import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho para a pasta constants

export default StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.text,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: Colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});
