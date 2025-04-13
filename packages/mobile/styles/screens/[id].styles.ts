// packages/mobile/styles/screens/PaymentDetail.styles.ts
// VERSÃO LIMPA PARA A ESTRUTURA COM ABAS E COMPONENTES EXTRAÍDOS

import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  // --- Estilos Gerais da Tela (Loading/Error) ---
  container: {
    // Usado principalmente pelo contentContainer dos ScrollViews ou para Loading/Error
    flexGrow: 1,
    padding: 20,
  },
  centerContent: {
    // Para centralizar Loading/Error
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Mantém padding mesmo centralizado
    backgroundColor: Colors.background, // Garante fundo escuro
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
    // Título principal da tela
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
    color: Colors.text,
    paddingHorizontal: 20,
  },

  // --- Estilos da TabView ---
  tabSceneContainer: {
    flex: 1,
  },
  tabScrollContentContainer: {
    // Estilo para o CONTEÚDO INTERNO do ScrollView das abas
    padding: 15, // Padding interno
    paddingBottom: 20, // Espaço no fim
    flexGrow: 1, // Permite crescer e rolar
  },
  placeholderText: {
    // Texto para abas ainda não implementadas ou vazias
    paddingVertical: 20,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 16,
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

  // --- Estilos para Seções/Conteúdo (Exemplo para Comentários, podem ir para seus componentes) ---
  sectionTitle: {
    // Título usado dentro da aba de Histórico (exemplo)
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 10, // Ajuste conforme necessário dentro da aba
    marginBottom: 15,
    // borderBottomWidth: 1, // Opcional
    // borderBottomColor: Colors.border,
  },

  // --- ESTILOS REMOVIDOS que agora pertencem a componentes filhos ---
  // detailItem, labelContainer, labelIcon, label, value, amountValue -> Em PaymentDetailCard.styles.ts
  // sequenceItem, sequenceIcon, sequenceText -> Em ApprovalFlow.styles.ts
  // attachmentItem, attachmentIcon, attachmentText -> Em AttachmentList.styles.ts
  // buttonContainer -> Em PaymentActionButtons.styles.ts
  // Modal styles -> Em RejectionModal.styles.ts
});
