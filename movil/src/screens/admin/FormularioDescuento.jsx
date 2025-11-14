import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Autocomplete from "react-native-autocomplete-input";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function FormularioDescuento() {
  const [tipoDescuento, setTipoDescuento] = useState("");
  const [valor, setValor] = useState("");
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [estadoDescuento, setEstadoDescuento] = useState("Activo");
  const [aplicacion, setAplicacion] = useState("producto");

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [nombreProducto, setNombreProducto] = useState("");
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [idCategoria, setIdCategoria] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(null); // "inicio" | "fin"

  const navigation = useNavigation();

  useEffect(() => {
    API.get("/productos/listar")
      .then((res) => setProductos(res.data || []))
      .catch((err) => console.error("Error al cargar productos:", err));

    API.get("/categorias/listar")
      .then((res) => setCategorias(res.data || []))
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  const normalize = (s = "") => s.toString().trim().normalize();

  const handleSubmit = async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy) {
      Alert.alert("Error", "La fecha de inicio no puede ser anterior al día de hoy.");
      return;
    }

    if (fechaFin < fechaInicio) {
      Alert.alert("Error", "La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    if (!tipoDescuento) {
      Alert.alert("Error", "Selecciona el tipo de descuento.");
      return;
    }
    if (!valor || isNaN(parseFloat(valor))) {
      Alert.alert("Error", "Ingresa un valor de descuento válido.");
      return;
    }

    // Convertir fechas a formato YYYY-MM-DD sin conversión de zona horaria
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const data = {
      tipo_descuento: tipoDescuento,
      valor: valor.toString(),
      fecha_inicio: formatDate(fechaInicio),
      fecha_fin: formatDate(fechaFin),
      estado_descuento: estadoDescuento,
      aplicacion,
    };

    if (aplicacion === "producto") {
      let productoValido = selectedProducto;

      if (!productoValido && nombreProducto) {
        productoValido = productos.find(
          (p) => normalize(p.nombre) === normalize(nombreProducto)
        );
      }

      if (!productoValido) {
        Alert.alert("Error", "Debes seleccionar un producto válido de la lista.");
        return;
      }

      data.nombre_producto = productoValido.nombre.toString().trim();
    } else {
      if (!idCategoria) {
        Alert.alert("Error", "Debes seleccionar una categoría.");
        return;
      }
      data.id_categoria = idCategoria;
    }

    try {
      console.log("Payload enviado:", data);
      const res = await API.post("/descuentos", data);
      console.log("Respuesta API:", res.data);
      Alert.alert("Éxito", "Descuento creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Error al crear descuento:", err.response?.data || err.message || err);
      const detalle = err.response?.data?.error || err.response?.data?.detalle || null;
      Alert.alert(
        "Error",
        detalle ? `No se pudo crear: ${detalle}` : "Hubo un error al crear el descuento."
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      {/* Barra superior */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Añadir Descuento</Text>
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
          selectedValue={tipoDescuento}
          onValueChange={(val) => setTipoDescuento(val)}
          style={styles.input}
        >
          <Picker.Item label="Seleccione..." value="" />
          <Picker.Item label="Porcentaje" value="Porcentaje" />
          <Picker.Item label="Fijo" value="Fijo" />
        </Picker>

        <Text style={styles.label}>Valor del descuento</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={valor}
          onChangeText={setValor}
        />

        <Text style={styles.label}>Fecha de inicio</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker("inicio")}
        >
          <Text>{fechaInicio.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Fecha de fin</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker("fin")}
        >
          <Text>{fechaFin.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Estado del descuento</Text>
        <Picker
          selectedValue={estadoDescuento}
          onValueChange={(val) => setEstadoDescuento(val)}
          style={styles.input}
        >
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>

        <Text style={styles.label}>Aplicar a:</Text>
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <TouchableOpacity
            style={[styles.radioButton, aplicacion === "producto" && styles.radioSelected]}
            onPress={() => setAplicacion("producto")}
          >
            <Text>Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, aplicacion === "categoria" && styles.radioSelected]}
            onPress={() => setAplicacion("categoria")}
          >
            <Text>Categoría</Text>
          </TouchableOpacity>
        </View>

        {aplicacion === "producto" ? (
          <>
            <Text style={styles.label}>Buscar producto</Text>
            <Autocomplete
              data={
                nombreProducto
                  ? productos.filter((p) =>
                      normalize(p.nombre).includes(normalize(nombreProducto))
                    )
                  : []
              }
              value={nombreProducto}
              onChangeText={(text) => {
                setNombreProducto(text);
                setSelectedProducto(null);
              }}
              placeholder="Escribe el nombre..."
              flatListProps={{
                keyboardShouldPersistTaps: "always",
                keyExtractor: (item) => item.id_producto?.toString() || item.nombre,
                renderItem: ({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setNombreProducto(item.nombre);
                      setSelectedProducto(item);
                    }}
                  >
                    <Text style={styles.itemText}>{item.nombre}</Text>
                  </TouchableOpacity>
                ),
              }}
              inputContainerStyle={styles.input}
              listContainerStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
            />
         
          </>
        ) : (
          <>
            <Text style={styles.label}>Categoría</Text>
            <Picker
              selectedValue={idCategoria}
              onValueChange={(val) => setIdCategoria(val)}
              style={styles.input}
            >
              <Picker.Item label="Seleccione..." value="" />
              {categorias.map((cat) => (
                <Picker.Item
                  key={cat.id_categoria}
                  label={cat.nombre_categoria}
                  value={cat.id_categoria}
                />
              ))}
            </Picker>
          </>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Guardar Descuento</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* DatePickers */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === "inicio" ? fechaInicio : fechaFin}
          mode="date"
          display="default"
          minimumDate={new Date()} // <-- no permite seleccionar días pasados
          onChange={(event, selectedDate) => {
            setShowDatePicker(null);
            if (selectedDate) {
              showDatePicker === "inicio"
                ? setFechaInicio(selectedDate)
                : setFechaFin(selectedDate);
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
  itemText: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: "#e9ecef",
    borderColor: "#0d6efd",
  },
  submitButton: {
    backgroundColor: "#0d6efd",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
});