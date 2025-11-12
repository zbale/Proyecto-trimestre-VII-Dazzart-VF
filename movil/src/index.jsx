import React, { useState } from 'react';
import API from './config/api';
import { View, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Alert, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';


import Header from './Components/Header';
import ModalLogin from './Components/ModalLogin';
import ModalFeedback from './Components/ModalFeedback';
import Footer from './Components/Footer';
import Marcas from './Components/Marcas';
import BannerCarrusel from './Components/BannerCarrusel';
import ProductosList from './Components/ProductosList';
import ModalDetalleProducto from './Components/ModalDetalleProducto';
import MenuLateral from './Components/MenuLateral';
import PerfilDropdown from './Components/PerfilDropdown';

const Index = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [menuVisible, setMenuVisible] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [debugMsg, setDebugMsg] = useState('Iniciando...');
  const [showDebug, setShowDebug] = useState(true);
  
  // DEBUG: Verificar conexión al backend al iniciar
  React.useEffect(() => {
    const testBackend = async () => {
      try {
        setDebugMsg('Conectando al backend...');
        const res = await API.get('/productos/listar');
        const count = Array.isArray(res.data) ? res.data.length : 0;
        setDebugMsg(`✅ CONECTADO! ${count} productos disponibles`);
        Alert.alert('DEBUG', `✅ Backend conectado exitosamente!\n${count} productos en BD`);
      } catch (err) {
        const errorMsg = err?.message || 'Error desconocido';
        setDebugMsg(`❌ Error de conexión: ${errorMsg}`);
        Alert.alert('ERROR DE CONEXIÓN', `No se pudo conectar al backend en 67.202.48.5:3001\n\nError: ${errorMsg}`);
      }
    };
    
    testBackend();
  }, []);
  
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const userStr = await AsyncStorage.getItem('usuario');
      if (userStr) setUsuario(JSON.parse(userStr));
      else setUsuario(null);
    });
    return unsubscribe;
  }, [navigation]);
  const [carrito, setCarrito] = useState([]);
  const [modalAgregadoVisible, setModalAgregadoVisible] = useState(false);
  const [perfilDropdownVisible, setPerfilDropdownVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [modalRestringido, setModalRestringido] = useState(false);

  const handleAgregarCarrito = async (producto, cantidad = 1) => {
    if (!usuario) {
      setLoginVisible(true);
      return;
    }
    // Si es admin, mostrar modal y no agregar
    if (usuario.id_rol === 1) {
      setModalRestringido(true);
      return;
    }
    try {
      await API.post('/carrito', {
        id_usuario: usuario.id_usuario,
        id_producto: producto._id || producto.id || producto.id_producto,
        cantidad: cantidad,
      });
      // RECARGAR CARRITO ACTUALIZADO
      const res = await API.get(`/carrito/${usuario.id_usuario}`);
      setCarrito(res.data || []);
    } catch {
    }
    setModalAgregadoVisible(true);
  };

  // SE CARGAN PRODUCTOS EN EL CARRITO AL INICIAR SESION
  const handleLogin = async (user) => {
    setUsuario(user);
    if (user && user.id_usuario) {
      try {
        const res = await API.get(`/carrito/${user.id_usuario}`);
        setCarrito(res.data || []);
      } catch {
        setCarrito([]);
      }
    } else {
      setCarrito([]);
    }
  };

  // HANDLER PARA ELIMINAR PRODUCTO DEL CARRITO
  const handleRemoveCarrito = async (producto) => {
    const getId = (p) => p._id || p.id || p.id_producto;
    const idProd = getId(producto);
    const prod = carrito.find((p) => getId(p) === idProd);
    if (prod && prod.id_carrito) {
      try {
        await API.delete(`/carrito/${prod.id_carrito}`);
        // RECARGAR CARRITO ACTUALIZADO
        const res = await API.get(`/carrito/${usuario.id_usuario}`);
        setCarrito(res.data || []);
      } catch {
      }
    } else {
      setCarrito((prev) => prev.filter((p) => getId(p) !== idProd));
    }
  };

 
  const handleCheckout = () => {
    // FALTA LA LOGICA PARA LA COMPRA DESDE EL CARRITO DE COMPRAS
    setCarrito([]);
    
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={() => perfilDropdownVisible && setPerfilDropdownVisible(false)}>
        <View style={styles.container}>
        <Header
          onMenuPress={() => setMenuVisible(true)}
          onLoginPress={(e) => {
            e && e.stopPropagation && e.stopPropagation();
            if (usuario) {
              setPerfilDropdownVisible((v) => !v);
            } else {
              setLoginVisible(true);
            }
          }}
          onCartPress={() => {
            if (!usuario) {
              setLoginVisible(true);
              return;
            }
            navigation.navigate('Carrito', { usuario });
          }}
          usuario={usuario}
          onSearch={(searchText) => {
            if (searchText && searchText.trim().length > 0) {
              navigation.navigate('VistaProductos', { search: searchText });
            }
          }}
        />
        {showDebug && (
          <View style={{ backgroundColor: '#f0f0f0', padding: 10, marginHorizontal: 10, marginTop: 5, borderRadius: 5 }}>
            <Text style={{ fontSize: 12, color: '#333', fontWeight: 'bold' }}>DEBUG: {debugMsg}</Text>
            <Text style={{ fontSize: 10, color: '#666', marginTop: 3 }} onPress={() => setShowDebug(false)}>Toca para cerrar</Text>
          </View>
        )}
        <ModalDetalleProducto
          visible={modalDetalleVisible}
          producto={productoDetalle}
          onClose={() => setModalDetalleVisible(false)}
          onAgregarCarrito={handleAgregarCarrito}
        />
        <ModalLogin
          visible={loginVisible}
          onClose={() => setLoginVisible(false)}
          onLogin={handleLogin}
        />
  {/* MODAL DE AUTENTICADO */}
        {/* MODAL DE PRODUCTO AGREGADO */}
        <ModalFeedback
          visible={modalAgregadoVisible}
          icono="check"
          titulo="Producto agregado"
          mensaje="Producto agregado al carrito"
          colorFondo="#fff"
          colorTitulo="#222"
          colorMensaje="#444"
          textoBoton="Cerrar"
          outlineBoton={true}
          onBoton={() => setModalAgregadoVisible(false)}
          textoBotonSecundario="Ir al carrito"
          onBotonSecundario={() => {
            setModalAgregadoVisible(false);
            navigation.navigate('Carrito', { usuario });
          }}
          showClose={true}
          onClose={() => setModalAgregadoVisible(false)}
        />
        <ModalFeedback
          visible={modalRestringido}
          icono="error-outline"
          titulo="Acceso restringido"
          mensaje="Solo los usuarios pueden agregar productos al carrito. El administrador no puede hacer compras."
          colorFondo="#fff"
          colorTitulo="#000000FF"
          colorMensaje="#444"
          textoBoton="Cerrar"
          outlineBoton={true}
          onBoton={() => setModalRestringido(false)}
          showClose={true}
          onClose={() => setModalRestringido(false)}
        />
        <BannerCarrusel />
        <View style={styles.content}>
          <ProductosList
            onAgregarCarrito={handleAgregarCarrito}
            usuario={usuario}
            onVerDetalle={producto => {
              setProductoDetalle(producto);
              setModalDetalleVisible(true);
            }}
          />
        </View>
        <Marcas />
        <SafeAreaView style={styles.safeFooter}>
          <Footer />
        </SafeAreaView>
        <MenuLateral visible={menuVisible} onClose={() => setMenuVisible(false)} />
        <PerfilDropdown
          visible={perfilDropdownVisible}
          usuario={usuario}
          onLogout={async () => {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem('usuario');
            setUsuario(null);
            setPerfilDropdownVisible(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Index' }],
            });
          }}
          onMisCompras={() => {
            setPerfilDropdownVisible(false);
            navigation.navigate('MisCompras');
          }}
          onMisDatos={() => {
            setPerfilDropdownVisible(false);
            navigation.navigate('MisDatos');
          }}
        />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeFooter: {
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
    carruselContainer: {
    height: 260, 
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default Index;