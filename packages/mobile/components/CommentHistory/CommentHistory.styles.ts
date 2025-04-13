// packages/mobile/components/CommentHistoryTab/CommentHistoryTab.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  container: {
    // Container geral da aba
    flex: 1,
    padding: 15,
  },
  // Mantém o título da seção, mas talvez um nome mais genérico?
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15, // Aumentei espaço abaixo do título
  },
  commentItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.inputBackground, // Fundo sutil para cada comentário
    borderRadius: 6,
  },
  commentAuthor: {
    fontSize: 13, // Ligeiramente maior
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 21, // Melhor legibilidade
  },
  placeholderText: {
    // Para caso não haja comentários
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Estilos para FlatList se necessário (ex: contentContainer)
  listContentContainer: {
    paddingBottom: 20, // Espaço no final da lista
  },
});
