// packages/api/src/services/etl/user-sync.service.ts
import { UserActivationStatus, UserRole } from 'shared-types';
import { Repository } from 'typeorm';
import { User } from '../../entities/postgresql/User.entity';
import { oracleDataSource, pgDataSource } from '../../lib/typeorm';

/**
 * Serviço de Sincronização Inteligente de Usuários
 *
 * Responsável por:
 * 1. Validar usuários contra Oracle CTR_CADASTRODEUSUARIOS
 * 2. Criar usuários "dormentes" automaticamente
 * 3. Manter sincronização Oracle ↔ PostgreSQL
 * 4. Aplicar regras de negócio (username MAIÚSCULO, usuários ativos, etc.)
 */

interface OracleUserData {
  USUARIO: string; // Username (15 chars)
  NOMEUSUARIO: string; // Nome completo (40 chars)
  EMAIL: string; // Email (50 chars)
  ATIVO: string; // S ou N
}

export class UserSyncService {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = pgDataSource.getRepository(User);
  }

  /**
   * Encontra ou cria usuário baseado no username do Oracle
   *
   * Fluxo:
   * 1. Verifica se usuário já existe no PostgreSQL
   * 2. Se não existe, valida contra Oracle
   * 3. Se Oracle válido e ativo, cria usuário dormiente
   * 4. Retorna usuário ou null
   */
  async findOrCreateUserFromOracle(username: string): Promise<User | null> {
    try {
      // Normalizar username para MAIÚSCULO
      const normalizedUsername = username.toUpperCase().trim();

      console.log(`🔍 Verificando usuário: ${normalizedUsername}`);

      // 1. Verificar se já existe no PostgreSQL
      let user = await this.userRepo.findOne({
        where: { username: normalizedUsername },
      });

      if (user) {
        console.log(`✅ Usuário ${normalizedUsername} já existe no PostgreSQL`);

        // Atualizar última sincronização
        user.lastSyncAt = new Date();
        await this.userRepo.save(user);

        return user;
      }

      // 2. Usuário não existe, validar contra Oracle
      console.log(
        `🔍 Usuário ${normalizedUsername} não existe, validando contra Oracle...`
      );

      const oracleUserData = await this.validateUserInOracle(
        normalizedUsername
      );

      if (!oracleUserData) {
        console.log(
          `❌ Usuário ${normalizedUsername} não encontrado no Oracle`
        );
        return null;
      }

      if (oracleUserData.ATIVO !== 'S') {
        console.log(
          `⚠️ Usuário ${normalizedUsername} existe no Oracle mas está inativo`
        );
        return null;
      }

      // 3. Criar usuário dormiente
      console.log(`🆕 Criando usuário dormiente: ${normalizedUsername}`);

      user = await this.createDormantUser(oracleUserData);

      console.log(
        `✅ Usuário dormiente ${normalizedUsername} criado com sucesso`
      );
      return user;
    } catch (error) {
      console.error(`❌ Erro ao processar usuário ${username}:`, error);
      return null;
    }
  }

  /**
   * Valida se usuário existe e está ativo no Oracle
   */
  private async validateUserInOracle(
    username: string
  ): Promise<OracleUserData | null> {
    try {
      const query = `
        SELECT 
          USUARIO,
          NOMEUSUARIO,
          EMAIL,
          ATIVO
        FROM GLOBUS.CTR_CADASTRODEUSUARIOS
        WHERE USUARIO = :username
      `;

      const result = await oracleDataSource.query(query, [username]);

      if (result.length === 0) {
        return null;
      }

      return result[0] as OracleUserData;
    } catch (error) {
      console.error(`❌ Erro ao validar usuário ${username} no Oracle:`, error);
      return null;
    }
  }

  /**
   * Cria usuário dormiente baseado nos dados do Oracle
   */
  private async createDormantUser(oracleData: OracleUserData): Promise<User> {
    const user = new User();

    // Dados básicos
    user.username = oracleData.USUARIO.toUpperCase().trim();
    user.name = oracleData.NOMEUSUARIO?.trim() || oracleData.USUARIO;
    user.role = UserRole.REQUESTER; // Padrão, pode ser ajustado depois
    user.activationStatus = UserActivationStatus.DORMANT;

    // Dados do Oracle
    user.erpUserId = oracleData.USUARIO;
    user.erpEmail = oracleData.EMAIL?.trim() || null;
    user.erpActive = oracleData.ATIVO === 'S';

    // Controle de sincronização
    user.lastSyncAt = new Date();
    user.activatedAt = null;
    user.passwordHash = null; // Usuário dormiente não tem senha

    return await this.userRepo.save(user);
  }

  /**
   * Ativa conta de usuário dormiente
   */
  async activateUser(
    username: string,
    passwordHash: string
  ): Promise<User | null> {
    try {
      const normalizedUsername = username.toUpperCase().trim();

      const user = await this.userRepo.findOne({
        where: {
          username: normalizedUsername,
          activationStatus: UserActivationStatus.DORMANT,
        },
      });

      if (!user) {
        console.log(
          `❌ Usuário dormiente ${normalizedUsername} não encontrado`
        );
        return null;
      }

      // Ativar conta
      user.activateAccount(passwordHash);

      const activatedUser = await this.userRepo.save(user);

      console.log(`✅ Usuário ${normalizedUsername} ativado com sucesso`);

      // Após ativação, adotar APs órfãs
      await this.adoptOrphanPayments(activatedUser);

      return activatedUser;
    } catch (error) {
      console.error(`❌ Erro ao ativar usuário ${username}:`, error);
      return null;
    }
  }

  /**
   * Adota APs órfãs quando usuário ativa conta
   */
  private async adoptOrphanPayments(user: User): Promise<void> {
    try {
      const paymentRepo = pgDataSource.getRepository('Payment');

      const result = await paymentRepo
        .createQueryBuilder()
        .update()
        .set({ requesterId: user.id })
        .where('requesterUsername = :username', { username: user.username })
        .andWhere('requesterId IS NULL')
        .execute();

      if (result.affected && result.affected > 0) {
        console.log(
          `✅ ${result.affected} APs adotadas pelo usuário ${user.username}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Erro ao adotar APs para usuário ${user.username}:`,
        error
      );
    }
  }

  /**
   * Sincroniza dados de usuário com Oracle (atualização)
   */
  async syncUserWithOracle(user: User): Promise<User | null> {
    try {
      if (!user.erpUserId) {
        return user; // Usuário não é do Oracle
      }

      const oracleData = await this.validateUserInOracle(user.erpUserId);

      if (!oracleData) {
        console.warn(
          `⚠️ Usuário ${user.username} não encontrado mais no Oracle`
        );
        user.erpActive = false;
      } else {
        // Atualizar dados do Oracle
        user.name = oracleData.NOMEUSUARIO?.trim() || user.name;
        user.erpEmail = oracleData.EMAIL?.trim() || null;
        user.erpActive = oracleData.ATIVO === 'S';
      }

      user.lastSyncAt = new Date();

      return await this.userRepo.save(user);
    } catch (error) {
      console.error(
        `❌ Erro ao sincronizar usuário ${user.username} com Oracle:`,
        error
      );
      return null;
    }
  }

  /**
   * Lista usuários dormentes (para debug/admin)
   */
  async getDormantUsers(): Promise<User[]> {
    return await this.userRepo.find({
      where: { activationStatus: UserActivationStatus.DORMANT },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Estatísticas de usuários
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    dormant: number;
    fromOracle: number;
  }> {
    const { IsNull } = await import('typeorm');

    const [total, active, dormant, notFromOracle] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({
        where: { activationStatus: UserActivationStatus.ACTIVE },
      }),
      this.userRepo.count({
        where: { activationStatus: UserActivationStatus.DORMANT },
      }),
      this.userRepo.count({ where: { erpUserId: IsNull() } }),
    ]);

    return {
      total,
      active,
      dormant,
      fromOracle: total - notFromOracle,
    };
  }
}
