// packages/mobile/components/HistoryModal/HistoryModal.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalScrollViewContent: {
    // Para o ScrollView que envolve o modalView
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20, // Espaço para o modal "respirar" no scroll
  },
  modalView: {
    width: '92%',
    maxWidth: 400,
    // Removido maxHeight para o ScrollView controlar
    marginVertical: 10, // Margem vertical se o conteúdo for menor que a tela
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20, // Padding interno do card do modal
    alignItems: 'center',
    shadowColor: '#000',
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
  summaryContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    marginBottom: 15,
  },
  summaryText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 5 },
  comparisonLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  comparisonIcon: { marginRight: 6 },
  comparisonText: { fontSize: 15, fontWeight: 'bold' },

  chartContainer: {
    marginBottom: 15,
    // paddingHorizontal: 5, // Padding para o gráfico não colar nas bordas do container
  },
  chartTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 8,
  },

  historyListContainer: { width: '100%', marginTop: 10, marginBottom: 15 }, // Adicionado marginBottom
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
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
  },
  historyDate: { fontSize: 15, color: Colors.textSecondary },
  historyAmount: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  minAmountText: { color: Colors.successText, fontWeight: 'bold' },
  maxAmountText: { color: Colors.dangerText, fontWeight: 'bold' },
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
  closeButtonContainer: { width: '60%', marginTop: 20, alignSelf: 'center' },
});
