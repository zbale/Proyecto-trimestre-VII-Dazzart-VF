import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  SafeAreaView,
  RefreshControl,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import API from "../../config/api";
import MenuLateral from "../../Components/Admin/MenuLateral";
import { useNavigation } from "@react-navigation/native";

export default function DescuentosAdmin() {
  const [descuentos, setDescuentos] = useState([]);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const descuentosPorPagina = 5;
  const navigation = useNavigation();

  const cargarDescuentos = async () => {
    setRefreshing(true);
    try {
      const res = await API.get("/descuentos");
      setDescuentos(Array.isArray(res.data) ? res.data : []);
      setPaginaActual(1);
    } catch (err) {
      console.error("Error cargando descuentos:", err);
      Alert.alert("Error", "No se pudieron cargar los descuentos");
    } finally {
      setRefreshing(false);
    }
  };

  const eliminarDescuento = (id) => {
    Alert.alert("Eliminar descuento", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/descuentos/${id}`);
            Alert.alert("Éxito", "Descuento eliminado");
            await cargarDescuentos();
          } catch (err) {
            console.error("Error eliminando descuento:", err);
            Alert.alert("Error", "No se pudo eliminar el descuento");
          }
        },
      },
    ]);
  };

  // 🔹 Cargar solo una vez al montar el componente
  useEffect(() => {
    cargarDescuentos();
  }, []);

  // 🔹 Filtrado por búsqueda
  const descuentosFiltrados = descuentos.filter((d) => {
    const texto = search.trim().toLowerCase();
    const fechaInicio = d.fecha_inicio?.split("T")[0] || "";
    const fechaFin = d.fecha_fin?.split("T")[0] || "";
    const aplicacionNombre =
      d.aplicacion === "producto" ? d.nombre_producto : d.nombre_categoria;
    const estado = (d.estado_descuento || "").toLowerCase().trim();

    return (
      (d.tipo_descuento || "").toLowerCase().includes(texto) ||
      estado.includes(texto) ||
      (aplicacionNombre || "").toLowerCase().includes(texto) ||
      (d.valor?.toString() || "").includes(texto) ||
      fechaInicio.includes(texto) ||
      fechaFin.includes(texto)
    );
  });

  // 🔹 Paginación
  const indiceUltimo = paginaActual * descuentosPorPagina;
  const indicePrimero = indiceUltimo - descuentosPorPagina;
  const descuentosVisibles = descuentosFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );
  const totalPaginas = Math.ceil(
    descuentosFiltrados.length / descuentosPorPagina
  );

  const renderDescuento = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>ID:</Text>
      <Text style={styles.value}>{item.id_descuento}</Text>

      <Text style={styles.label}>Tipo:</Text>
      <Text style={styles.value}>{item.tipo_descuento}</Text>

      <Text style={styles.label}>Valor:</Text>
      <Text style={styles.value}>{item.valor}</Text>

      <Text style={styles.label}>Fecha Inicio:</Text>
      <Text style={styles.value}>{item.fecha_inicio?.split("T")[0]}</Text>

      <Text style={styles.label}>Fecha Fin:</Text>
      <Text style={styles.value}>{item.fecha_fin?.split("T")[0]}</Text>

      <Text style={styles.label}>Estado:</Text>
      <Text style={styles.value}>{item.estado_descuento}</Text>

      <Text style={styles.label}>Aplicación:</Text>
      <Text style={styles.value}>{item.aplicacion}</Text>

      <Text style={styles.label}>Producto/Categoría:</Text>
      <Text style={styles.value}>
        {item.aplicacion === "producto"
          ? item.nombre_producto
          : item.aplicacion === "categoria"
          ? item.nombre_categoria
          : "Todos"}
      </Text>

      {/* 🔹 Acciones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditarDescuento", { id: item.id_descuento })
          }
        >
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarDescuento(item.id_descuento)}
        >
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      {/* 🔹 Barra superior */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Descuentos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AgregarDescuento")}
        >
          <Text style={styles.addButtonText}>+ Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Buscador */}
      <View style={styles.searchContainer}>
        <Icon name="magnifying-glass" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por tipo, estado, producto/categoría o fecha..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 🔹 Menú lateral */}
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

      {/* 🔹 Lista con paginación */}
      <FlatList
        data={descuentosVisibles}
        keyExtractor={(item) => item.id_descuento.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderDescuento}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarDescuentos} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No se encontraron descuentos
          </Text>
        }
      />

      {/* 🔹 Controles de paginación */}
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[
            styles.pageButton,
            paginaActual === 1 && styles.disabledButton,
          ]}
          onPress={() => paginaActual > 1 && setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          <Text style={styles.pageText}>Anterior</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Página {paginaActual} de {totalPaginas || 1}
        </Text>

        <TouchableOpacity
          style={[
            styles.pageButton,
            paginaActual === totalPaginas && styles.disabledButton,
          ]}
          onPress={() =>
            paginaActual < totalPaginas && setPaginaActual(paginaActual + 1)
          }
          disabled={paginaActual === totalPaginas}
        >
          <Text style={styles.pageText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
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
  addButton: {
    backgroundColor: "#0d6efd",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
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
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    marginBottom: 6,
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#198754",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  pageButton: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  disabledButton: {
    backgroundColor: "#adb5bd",
  },
  pageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
    color: "#333",
  },
});