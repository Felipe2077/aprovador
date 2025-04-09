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
  modalCenteredView: {
    flex: 1, // Ocupa toda a tela
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundo semi-transparente
  },
  modalView: {
    width: '85%', // Largura do modal
    margin: 20,
    backgroundColor: Colors.card, // Fundo do modal (cor de card do tema)
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000', // Sombra (pode não aparecer bem no tema escuro)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalTextInput: {
    width: '100%',
    minHeight: 100, // Altura mínima para multiline
    maxHeight: 150, // Altura máxima
    backgroundColor: Colors.inputBackground, // Fundo do input
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top', // Alinha texto no topo para multiline
    fontSize: 16,
    color: Colors.text,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ou 'flex-end' para botões à direita
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2, // Sombra Android
    minWidth: 100, // Largura mínima
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.textMuted, // Cor cinza/neutra para cancelar
    marginRight: 10, // Espaço entre botões
  },
  modalButtonConfirm: {
    backgroundColor: Colors.error, // Cor de erro para confirmar rejeição
  },
  modalButtonTextCancel: {
    color: Colors.background, // Texto contrastante
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButtonTextConfirm: {
    color: Colors.text, // Texto contrastante
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
