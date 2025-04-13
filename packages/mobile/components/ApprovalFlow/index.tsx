// packages/mobile/components/ApprovalFlow/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import styles from './ApprovalFlow.styles';

// Define o tipo esperado para cada passo na sequência
interface ApprovalStep {
  id: string;
  name: string;
  status: 'Aprovado' | 'Pendente' | 'Não Iniciado' | string; // Permite string para flexibilidade
}

interface ApprovalFlowProps {
  sequence: ApprovalStep[]; // Recebe o array da sequência
}

export default function ApprovalFlow({ sequence }: ApprovalFlowProps) {
  const getStatusStyleAndIcon = (
    status: string
  ): { style: object; icon: keyof typeof Ionicons.glyphMap } => {
    switch (status) {
      case 'Aprovado':
        return { style: styles.statusApproved, icon: 'checkmark-circle' };
      case 'Pendente':
        return { style: styles.statusPending, icon: 'time-outline' };
      default: // Não Iniciado ou outros
        return { style: styles.statusDefault, icon: 'ellipse-outline' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fluxo de Aprovação</Text>
      {sequence.map((step) => {
        const { style: statusStyle, icon: iconName } = getStatusStyleAndIcon(
          step.status
        );
        return (
          <View key={step.id} style={styles.stepItem}>
            <Ionicons
              name={iconName}
              size={20}
              color={statusStyle.color} // Usa a cor do estilo de status
              style={styles.stepIcon}
            />
            <Text style={[styles.stepText, statusStyle]}>{step.name}</Text>
          </View>
        );
      })}
    </View>
  );
}
