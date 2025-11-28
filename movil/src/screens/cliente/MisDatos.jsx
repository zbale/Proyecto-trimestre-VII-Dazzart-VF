import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import API from '../../config/api';
import styles from '../../css/MisDatos';
import Header from '../../Components/Header';
import PerfilDropdown from '../../Components/PerfilDropdown';
import { TouchableWithoutFeedback } from 'react-native';
import ModalFeedback from '../../Components/ModalFeedback';

export default function MisDatos({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [menuPerfilVisible, setMenuPerfilVisible] = useState(false);
  const [accesoRestringido, setAccesoRestringido] = useState(false);


  // MOSTRAR MENÚ DE PERFIL
  const handleLoginPress = () => {
    setMenuPerfilVisible(true);
  };
  // ACCIONES DEL MENÚ DE PERFIL
  const handleMisCompras = () => {
    setMenuPerfilVisible(false);
    navigation.navigate('MisCompras');
  };
  const handleMisDatos = () => {
    setMenuPerfilVisible(false);
    navigation.navigate('MisDatos');
  };
  const handleLogout = async () => {
    setMenuPerfilVisible(false);
    await AsyncStorage.removeItem('usuario');
    navigation.navigate('Index');
  };
  const handleCartPress = () => {
    navigation.navigate('Carrito');
  };

  // BUSQUEDA DE LA LUPA
  const handleSearch = (searchText) => {
    navigation.navigate('VistaProductos', { search: searchText });
  };
  const [form, setForm] = useState({
    nombre: '',
    correo_electronico: '',
    telefono: '',
    direccion: '',
    contrasena: '',
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('usuario');
      if (!userStr) {
        navigation.navigate('Index');
        return;
      }
      const user = JSON.parse(userStr);
      setUsuario(user);
      setForm({
        nombre: user.nombre || '',
        correo_electronico: user.correo_electronico || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        contrasena: '',
      });
    })();
  }, [navigation]);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMensaje('');
    try {
      const datosEnviar = {
        nombre: form.nombre.trim() || usuario.nombre,
        nombre_usuario: usuario.nombre_usuario,
        correo: form.correo_electronico.trim() || usuario.correo_electronico,
        telefono: form.telefono.trim() || usuario.telefono,
        direccion: form.direccion.trim() || usuario.direccion,
        contrasena: form.contrasena.trim(),
      };
      const res = await API.put(`/usuarios/${usuario.id_usuario}`, datosEnviar);
      if (res.data && !res.data.error) {
        setMensaje('Datos actualizados correctamente');
        const nuevoUsuario = { ...usuario, nombre: datosEnviar.nombre, correo_electronico: datosEnviar.correo, telefono: datosEnviar.telefono, direccion: datosEnviar.direccion };
        await AsyncStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
        setUsuario(nuevoUsuario);
        setForm(f => ({ ...f, contrasena: '' }));
      } else {
        setMensaje(res.data.error || 'Error al actualizar los datos');
      }
    } catch (err) {
      setMensaje('Error de red o servidor');
    }
    setLoading(false);
  };

  // MOSTRAR MENSAJE DE ERROR SOLO SI ES ADMIN
  if (usuario && usuario.id_rol === 1) {
    return (
      <>
        <Header
          onLoginPress={handleLoginPress}
          onCartPress={handleCartPress}
          onSearch={handleSearch}
          usuario={usuario}
        />
        <ModalFeedback
          visible={true}
          onClose={() => navigation && navigation.goBack()}
          titulo="Acceso restringido"
          mensaje="Solo los usuarios pueden editar sus datos. El administrador no puede modificar datos personales aquí."
          icono="error-outline"
          colorTitulo="#000000FF"
          textoBoton="Volver"
          onBoton={() => navigation && navigation.goBack()}
        />
      </>
    );
  }

  return (
    <>
      <Header
        onLoginPress={handleLoginPress}
        onCartPress={handleCartPress}
        onSearch={handleSearch}
        usuario={usuario}
      />
      {menuPerfilVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuPerfilVisible(false)}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 }}>
            <PerfilDropdown
              visible={true}
              usuario={usuario}
              onLogout={handleLogout}
              onMisCompras={handleMisCompras}
              onMisDatos={handleMisDatos}
            />
          </View>
        </TouchableWithoutFeedback>
      )}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>Mis Datos</Text>
          <View style={styles.formGroup}>
            <MaterialIcons name="person" size={22} color="#989898FF" style={styles.icon} />
            <TextInput
              style={[styles.input, { color: '#989898FF' }]}
              placeholder="Nombre"
              placeholderTextColor="#989898FF"
              value={form.nombre}
              onChangeText={v => handleChange('nombre', v)}
            />
          </View>
          <View style={styles.formGroup}>
            <MaterialIcons name="email" size={22} color="#989898FF" style={styles.icon} />
            <TextInput
              style={[styles.input, { color: '#989898FF' }]}
              placeholder="Correo electrónico"
              placeholderTextColor="#989898FF"
              value={form.correo_electronico}
              onChangeText={v => handleChange('correo_electronico', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.formGroup}>
            <MaterialIcons name="phone" size={22} color="#989898FF" style={styles.icon} />
            <TextInput
              style={[styles.input, { color: '#989898FF' }]}
              placeholder="Teléfono"
              placeholderTextColor="#989898FF"
              value={form.telefono}
              onChangeText={v => handleChange('telefono', v)}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.formGroup}>
            <MaterialIcons name="location-on" size={22} color="#989898FF" style={styles.icon} />
            <TextInput
              style={[styles.input, { height: 60, color: '#989898FF' }]}
              placeholder="Dirección"
              placeholderTextColor="#989898FF"
              value={form.direccion}
              onChangeText={v => handleChange('direccion', v)}
              multiline
            />
          </View>
          <View style={styles.formGroup}>
            <MaterialIcons name="lock" size={22} color="#989898FF" style={styles.icon} />
            <TextInput
              style={[styles.input, { color: '#989898FF', textAlign: 'left' }]}
              placeholder="Nueva contraseña (opcional)"
              placeholderTextColor="#989898FF"
              value={form.contrasena}
              onChangeText={v => handleChange('contrasena', v)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#989898FF" style={{ textAlign: 'center', width: 28 }} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.btn}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
          </TouchableOpacity>
          {mensaje ? (
            <Text style={styles.mensaje}>{mensaje}</Text>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
