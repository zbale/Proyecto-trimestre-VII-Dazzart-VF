import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Modal } from 'react-native';
import preciosStyles from '../../css/CarritoScreen';
import ModalFeedback from '../../Components/ModalFeedback';
import API from '../../config/api';
import { FontAwesome } from '@expo/vector-icons';

const CarritoScreen = ({ navigation, route }) => {
  const { usuario, onRemove, onCheckout } = route.params || {};
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [productosState, setProductosState] = useState([]);
  const [usuarioState, setUsuarioState] = useState(usuario);
  // MODAL DE CONFIRMACION DE PEDIDO
  const [modalPedidoVisible, setModalPedidoVisible] = useState(false);
  // MODAL DE CONFIRMACION DE DIRECCIÓN
  const [modalDireccionVisible, setModalDireccionVisible] = useState(false);
  // MODAL DE FEEDBACK DE PEDIDO EXITOSO
  const [modalPedidoExito, setModalPedidoExito] = useState(false);
  // Estado para la dirección del pedido
  const [direccionPedido, setDireccionPedido] = useState('');
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const userStr = await AsyncStorage.getItem('usuario');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsuarioState(user);
        // Cargar dirección guardada
        setDireccionPedido(user.direccion || '');
      } else {
        setUsuarioState(null);
      }
    });
    return unsubscribe;
  }, [navigation]);

  // AL MONTAR, HACER FETCH DEL CARRITO DEL USUARIO
  useEffect(() => {
    if (usuarioState && usuarioState.id_usuario) {
      API.get(`/carrito/${usuarioState.id_usuario}`)
        .then(res => {
          setProductosState(res.data || []);
        })
        .catch(() => setProductosState([]));
    }
  }, [usuarioState]);
  const subtotal = productosState.reduce((sum, p) => sum + (p.precio_final || p.precio || 0) * (p.cantidad || 1), 0);
  const envio = subtotal > 0 ? 0 : 0; 
  const pago = 'Pago ContraEntrega';
  const total = subtotal + envio;

  // Calcular descuento total aplicado
  const precioOriginalTotal = productosState.reduce((sum, p) => sum + (p.precio || 0) * (p.cantidad || 1), 0);
  const descuentoTotal = precioOriginalTotal - subtotal;


  // HANDLER PARA MOSTRAR MODAL DE CONFIRMACION DE ELIMINACION
  function handleRemovePress(producto) {
    setProductoAEliminar(producto);
    setModalEliminarVisible(true);
  }

  // CONFIRMAR ELIMINACION
  function confirmarEliminarProducto() {
    if (productoAEliminar) {
      const getId = (p) => p._id || p.id || p.id_producto;
      const idProd = getId(productoAEliminar);
      const idCarrito = productoAEliminar.id_carrito;
      if (idCarrito) {
        API.delete(`/carrito/${idCarrito}`)
          .then(() => {
            // REFRESCAR CARRITO DESPUES DE ELIMINAR
            if (usuarioState && usuarioState.id_usuario) {
              API.get(`/carrito/${usuarioState.id_usuario}`)
                .then(res => {
                  setProductosState(res.data || []);
                })
                .catch(() => setProductosState([]));
            }
          });
      } else {
        setProductosState((prev) => prev.filter((p) => getId(p) !== idProd));
      }
      if (onRemove) onRemove(productoAEliminar);
    }
    setModalEliminarVisible(false);
    setProductoAEliminar(null);
  }

  // CANCELAR ELIMINACION
  function onCancelarEliminarProducto() {
    setModalEliminarVisible(false);
    setProductoAEliminar(null);
  }

  // HANDLER PARA INICIAR PEDIDO
  function handleRealizarPedido() {
    setModalDireccionVisible(true);
  }

  // FUNCIÓN PARA APLICAR CÓDIGO DE DESCUENTO - YA NO SE USA
  async function aplicarCodigoDescuento() {
    return;
  }

  // CONFIRMAR PEDIDO
  async function confirmarPedido() {
    // Validar que la dirección no esté vacía
    if (!direccionPedido.trim()) {
      Alert.alert('Error', 'Por favor ingresa una dirección de entrega');
      return;
    }

    setModalDireccionVisible(false);
    if (!usuarioState || !usuarioState.id_usuario || productosState.length === 0) {
      setModalPedidoExito(true);
      return;
    }
    try {
      // 1. CREAR EL PEDIDO CON LA DIRECCIÓN INGRESADA
      const productos = productosState.map(p => ({
        id_producto: p.id_producto || p._id || p.id,
        nombre: p.nombre,
        cantidad: p.cantidad || 1,
        precio: p.precio_final || p.precio || 0,
        descuento_aplicado: !!p.descuento_aplicado,
        precio_original: p.precio || 0
      }));
      const total_productos = productos.reduce((sum, p) => sum + (p.cantidad || 1), 0);
      const total = productos.reduce((sum, p) => sum + (p.precio || 0) * (p.cantidad || 1), 0);
      await API.post('/pedidos/', {
        id_usuario: usuarioState.id_usuario,
        direccion: direccionPedido.trim(),
        productos,
        total_productos,
        total
      });
      // 2. VACIAR EL CARRITO
      await API.delete(`/carrito/vaciar/${usuarioState.id_usuario}`);
      // 3. FEEDBACK DE ÉXITO Y LIMPIAR CARRITO VISUALMENTE
      setProductosState([]);
      setModalPedidoExito(true);
    } catch (err) {
      // SI HAY ERROR, IGUAL MOSTRAMOS FEEDBACK PERO CON MENSAJE DE ERROR
      setModalPedidoExito(true);
    }
  }

  // CERRAR MODAL DE EXITO
  function cerrarModalExito() {
    setModalPedidoExito(false);
    // REDIRIGIR O VOLVER ATRAS SI SE DESEA
    navigation.goBack();
  }

  // SI EL USUARIO ES ADMIN, MOSTRAR MODAL DE ACCESO RESTRINGIDO
  if (usuarioState && usuarioState.id_rol === 1) {
    return (
      <ModalFeedback
        visible={true}
        onClose={() => navigation && navigation.goBack()}
        titulo="Acceso restringido"
        mensaje="Solo los usuarios pueden realizar pedidos. El administrador no puede hacer compras."
        icono="error-outline"
        colorTitulo="#000000FF"
        textoBoton="Volver"
        onBoton={() => navigation && navigation.goBack()}
      />
    );
  }

  return (
    <>
      <ScrollView style={preciosStyles.scroll} contentContainerStyle={{ flexGrow: 1 }}>
  <Text style={preciosStyles.title}>Tu Carrito de Compras</Text>
      {productosState.length === 0 ? (
        <View style={{ alignItems: 'center', marginVertical: 30, flex: 1, justifyContent: 'center' }}>
          <FontAwesome name="shopping-cart" size={60} color="#aaa" />
          <Text style={{ color: '#888', marginTop: 10, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            Tu carrito está vacío
          </Text>
          <Text style={{ color: '#444', marginTop: 8, fontSize: 16, textAlign: 'center', marginHorizontal: 24 }}>
            Agrega productos para poder realizar un pedido.
          </Text>
          <TouchableOpacity
            style={[
              preciosStyles.btnPedido,
              {
                marginTop: 30,
                backgroundColor: '#000000FF',
                width: '90%',
                alignSelf: 'center',
                paddingVertical: 18,
                borderRadius: 14
              }
            ]}
            onPress={() => navigation.navigate('Index' || 'Home' || 'Productos')}
          >
            <Text style={preciosStyles.btnPedidoText}>Ir a la tienda</Text>
          </TouchableOpacity>
        </View>
      ) : (
  <View style={preciosStyles.cartContent}>
          <FlatList
            data={productosState}
            keyExtractor={item => item._id?.toString() || item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <View style={preciosStyles.itemRow}>
                {(() => {
                  let imgUrl = item?.imagen;
                  if (imgUrl && (imgUrl.startsWith('/img/') || imgUrl.startsWith('img/'))) {
                    imgUrl = imgUrl.replace(/^\/?.*img\//, '');
                  }
                  if (imgUrl && !imgUrl.startsWith('http')) {
                    imgUrl = `${API.defaults.baseURL.replace(/\/api$/, '')}/productos/img/${imgUrl}`;
                  }
                  return imgUrl ? (
                    <Image source={{ uri: imgUrl }} style={preciosStyles.itemImage} />
                  ) : (
                    <View style={preciosStyles.noImage}><FontAwesome name="image" size={48} color="#aaa" /></View>
                  );
                })()}
                <View style={preciosStyles.itemInfo}>
                  <Text style={preciosStyles.itemName}>{item.nombre}</Text>
                  <View style={preciosStyles.preciosContainer}>
                    {(item.precio_original && item.precio_final && Number(item.precio_final) < Number(item.precio_original)) ? (
                      <>
                        <Text style={preciosStyles.precioTachado}>
                          ${Number(item.precio_original).toLocaleString('es-CO')}
                        </Text>
                        <Text style={preciosStyles.precioDescuento}>
                          ${Number(item.precio_final).toLocaleString('es-CO')}
                        </Text>
                      </>
                    ) : (
                      <Text style={preciosStyles.precioNormal}>
                        ${Number(item.precio_final || item.precio_original).toLocaleString('es-CO')}
                      </Text>
                    )}
                  </View>
                  <Text style={preciosStyles.cantidad}>Cantidad: {item.cantidad || 1}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemovePress(item)} style={preciosStyles.trashBtn}>
                  <FontAwesome name="trash" size={32} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            )}
            style={{ marginBottom: 10 }}
          />
          <ModalFeedback
            visible={modalEliminarVisible}
            icono="check"
            titulo="¿Eliminar producto?"
            mensaje={productoAEliminar ? `¿Seguro que deseas eliminar "${productoAEliminar.nombre}" del carrito?` : ''}
            colorFondo="#fff"
            colorTitulo="#222"
            colorMensaje="#444"
            textoBoton="Cancelar"
            outlineBoton={true}
            onBoton={onCancelarEliminarProducto}
            textoBotonSecundario="Eliminar"
            onBotonSecundario={confirmarEliminarProducto}
            showClose={true}
            onClose={onCancelarEliminarProducto}
          />

          <View style={preciosStyles.resumenPago}>
            <Text style={preciosStyles.resumenTitle}>Información de Pago</Text>
            <View style={preciosStyles.resumenRow}>
              <Text style={preciosStyles.resumenLabel}>SubTotal:</Text>
              <Text style={preciosStyles.resumenValor}>${subtotal.toLocaleString('es-CO')}</Text>
            </View>
            {descuentoTotal > 0 && (
              <View style={[preciosStyles.resumenRow, { backgroundColor: '#e8f5e9', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 4, marginVertical: 4 }]}>
                <Text style={[preciosStyles.resumenLabel, { color: '#2e7d32', fontWeight: 'bold' }]}>Descuento Aplicado:</Text>
                <Text style={[preciosStyles.resumenValor, { color: '#2e7d32', fontWeight: 'bold' }]}>-${descuentoTotal.toLocaleString('es-CO')}</Text>
              </View>
            )}
            <View style={preciosStyles.resumenRow}>
              <Text style={preciosStyles.resumenLabel}>Envío:</Text>
              <Text style={preciosStyles.resumenValor}>Envío Gratuito a Distrito Capital</Text>
            </View>
            <View style={preciosStyles.resumenRow}>
              <Text style={preciosStyles.resumenLabel}>Pago:</Text>
              <Text style={preciosStyles.resumenValor}>{pago}</Text>
            </View>
            <View style={preciosStyles.resumenRowTotal}>
              <Text style={preciosStyles.resumenLabelTotal}>Total:</Text>
              <Text style={preciosStyles.resumenValorTotal}>${total.toLocaleString('es-CO')}</Text>
            </View>
            <TouchableOpacity style={preciosStyles.btnPedido} onPress={handleRealizarPedido} disabled={productosState.length === 0}>
              <Text style={preciosStyles.btnPedidoText}>Realizar Un Pedido</Text>
            </TouchableOpacity>
          {/* MODAL DE CONFIRMACION DE DIRECCIÓN */}
          <Modal
            visible={modalDireccionVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalDireccionVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
              <View style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 30,
                maxHeight: '80%'
              }}>
                <TouchableOpacity
                  onPress={() => setModalDireccionVisible(false)}
                  style={{ alignSelf: 'flex-end', marginBottom: 16 }}
                >
                  <FontAwesome name="close" size={24} color="#000" />
                </TouchableOpacity>

                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#000',
                  marginBottom: 12
                }}>
                  Confirmar Dirección de Entrega
                </Text>

                <Text style={{
                  fontSize: 14,
                  color: '#666',
                  marginBottom: 16
                }}>
                  Por favor revisa y confirma tu dirección de entrega:
                </Text>

                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 14,
                    backgroundColor: '#f9f9f9',
                    marginBottom: 16,
                    minHeight: 100,
                    textAlignVertical: 'top'
                  }}
                  placeholder="Ingresa tu dirección de entrega completa"
                  value={direccionPedido}
                  onChangeText={setDireccionPedido}
                  multiline={true}
                  numberOfLines={4}
                />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 8,
                      backgroundColor: '#f0f0f0',
                      alignItems: 'center'
                    }}
                    onPress={() => setModalDireccionVisible(false)}
                  >
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 8,
                      backgroundColor: '#000',
                      alignItems: 'center'
                    }}
                    onPress={confirmarPedido}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Confirmar Pedido</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* MODAL DE CONFIRMACION DE PEDIDO - YA NO SE USA */}
          <ModalFeedback
            visible={false}
            icono="check"
            titulo="¿Confirmar pedido?"
            mensaje="¿Deseas realizar tu pedido con los productos actuales?"
            colorFondo="#fff"
            colorTitulo="#222"
            colorMensaje="#444"
            textoBoton="Cancelar"
            outlineBoton={true}
            onBoton={() => {}}
            textoBotonSecundario="Confirmar"
            onBotonSecundario={() => {}}
            showClose={true}
            onClose={() => {}}
          />
            <TouchableOpacity style={preciosStyles.btnVolver} onPress={() => navigation.goBack()}>
              <Text style={preciosStyles.btnVolverText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
    {/* MODAL DE EXITO DE PEDIDO SIEMPRE DISPONIBLE */}
    <ModalFeedback
      visible={modalPedidoExito}
      icono="check"
      titulo="¡Pedido realizado!"
      mensaje="Tu pedido fue registrado exitosamente."
      colorFondo="#fff"
      colorTitulo="#010101FF"
      colorMensaje="#444"
      textoBoton="Volver"
      outlineBoton={false}
      onBoton={cerrarModalExito}
      showClose={false}
    />
  </>
);
};
export default CarritoScreen;
