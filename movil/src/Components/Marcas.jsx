import React, { useEffect, useRef, useState } from 'react';
import { View, Image, TouchableOpacity, Linking, Animated, StyleSheet, FlatList } from 'react-native';

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
const marcas = Array(21).fill(marcasOriginal).flat();

const Marcas = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemWidth = 220; // width del item
  const middleIndex = marcasOriginal.length * Math.floor(21 / 2);

  useEffect(() => {
    // Posicionar en el medio al montar
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: middleIndex, animated: false });
    }, 300);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 2500); // Cada 2.5 segundos (sin pausas, desfiladero constante)

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / itemWidth);
    
    // Si llegamos al final o casi al inicio, reiniciar en el medio
    if (index >= marcas.length - marcasOriginal.length) {
      flatListRef.current?.scrollToIndex({ index: middleIndex, animated: false });
      setCurrentIndex(middleIndex);
    }
  };

  return (
    <View style={marcasStyles.section}>
      <FlatList
        ref={flatListRef}
        data={marcas}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={marcasStyles.item}
            onPress={() => item.url && Linking.openURL(item.url)}
          >
            <Image source={item.img} style={marcasStyles.img} accessibilityLabel={item.alt} />
          </TouchableOpacity>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={marcasStyles.scrollContent}
        getItemLayout={(data, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
      />
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
    height: 100,
  },
  img: {
    height: 80,
    width: 200,
    resizeMode: 'contain',
  },
});

export default Marcas;
