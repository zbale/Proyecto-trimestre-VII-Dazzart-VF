import ModalLogin from '../../Components/ModalLogin';
import API from '../../config/api';

import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, useWindowDimensions, TouchableWithoutFeedback, Modal, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../../css/DetalleProducto';
import ModalFeedback from '../../Components/ModalFeedback';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../../Components/Header';
import PerfilDropdown from '../../Components/PerfilDropdown';
import MenuLateral from '../../Components/MenuLateral';

export default function DetalleProducto() {
    const route = useRoute();
    const navigation = useNavigation();
    const { producto } = route.params || {};
    const [usuario, setUsuario] = useState(null);
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const userStr = await AsyncStorage.getItem('usuario');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUsuario(user);
                setDireccionPedido(user.direccion || '');
            }
            else setUsuario(null);
        });
        return unsubscribe;
    }, [navigation]);
    const [cantidad, setCantidad] = useState(1);
    const [dropdownCantidadVisible, setDropdownCantidadVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [mensajeModal, setMensajeModal] = useState('');
    const [modalCarrito, setModalCarrito] = useState(false);
    const [modalRestringido, setModalRestringido] = useState(false);
    const [modalDireccionVisible, setModalDireccionVisible] = useState(false);
    const [direccionPedido, setDireccionPedido] = useState('');
    const [modalPedidoExito, setModalPedidoExito] = useState(false);

    const { width } = useWindowDimensions();
    const isLargeScreen = width > 600;

    const maxCantidad = producto.stock || 10;
    const [showLogin, setShowLogin] = useState(false);
    const [showPerfil, setShowPerfil] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const handleAgregarCarrito = (producto, cantidad = 1) => {
        if (!usuario) {
            setShowLogin(true);
            return;
        }
        // SI ES ADMIN, MOSTRAR MODAL Y NO AGREGAR
        if (usuario.id_rol === 1) {
            setModalRestringido(true);
            return;
        }
        (async () => {
    try {
        await API.post('/carrito', {
            id_usuario: usuario.id_usuario,
            id_producto: producto._id || producto.id || producto.id_producto,
            cantidad: cantidad,
        });
        setModalCarrito(true); 
    } catch (e) {
        setMensajeModal('Error al agregar al carrito');
        setModalVisible(true);
    }
})();
    };

    const handleComprarAhora = (producto, cantidad = 1) => {
        if (!usuario) {
            setShowLogin(true);
            return;
        }
        // SI ES ADMIN, MOSTRAR MODAL Y NO COMPRAR
        if (usuario.id_rol === 1) {
            setModalRestringido(true);
            return;
        }
        setModalDireccionVisible(true);
    };

    const confirmarCompra = async () => {
        if (!direccionPedido.trim()) {
            Alert.alert('Error', 'Por favor ingresa una dirección de entrega');
            return;
        }

        setModalDireccionVisible(false);
        try {
            const precioFinal = producto.precio_final || producto.precio;
            const productos = [{
                id_producto: producto._id || producto.id || producto.id_producto,
                nombre: producto.nombre,
                cantidad: cantidad,
                precio: precioFinal,
                descuento_aplicado: !!producto.descuento_aplicado,
                precio_original: producto.precio || 0
            }];
            
            await API.post('/pedidos/', {
                id_usuario: usuario.id_usuario,
                direccion: direccionPedido.trim(),
                productos,
                total_productos: cantidad,
                total: precioFinal * cantidad
            });
            setModalPedidoExito(true);
        } catch (err) {
            setModalPedidoExito(true);
        }
    };

    const cerrarModalExito = () => {
        setModalPedidoExito(false);
        navigation.goBack();
    };

    return (
        <TouchableWithoutFeedback onPress={() => showPerfil && setShowPerfil(false)}>
            <View style={{ flex: 1 }}>
                {/* HEADER SUPERIOR */}
                <Header
                    usuario={usuario}
                    onMenuPress={() => setMenuVisible(true)}
                    onLoginPress={() => {
                        if (usuario) {
                            setShowPerfil((v) => !v);
                        } else {
                            setShowLogin(true);
                        }
                    }}
                    onCartPress={() => {
                        if (!usuario) {
                            setShowLogin(true);
                        } else {
                            navigation.navigate('Carrito', { usuario });
                        }
                    }}
                    onSearch={(searchText) => {
                        if (searchText && searchText.trim().length > 0) {
                            navigation.navigate('VistaProductos', { search: searchText });
                        }
                    }}
                />

                <PerfilDropdown
                    visible={showPerfil}
                    usuario={usuario}
                    onLogout={async () => {
                        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                        await AsyncStorage.removeItem('usuario');
                        setUsuario(null);
                        setShowPerfil(false);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Index' }],
                        });
                    }}
                    onMisCompras={() => {
                        setShowPerfil(false);
                        navigation.navigate('MisCompras', { usuario });
                    }}
                    onMisDatos={() => {
                        setShowPerfil(false);
                        navigation.navigate('MisDatos', { usuario });
                    }}
                />
                {/* MENU LATERAL*/}
                <MenuLateral
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    onSelectSubcategoria={(catId, subcatId) => {
                        setMenuVisible(false);
                        navigation.navigate('VistaProductos', { id_categoria: catId, id_subcategoria: subcatId });
                    }}
                />
                <ScrollView style={styles.container}>
                    {/* BOTON VOLVER */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.volverBtn}>
                        <FontAwesome name="arrow-left" size={28} color="#5F5656" style={styles.volverIcon} />
                    </TouchableOpacity>
                    {/* CONTENEDOR RESPONSIVE */}
                    <View style={[styles.productBoxMobile, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
                        {/* CARGA DE IMAGENES */}
                        <View style={styles.imgBoxMobile}>
                            <Image
                                source={{
                                    uri: producto.imagen
                                        ? `${API.defaults.baseURL.replace(/\/api$/, '')}/productos/img/${encodeURIComponent(producto.imagen.replace(/^\/?img\//, ''))}`
                                        : undefined
                                }}
                                style={styles.imagenDetalle}
                                resizeMode="contain"
                            />
                        </View>
                        {/* INFO */}
                        <View style={styles.infoBoxMobile}>
                            <Text style={styles.tituloMobile}>{producto.nombre}</Text>
                            {/* PRECIOS */}
                            <View style={styles.precioBoxMobile}>
                                {producto.descuento_aplicado ? (
                                    <>
                                        <Text style={styles.precioTachadoMobile}>${producto.precio}</Text>
                                        <Text style={styles.precioDescuentoMobile}>${producto.precio_final}</Text>
                                        {producto.descuento_aplicado.tipo_descuento?.toLowerCase() === 'porcentaje' && (
                                            <Text style={styles.badgeMobile}>-{producto.descuento_aplicado.valor}%</Text>
                                        )}
                                        {(producto.descuento_aplicado.tipo_descuento?.toLowerCase() === 'valor' ||
                                            producto.descuento_aplicado.tipo_descuento?.toLowerCase() === 'fijo') && (
                                                <Text style={styles.badgeMobile}>-${producto.descuento_aplicado.valor}</Text>
                                            )}
                                    </>
                                ) : (
                                    <Text style={styles.precioNormalMobile}>${producto.precio}</Text>
                                )}
                            </View>
                            {/* CANTIDAD */}
                            <View style={styles.cantidadBoxMobile}>
                                <Text style={styles.cantidadLabelMobile}>Cantidad:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', gap: 8 }}>
                                    <TouchableOpacity
                                        style={styles.cantidadSelectBtnMobile}
                                        onPress={() => setDropdownCantidadVisible(!dropdownCantidadVisible)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                                            <Text style={styles.cantidadSelectTxtMobile}>
                                                {cantidad} {cantidad === 1 ? 'Producto' : 'Productos'}
                                            </Text>
                                            <FontAwesome name={dropdownCantidadVisible ? 'chevron-up' : 'chevron-down'} size={13} color="#444" style={styles.cantidadArrowIcon} />
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={styles.stockTxtMobile}>{producto.stock} disponibles</Text>
                                    {dropdownCantidadVisible && (
                                        <>
                                            {/* OVERLAY PARA CERRAR DANDOLE CLICK AFUERA */}
                                            <TouchableOpacity
                                                style={{ position: 'absolute', top: 0, left: -1000, right: -1000, bottom: -1000, zIndex: 9 }}
                                                activeOpacity={1}
                                                onPress={() => setDropdownCantidadVisible(false)}
                                            />
                                            <View style={styles.dropdownCantidadBox}>
                                                <ScrollView style={styles.dropdownCantidadScroll}>
                                                    {Array.from({ length: maxCantidad }, (_, i) => i + 1).map(num => (
                                                        <TouchableOpacity
                                                            key={num}
                                                            style={[styles.dropdownCantidadBtn, cantidad === num && styles.dropdownCantidadBtnAct]}
                                                            onPress={() => {
                                                                setCantidad(num);
                                                                setDropdownCantidadVisible(false);
                                                            }}
                                                        >
                                                            <Text style={styles.dropdownCantidadBtnTxt}>
                                                                {num} {num === 1 ? 'Producto' : 'Productos'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                            {/* BOTONES */}
                            <View style={styles.btnBoxMobile}>
                                <TouchableOpacity
                                    style={styles.btnCarritoMobile}
                                    onPress={() => handleAgregarCarrito(producto, cantidad)}
                                >
                                    <Text style={styles.btnCarritoTxtMobile}>+ Añadir al carrito</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btnComprarMobile} onPress={() => handleComprarAhora(producto, cantidad)}>
                                    <Text style={styles.btnComprarTxtMobile}>Comprar ahora</Text>
                                </TouchableOpacity>
                            </View>
                            {/* DESCRIPCION */}
                            <View style={styles.tabBoxMobile}>
                                <Text style={styles.tabTitleMobile}>Descripción</Text>
                                <Text style={styles.descripcionMobile}>{producto.descripcion}</Text>
                            </View>
                        </View>
                    </View>
                    {/* MODAL DE LOGIN */}
                    <ModalLogin
                        visible={showLogin}
                        onClose={() => setShowLogin(false)}
                        onLogin={user => {
                            setUsuario(user);
                            setShowLogin(false);
                        }}
                    />
                    {/* MODAL DE PRODUCTO AGREGADO AL CARRITO */}
                    <ModalFeedback
                        visible={modalCarrito}
                        onClose={() => setModalCarrito(false)}
                        titulo="Producto agregado"
                        mensaje="Cantidad actualizada en el carrito"
                        textoBoton="Cerrar"
                        textoBotonSecundario="Ir al carrito"
                        onBotonSecundario={() => {
                            setModalCarrito(false);
                            navigation.navigate('Carrito', { usuario });
                        }}
                    />
                    {/* MODAL DE ACCESO RESTRINGIDO */}
                    <ModalFeedback
                        visible={modalRestringido}
                        onClose={() => setModalRestringido(false)}
                        titulo="Acceso restringido"
                        mensaje="Solo los usuarios pueden agregar productos al carrito. El administrador no puede hacer compras."
                        icono="error-outline"
                        colorTitulo="#000000FF"
                        textoBoton="Cerrar"
                        onBoton={() => setModalRestringido(false)}
                    />
                    
                    {/* MODAL DE DIRECCIÓN PARA COMPRAR AHORA */}
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
                                <TouchableOpacity onPress={() => setModalDireccionVisible(false)} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
                                    <FontAwesome name="close" size={24} color="#000" />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 12 }}>
                                    Confirmar Dirección de Entrega
                                </Text>
                                <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
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
                                        style={{ flex: 1, paddingVertical: 14, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' }}
                                        onPress={() => setModalDireccionVisible(false)}
                                    >
                                        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flex: 1, paddingVertical: 14, borderRadius: 8, backgroundColor: '#000', alignItems: 'center' }}
                                        onPress={confirmarCompra}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Confirmar Compra</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* MODAL DE COMPRA EXITOSA */}
                    <ModalFeedback
                        visible={modalPedidoExito}
                        icono="check"
                        titulo="¡Compra realizada!"
                        mensaje="Tu pedido fue registrado exitosamente."
                        colorFondo="#fff"
                        colorTitulo="#010101FF"
                        colorMensaje="#444"
                        textoBoton="Volver"
                        outlineBoton={false}
                        onBoton={cerrarModalExito}
                        showClose={false}
                    />
                    {/* MODAL DE ACCESO RESTRINGIDO */}
                    <ModalFeedback
                        visible={modalRestringido}
                        onClose={() => setModalRestringido(false)}
                        titulo="Acceso restringido"
                        mensaje="Solo los usuarios pueden agregar productos al carrito. El administrador no puede hacer compras."
                        icono="error-outline"
                        colorTitulo="#000000FF"
                        textoBoton="Cerrar"
                        onBoton={() => setModalRestringido(false)}
                    />
                    {/* FOOTER SIMULADO */}
                    <View style={{ height: 60 }} />
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
    );
}