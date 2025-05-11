// packages/mobile/components/AuthLoadingSkeleton/AuthLoadingSkeleton.tsx
import React from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Colors from '../../constants/Colors'; // Ajuste o caminho se necessário
import styles from './AuthLoadingSkeleton.styles';

const AuthLoadingSkeleton = () => {
  return (
    <SkeletonPlaceholder
      backgroundColor={Colors.card} // Cor de fundo do esqueleto
      highlightColor={Colors.card2} // Cor do brilho/shimmer
      speed={1000} // Velocidade da animação do shimmer
    >
      <View style={styles.container}>
        {/* Skeleton para o Header */}
        <View style={styles.headerPlaceholder} />

        {/* Skeleton para alguns Itens da Lista */}
        <View style={styles.listItemPlaceholder} />
        <View style={styles.listItemPlaceholder} />
        <View style={styles.listItemPlaceholder} />
        <View style={styles.listItemPlaceholder} />
        <View style={styles.listItemPlaceholder} />

        <View style={styles.tabBarPlaceholder}>
          <View style={styles.tabItemPlaceholder} />
          <View style={styles.tabItemPlaceholder} />
          <View style={styles.tabItemPlaceholder} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

export default AuthLoadingSkeleton;
