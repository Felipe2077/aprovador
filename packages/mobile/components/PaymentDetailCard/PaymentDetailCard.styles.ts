// packages/mobile/components/PaymentDetailCard/PaymentDetailCard.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho se necessário

export default StyleSheet.create({
  cardContainer: {
    marginBottom: 15, // Espaço abaixo deste bloco de detalhes
    backgroundColor: Colors.card, // Fundo do card
    padding: 8, // Espaçamento interno
    borderWidth: 1, // Borda do card
    borderColor: Colors.border, // Cor da borda
    borderRadius: 8, // Bordas arredondadas
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Reduzi um pouco para ficar menos espaçado dentro do card
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 1,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 15, // Talvez um pouco menor dentro do card
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 15, // Talvez um pouco menor
    color: Colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontWeight: 'bold',
    color: Colors.primary, // Cor de destaque para o valor
  },
});
