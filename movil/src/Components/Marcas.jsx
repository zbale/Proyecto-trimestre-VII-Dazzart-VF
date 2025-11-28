import React from 'react';
import { View, Image, TouchableOpacity, Linking, StyleSheet, Animated } from 'react-native';

// IMPORTAR IMAGENES
import marca1 from '../assets/MSI.webp';
import marca2 from '../assets/FANTECH.webp';
import marca3 from '../assets/High_Resolution_PNG-LogitechG_horz_RGB_cyan_SM-1024x307.png';
import marca4 from '../assets/ASTRO-1.webp';
import marca5 from '../assets/LG-ULTRAGEAR-1.webp';

const marcasOriginal = [
  { id: 1, img: marca1, alt: 'MSI', url: 'https://latam.msi.com/' },
  { id: 2, img: marca2, alt: 'Fantech', url: 'https://fantechworld.com/' },
  { id: 3, img: marca3, alt: 'Logitech', url: 'https://www.logitechstore.com.co/' },
  { id: 4, img: marca4, alt: 'Astro', url: 'https://www.marca4.com' },
  { id: 5, img: marca5, alt: 'LG', url: 'https://www.marca5.com' },
];

// Repetir marcas para carrusel infinito
const marcas = Array(20).fill(marcasOriginal).flat();

const Marcas = () => {
  const scrollX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -marcasOriginal.length * 220, // Desplazar una vuelta completa
        duration: 30000, // 30 segundos para una vuelta completa (continuo)
        useNativeDriver: true,
      })
    ).start();
  }, [scrollX]);

  return (
    <View style={marcasStyles.section}>
      <Animated.View
        style={[
          marcasStyles.scrollContent,
          {
            transform: [{ translateX: scrollX }],
          },
        ]}
      >
        {marcas.map(({ id, img, alt, url }, index) => (
          <TouchableOpacity
            key={`${id}-${index}`}
            style={marcasStyles.item}
            onPress={() => url && Linking.openURL(url)}
          >
            <Image source={img} style={marcasStyles.img} accessibilityLabel={alt} />
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const marcasStyles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 0,
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 100,
  },
  img: {
    height: 80,
    width: 200,
    resizeMode: 'contain',
  },
});

export default Marcas;
