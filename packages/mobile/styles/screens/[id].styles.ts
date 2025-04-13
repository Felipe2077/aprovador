// packages/mobile/styles/screens/[id].styles.ts

import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho se necessário

export default StyleSheet.create({
  // --- Estilos Gerais da Tela (Usados também no Loading/Error) ---
  container: {
    flexGrow: 1, // Para ScrollView interno das abas ou view principal
    padding: 20,
    // A cor de fundo vem do ThemeProvider ou do container raiz no JSX
    // backgroundColor: Colors.background
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Colors.background // Herda ou define explicitamente
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
    fontSize: 24,
    fontWeight: 'bold',
    // Reduzi a margem inferior pois agora temos a TabBar logo abaixo
    marginBottom: 15,
    textAlign: 'center',
    color: Colors.text,
  },

  // --- Estilos da TabView ---
  // Note: 'tabView' em si não precisa de estilo aqui se usamos flex: 1 inline no JSX
  tabSceneContainer: {
    flex: 1, // <-- ESSENCIAL! Garante que a View da aba ocupe o espaço.
    //backgroundColor: Colors.background, // Opcional, se precisar definir aqui
    // padding: 15, // Opcional, padding interno da aba
  },
  placeholderText: {
    // Estilo para o texto temporário das abas
    padding: 20,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  tabLabel: {
    // color: Colors.text, // <-- REMOVA esta linha daqui
    fontSize: 13,
    textTransform: 'capitalize',
    fontWeight: '600',
    margin: 0,
    paddingHorizontal: 4, // Pode ajustar/remover se tabStyle já cuida
  },
});
