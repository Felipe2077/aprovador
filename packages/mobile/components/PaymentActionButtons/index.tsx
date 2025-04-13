// packages/mobile/components/PaymentActionButtons/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import AppButton from '../AppButton'; // Importa nosso botão customizado
import { getTextColorForVariant } from '../AppButton/AppButton.styles'; // Helper de cor
import styles from './PaymentActionButtons.styles'; // Importa estilos locais

interface PaymentActionButtonsProps {
  // Funções de callback para cada ação
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  // Estado para desabilitar botões (ex: durante loading da tela)
  isLoading?: boolean;
}

export default function PaymentActionButtons({
  onApprove,
  onReject,
  onCancel,
  isLoading = false,
}: PaymentActionButtonsProps) {
  return (
    <View style={styles.container}>
      <AppButton
        title='Cancelar'
        onPress={onCancel}
        variant='danger'
        iconLeft={
          <Ionicons
            name='close-circle-outline'
            size={20}
            color={getTextColorForVariant('danger')}
          />
        }
        disabled={isLoading}
        // Adicionamos flex: 1 aqui para que os botões dividam o espaço
        // dentro deste container específico de ações.
        style={{ flex: 1 }}
      />
      <AppButton
        title='Rejeitar'
        onPress={onReject}
        variant='warning'
        iconLeft={
          <Ionicons
            name='arrow-undo-outline'
            size={20}
            color={getTextColorForVariant('warning')}
          />
        }
        disabled={isLoading}
        style={{ flex: 1 }} // Divide espaço
      />
      <AppButton
        title='Aprovar'
        onPress={onApprove}
        variant='success'
        iconLeft={
          <Ionicons
            name='thumbs-up-outline'
            size={20}
            color={getTextColorForVariant('success')}
          />
        }
        disabled={isLoading}
        style={{ flex: 1 }} // Divide espaço
      />
    </View>
  );
}
