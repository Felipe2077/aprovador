// packages/mobile/components/AttachmentList/AttachmentList.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  container: {
    marginTop: 20, // Espaço acima da seção
    marginBottom: 10,
  },
  title: {
    fontSize: 16, // Mesmo tamanho do título do Fluxo
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  item: {
    // Estilo para cada linha de anexo
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    // borderBottomWidth: 1, // Linha separadora opcional
    // borderBottomColor: Colors.border,
  },
  icon: {
    marginRight: 10,
    width: 20, // Largura fixa para alinhar
    textAlign: 'center',
  },
  text: {
    // Estilo para o nome do arquivo
    fontSize: 15,
    color: Colors.link, // Cor de link, indicando clicável
    flexShrink: 1, // Permite quebrar nome longo
  },
  placeholderText: {
    // Estilo se não houver anexos
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 5,
    fontStyle: 'italic',
    // textAlign: 'center', // Opcional
  },
});
