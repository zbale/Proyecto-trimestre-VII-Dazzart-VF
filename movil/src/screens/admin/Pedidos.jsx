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
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 5;
  const [mostrarPapelera, setMostrarPapelera] = useState(false);
  const [pedidosPapelera, setPedidosPapelera] = useState([]);
  const navigation = useNavigation();

  const cargarPedidos = async () => {
    setRefreshing(true);
    try {
      const res = await API.get("/pedidos");
      const data = Array.isArray(res.data) ? res.data : [];
      setPedidos(
        data.filter(
          (p) => !["cancelado", "entregado"].includes((p.estado || "").toLowerCase())
        )
      );

      setPaginaActual(1);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      Alert.alert("Error", "No se pudieron cargar los pedidos");
    } finally {
      setRefreshing(false);
    }
  };

  // REFRESCAR AL VOLVER A LA PANTALLA
  useFocusEffect(
    React.useCallback(() => {
      cargarPedidos();
    }, [])
  );

  const cargarPapelera = async () => {
    try {
      const res = await API.get("/pedidos?papelera=1");
      const data = Array.isArray(res.data) ? res.data : [];
      // SE FILTRAN LOS QUE ESTÁN CANCELADOS O ENTREGADOS
      const filtrados = data.filter(
        (p) =>
          ["cancelado", "entregado"].includes((p.estado || "").toLowerCase())
      );
      setPedidosPapelera(filtrados);
    } catch (err) {
      setPedidosPapelera([]);
      Alert.alert("Error", "No se pudo cargar la papelera");
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    if (mostrarPapelera) cargarPapelera();
  }, [mostrarPapelera]);

  // FILTRADO DE PEDIDOS SEGUN BUSQUEDA
  const pedidosFiltrados = pedidos.filter((p) => {
    const texto = search.trim().toLowerCase();
    return (
      (p.nombre_cliente || "").toLowerCase().includes(texto) ||
      (p.direccion || "").toLowerCase().includes(texto) ||
      (p.estado || "").toLowerCase().includes(texto) ||
      (p.id_factura?.toString() || "").includes(texto)
    );
  });

  // PAGNACION
  const indiceUltimo = paginaActual * pedidosPorPagina;
  const indicePrimero = indiceUltimo - pedidosPorPagina;
  const pedidosVisibles = pedidosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);

  const renderProductos = (productos) => {
    if (!Array.isArray(productos)) return "Sin productos";
    return productos.map((p, i) => `${p.nombre} (x${p.cantidad})`).join(", ");
  };

  const renderPedido = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>ID:</Text>
      <Text style={styles.value}>{item.id_factura}</Text>

      <Text style={styles.label}>Cliente:</Text>
      <Text style={styles.value}>{item.nombre_cliente}</Text>

      <Text style={styles.label}>Dirección:</Text>
      <Text style={styles.value}>{item.direccion}</Text>

      <Text style={styles.label}>Productos:</Text>
      <Text style={styles.value}>{renderProductos(item.productos)}</Text>

      <Text style={styles.label}>Cantidad:</Text>
      <Text style={styles.value}>{item.total_productos}</Text>

      <Text style={styles.label}>Total:</Text>
      <Text style={styles.value}>${Number(item.total).toLocaleString("es-CO")}</Text>

      <Text style={styles.label}>Estado:</Text>
      <Text style={styles.value}>{item.estado}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate("VerFactura", { id: item.id_factura })}
        >
          <Text style={styles.actionText}>Observar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // UTILIDAD PARA FORMATEAR FECHAS
  const formatFechaLocal = (fechaUTC) => {
    if (!fechaUTC) return "";
    const fecha = new Date(fechaUTC);
    return fecha.toLocaleString("es-CO", { hour12: false });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      {/* BARRA SUPERIOR */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Pedidos</Text>
        <TouchableOpacity
          style={styles.trashButton}
          onPress={() => setMostrarPapelera(true)}
        >
          <Icon name="trash" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <Icon name="magnifying-glass" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, dirección, estado o ID..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* MENU LATERAL */}
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

      {/* LISTA DE PAGNACION */}
      <FlatList
        data={pedidosVisibles}
        keyExtractor={(item) => item.id_factura.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderPedido}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarPedidos} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No se encontraron pedidos
          </Text>
        }
      />

      {/* CONTROLES DE PAGINACION */}
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

      {/* PAPELERA DE PEDIDOS*/}
      <Modal
        visible={mostrarPapelera}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarPapelera(false)}
      >
        <View style={styles.papeleraOverlay}>
          {/* FONDO CLICKCLEABLE PARA CERRAR */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setMostrarPapelera(false)}
          />

          {/* CONTENEDOR DEL MODAL */}
          <View style={styles.papeleraContainer}>
            <TouchableOpacity
              onPress={() => setMostrarPapelera(false)}
              style={styles.closeBtn}
            >
              <Text style={{ fontSize: 28, color: "#888" }}>×</Text>
            </TouchableOpacity>

            <Text style={styles.papeleraTitle}>Pedidos en papelera</Text>

            <TouchableOpacity
              style={styles.vaciarBtn}
              onPress={async () => {
                Alert.alert(
                  "Vaciar papelera",
                  "¿Vaciar papelera? Esta acción eliminará definitivamente los pedidos con más de 7 días.",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Eliminar",
                      style: "destructive",
                      onPress: async () => {
                        await API.delete("/pedidos/vaciar-papelera");
                        cargarPapelera();
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Vaciar papelera
              </Text>
            </TouchableOpacity>

            <FlatList
              data={pedidosPapelera}
              keyExtractor={(item) => item.id_factura.toString()}
              contentContainerStyle={{ paddingVertical: 8 }}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  No hay pedidos en papelera
                </Text>
              }
              renderItem={({ item }) => {
                let productosArray = [];
                try {
                  productosArray = JSON.parse(item.productos || '[]');
                } catch (e) {
                  productosArray = [];
                }
                return (
                  <View style={styles.card}>
                    <Text style={styles.label}>ID:</Text>
                    <Text style={styles.value}>{item.id_factura}</Text>
                    <Text style={styles.label}>Cliente:</Text>
                    <Text style={styles.value}>{item.nombre_cliente}</Text>
                    <Text style={styles.label}>Estado:</Text>
                    <Text style={styles.value}>{item.estado}</Text>
                    <Text style={styles.label}>Fecha eliminado:</Text>
                    <Text style={styles.value}>
                      {formatFechaLocal(item.fecha_eliminado)}
                    </Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() =>
                          navigation.navigate("VerFactura", { id: item.id_factura })
                        }
                      >
                        <Text style={styles.actionText}>Observar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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
  trashButton: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 30,
    marginLeft: 8,
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
  viewButton: {
    backgroundColor: "#198754",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
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
  papeleraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  papeleraContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 32,
    minWidth: 400,
    maxWidth: 900,
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
    position: "relative",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 15,
    backgroundColor: "transparent",
    borderWidth: 0,
    fontSize: 24,
    zIndex: 2,
  },
  papeleraTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  vaciarBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: "center",
  },
});