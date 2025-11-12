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

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5;
  const navigation = useNavigation();

  const cargarUsuarios = async () => {
    setRefreshing(true);
    try {
      const res = await API.get("/usuarios");
      const data = Array.isArray(res.data) ? res.data : [];

      // Ordenar por id numérico
      const dataOrdenada = data.sort((a, b) => a.id_usuario - b.id_usuario);

      setUsuarios(dataOrdenada);
      setPaginaActual(1);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarUsuarios(); // solo carga inicial
  }, []);

  // Filtrado por búsqueda
  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = search.trim().toLowerCase();
    return (
      (u.nombre || "").toLowerCase().includes(texto) ||
      (u.nombre_usuario || "").toLowerCase().includes(texto) ||
      (u.correo_electronico || "").toLowerCase().includes(texto)
    );
  });

  // Paginación sobre los filtrados
  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosVisibles = usuariosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const renderUsuario = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>ID:</Text>
      <Text style={styles.value}>{item.id_usuario}</Text>

      <Text style={styles.label}>Cédula:</Text>
      <Text style={styles.value}>{item.cedula}</Text>

      <Text style={styles.label}>Nombre:</Text>
      <Text style={styles.value}>{item.nombre}</Text>

      <Text style={styles.label}>Usuario:</Text>
      <Text style={styles.value}>{item.nombre_usuario}</Text>

      <Text style={styles.label}>Correo:</Text>
      <Text style={styles.value}>{item.correo_electronico}</Text>

      <Text style={styles.label}>Celular:</Text>
      <Text style={styles.value}>{item.telefono}</Text>

      <Text style={styles.label}>Dirección:</Text>
      <Text style={styles.value}>{item.direccion}</Text>

      <Text style={styles.label}>Contraseña:</Text>
      <Text style={styles.value}>*******</Text>

      <Text style={styles.label}>Rol:</Text>
      <Text style={styles.value}>{item.rol}</Text>

      <Text style={styles.label}>Estado:</Text>
      <Text
        style={[
          styles.value,
          {
            color: item.estado.toLowerCase() === "activo" ? "green" : "gray",
          },
        ]}
      >
        {item.estado}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditarUsuario", {
              id: item.id_usuario,
            })
          }
        >
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>

        {!(
          item.id_usuario === 1 &&
          item.correo_electronico === "josecrack13113@gmail.com"
        ) && (
          <TouchableOpacity
            style={
              item.estado.toLowerCase() === "activo"
                ? styles.inactivateButton
                : styles.activateButton
            }
            onPress={() =>
              Alert.alert(
                `${
                  item.estado.toLowerCase() === "activo"
                    ? "Inactivar"
                    : "Activar"
                } usuario`,
                "¿Estás seguro?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Sí",
                    onPress: async () => {
                      try {
                        await API.put(`/usuarios/${item.id_usuario}/estado`, {
                          estado:
                            item.estado.toLowerCase() === "activo"
                              ? "Inactivo"
                              : "Activo",
                        });
                        await cargarUsuarios();
                      } catch (err) {
                        Alert.alert("Error", "No se pudo cambiar el estado");
                      }
                    },
                  },
                ]
              )
            }
          >
            <Text style={styles.actionText}>
              {item.estado.toLowerCase() === "activo"
                ? "Inactivar"
                : "Activar"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AgregarUsuario")}
        >
          <Text style={styles.addButtonText}>+ Añadir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnifying-glass" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, usuario o correo..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

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

      <FlatList
        data={usuariosVisibles}
        keyExtractor={(item) => item.id_usuario.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderUsuario}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarUsuarios} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No se encontraron usuarios
          </Text>
        }
      />

      <View style={styles.pagination}>
        <TouchableOpacity
          style={[
            styles.pageButton,
            paginaActual === 1 && styles.disabledButton,
          ]}
          onPress={() =>
            paginaActual > 1 && setPaginaActual(paginaActual - 1)
          }
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
            paginaActual < totalPaginas &&
            setPaginaActual(paginaActual + 1)
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
  activateButton: {
    backgroundColor: "#0d6efd",
    padding: 10,
    borderRadius: 8,
  },
  inactivateButton: {
    backgroundColor: "#ffc107",
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
