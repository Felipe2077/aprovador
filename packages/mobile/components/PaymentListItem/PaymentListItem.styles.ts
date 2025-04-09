import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; //

export default StyleSheet.create({
  itemContainer: {
    backgroundColor: Colors.card,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftColor: '#3D825C', //TODO mudar para a cor do tema PEGANDO no mock de dados
    borderLeftWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,

    elevation: 8,
  },

  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  payee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  requester: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dueDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  amountContainer: {},
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
