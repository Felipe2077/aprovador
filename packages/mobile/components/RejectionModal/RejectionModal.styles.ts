// packages/mobile/components/RejectionModal/RejectionModal.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho se necessário

export default StyleSheet.create({
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    margin: 20,
    backgroundColor: Colors.card2,
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Sombra Android
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
    minHeight: 100,
    maxHeight: 150,
    backgroundColor: Colors.inputBackground,

    paddingVertical: 10, // Padding vertical
    paddingHorizontal: 15, // Padding horizontal
    marginBottom: 25, // Aumentei espaço antes dos botões
    textAlignVertical: 'top', // Começa a digitar do topo
    fontSize: 16,
    color: Colors.text,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Espaçar botões do modal
    width: '100%',
    marginTop: 10,
    gap: 10, // Espaço entre botões do modal
  },
});
