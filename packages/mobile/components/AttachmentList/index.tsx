// packages/mobile/components/AttachmentList/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho
import styles from './AttachmentList.styles';

// Tipo para o objeto de anexo (pode vir de shared-types depois)
interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | string; // Tipos básicos ou string genérica
}

interface AttachmentListProps {
  attachments: Attachment[]; // Recebe a lista de anexos
}

export default function AttachmentList({ attachments }: AttachmentListProps) {
  const getFileIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    if (type === 'pdf') return 'document-text-outline';
    if (type === 'image' || type === 'jpg' || type === 'png')
      return 'image-outline';
    return 'document-outline'; // Ícone padrão
  };

  const handleAttachmentPress = (attachment: Attachment) => {
    // TODO: Implementar lógica para abrir/baixar o anexo futuramente
    console.log('Abrir anexo:', attachment.name);
    alert(`Simulação: Abrindo anexo "${attachment.name}"`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anexos</Text>
      {attachments && attachments.length > 0 ? (
        attachments.map((attachment) => (
          <TouchableOpacity
            key={attachment.id}
            style={styles.item}
            onPress={() => handleAttachmentPress(attachment)} // Chama handler ao clicar
          >
            <Ionicons
              name={getFileIcon(attachment.type)} // Pega ícone dinamicamente
              size={20}
              color={Colors.primary} // Cor do ícone
              style={styles.icon}
            />
            <Text style={styles.text} numberOfLines={1} ellipsizeMode='middle'>
              {attachment.name}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.placeholderText}>Nenhum anexo encontrado.</Text>
      )}
    </View>
  );
}
