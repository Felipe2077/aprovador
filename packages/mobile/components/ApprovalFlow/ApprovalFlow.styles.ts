// packages/mobile/components/ApprovalFlow/ApprovalFlow.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

export default StyleSheet.create({
  container: {
    marginTop: 20, // Espaço acima da seção
    marginBottom: 10,
  },
  title: {
    fontSize: 16, // Um pouco menor que o título principal da tela
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    // Removendo a borda inferior que estava no sectionTitle geral
  },
  stepItem: {
    // Estilo para cada passo/aprovador na sequência
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginLeft: 5, // Leve indentação
    borderLeftWidth: 2, // Linha vertical à esquerda
    borderLeftColor: Colors.border, // Cor da linha
    paddingLeft: 10, // Espaço após a linha
  },
  stepIcon: {
    marginRight: 10, // Espaço entre ícone e texto
    width: 20, // Largura fixa para alinhar
    textAlign: 'center',
  },
  stepText: {
    fontSize: 15,
    flex: 1, // Ocupa espaço restante
  },
  statusPending: {
    color: Colors.warning, // Laranja para pendente
    fontWeight: 'bold',
  },
  statusApproved: {
    color: Colors.success, // Verde para aprovado
  },
  statusDefault: {
    color: Colors.textMuted, // Cinza para não iniciado
  },
});
