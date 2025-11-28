import React, { useEffect, useRef, useState } from 'react';
import { View, Image, TouchableOpacity, Linking, Animated, StyleSheet } from 'react-native';

// IMPORTAR IMAGENES
import marca1 from '../assets/MSI.webp';
import marca2 from '../assets/FANTECH.webp';
import marca3 from '../assets/High_Resolution_PNG-LogitechG_horz_RGB_cyan_SM-1024x307.png';
import marca4 from '../assets/ASTRO-1.webp';
import marca5 from '../assets/LG-ULTRAGEAR-1.webp';

const marcas = [
  { id: 1, img: marca1, alt: 'MSI', url: 'https://latam.msi.com/' },
  { id: 2, img: marca2, alt: 'Fantech', url: 'https://fantechworld.com/' },
  { id: 3, img: marca3, alt: 'Logitech', url: 'https://www.logitechstore.com.co/' },
  { id: 4, img: marca4, alt: 'Astro', url: 'https://www.marca4.com' },
  { id: 5, img: marca5, alt: 'LG', url: 'https://www.marca5.com' },
];

const Marcas = () => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const itemWidth = 220; // width + margin (200 + 20)
    const totalWidth = itemWidth * marcas.length;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % marcas.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * itemWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000); // Cambiar cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={marcasStyles.section}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={marcasStyles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        pagingEnabled
      >
        {marcas.map(({ id, img, alt, url }) => (
          <TouchableOpacity
            key={id}
            style={marcasStyles.item}
            onPress={() => url && Linking.openURL(url)}
          >
            <Image source={img} style={marcasStyles.img} accessibilityLabel={alt} />
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const marcasStyles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  item: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
  },
  img: {
    height: 80,
    width: 200,
    resizeMode: 'contain',
  },
});

export default Marcas;
