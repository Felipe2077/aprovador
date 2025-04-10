import Colors from '@/constants/Colors';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: Colors.text,
  },
  pullDownText: {
    fontSize: 14,
    marginTop: 10,
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12, // Ajuste padding geral
    borderWidth: 1, // Talvez remover borda? Ou manter
    borderColor: Colors.border,
    marginTop: 10,
    borderRadius: 24, // Borda arredondada no header?
    marginHorizontal: 10, // Margem lateral
  },
  requesterPhoto: {
    // Estilo para a Image
    width: 44,
    height: 44,
    borderRadius: 20, // Círculo perfeito
    marginRight: 12,
    backgroundColor: Colors.inputBackground, // Cor de fundo enquanto carrega
  },
  requesterInfoContainer: {
    // Container para nome/depto
    flex: 1, // Ocupa o espaço disponível
    justifyContent: 'center', // Alinha verticalmente no centro
    marginRight: 8, // Espaço antes do badge
  },
  requesterNameText: {
    // Estilo para o nome
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  requesterDeptText: {
    // Estilo para o departamento
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2, // Espaço entre nome e depto
  },
  badgeContainer: {
    // Estilo para o badge
    backgroundColor: Colors.primary, // Cor primária (amarelo) ou outra
    borderRadius: 12, // Bem arredondado
    paddingVertical: 2,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24, // Largura mínima
    height: 24, // Altura fixa
    marginRight: 8, // Espaço antes do chevron
  },
  badgeText: {
    // Estilo para o texto dentro do badge
    color: Colors.background, // Cor contrastante com o fundo do badge
    fontSize: 12,
    fontWeight: 'bold',
  },
  chevronIcon: {
    // Estilo para o ícone chevron (se precisar de margem)
    // marginLeft: 'auto', // Empurra para a direita (alternativa)
  },
  // Remover sectionHeaderIcon se não usar mais
  // Ajustar sectionHeaderText se mudou (agora é requesterNameText)
  // Ajustar/remover sectionToggleIndicator se não usar mais
  sectionSeparator: {
    // Manter se gostar do espaço
    height: 5, // Diminuir talvez?
  },
});
