// Se eliminó la pantalla de Login y ahora el botón 'Salir' redirige al Index.
// Cambios para navegación directa al Index desde el menú lateral.
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";

export default function MenuLateral() {
  const [openConfig, setOpenConfig] = useState(false);
  const navigation = useNavigation();

  // Al presionar 'Salir', se navega al Index en vez de Login
  const handleLogout = () => {
    // Aquí puedes limpiar AsyncStorage o lo que uses para sesión
    Alert.alert("Salir", "¿Deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          // Limpia sesión aquí
          // Redirección al Index (login eliminado)
          navigation.replace("Index");
        },
      },
    ]);
  };

  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>Dazzart Admin</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Estadisticas")}>
        <Icon name="chart-line" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Estadísticas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Categorias")}>
        <Icon name="folder" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Categorías</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Subcategorias")}>
        <Icon name="folder-tree" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Subcategorías</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Productos")}>
        <Icon name="box" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Productos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Descuentos")}>
        <Icon name="percent" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Descuentos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Pedidos")}>
        <Icon name="truck" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Pedidos</Text>
      </TouchableOpacity>
      {/* Configuración */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => setOpenConfig(!openConfig)}
      >
        <Icon name="gear" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>
          Configuración {openConfig ? "▾" : "▸"}
        </Text>
      </TouchableOpacity>
      {openConfig && (
        <View style={styles.subMenu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Usuarios")}>
            <Icon name="user" size={18} color="#fff" style={styles.icon} />
            <Text style={styles.menuText}>Clientes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Icon name="right-from-bracket" size={18} color="#fff" style={styles.icon} />
            <Text style={styles.menuText}>Salir</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: "#212529",
    paddingVertical: 24,
    paddingHorizontal: 16,
    width: 240,
    minHeight: "100%",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 24,
    letterSpacing: 1,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
  icon: {
    width: 24,
    textAlign: "center",
  },
  subMenu: {
    paddingLeft: 24,
    marginBottom: 8,
  },
});