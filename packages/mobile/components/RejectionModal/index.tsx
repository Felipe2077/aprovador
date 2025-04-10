// packages/mobile/components/RejectionModal/index.tsx
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal, // Ou importe AppButton
  Platform,
  Text,
  TextInput,
  View,
} from 'react-native';
import Colors from '../../constants/Colors'; // Para cores
import AppButton from '../AppButton'; // Importe AppButton se for usar
import styles from './RejectionModal.styles'; // Estilos específicos do modal

// Props que o Modal receberá
interface RejectionModalProps {
  isVisible: boolean; // Controla se o modal está visível
  payeeName: string; // Nome do fornecedor para exibir no título
  onClose: () => void; // Função chamada para fechar (clicar fora ou Cancelar)
  onSubmit: (reason: string) => void; // Função chamada ao confirmar, passando o motivo
}

export default function RejectionModal({
  isVisible,
  payeeName,
  onClose,
  onSubmit,
}: RejectionModalProps) {
  // Estado INTERNO do modal para o texto do motivo
  const [reason, setReason] = useState('');

  // Limpa o campo de texto quando o modal fecha
  useEffect(() => {
    if (!isVisible) {
      setReason('');
    }
  }, [isVisible]);

  // Função para lidar com o submit
  const handleSubmit = () => {
    // Poderíamos adicionar validação aqui (ex: motivo não pode ser vazio)
    // if (!reason.trim()) {
    //   Alert.alert('Erro', 'Por favor, insira um motivo para a rejeição.');
    //   return;
    // }
    onSubmit(reason); // Chama a função passada via props com o motivo
  };

  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Fecha com botão voltar do Android
    >
      {/* KeyboardAvoidingView para o input não ficar atrás do teclado */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalCenteredView}
      >
        {/* O conteúdo visual do modal */}
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            Motivo da Rejeição{payeeName ? ` (${payeeName})` : ''}
          </Text>
          <TextInput
            style={styles.modalTextInput}
            placeholder='Digite o motivo aqui...'
            placeholderTextColor={Colors.textMuted}
            value={reason}
            onChangeText={setReason} // Atualiza estado interno 'reason'
            multiline={true}
            numberOfLines={4}
          />
          <View style={styles.modalButtonContainer}>
            {/* Botão Cancelar */}
            <AppButton
              title='Cancelar'
              onPress={onClose} // Chama a função onClose passada via props
              variant='muted'
              style={{ flex: 1, marginRight: 5 }}
            />
            {/* Botão Confirmar */}
            <AppButton
              title='Confirmar' // Título mais curto
              onPress={handleSubmit} // Chama a função local que chama onSubmit(reason)
              variant='danger' // Ou 'warning'? Usando danger por enquanto
              style={{ flex: 1, marginLeft: 5 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
