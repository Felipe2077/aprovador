// packages/mobile/components/AppButton/AppButton.styles.ts
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors'; // Ajuste o caminho

// Define as cores de TEXTO/ÍCONE para cada variante para garantir contraste
// Ajuste aqui se necessário com base nas suas cores exatas!
const variantTextColors = {
  primary: Colors.background,
  success: Colors.successText,
  danger: Colors.dangerText,
  warning: Colors.warningText,
  muted: Colors.text,
  default: Colors.text,
  neutral: Colors.background,
  link: Colors.primary,
};
type VariantTextColorKeys = keyof typeof variantTextColors;

export default StyleSheet.create({
  // Estilo base do container do botão
  container: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15, // Um pouco menor para caber com ícone
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Estilo para o container/wrapper do ícone
  iconWrapper: {
    marginRight: 8, // Espaço entre ícone e texto
  },
  containerLink: {
    backgroundColor: 'transparent', // Fundo transparente
    paddingVertical: 6, // Padding menor para um look mais sutil
    paddingHorizontal: 8,
    flex: undefined, // Remove o flex: 1 do estilo base
    flexGrow: 0, // Não permite crescer
    flexShrink: 1, // Permite encolher se necessário
    // Não precisa de minWidth ou marginHorizontal aqui, pois será um botão pequeno
  },

  // --- Estilos das Variantes (Background) ---
  containerPrimary: { backgroundColor: Colors.primary },
  containerSuccess: { backgroundColor: Colors.success },
  containerDanger: { backgroundColor: Colors.error },
  containerWarning: { backgroundColor: Colors.warning },
  containerMuted: { backgroundColor: Colors.textMuted },
  containerDefault: { backgroundColor: Colors.card },
  containerNeutral: { backgroundColor: Colors.neutral },

  // --- Estilos das Variantes (Cor do Texto/Ícone) ---
  textPrimary: { color: variantTextColors.primary },
  textSuccess: { color: variantTextColors.success },
  textDanger: { color: variantTextColors.danger },
  textWarning: { color: variantTextColors.warning },
  textMuted: { color: variantTextColors.muted },
  textDefault: { color: variantTextColors.default },
  textNeutral: { color: variantTextColors.neutral },
  textLink: { color: variantTextColors.link },

  // --- Estilo para estado Desabilitado/Loading ---
  disabled: {
    opacity: 0.6, // Reduz a opacidade
  },
});

// Função auxiliar para pegar a cor do texto da variante (usada para o ActivityIndicator)
export function getTextColorForVariant(
  variant: VariantTextColorKeys = 'default'
): string {
  return variantTextColors[variant] || variantTextColors.default;
}
