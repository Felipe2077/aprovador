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

  // --- Estilo para estado Desabilitado/Loading ---
  disabled: {
    opacity: 0.6, // Reduz a opacidade
  },
});

// Função auxiliar para pegar a cor do texto da variante (usada para o ActivityIndicator)
export function getTextColorForVariant(
  variant: VariantTextColorKeys = 'default'
): string {
  // Agora o TypeScript sabe que 'variant' SÓ PODE ser 'primary', 'success', etc.
  // O acesso variantTextColors[variant] é seguro.
  // O fallback || ainda é bom por segurança extra, mas tecnicamente menos necessário.
  return variantTextColors[variant] || variantTextColors.default;
}
