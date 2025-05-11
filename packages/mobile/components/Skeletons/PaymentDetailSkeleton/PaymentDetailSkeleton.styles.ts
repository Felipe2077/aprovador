// packages/mobile/components/PaymentDetailSkeleton/PaymentDetailSkeleton.styles.ts
import { Dimensions, Platform, StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors'; // Ajuste o caminho

const { width } = Dimensions.get('window');
const PADDING_HORIZONTAL_SCREEN = 20; // Padding da tela [id].tsx (styles.title)
const PADDING_HORIZONTAL_CONTENT = 15; // Padding interno das abas (styles.tabScrollContentContainer)

export default StyleSheet.create({
  container: {
    // Container geral do skeleton (ocupa a tela)
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'ios' ? 0 : 10, // Ajuste conforme seu header
    // Não precisa de paddingHorizontal aqui, controlamos nos itens
  },
  // Wrapper para os itens do SkeletonPlaceholder
  placeholderWrapper: {
    paddingHorizontal: PADDING_HORIZONTAL_SCREEN, // Para alinhar com o título da tela
  },
  titlePlaceholder: {
    width: width * 0.7, // 70% da largura para o título
    height: 28,
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 10, // Espaço após o header real da Stack
    marginBottom: 15, // Espaço antes da TabBar
  },
  tabBarPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Ou 'space-around' se preferir
    height: 40, // Altura da TabBar
    marginBottom: 15, // Espaço após a TabBar
    paddingLeft: PADDING_HORIZONTAL_SCREEN - PADDING_HORIZONTAL_CONTENT + 5, // Ajuste para alinhar com o conteúdo da aba
    // (Compensa o padding da tela vs padding da aba)
  },
  tabItemPlaceholder: {
    width: 100, // Largura de uma aba
    height: 30, // Altura do texto da aba
    borderRadius: 4,
    marginRight: 15, // Espaço entre abas
  },
  // Para o conteúdo da aba (simulando o card de detalhes e seções)
  contentBlock: {
    width: width - (PADDING_HORIZONTAL_SCREEN + PADDING_HORIZONTAL_CONTENT) * 2, // Largura do conteúdo da aba
    alignSelf: 'center', // Centraliza o bloco de conteúdo
    marginBottom: 20,
  },
  line: {
    // Linha de texto genérica
    width: '100%',
    height: 16,
    borderRadius: 4,
    marginBottom: 10,
  },
  shortLine: {
    // Linha mais curta
    width: '60%',
    height: 16,
    borderRadius: 4,
    marginBottom: 10,
  },
  // Para os botões de ação no rodapé
  actionButtonRowPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING_HORIZONTAL_SCREEN,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    // position: 'absolute', // Não precisa se o KAV empurrar para baixo
    // bottom: 0,
    // left: 0,
    // right: 0,
    // backgroundColor: Colors.background, // Para cobrir se KAV não ajustar bem
  },
  actionButtonPlaceholder: {
    // Largura: (largura_tela - paddings_tela*2 - gaps*2) / 3
    width: (width - PADDING_HORIZONTAL_SCREEN * 2 - 10 * 2) / 3,
    height: 45, // Altura do AppButton
    borderRadius: 8,
  },
});
