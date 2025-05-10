import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; //

export default StyleSheet.create({
  itemContainer: {
    backgroundColor: Colors.card,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,

    elevation: 8,
  },
  itemOuterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 12, // Adicionado para consistência com seu estilo anterior
    //overflow: 'hidden', // Importante para o borderRadius da faixa funcionar
    elevation: 3, // Sombra Android
    shadowColor: '#000', // Sombra iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginVertical: 10,
  },
  dueDateIndicator: {
    width: 6, // Largura da faixa
    borderBottomLeftRadius: 8,
  },
  itemContentContainer: {
    flex: 1, // Ocupa o restante do espaço
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12, // Padding à esquerda do conteúdo, após a faixa
    paddingRight: 15, // Padding à direita do conteúdo (era do seu itemContainer antigo)
    marginTop: 15,
    borderRadius: 8,
  },

  textContainer: {
    flex: 1, // Para o payee usar o espaço e quebrar linha
    marginRight: 10, // Espaço antes do amountContainer
  },
  payee: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  requester: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2, // Era marginBottom, ajustei para marginTop
  },
  dueDate: {
    fontSize: 14,
    color: Colors.textMuted, // Era textSecondary
    marginTop: 4,
  },
  amountContainer: {
    paddingLeft: 8,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 2,
  },
  // ---  ESTILOS PARA O BADGE ---
  dueDateBadge: {
    position: 'absolute', // Para posicionar no canto
    top: 8, // Distância do topo do card
    right: 8, // Distância da direita do card
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 12, // Bem arredondado
    elevation: 4, // Para ficar acima do conteúdo do card se houver sobreposição
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12, // Texto pequeno
    fontWeight: 'bold',
  },
  // ------------------------------------
});
