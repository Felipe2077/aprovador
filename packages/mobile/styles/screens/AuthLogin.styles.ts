// packages/mobile/styles/screens/AuthLogin.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho se necessário

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Usa cor de fundo do tema
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: Colors.text,
    borderColor: Colors.border, // Cor da borda
    borderWidth: 1,
    borderStyle: 'solid',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.primary, // Cor primária para o botão
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.background, // Texto do botão contrastante
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.error, // Cor de erro
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
