import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import API from "../../config/api"; 
import MenuLateral from "../../Components/Admin/MenuLateral";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function EditarDescuento() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params; 

  const [form, setForm] = useState({
    tipo_descuento: "Porcentaje",
    valor: "",
    fecha_inicio: new Date(),
    fecha_fin: new Date(),
    estado_descuento: "Activo",
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(null); 

  useEffect(() => {
    API.get(`/descuentos/${id}`)
      .then((res) => {
        const d = res.data;
        setForm({
          tipo_descuento: d.tipo_descuento,
          valor: d.valor.toString(),
          fecha_inicio: new Date(d.fecha_inicio),
          fecha_fin: new Date(d.fecha_fin),
          estado_descuento: d.estado_descuento,
        });
      })
      .catch((err) => {
        console.error("Error al cargar el descuento:", err);
        Alert.alert("Error", "No se pudo cargar el descuento.");
      });
  }, [id]);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const hoy = new Date().toISOString().split("T")[0]; // fecha actual YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const fechaInicio = formatDate(form.fecha_inicio);
    const fechaFin = formatDate(form.fecha_fin);

    //  Validación de rango
    if (fechaFin < fechaInicio) {
      Alert.alert("Error", "La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }

    //  Validación especial: no dejar activar descuentos expirados
    if (fechaFin < hoy && form.estado_descuento === "Activo") {
      Alert.alert(
        "Error",
        "El descuento ya expiró. Debes actualizar las fechas a un rango válido antes de poder activarlo."
      );
      return;
    }

    try {
      await API.put(`/descuentos/${id}`, {
        ...form,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });
      Alert.alert("Éxito", "Descuento actualizado correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Error al actualizar descuento:", err.response?.data || err.message || err);
      Alert.alert("Error", "No se pudo actualizar el descuento.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      {/* Barra superior */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Descuento</Text>
      </View>

      {/* Menú lateral */}
      <Modal
        visible={showMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <MenuLateral />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Formulario */}
      <KeyboardAwareScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Tipo de descuento</Text>
        <Picker
          selectedValue={form.tipo_descuento}
          onValueChange={(val) => handleChange("tipo_descuento", val)}
          style={styles.input}
        >
          <Picker.Item label="Porcentaje" value="Porcentaje" />
          <Picker.Item label="Fijo" value="Fijo" />
        </Picker>

        <Text style={styles.label}>Valor del descuento</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={form.valor}
          onChangeText={(val) => handleChange("valor", val)}
        />

        <Text style={styles.label}>Fecha de inicio</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker("inicio")}
        >
          <Text>{form.fecha_inicio.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Fecha de fin</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker("fin")}
        >
          <Text>{form.fecha_fin.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Estado del descuento</Text>
        <Picker
          selectedValue={form.estado_descuento}
          onValueChange={(val) => handleChange("estado_descuento", val)}
          style={styles.input}
        >
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Icon name="pen-to-square" size={18} color="#fff" />
          <Text style={styles.submitText}> Actualizar Descuento</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* DatePickers */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === "inicio" ? form.fecha_inicio : form.fecha_fin}
          mode="date"
          display="default"
          minimumDate={
            showDatePicker === "inicio"
              ? new Date()                //  inicio >= hoy
              : form.fecha_inicio         //  fin >= inicio
          }
          onChange={(event, selectedDate) => {
            setShowDatePicker(null);
            if (selectedDate) {
              handleChange(
                showDatePicker === "inicio" ? "fecha_inicio" : "fecha_fin",
                selectedDate
              );
            }
          }}
        />
      )}
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
  menuButton: {
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
    flex: 1,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    flexDirection: "row",
  },
  menuContainer: {
    width: 240,
    backgroundColor: "#212529",
    height: "100%",
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#0d6efd",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
