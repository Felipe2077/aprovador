// constants/Colors.ts

// Defina suas cores baseadas no Figma aqui
const tintColorDark = '#fff'; // Cor de destaque/tint padrão para modo escuro

// Objeto com as cores do seu tema escuro fixo
export default {
  // Cores de Texto
  text: '#FFFFFF', // Texto principal
  textSecondary: '#a1a1a1', // Texto secundário/mais claro
  textMuted: '#777777', // Texto ainda mais sutil
  link: '#62A0FC', // Cor para links (exemplo)

  // Cores de Fundo
  background: '#111', // Fundo principal escuro
  card: '#151515', // Fundo para cards, headers, elementos elevados
  card2: '#191919',
  inputBackground: '#2C2C2E', // Fundo para inputs (exemplo)

  // Cores de Acento/Primárias
  primary: '#FACC15', // Sua cor primária (roxo exemplo)
  accent: '#03DAC5', // Uma cor de acento secundária (ciano exemplo)

  // Cores de Status/Feedback
  success: '#4CAF50', // Verde para sucesso
  warning: '#FFC107', // Amarelo para aviso
  error: '#F44336', // Vermelho para erro

  // Outras Cores
  border: '#27272A', // Bordas sutis
  separator: '#3A3A3C', // Separadores
  tint: tintColorDark, // Cor de tint/destaque padrão
  tabIconDefault: '#ccc', // Cor de ícone de tab inativo (se usar tabs)
  tabIconSelected: tintColorDark, // Cor de ícone de tab ativo (se usar tabs)
};
