// packages/mobile/components/PaymentActionButtons/PaymentActionButtons.styles.ts
import { Platform, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 15,
    // Padding inferior maior no iOS por causa da barra inicial, etc.
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingHorizontal: 15, // Padding lateral
    gap: 10, // Espaço entre os botões
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background, // Fundo para garantir que sobreponha conteúdo se necessário
  },
});
