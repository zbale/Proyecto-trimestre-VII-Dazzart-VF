import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import API from "../../config/api";

export default function AgregarProducto({ navigation }) {
  const [form, setForm] = useState({
    numero_serial: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_categoria: "",
    id_subcategoria: "",
    fecha_creacion: new Date().toISOString().split("T")[0],
  });

  const [imagenNueva, setImagenNueva] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriaAbierta, setCategoriaAbierta] = useState(false);
  const [subcategoriaAbierta, setSubcategoriaAbierta] = useState(false);

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const res = await API.get("/categorias/listar");
        setCategorias(res.data || []);
      } catch (error) {
        // Error cargando categorías
      }
    };
    cargarCategorias();
  }, []);

  // Cargar subcategorías cuando se selecciona categoría
  useEffect(() => {
    const cargarSubcategorias = async () => {
      if (!form.id_categoria) return setSubcategorias([]);
      try {
        const res = await API.get("/subcategorias/listar");
        const filtradas = res.data.filter(
          (s) => String(s.id_categoria) === String(form.id_categoria)
        );
        setSubcategorias(filtradas);
      } catch (error) {
        // Error cargando subcategorías
      }
    };
    cargarSubcategorias();
  }, [form.id_categoria]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Seleccionar imagen
  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tus fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagenNueva(result.assets[0]);
    }
  };

  // Guardar producto
  const handleSubmit = async () => {
    if (!form.nombre || !form.precio || !form.stock || !form.id_categoria) {
      Alert.alert("Campos requeridos", "Completa todos los campos obligatorios.");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));

    if (imagenNueva) {
      const fileName = imagenNueva.uri.split("/").pop();
      const fileType = fileName.split(".").pop();
      fd.append("imagen", {
        uri: Platform.OS === "android" ? imagenNueva.uri : imagenNueva.uri.replace("file://", ""),
        name: fileName,
        type: `image/${fileType}`,
      });
    }

    try {
      await API.post("/productos/agregar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Éxito", "Producto agregado correctamente");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo agregar el producto");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Añadir Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="Número Serial"
        value={form.numero_serial}
        onChangeText={(t) => handleChange("numero_serial", t)}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre *"
        value={form.nombre}
        onChangeText={(t) => handleChange("nombre", t)}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Descripción"
        value={form.descripcion}
        onChangeText={(t) => handleChange("descripcion", t)}
        multiline
      />

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder="Precio *"
            keyboardType="numeric"
            value={form.precio}
            onChangeText={(t) => handleChange("precio", t.replace(/[^0-9.]/g, ""))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder="Stock *"
            keyboardType="numeric"
            value={form.stock}
            onChangeText={(t) => handleChange("stock", t.replace(/[^0-9]/g, ""))}
          />
        </View>
      </View>

      {/* Categoría */}
      <Text style={styles.label}>Categoría *</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setCategoriaAbierta(!categoriaAbierta)}
      >
        <Text>
          {form.id_categoria
            ? categorias.find((c) => String(c.id_categoria) === String(form.id_categoria))?.nombre_categoria
            : "Seleccionar categoría"}
        </Text>
      </TouchableOpacity>
      {categoriaAbierta &&
        categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id_categoria}
            style={styles.opcion}
            onPress={() => {
              handleChange("id_categoria", cat.id_categoria);
              handleChange("id_subcategoria", "");
              setCategoriaAbierta(false);
            }}
          >
            <Text>{cat.nombre_categoria}</Text>
          </TouchableOpacity>
        ))}

      {/* Subcategoría */}
      {form.id_categoria && subcategorias.length > 0 && (
        <>
          <Text style={styles.label}>Subcategoría</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setSubcategoriaAbierta(!subcategoriaAbierta)}
          >
            <Text>
              {form.id_subcategoria
                ? subcategorias.find((s) => String(s.id_subcategoria) === String(form.id_subcategoria))?.nombre_subcategoria
                : "Seleccionar subcategoría"}
            </Text>
          </TouchableOpacity>
          {subcategoriaAbierta &&
            subcategorias.map((sub) => (
              <TouchableOpacity
                key={sub.id_subcategoria}
                style={styles.opcion}
                onPress={() => {
                  handleChange("id_subcategoria", sub.id_subcategoria);
                  setSubcategoriaAbierta(false);
                }}
              >
                <Text>{sub.nombre_subcategoria}</Text>
              </TouchableOpacity>
            ))}
        </>
      )}

      {/* Imagen */}
      <TouchableOpacity style={styles.btn} onPress={pickImage}>
        <Text style={styles.btnText}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {imagenNueva && (
        <Image
          source={{ uri: imagenNueva.uri }}
          style={{ width: 150, height: 150, marginVertical: 10, borderRadius: 8 }}
        />
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#007bff" }]}
        onPress={handleSubmit}
      >
        <Text style={styles.btnText}>Guardar Producto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  selector: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 6,
  },
  opcion: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  btn: {
    backgroundColor: "#198754",
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
