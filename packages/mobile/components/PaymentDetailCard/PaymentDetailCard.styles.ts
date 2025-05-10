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
  cardHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%', // Garante que o container ocupe a largura
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Reduzi um pouco para ficar menos espaçado dentro do card
  },
  icon: {
    fontSize: 16,
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
  payeeValueContainer: {
    //  Container para o nome do favorecido e o ícone
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Alinha à direita dentro do espaço disponível
    flexShrink: 1,
  },
  payeeText: {
    //  Estilo para o texto do nome do favorecido
    fontSize: 15,
    color: Colors.text, // Ou Colors.link se quiser que pareça mais clicável
    // Não precisa de textAlign: 'right' aqui, o container cuida
  },
  historyIcon: {
    //: Estilo para o ícone de histórico
    marginLeft: 8, // Espaço entre o nome e o ícone
  },
  amountValue: {
    fontWeight: 'bold',
    color: Colors.successText, // Cor de destaque para o valor
  },
});
