// packages/mobile/components/HistoryModal/HistoryModal.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  // Estilos para o Modal de Histórico (pode reutilizar modalView, modalTitle...)
  historyModalView: {
    // Estilo adicional se quiser diferenciar do modal de rejeição
    maxHeight: '70%', // Limita a altura máxima
  },
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
  historyListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyDate: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  historyEmptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButtonContainer: {
    width: '60%', // Ou ajuste conforme AppButton
    marginTop: 20,
  },
  historyListContainer: {
    // Adicionado para a FlatList ocupar espaço
    width: '100%',
    flexShrink: 1, // Permite encolher se necessário dentro do maxHeight
  },
});
