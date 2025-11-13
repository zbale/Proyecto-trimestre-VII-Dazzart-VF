import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import API from '../config/api';
import { useRoute, useNavigation } from '@react-navigation/native';

const RestablecerContraScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // EL TOKEN PUEDE VENIR POR PARÁMETRO EN LA RUTA
  const token = route.params?.token || '';
  const [tokenManual, setTokenManual] = useState('');

  // Si el usuario pega una URL completa, intentar extraer solo el token
  const onChangeTokenManual = (text) => {
    if (!text) return setTokenManual('');
    try {
      // Normalizar espacios
      const t = text.trim();
      // Buscar '/reset-password/' o variaciones comunes y extraer lo que venga después
      const match = t.match(/reset[-_]?password\/(.+)$/i);
      if (match && match[1]) {
        // Puede incluir parámetros o fragmentos, quitar después de ? o #
        const tokenOnly = match[1].split(/[?#]/)[0];
        setTokenManual(tokenOnly);
      } else {
        setTokenManual(t);
      }
    } catch (_e) {
      setTokenManual(text);
    }
  };

  const handleRestablecer = async () => {
    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      setFeedback({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setFeedback({ success: false, message: 'Las contraseñas no coinciden.' });
      return;
    }
    const actualToken = token || tokenManual;
    if (!actualToken) {
      setFeedback({ success: false, message: 'Código faltante. Pega el código recibido por correo o la URL de restablecimiento.' });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await API.post('/login/reset-password', {
        token: actualToken,
        nuevaContrasena,
      });
      setFeedback({ success: true, message: '¡Contraseña restablecida correctamente! Ahora puedes iniciar sesión.' });
    } catch (err) {
      setFeedback({ success: false, message: err?.response?.data?.message || 'Error al restablecer la contraseña.' });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer Contraseña</Text>
      {/* Si no hay token en la ruta, mostrar un campo para pegar el token (útil en Expo Go) */}
      {!token && (
        <>
          <Text style={styles.label}>Código de recuperación</Text>
          <TextInput
            style={styles.input}
            value={tokenManual}
            onChangeText={onChangeTokenManual}
            placeholder="Pega aquí el código o la URL de restablecimiento"
            autoCapitalize="none"
          />
        </>
      )}

      <Text style={styles.label}>Nueva contraseña</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[styles.input, { paddingRight: 44 }]}
          secureTextEntry={!showPassword}
          value={nuevaContrasena}
          onChangeText={setNuevaContrasena}
          placeholder="Nueva contraseña"
        />
        <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: 10, top: 12 }}>
          <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color="#888" />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Confirmar contraseña</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[styles.input, { paddingRight: 44 }]}
          secureTextEntry={!showConfirmPassword}
          value={confirmarContrasena}
          onChangeText={setConfirmarContrasena}
          placeholder="Confirmar contraseña"
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(p => !p)} style={{ position: 'absolute', right: 10, top: 12 }}>
          <MaterialIcons name={showConfirmPassword ? 'visibility-off' : 'visibility'} size={22} color="#888" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRestablecer} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Restablecer</Text>}
      </TouchableOpacity>
      {feedback && (
        <Text style={{ color: feedback.success ? '#28a745' : '#d32f2f', marginTop: 12, textAlign: 'center' }}>
          {feedback.message}
        </Text>
      )}
      <TouchableOpacity onPress={() => {
        if (navigation.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Index');
        }
      }} style={{ marginTop: 18 }}>
        <Text style={{ color: '#1976d2', textAlign: 'center' }}>Volver al inicio de sesión</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default RestablecerContraScreen;
