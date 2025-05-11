// packages/mobile/components/AuthLoadingSkeleton/AuthLoadingSkeleton.styles.ts
import { Dimensions, StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors'; // Ajuste o caminho

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Fundo da tela de loading
    alignItems: 'center',
    paddingTop: 50, // Simula espaço para o status bar e header
    paddingHorizontal: 12,
  },
  headerPlaceholder: {
    width: screenWidth * 0.6, // Largura do título do header
    height: 28,
    borderRadius: 4,
    marginBottom: 30, // Espaço após o header
  },
  listItemPlaceholder: {
    width: screenWidth - 24, // Largura total menos paddings horizontais
    height: 70, // Altura de um PaymentListItem
    borderRadius: 8,
    marginBottom: 10, // Mesma margem do PaymentListItem
  },

  tabBarPlaceholder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60, // Altura típica de uma tab bar
    backgroundColor: Colors.card, // Cor de fundo da tab bar
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tabItemPlaceholder: {
    width: 40,
    height: 30,
    borderRadius: 4,
  },
});
