// packages/mobile/styles/screens/PaymentDetail.styles.ts
// VERSÃO LIMPA PARA ESTRUTURA MÍNIMA COM TABS

import { Platform, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  // --- Estilos Gerais da Tela / Loading / Error ---
  container: {
    // Usado pelo contentContainer do ScrollView interno das abas OU para Loading/Error
    flexGrow: 1,
    padding: 20,
  },
  centerContent: {
    // Para centralizar Loading/Error View
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 15,
  },
  title: {
    // Título principal da tela (acima das abas)
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
    textAlign: 'center',
    color: Colors.text,
    paddingHorizontal: 20,
  },

  // --- Estilos da TabView e Cenas ---
  tabSceneContainer: {
    // Estilo para a VIEW RAIZ de cada cena da aba
    flex: 1, // ESSENCIAL!
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: Colors.background // Define cores diferentes nos placeholders para debug
  },
  placeholderText: {
    // Para o texto "ABA DETALHES / ABA HISTÓRICO"
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 18,
    fontStyle: 'italic',
  },
  tabLabel: {
    // Estilo para o texto na TabBar
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: 'bold',
    margin: 0,
    paddingHorizontal: 8,
    textAlign: 'center',
  },

  // --- Estilos Removidos (Pertencem a componentes filhos) ---
  // detailItem, labelContainer, labelIcon, label, value, amountValue
  // sectionContainer, sectionTitle, sequenceItem, etc.
  // attachmentItem, etc.
  // buttonContainer
  // Estilos de Modal (estão nos componentes de Modal)
  // commentItem, etc.
});
