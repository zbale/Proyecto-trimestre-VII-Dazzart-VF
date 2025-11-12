import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import API from "../../config/api"; // tu instancia axios con baseURL
import MenuLateral from "../../Components/Admin/MenuLateral";
import { useNavigation } from "@react-navigation/native";

export default function AgregarUsuario() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    nombre_usuario: "",
    correo: "",
    telefono: "",
    direccion: "",
    contrasena: "",
    id_rol: 1, // admin
  });

  const [verPassword, setVerPassword] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleChange = (name, value) => {
    let nuevoValor = value;

    // Validaciones dinámicas
    if (name === "cedula") {
      // Solo números y máximo 10 dígitos
      nuevoValor = value.replace(/[^0-9]/g, "").slice(0, 10);
    } else if (name === "telefono") {
      // Solo números y máximo 10 dígitos
      nuevoValor = value.replace(/[^0-9]/g, "").slice(0, 10);
    } else if (name === "nombre") {
      // Solo letras y espacios
      nuevoValor = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: nuevoValor }));
  };

const handleSubmit = async () => {
  // Validaciones antes de enviar
  if (!/^\d{8,10}$/.test(formData.cedula)) {
    Alert.alert("Error", "La cédula debe tener entre 8 y 10 dígitos numéricos.");
    return;
  }
  if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(formData.nombre)) {
    Alert.alert("Error", "El nombre solo puede contener letras y espacios.");
    return;
  }
  if (!/^\d{10}$/.test(formData.telefono)) {
    Alert.alert("Error", "El número de celular debe tener exactamente 10 dígitos.");
    return;
  }

  try {
    const res = await API.post("/usuarios", formData);
    if (res.status === 201) {
      Alert.alert("Éxito", "Usuario administrador creado con éxito", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  } catch (err) {
    console.error("Error al registrar usuario:", err);

    const errorMessage =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Ocurrió un error desconocido al registrar el usuario.";

    Alert.alert("Error", errorMessage);
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      {/* Barra superior */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Añadir Administrador</Text>
      </View>

      {/* Menú lateral */}
      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <MenuLateral />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Formulario */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cédula</Text>
          <TextInput
            style={styles.input}
            value={formData.cedula}
            onChangeText={(val) => handleChange("cedula", val)}
            placeholder="Cédula"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(val) => handleChange("nombre", val)}
            placeholder="Nombre"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre_usuario}
            onChangeText={(val) => handleChange("nombre_usuario", val)}
            placeholder="Usuario"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={formData.correo}
            onChangeText={(val) => handleChange("correo", val)}
            placeholder="Correo"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Celular</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(val) => handleChange("telefono", val)}
            placeholder="Teléfono"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            value={formData.direccion}
            onChangeText={(val) => handleChange("direccion", val)}
            placeholder="Dirección"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={formData.contrasena}
              onChangeText={(val) => handleChange("contrasena", val)}
              placeholder="Contraseña"
              secureTextEntry={!verPassword}
            />
            <TouchableOpacity onPress={() => setVerPassword((prev) => !prev)} style={{ marginLeft: 8 }}>
              <Icon name={verPassword ? "eye-slash" : "eye"} size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rol</Text>
          <TextInput style={styles.input} value="admin" editable={false} />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            <Icon name="plus" size={16} color="#fff" /> Añadir
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  menuButton: { marginRight: 16, backgroundColor: "#fff", borderRadius: 30, padding: 6 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#212529", flex: 1 },
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)", flexDirection: "row" },
  menuContainer: { width: 240, backgroundColor: "#212529", height: "100%" },

  formContainer: { padding: 16 },
  inputGroup: { marginBottom: 14 },
  label: { fontWeight: "bold", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#212529",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: { color: "#fff", fontWeight: "bold" },
});
