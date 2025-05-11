// packages/mobile/components/PaymentDetailSkeleton/PaymentDetailSkeleton.tsx
import React from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Colors from '../../../constants/Colors'; // Ajuste o caminho
import styles from './PaymentDetailSkeleton.styles';

const PaymentDetailSkeleton = () => {
  const skeletonBackgroundColor = Colors.card;
  const skeletonHighlightColor = Colors.card2 || Colors.inputBackground;

  return (
    <View style={styles.container}>
      <SkeletonPlaceholder
        backgroundColor={skeletonBackgroundColor}
        highlightColor={skeletonHighlightColor}
        speed={1000}
      >
        {/* Usamos um View wrapper para o SkeletonPlaceholder aplicar padding/margem corretamente */}
        <View style={styles.placeholderWrapper}>
          {/* Título da Tela */}
          <SkeletonPlaceholder.Item {...styles.titlePlaceholder} />

          {/* Barra de Abas (simulando 2 abas) */}
          <SkeletonPlaceholder.Item {...styles.tabBarPlaceholder}>
            <SkeletonPlaceholder.Item {...styles.tabItemPlaceholder} />
            <SkeletonPlaceholder.Item {...styles.tabItemPlaceholder} />
          </SkeletonPlaceholder.Item>

          {/* Conteúdo da Aba "Informações" (simulado) */}
          <View style={styles.contentBlock}>
            {/* Simulando PaymentDetailCard */}
            <SkeletonPlaceholder.Item {...styles.line} marginTop={10} />
            <SkeletonPlaceholder.Item {...styles.shortLine} />
            <SkeletonPlaceholder.Item {...styles.line} marginTop={15} />
            <SkeletonPlaceholder.Item {...styles.shortLine} />
            <SkeletonPlaceholder.Item {...styles.line} marginTop={15} />
            <SkeletonPlaceholder.Item {...styles.shortLine} />

            {/* Simulando ApprovalFlow */}
            <SkeletonPlaceholder.Item
              {...styles.line}
              marginTop={30}
              width='50%'
            />
            <SkeletonPlaceholder.Item {...styles.shortLine} marginTop={10} />
            <SkeletonPlaceholder.Item {...styles.shortLine} />

            {/* Simulando AttachmentList */}
            <SkeletonPlaceholder.Item
              {...styles.line}
              marginTop={30}
              width='40%'
            />
            <SkeletonPlaceholder.Item {...styles.shortLine} marginTop={10} />
          </View>
        </View>
      </SkeletonPlaceholder>

      {/* Botões de Ação (separados para não terem shimmer ou terem shimmer diferente) */}
      {/* Para ter shimmer aqui, envolva em outro SkeletonPlaceholder */}
      {/* Por enquanto, apenas um View com a mesma cor de fundo dos itens do esqueleto */}
      <View style={styles.actionButtonRowPlaceholder}>
        <View
          style={[
            styles.actionButtonPlaceholder,
            { backgroundColor: skeletonBackgroundColor },
          ]}
        />
        <View
          style={[
            styles.actionButtonPlaceholder,
            { backgroundColor: skeletonBackgroundColor },
          ]}
        />
        <View
          style={[
            styles.actionButtonPlaceholder,
            { backgroundColor: skeletonBackgroundColor },
          ]}
        />
      </View>
    </View>
  );
};

export default PaymentDetailSkeleton;
