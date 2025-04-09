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
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card2, // Cor de fundo do cabeçalho da seção
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    marginTop: 10, // Espaço antes de uma nova seção
  },
  sectionHeaderIcon: {
    // Estilo para o ícone do usuário
    marginRight: 10, // Espaço entre o ícone e o texto
  },
  requesterPhotoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18, // Metade da largura/altura para círculo perfeito
    backgroundColor: Colors.primary, // Cor de fundo do placeholder
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requesterInitial: {
    color: Colors.background, // Cor da letra inicial (contraste com fundo do placeholder)
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeaderText: {
    flex: 1, // Faz o nome ocupar o espaço restante
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionToggleIndicator: {
    fontSize: 18,
    color: Colors.textSecondary,
    paddingLeft: 10,
  },
  sectionSeparator: {
    height: 4, // Espaço visual entre o fim de uma seção e o cabeçalho da próxima
    // backgroundColor: Colors.background // Pode usar a cor de fundo geral
  },
});
