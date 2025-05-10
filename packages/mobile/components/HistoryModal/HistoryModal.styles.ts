// packages/mobile/components/HistoryModal/HistoryModal.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    margin: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },

  summaryContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: Colors.inputBackground,
    borderRadius: 6,
    marginBottom: 15,
  },
  summaryText: { fontSize: 16, color: Colors.textSecondary, marginBottom: 4 },
  comparisonLine: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  comparisonIcon: { marginRight: 5 },
  comparisonText: { fontSize: 15, fontWeight: 'bold' }, // Cor é aplicada inline

  historyListContainer: { width: '100%', flexShrink: 1, marginTop: 0 }, // Removi marginTop
  historyListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyItemMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
  }, // Adicionado marginRight
  historyDate: { fontSize: 15, color: Colors.textSecondary },
  historyAmount: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  minAmountText: { color: Colors.successText, fontWeight: 'bold' }, // Para destacar o menor valor
  maxAmountText: { color: Colors.dangerText, fontWeight: 'bold' }, // Para destacar o maior valor
  itemComparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    justifyContent: 'flex-end',
  },
  itemComparisonIcon: { marginRight: 3 },
  itemComparisonText: { fontSize: 12, fontWeight: 'bold' },

  historyEmptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  closeButtonContainer: {
    width: '100%',
    height: 50,
    marginTop: 20,
    color: Colors.text,
  },
});
