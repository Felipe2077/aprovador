// packages/mobile/styles/screens/PaymentDetail.styles.ts
// (Ou o caminho/nome correto que você usou para os estilos desta tela)

import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho se necessário

export default StyleSheet.create({
  // --- Estilos Gerais da Tela ---
  scrollView: {
    flex: 1,
    // O fundo será herdado do ThemeProvider ou do container abaixo
  },
  container: {
    flexGrow: 1, // Importante para o ScrollView permitir crescimento do conteúdo
    padding: 20, // Padding geral da tela
    // backgroundColor: Colors.background // Geralmente não precisa se ThemeProvider define
  },
  centerContent: {
    // Para centralizar loading e erro
    flex: 1, // Precisa de flex: 1 para ocupar espaço e centralizar
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Mantém o padding
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary, // Cor mais sutil para texto de loading
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25, // Aumentei um pouco a margem inferior
    textAlign: 'center',
    color: Colors.text,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error, // Cor de erro
    textAlign: 'center',
    marginBottom: 15,
  },

  // --- Estilos dos Detalhes ---
  detailItem: {
    flexDirection: 'row', // Label+Icon lado a lado com Valor
    justifyContent: 'space-between', // Espaçar Label/Valor
    alignItems: 'center', // Alinhar verticalmente no centro
    paddingVertical: 12, // Espaçamento vertical
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // Cor sutil da borda/separador
  },
  labelContainer: {
    // Container para agrupar Ícone + Label
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10, // Espaço à direita antes do valor
    flexShrink: 1, // Permite que o label encolha se o valor for muito grande
  },
  labelIcon: {
    // Estilo para o ícone ao lado do label
    marginRight: 8, // Espaço entre ícone e texto
  },
  label: {
    fontSize: 16,
    fontWeight: '600', // Semi-bold
    color: Colors.textSecondary, // Cor secundária para label
  },
  value: {
    fontSize: 16,
    color: Colors.text, // Cor principal para o valor
    flexShrink: 1, // Permite encolher se necessário
    textAlign: 'right', // Alinha valor à direita
  },
  amountValue: {
    // Estilo específico para o valor monetário
    fontWeight: 'bold',
    color: Colors.primary, // Cor primária/acento para destaque
  },

  // --- Estilos dos Botões de Ação ---
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    paddingVertical: 10,
    gap: 10,
  },

  // --- Estilos do Modal de Rejeição ---
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
  // --- Estilos Opcionais para Botões do Modal (se NÃO usar AppButton dentro dele) ---
  /*
    modalButton: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 2,
        flex: 1, // Faz os botões dividirem espaço
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonCancel: {
        backgroundColor: Colors.textMuted, // Cinza
        marginRight: 5, // Metade do gap
    },
    modalButtonConfirm: {
        backgroundColor: Colors.error, // Vermelho
        marginLeft: 5, // Metade do gap
    },
    modalButtonTextCancel: {
        color: Colors.text, // Ajuste contraste se textMuted for claro
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalButtonTextConfirm: {
        color: '#FFFFFF', // Branco geralmente contrasta bem com vermelho
        fontWeight: 'bold',
        textAlign: 'center',
    }
    */

  historyButton: {
    // Estilo para o botão "Ver Histórico"
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center', // Centraliza o botão
    marginBottom: 20, // Espaço abaixo dele
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.card, // Ou outra cor
    // Talvez uma borda sutil
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  historyButtonText: {
    marginLeft: 8,
    color: Colors.primary,
    fontWeight: 'bold',
  },

  // Estilos para o Modal de Histórico (pode reutilizar modalView, modalTitle...)
  historyModalView: {
    // Estilo adicional se quiser diferenciar do modal de rejeição
    maxHeight: '70%', // Limita a altura máxima
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
});
