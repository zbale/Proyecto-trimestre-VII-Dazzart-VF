import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@env";

// Normalizar la URL del backend: eliminar slashes finales y evitar doble "/api"
const RAW_BACKEND = BACKEND_URL || "http://67.202.48.5:3001";
const BASE_HOST = RAW_BACKEND.replace(/\/+$/, "").replace(/\/api$/i, "");
const BASE = BASE_HOST; // base sin sufijo /api

// Logear la baseURL final que usará Axios (ayuda a depuración)
try {
  console.log('[API baseURL]', `${BASE}/api`);
} catch (e) {}

// Instancia de Axios
const API = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 10000,
});

// Función para construir URLs de imágenes
export const imgUrl = (path) => {
  if (!path) return "";
  return `${BASE}/${path.replace(/^\/+/, "")}`;
};

// Interceptor request: agrega token
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      config.headers = config.headers || {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
      // Log request method and URL for debugging in Metro/Expo
      try {
        console.log('[API request]', (config && config.method && config.url) ? `${config.method.toUpperCase()} ${config.baseURL || ''}${config.url}` : config);
      } catch (e) {
        // ignore logging errors
      }
      return config;
    } catch (error) {
      console.log("Error obteniendo token:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Interceptor response: elimina token si 401
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    // Log response errors for debugging
    try {
      if (err && err.config) {
        console.error('[API response error]', err.config.method ? err.config.method.toUpperCase() : '', err.config.url, err.response ? err.response.status : err.message);
      } else {
        console.error('[API response error]', err && err.message ? err.message : err);
      }
    } catch (e) {
      // ignore logging errors
    }
    if (err.response && err.response.status === 401) {
      try { await AsyncStorage.removeItem("token"); } catch (e) {}
    }
    return Promise.reject(err);
  }
);

/////////////////////////
// AUTH
/////////////////////////
export const login = async (data) => {
  try {
    const res = await API.post("/login", data);
    return res.data;
  } catch (err) {
    console.error("Error login:", err);
    return null;
  }
};

export const forgotPassword = async (data) => {
  try {
    const res = await API.post("/login/forgot-password", data);
    return res.data;
  } catch (err) {
    console.error("Error forgot password:", err);
    return null;
  }
};

export const resetPassword = async (data) => {
  try {
    const res = await API.post("/login/reset-password", data);
    return res.data;
  } catch (err) {
    console.error("Error reset password:", err);
    return null;
  }
};

/////////////////////////
// PRODUCTOS
/////////////////////////
export const getProductos = async () => {
  try {
    const res = await API.get("/productos/listar");
    return res.data;
  } catch (err) {
    console.error("Error obteniendo productos:", err);
    return [];
  }
};

export const getProductoPorId = async (id) => {
  try {
    const res = await API.get(`/productos/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error obteniendo producto por ID:", err);
    return null;
  }
};

/////////////////////////
// CATEGORIAS
/////////////////////////
export const getCategorias = async () => {
  try {
    const res = await API.get("/categorias/listar");
    return res.data;
  } catch (err) {
    console.error("Error obteniendo categorías:", err);
    return [];
  }
};

/////////////////////////
// SUBCATEGORIAS
/////////////////////////
export const getSubcategorias = async () => {
  try {
    const res = await API.get("/subcategorias/listar");
    return res.data;
  } catch (err) {
    console.error("Error obteniendo subcategorias:", err);
    return [];
  }
};

export const getSubcategoriasPorCategoria = async (id_categoria) => {
  try {
    const res = await API.get(`/subcategorias/listar/${id_categoria}`);
    return res.data;
  } catch (err) {
    console.error("Error obteniendo subcategorias por categoría:", err);
    return [];
  }
};

/////////////////////////
// DESCUENTOS
/////////////////////////
export const getDescuentos = async () => {
  try {
    const res = await API.get("/descuentos");
    return res.data;
  } catch (err) {
    console.error("Error obteniendo descuentos:", err);
    return [];
  }
};

export const getDescuentoPorId = async (id) => {
  try {
    const res = await API.get(`/descuentos/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error obteniendo descuento por ID:", err);
    return null;
  }
};

/////////////////////////
// PEDIDOS
/////////////////////////
export const getPedidos = async () => {
  try {
    const res = await API.get("/pedidos");
    return res.data;
  } catch (err) {
    console.error("Error obteniendo pedidos:", err);
    return [];
  }
};

export const getPedidosPorUsuario = async (id_usuario) => {
  try {
    const res = await API.get(`/pedidos/usuario/${id_usuario}`);
    return res.data;
  } catch (err) {
    console.error("Error obteniendo pedidos del usuario:", err);
    return [];
  }
};

export const crearPedido = async (data) => {
  try {
    const res = await API.post("/pedidos", data);
    return res.data;
  } catch (err) {
    console.error("Error creando pedido:", err);
    return null;
  }
};

export const actualizarEstadoPedido = async (id_factura, estado) => {
  try {
    const res = await API.put(`/pedidos/actualizar-estado/${id_factura}`, { estado });
    return res.data;
  } catch (err) {
    console.error("Error actualizando estado del pedido:", err);
    return null;
  }
};

export const cancelarPedido = async (id_factura) => {
  try {
    const res = await API.put(`/pedidos/cancelar/${id_factura}`);
    return res.data;
  } catch (err) {
    console.error("Error cancelando pedido:", err);
    return null;
  }
};

export const restaurarPedido = async (id_factura) => {
  try {
    const res = await API.put(`/pedidos/restaurar/${id_factura}`);
    return res.data;
  } catch (err) {
    console.error("Error restaurando pedido:", err);
    return null;
  }
};

export const vaciarPapeleraPedidos = async () => {
  try {
    const res = await API.delete("/pedidos/vaciar-papelera");
    return res.data;
  } catch (err) {
    console.error("Error vaciando papelera de pedidos:", err);
    return null;
  }
};

/////////////////////////
// CARRITO
/////////////////////////
export const getCarrito = async (id_usuario) => {
  try {
    const res = await API.get(`/carrito/${id_usuario}`);
    return res.data;
  } catch (err) {
    console.error("Error obteniendo carrito:", err);
    return [];
  }
};

export const agregarProductoCarrito = async (data) => {
  try {
    const res = await API.post("/carrito", data);
    return res.data;
  } catch (err) {
    console.error("Error agregando producto al carrito:", err);
    return null;
  }
};

export const eliminarProductoCarrito = async (id_carrito) => {
  try {
    const res = await API.delete(`/carrito/${id_carrito}`);
    return res.data;
  } catch (err) {
    console.error("Error eliminando producto del carrito:", err);
    return null;
  }
};

export const vaciarCarrito = async (id_usuario) => {
  try {
    const res = await API.delete(`/carrito/vaciar/${id_usuario}`);
    return res.data;
  } catch (err) {
    console.error("Error vaciando carrito:", err);
    return null;
  }
};

/////////////////////////
// USUARIOS
/////////////////////////
export const registerUser = async (data) => {
  try {
    const res = await API.post("/usuarios/register", data);
    return res.data;
  } catch (err) {
    console.error("Error registrando usuario:", err);
    return null;
  }
};

export const getUsuarios = async () => {
  try {
    const res = await API.get("/usuarios");
    return res.data;
  } catch (err) {
    console.error("Error obteniendo usuarios:", err);
    return [];
  }
};

export const getUsuarioPorId = async (id) => {
  try {
    const res = await API.get(`/usuarios/usuario/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error obteniendo usuario por ID:", err);
    return null;
  }
};

export const actualizarUsuario = async (id, data) => {
  try {
    const res = await API.put(`/usuarios/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Error actualizando usuario:", err);
    return null;
  }
};

export const cambiarEstadoUsuario = async (id, estado) => {
  try {
    const res = await API.put(`/usuarios/${id}/estado`, { estado });
    return res.data;
  } catch (err) {
    console.error("Error cambiando estado de usuario:", err);
    return null;
  }
};

export default API;
