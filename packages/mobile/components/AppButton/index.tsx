// packages/mobile/components/AppButton/index.tsx
import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle, // Importe TextStyle
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import styles from './AppButton.styles'; // Importa também a função helper

// Tipos aceitos para a variante do botão
type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'muted'
  | 'default'
  | 'neutral';

// Props que o componente aceita
interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  iconLeft?: React.ReactNode; // Espera um componente Ícone como filho React
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>; // Estilos customizados para o container
}

export default function AppButton({
  title,
  onPress,
  variant = 'default',
  iconLeft,
  isLoading = false,
  disabled = false,
  style,
}: AppButtonProps) {
  // O botão está desabilitado se 'disabled' for true OU se 'isLoading' for true
  const isDisabled = disabled || isLoading;

  const getVariantContainerStyle = (variant: ButtonVariant): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.containerPrimary;
      case 'success':
        return styles.containerSuccess;
      case 'danger':
        return styles.containerDanger;
      case 'warning':
        return styles.containerWarning;
      case 'muted':
        return styles.containerMuted;
      case 'neutral':
        return styles.containerNeutral;
      default:
        return styles.containerDefault;
    }
  };
  const getVariantTextStyle = (variant: ButtonVariant): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.textPrimary;
      case 'success':
        return styles.textSuccess;
      case 'danger':
        return styles.textDanger;
      case 'warning':
        return styles.textWarning;
      case 'muted':
        return styles.textMuted;
      case 'neutral':
        return styles.textNeutral;
      default:
        return styles.textDefault;
    }
  };
  // Monta o array de estilos para o container do botão
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    // Aplica o estilo da variante dinamicamente (ex: styles.containerSuccess)
    getVariantContainerStyle(variant),
    // Aplica o estilo de desabilitado se necessário
    isDisabled ? styles.disabled : {},
    style, // Aplica estilos customizados passados via prop (sobrescreve anteriores se houver conflito)
  ];

  // Monta o array de estilos para o texto do botão
  const textStyle: StyleProp<TextStyle> = [
    styles.text,
    getVariantTextStyle(variant),
  ];

  // Pega a cor do texto/ícone para usar no ActivityIndicator
  const loadingColor = getVariantTextStyle(variant).color || Colors.text; // Pega a cor do estilo retornado pelo helper
  if (variant === 'primary') {
    console.log(
      `--- DEBUG AppButton (variant="primary", title="${title}") ---`
    );
    // Log o objeto de estilo retornado pelo helper:
    console.log(
      'Estilo Texto da Variante (do helper):',
      JSON.stringify(getVariantTextStyle(variant))
    );
    // Log o estilo final que será aplicado ao <Text>
    console.log(
      'Estilo Final do Texto (flattened):',
      JSON.stringify(StyleSheet.flatten(textStyle))
    );
    console.log('----------------------------------------------------------');
  }
  // --- Fim do Console Log ---
  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7} // Efeito visual leve ao pressionar
    >
      {isLoading ? (
        // Se estiver carregando, mostra o indicador de atividade
        <ActivityIndicator size='small' color={loadingColor} />
      ) : (
        // Se não estiver carregando, mostra ícone (se houver) e texto
        <>
          {iconLeft && <View style={styles.iconWrapper}>{iconLeft}</View>}
          <Text style={StyleSheet.flatten(textStyle)}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
