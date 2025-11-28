import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import API from '../config/api';
import styles from '../css/ProductosList';

export const ProductoCard = ({ producto, onVerDetalle, onAgregarCarrito, showIcons, onPress }) => {
  let imgUrl = undefined;
  if (producto?.imagen) {
    // UNIFICA SIEMPRE MUSTRARA LA IMAGEN SIN IMPORATR EL FORMATO DEL QUE SE GUARDO
    const nombreArchivo = producto.imagen.replace(/^\/?img\//, '');
    imgUrl = `${API.defaults.baseURL.replace(/\/api$/, '')}/productos/img/${encodeURIComponent(nombreArchivo)}`;
  }

  // FORMATEO DE PRECIOS CON PUNTOS DE MILES
  const precioOriginal = Number(producto?.precio) || 0;
  const precioFinal = Number(producto?.precio_final) || 0;
  const precioOriginalStr = `$${precioOriginal.toLocaleString('es-CO')}`;
  const precioFinalStr = `$${precioFinal.toLocaleString('es-CO')}`;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.imageContainer}
        onPress={onPress}
      >
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <FontAwesome name="image" size={60} color="#aaa" />
          </View>
        )}
        {/* BADGE DE DESCUENTO */}
        {producto?.descuento_aplicado && (
          <View style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: '#43a047',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 4,
            zIndex: 10
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
              {producto.descuento_aplicado.tipo_descuento?.toLowerCase() === 'porcentaje' 
                ? `-${producto.descuento_aplicado.valor}%` 
                : `-$${Number(producto.descuento_aplicado.valor).toLocaleString('es-CO')}`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {showIcons && (
        <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', zIndex: 2 }}>
          <TouchableOpacity onPress={() => onVerDetalle(producto)} style={{ marginHorizontal: 4 }}>
            <FontAwesome name="search" size={26} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onAgregarCarrito(producto)} style={{ marginHorizontal: 4 }}>
            <FontAwesome name="shopping-cart" size={26} color="#444" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.nombre} numberOfLines={2}>{producto?.nombre || ''}</Text>
        <Text style={styles.descripcion} numberOfLines={2}>{producto?.descripcion || ''}</Text>
        {producto?.descuento_aplicado ? (
          <View style={{ marginTop: 8 }}>
            {/* Precio original tachado */}
            <Text style={styles.precioTachado}>{precioOriginalStr}</Text>
            {/* Precio con descuento en azul (igual que DetalleProducto) */}
            <Text style={{ ...styles.precioDescuento, color: '#3483fa', fontWeight: 'bold', fontSize: 16 }}>{precioFinalStr}</Text>
          </View>
        ) : (
          <Text style={styles.precioNormal}>{precioOriginalStr}</Text>
        )}
      </View>
    </View>
  );
};

const ProductosList = ({ onAgregarCarrito, usuario, onVerDetalle }) => {
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIcons, setShowIcons] = useState(false);
  const hideIconsTimeout = React.useRef(null);
  const flatListRef = React.useRef(null);
  // REPETIR EL ARRAY MÁS VECES PARA UN LOOP MÁS LARGO Y FLUIDO
  const repeatCount = 21; 
  const loopedProductos = productos.length > 0 ? Array(repeatCount).fill(productos).flat() : [];
  const middleIndex = productos.length * Math.floor(repeatCount / 2);

  useEffect(() => {
    API.get('/productos/listar')
      .then(res => {
        // SE MUESTRAN SOLO MAS NUEVOS PRODUCTOS Y POR ID
        let arr = res.data;
        if (arr && arr.length > 0) {
          arr = arr.sort((a, b) => {
            if (a.fecha_creacion && b.fecha_creacion) {
              return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
            }
            return (b._id || b.id || 0) - (a._id || a.id || 0);
          });
          arr = arr.slice(0, 10);
        }
        setProductos(arr);
        setLoading(false);
        setTimeout(() => {
          if (flatListRef.current && arr.length > 0) {
            flatListRef.current.scrollToIndex({ index: middleIndex, animated: false });
          }
        }, 300);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />;
  }

  // CARRUSEL HORIZONTAL DE LOS 10 PRODUCTOS MAS NUEVOS
  return (
    <View style={styles.listContainer}>
      <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 12, textAlign: 'center' }}>
        Nuevos Productos
      </Text>
      <FlatList
        ref={flatListRef}
        data={loopedProductos}
        keyExtractor={(item, idx) => {
          const realId = item && (item._id || item.id || item.id_producto || 'sinid');
          return `${realId}-loop-${idx}`;
        }}
        renderItem={({ item }) => (
          <ProductoCard
            producto={item}
            showIcons={showIcons}
            onVerDetalle={onVerDetalle}
            onAgregarCarrito={onAgregarCarrito}
            onPress={() => navigation.navigate('DetalleProducto', { producto: item, usuario })}
          />
        )}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
        style={{ minHeight: 360 }}
        initialScrollIndex={middleIndex}
        getItemLayout={(_, index) => ({ length: 226, offset: 226 * index, index })} // 210 (card) + 16 (marginRight)
        onScrollBeginDrag={() => {
          if (hideIconsTimeout.current) {
            clearTimeout(hideIconsTimeout.current);
          }
          setShowIcons(true);
        }}
        onMomentumScrollEnd={() => {
          // SE OCULTAN ICONOS DESPUES DE 950ms
          if (hideIconsTimeout.current) {
            clearTimeout(hideIconsTimeout.current);
          }
          hideIconsTimeout.current = setTimeout(() => {
            setShowIcons(false);
          }, 950);
        }}
      />
    </View>
  );
};

export default ProductosList;