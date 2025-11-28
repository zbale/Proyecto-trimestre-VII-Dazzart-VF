 import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Alert, SafeAreaView, RefreshControl } from "react-native";
import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import API from "../../config/api";  // 🔹 corregido
import MenuLateral from "../../Components/Admin/MenuLateral";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";

export default function SubcategoriasAdmin() {
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre_subcategoria: "",
    descripcion_subcategoria: "",
    id_categoria: "",
  });
  const [editForm, setEditForm] = useState({
    id_subcategoria: null,
    nombre_subcategoria: "",
    descripcion_subcategoria: "",
    id_categoria: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itemsPorPagina = 10;

  useFocusEffect(
    React.useCallback(() => {
      cargarSubcategorias();
      cargarCategorias();
    }, [])
  );

  const cargarCategorias = async () => {
    try {
      const res = await API.get("/categorias/listar"); // 🔹 cambiado api -> API
      setCategorias(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      Alert.alert("Error", "No se pudieron cargar las categorías");
    }
  };

  const cargarSubcategorias = async () => {
    setRefreshing(true);
    try {
      const res = await API.get("/subcategorias/listar"); // 🔹 cambiado api -> API
      setSubcategorias(Array.isArray(res.data) ? res.data : []);
      setTotalPaginas(Math.ceil((Array.isArray(res.data) ? res.data : []).length / itemsPorPagina));
      setPagina(1);
    } catch (err) {
      console.error("Error al cargar subcategorías:", err);
      Alert.alert("Error", "No se pudieron cargar las subcategorías");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.id_categoria || !form.descripcion_subcategoria || !form.nombre_subcategoria) {
      return Alert.alert("Error", "Completa todos los campos");
    }
    try {
      await API.post("/subcategorias/agregar", form); // 🔹 cambiado api -> API
      setForm({ nombre_subcategoria: "", descripcion_subcategoria: "", id_categoria: "" });
      await cargarSubcategorias();
    } catch (err) {
      console.error("Error al agregar:", err);
      Alert.alert("Error", "No se pudo agregar la subcategoría");
    }
  };

  const eliminarSubcategoria = (id) => {
    Alert.alert("Eliminar Subcategoría", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/subcategorias/eliminar/${id}`); // 🔹 cambiado api -> API
            await cargarSubcategorias();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "No se pudo eliminar la subcategoría");
          }
        },
      },
    ]);
  };

  const abrirEditarModal = (subcat) => {
    setEditForm({
      id_subcategoria: subcat.id_subcategoria,
      nombre_subcategoria: subcat.nombre_subcategoria,
      descripcion_subcategoria: subcat.descripcion_subcategoria,
      id_categoria: subcat.id_categoria,
    });
    setShowEditModal(true);
  };

  const guardarEdicion = async () => {
    const { id_subcategoria, nombre_subcategoria, descripcion_subcategoria, id_categoria } = editForm;
    if (!nombre_subcategoria || !descripcion_subcategoria || !id_categoria) {
      return Alert.alert("Error", "Completa todos los campos");
    }
    try {
      await API.put(`/subcategorias/editar/${id_subcategoria}`, editForm); // 🔹 cambiado api -> API
      setShowEditModal(false);
      await cargarSubcategorias();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo actualizar la subcategoría");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      {/* Barra superior con botón de menú y título */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Icon name="bars" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administrar Subcategorías</Text>
      </View>

      {/* Menú lateral como modal */}
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

      <View style={{ padding: 16, paddingTop: 0 }}>
        {/* Formulario Añadir */}
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={form.nombre_subcategoria}
          onChangeText={(t) => setForm({ ...form, nombre_subcategoria: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={form.descripcion_subcategoria}
          onChangeText={(t) => setForm({ ...form, descripcion_subcategoria: t })}
        />
        <Picker
          selectedValue={form.id_categoria}
          onValueChange={(v) => setForm({ ...form, id_categoria: v })}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona Categoría" value="" />
          {categorias.map((cat) => (
            <Picker.Item key={cat.id_categoria} label={cat.nombre_categoria} value={cat.id_categoria} />
          ))}
        </Picker>
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Subcategorías */}
      <FlatList
        data={subcategorias.slice((pagina - 1) * itemsPorPagina, pagina * itemsPorPagina)}
        keyExtractor={(item) => item.id_subcategoria.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={cargarSubcategorias} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.nombre_subcategoria}</Text>
              <Text style={styles.cardDesc}>
                {item.descripcion_subcategoria} (Categoría: {item.nombre_categoria})
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => abrirEditarModal(item)}>
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarSubcategoria(item.id_subcategoria)}>
                <Text style={styles.actionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={{ padding: 16, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity 
                style={[styles.paginationBtn, pagina === 1 && styles.paginationBtnDisabled]}
                disabled={pagina === 1}
                onPress={() => setPagina(pagina - 1)}
              >
                <Text style={styles.paginationBtnText}>← Anterior</Text>
              </TouchableOpacity>
              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>{pagina} / {totalPaginas}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.paginationBtn, pagina === totalPaginas && styles.paginationBtnDisabled]}
                disabled={pagina === totalPaginas}
                onPress={() => setPagina(pagina + 1)}
              >
                <Text style={styles.paginationBtnText}>Siguiente →</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {/* Modal Edición */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Subcategoría</Text>
            <TextInput
              style={styles.input}
              value={editForm.nombre_subcategoria}
              onChangeText={(t) => setEditForm({ ...editForm, nombre_subcategoria: t })}
            />
            <TextInput
              style={styles.input}
              value={editForm.descripcion_subcategoria}
              onChangeText={(t) => setEditForm({ ...editForm, descripcion_subcategoria: t })}
            />
            <Picker
              selectedValue={editForm.id_categoria}
              onValueChange={(v) => setEditForm({ ...editForm, id_categoria: v })}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona Categoría" value="" />
              {categorias.map((cat) => (
                <Picker.Item key={cat.id_categoria} label={cat.nombre_categoria} value={cat.id_categoria} />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={guardarEdicion}>
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
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  picker: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 12, backgroundColor: "#fff" },
  addButton: { backgroundColor: "#ffc107", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 16 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, alignItems: "center" },
  cardTitle: { fontWeight: "bold" },
  cardDesc: { color: "#555" },
  cardActions: { flexDirection: "row", marginLeft: 10 },
  editButton: { backgroundColor: "#198754", padding: 10, borderRadius: 8, marginRight: 8 },
  deleteButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 8 },
  actionText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  cancelButton: { backgroundColor: "#6c757d", padding: 14, borderRadius: 8, flex: 1, marginRight: 8 },
  saveButton: { backgroundColor: "#0d6efd", padding: 14, borderRadius: 8, flex: 1 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  paginationBtn: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  paginationBtnDisabled: {
    backgroundColor: "#ccc",
  },
  paginationBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  paginationInfo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  paginationText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});