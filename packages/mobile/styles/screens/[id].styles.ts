// packages/mobile/styles/screens/PaymentDetail.styles.ts
// (Ou o caminho/nome correto que você usou para os estilos desta tela)

import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho se necessário

export default StyleSheet.create({
  // --- Estilos Gerais da Tela ---
  scrollView: {
    flex: 1,
    // O fundo será herdado do ThemeProvider ou do container abaixo
  },
  container: {
    flexGrow: 1, // Importante para o ScrollView permitir crescimento do conteúdo
    padding: 20, // Padding geral da tela
    // backgroundColor: Colors.background // Geralmente não precisa se ThemeProvider define
  },
  centerContent: {
    // Para centralizar loading e erro
    flex: 1, // Precisa de flex: 1 para ocupar espaço e centralizar
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Mantém o padding
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary, // Cor mais sutil para texto de loading
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25, // Aumentei um pouco a margem inferior
    textAlign: 'center',
    color: Colors.text,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error, // Cor de erro
    textAlign: 'center',
    marginBottom: 15,
  },

  // --- Estilos dos Detalhes ---
  detailItem: {
    flexDirection: 'row', // Label+Icon lado a lado com Valor
    justifyContent: 'space-between', // Espaçar Label/Valor
    alignItems: 'center', // Alinhar verticalmente no centro
    paddingVertical: 12, // Espaçamento vertical
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // Cor sutil da borda/separador
  },
  labelContainer: {
    // Container para agrupar Ícone + Label
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10, // Espaço à direita antes do valor
    flexShrink: 1, // Permite que o label encolha se o valor for muito grande
  },
  labelIcon: {
    // Estilo para o ícone ao lado do label
    marginRight: 8, // Espaço entre ícone e texto
  },
  label: {
    fontSize: 16,
    fontWeight: '600', // Semi-bold
    color: Colors.textSecondary, // Cor secundária para label
  },
  value: {
    fontSize: 16,
    color: Colors.text, // Cor principal para o valor
    flexShrink: 1, // Permite encolher se necessário
    textAlign: 'right', // Alinha valor à direita
  },
  amountValue: {
    // Estilo específico para o valor monetário
    fontWeight: 'bold',
    color: Colors.primary, // Cor primária/acento para destaque
  },

  // --- Estilos dos Botões de Ação ---
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    paddingVertical: 10,
    gap: 10,
  },

  historyButton: {
    // Estilo para o botão "Ver Histórico"
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center', // Centraliza o botão
    marginBottom: 20, // Espaço abaixo dele
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.card, // Ou outra cor
    // Talvez uma borda sutil
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  historyButtonText: {
    marginLeft: 8,
    color: Colors.primary,
    fontWeight: 'bold',
  },

  // --- Estilos dos placeholders ---
  sectionContainer: {
    marginTop: 20, // Espaço acima de cada nova seção
    marginBottom: 10,
    // Opcional: Estilo de Card para cada seção
    // backgroundColor: Colors.card,
    // borderRadius: 8,
    // padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1, // Linha separadora para o título da seção
    borderBottomColor: Colors.border,
  },
  // Estilos para Fluxo de Aprovação
  sequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sequenceIcon: {
    marginRight: 8,
  },
  sequenceText: {
    fontSize: 15,
    // color: Colors.textSecondary, // Cor definida dinamicamente no JSX
  },
  // Estilos para Histórico de Conversa
  commentItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: Colors.inputBackground, // Fundo ligeiramente diferente
    borderRadius: 6,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
  },
  // Estilos para Anexos
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    // borderBottomWidth: 1, // Linha separadora opcional entre anexos
    // borderBottomColor: Colors.border,
  },
  attachmentIcon: {
    marginRight: 10,
  },
  attachmentText: {
    fontSize: 15,
    color: Colors.link, // Cor de link para indicar clicável
    flexShrink: 1, // Permite quebrar texto se nome for longo
  },
  // Estilo genérico para mensagens de placeholder
  placeholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 5,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
