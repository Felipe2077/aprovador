// packages/mobile/babel.config.js
module.exports = function (api) {
  api.cache(true); // Habilita o cache do Babel para builds mais rápidos
  return {
    presets: [
      // Preset padrão da Expo: já inclui as transformações básicas
      // para React Native, JSX, TypeScript (básico), etc.
      'babel-preset-expo'
    ],
    plugins: [
      // Plugin do Expo Router: Essencial para o sistema de rotas baseado
      // em arquivos, rotas tipadas, API routes (se usar), etc., funcionar.
      'expo-router/babel',

      // Plugin do Reanimated: Necessário para o Reanimated v2/v3 funcionar.
      // Ele reescreve partes do seu código para otimizações e execução na thread de UI.
      // **IMPORTANTE:** Deve ser sempre o ÚLTIMO plugin na lista.
      'react-native-reanimated/plugin',
    ],
  };
};