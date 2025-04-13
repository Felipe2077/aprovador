// packages/mobile/components/PaymentDetailCard/PaymentDetailCard.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho se necessário

export default StyleSheet.create({
  cardContainer: {
    // Estilos opcionais para o container do card, se quiser um fundo ou borda
    // backgroundColor: Colors.card, // Poderia ser diferente do fundo da aba
    // borderRadius: 8,
    // padding: 15,
    marginBottom: 15, // Espaço abaixo deste bloco de detalhes
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Reduzi um pouco para ficar menos espaçado dentro do card
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // Use a cor de borda do seu tema
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
