import React, { useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Modal,
} from "react-native";
import API from "../../config/api";
import Icon from "react-native-vector-icons/FontAwesome5";
import MenuLateral from "../../Components/Admin/MenuLateral";

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const navigation = useNavigation();

  // Cargar productos desde backend
  const cargarProductos = async () => {
    try {
      const resProductos = await API.get("/productos/listar");
      const resCategorias = await API.get("/categorias/listar");
      const resSubcategorias = await API.get("/subcategorias/listar");

      setCategorias(resCategorias.data || []);
      setSubcategorias(resSubcategorias.data || []);

      if (Array.isArray(resProductos.data)) {
        setProductos(resProductos.data);
      } else {
        setProductos([]);
      }
    } catch {
      setProductos([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      cargarProductos();
    }, [])
  );

  // Eliminar producto
  const eliminarProducto = (id) => {
    Alert.alert(
      "Eliminar producto",
      "¿Estás seguro de eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/productos/eliminar/${id}`);
              cargarProductos();
              Alert.alert("Éxito", "Producto eliminado correctamente");
            } catch {
              Alert.alert("Error", "No se pudo eliminar el producto");
            }
          },
        },
      ]
    );
  };

  // Obtener nombre de categoría/subcategoría desde ID
  const obtenerNombreCategoria = (id) => {
    const cat = categorias.find((c) => String(c.id_categoria) === String(id));
    return cat ? cat.nombre_categoria : "N/A";
  };

  const obtenerNombreSubcategoria = (id) => {
    const sub = subcategorias.find((s) => String(s.id_subcategoria) === String(id));
    return sub ? sub.nombre_subcategoria : "N/A";
  };

  // Render de cada producto
  const renderItem = ({ item }) => {
    const imagenNombre = item.imagen ? item.imagen.replace(/^\/?img\//, "") : null;

    const imagenUri = imagenNombre
      ? `${API.defaults.baseURL.replace("/api", "")}/productos/img/${encodeURIComponent(imagenNombre)}?t=${Date.now()}`
      : "https://via.placeholder.com/80x80?text=No+Img";

    return (
      <View style={styles.row}>
        <View style={styles.imgCol}>
          <Image
            source={{ uri: imagenUri }}
            style={styles.imagen}
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.desc}>{item.descripcion}</Text>
          <Text style={styles.label}>
            Precio: <Text style={styles.valor}>${Math.floor(item.precio)}</Text>
          </Text>
          <Text style={styles.label}>
            Stock: <Text style={styles.valor}>{item.stock}</Text>
          </Text>
          <Text style={styles.label}>
            Categoría: <Text style={styles.valor}>{obtenerNombreCategoria(item.id_categoria)}</Text>
          </Text>
          <Text style={styles.label}>
            Subcat.: <Text style={styles.valor}>{obtenerNombreSubcategoria(item.id_subcategoria)}</Text>
          </Text>
          <Text style={styles.label}>
            Creación: <Text style={styles.valor}>{item.fecha_creacion?.split("T")[0]}</Text>
          </Text>
          <View style={styles.acciones}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("EditarProducto", { id: item.id_producto })}
            >
              <Icon name="pen-to-square" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => eliminarProducto(item.id_producto)}
            >
              <Icon name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {/* Barra superior */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Productos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AgregarProducto")}
        >
          <Icon name="plus" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* Menú lateral como modal */}
      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
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

      {/* Lista de productos */}
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id_producto?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        style={{ flex: 1 }}
        horizontal={false}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
            No hay productos para mostrar.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 4,
  },
  menuButton: {
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 6,
    elevation: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    flex: 1,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffc107",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
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
    paddingTop: 0,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 14,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  imgCol: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f8f9fa",
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
  },
  nombre: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#212529",
    marginBottom: 2,
  },
  desc: {
    color: "#555",
    fontSize: 13,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: "#888",
  },
  valor: {
    color: "#212529",
    fontWeight: "bold",
  },
  acciones: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  editBtn: {
    backgroundColor: "#198754",
    padding: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 6,
  },
});
