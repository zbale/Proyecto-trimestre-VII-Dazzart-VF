import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import API from "../../config/api"; 
import MenuLateral from "../../Components/Admin/MenuLateral";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [editForm, setEditForm] = useState({
    id_categoria: null,
    nombre: "",
    descripcion: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      cargarCategorias();
    }, [])
  );

  const cargarCategorias = async () => {
    setRefreshing(true);
    try {
      const res = await API.get("/categorias/listar"); 
      const categoriasMapeadas = Array.isArray(res.data)
        ? res.data.map((cat) => ({
            id_categoria: cat.id_categoria || cat.id,
            nombre_categoria: cat.nombre_categoria || cat.nombre,
            descripcion_categoria: cat.descripcion_categoria || cat.descripcion,
          }))
        : [];
      setCategorias(categoriasMapeadas);
    } catch (err) {
      console.error(
        "Error al listar:",
        err.message,
        err?.response?.data,
        err?.response?.status
      );
      Alert.alert(
        "Error",
        `No se pudieron cargar las categorías\n${err?.message}\n${JSON.stringify(
          err?.response?.data
        )}`
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.descripcion)
      return Alert.alert("Error", "Completa todos los campos");
    try {
      await API.post("/categorias/agregar", {
        nombre: form.nombre,
        descripcion: form.descripcion,
      }); // 🔹 cambiado api -> API
      setForm({ nombre: "", descripcion: "" });
      await cargarCategorias();
    } catch (err) {
      console.error("Error al agregar:", err?.message, err?.response?.data);
      Alert.alert("Error", "No se pudo agregar la categoría");
    }
  };

  const eliminarCategoria = (id) => {
    Alert.alert("Eliminar categoría", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/categorias/eliminar/${id}`); // 🔹 cambiado api -> API
            await cargarCategorias();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "No se pudo eliminar la categoría");
          }
        },
      },
    ]);
  };

  const abrirEditarModal = (cat) => {
    setEditForm({
      id_categoria: cat.id_categoria,
      nombre: cat.nombre_categoria,
      descripcion: cat.descripcion_categoria,
    });
    setShowEditModal(true);
  };

  const guardarEdicion = async () => {
    const { id_categoria, nombre, descripcion } = editForm;
    if (!nombre || !descripcion)
      return Alert.alert("Error", "Completa todos los campos");

    try {
      await API.put(`/categorias/editar/${id_categoria}`, {
        nombre: nombre,
        descripcion: descripcion,
      }); // 🔹 cambiado api -> API
      setShowEditModal(false);
      await cargarCategorias();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      {/* Barra superior */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> Administrar Categorías</Text>
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

      {/* Lista de categorías */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id_categoria.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarCategorias} />
        }
        ListHeaderComponent={
          <View style={{ padding: 16, paddingTop: 0 }}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={form.nombre}
              onChangeText={(t) => setForm({ ...form, nombre: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={form.descripcion}
              onChangeText={(t) => setForm({ ...form, descripcion: t })}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
              <Text style={styles.addButtonText}>Añadir</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.nombre_categoria}</Text>
              <Text style={styles.cardDesc}>{item.descripcion_categoria}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => abrirEditarModal(item)}
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => eliminarCategoria(item.id_categoria)}
              >
                <Text style={styles.actionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal edición */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Categoría</Text>
            <TextInput
              style={styles.input}
              value={editForm.nombre}
              onChangeText={(t) => setEditForm({ ...editForm, nombre: t })}
            />
            <TextInput
              style={styles.input}
              value={editForm.descripcion}
              onChangeText={(t) => setEditForm({ ...editForm, descripcion: t })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={guardarEdicion}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
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
    elevation: 0,
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
    paddingTop: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#ffc107",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  cardTitle: { fontWeight: "bold" },
  cardDesc: { color: "#555" },
  cardActions: { flexDirection: "row", marginLeft: 10 },
  editButton: {
    backgroundColor: "#198754",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 8 },
  actionText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  saveButton: { backgroundColor: "#0d6efd", padding: 14, borderRadius: 8, flex: 1 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});