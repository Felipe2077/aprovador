// packages/mobile/components/CommentHistoryTab/index.tsx
import React from 'react';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import styles from './CommentHistory.styles'; // Estilos locais
// Importe o tipo Comment de shared-types se o definirmos lá, senão defina localmente
// import { Comment } from 'shared-types'; // Exemplo futuro

// Tipo local para o mock atual
interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
}

interface CommentHistoryTabProps {
  comments: Comment[]; // Recebe o array de comentários
}

export default function CommentHistoryTab({
  comments,
}: CommentHistoryTabProps) {
  // Função para renderizar cada item da FlatList
  const renderCommentItem = ({ item }: ListRenderItemInfo<Comment>) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentAuthor}>
        {item.author} ({item.date}):
      </Text>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  // Componente para mostrar quando a lista está vazia
  const ListEmptyComponent = () => (
    <Text style={styles.placeholderText}>Nenhum comentário encontrado.</Text>
  );

  return (
    // Usamos View como container principal da aba com flex:1 (herdado do styles.tabSceneContainer no pai)
    // FlatList para performance em listas longas
    <FlatList
      data={comments}
      renderItem={renderCommentItem}
      keyExtractor={(item) => item.id}
      style={styles.container} // Aplica padding geral
      contentContainerStyle={styles.listContentContainer} // Padding inferior
      ListHeaderComponent={
        <Text style={styles.title}>Histórico de Conversa</Text>
      } // Título da seção
      ListEmptyComponent={ListEmptyComponent} // Mensagem se vazio
      // ItemSeparatorComponent={() => <View style={{height: 10}} />} // Separador opcional
    />
  );
}
