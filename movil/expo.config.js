module.exports = {
  expo: {
    name: 'Dazzart Components',
    slug: 'movil',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/logo.png',
    scheme: 'dazzart-components',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.zbale.movil',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/logo.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.zbale.movil',
      usesCleartextTraffic: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './src/assets/logo.png',
    },
    splash: {
      image: './src/assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    plugins: [
      // 'expo-router',  // Deshabilitado: usando react-navigation directamente
      [
        'expo-splash-screen',
        {
          image: './src/assets/logo.png',
          imageWidth: 300,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '60a085e2-f299-4b11-b258-6dae20f85fab',
      },
      EXPO_PUBLIC_API_URL: 'http://67.202.48.5:3001',
    },
  },
};
