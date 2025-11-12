import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
let BACKEND_URL = "", EXPO_PUBLIC_API_URL = "";

try {
  // Intenta importar desde @env (para desarrollo local)
  const envVars = require("@env");
  BACKEND_URL = envVars.BACKEND_URL;
  EXPO_PUBLIC_API_URL = envVars.EXPO_PUBLIC_API_URL;
} catch (e) {
  // Si no está disponible, no hace nada (será undefined)
}

// Normalizar la URL del backend: preferir EXPO_PUBLIC_API_URL (expo public o app.json),
// luego BACKEND_URL, y finalmente el fallback a la IP pública.
const getRawBackend = () => {
  // 1. Intenta desde @env (desarrollo)
  if (EXPO_PUBLIC_API_URL) {
    console.log('[API] Using EXPO_PUBLIC_API_URL from @env:', EXPO_PUBLIC_API_URL);
    return EXPO_PUBLIC_API_URL;
  }
  if (BACKEND_URL) {
    console.log('[API] Using BACKEND_URL from @env:', BACKEND_URL);
    return BACKEND_URL;
  }
  
  // 2. Intenta desde app.json.extra (APK/release)
  try {
    const extra = Constants.expoConfig?.extra || {};
    if (extra.EXPO_PUBLIC_API_URL) {
      console.log('[API] Using EXPO_PUBLIC_API_URL from app.json:', extra.EXPO_PUBLIC_API_URL);
      return extra.EXPO_PUBLIC_API_URL;
    }
  } catch (e) {
    console.error('[API] Error reading app.json.extra:', e?.message);
  }
  
  // 3. Fallback a IP por defecto
  const fallback = "http://67.202.48.5:3001";
  console.log('[API] Using fallback URL:', fallback);
  return fallback;
};

const RAW_BACKEND = getRawBackend();
const BASE_HOST = RAW_BACKEND.replace(/\/+$/, "").replace(/\/api$/i, "");
const BASE = BASE_HOST; // base sin sufijo /api

// Logear la baseURL final que usará Axios (ayuda a depuración)
try {
  console.log('========== API CONFIG ==========');
  console.log('[API MODE] DEV/PROD');
  console.log('[API BACKEND_URL]', BACKEND_URL || 'NOT SET');
  console.log('[API EXPO_PUBLIC_API_URL]', EXPO_PUBLIC_API_URL || 'NOT SET');
  console.log('[API RAW_BACKEND]', RAW_BACKEND);
  console.log('[API BASE_HOST]', BASE_HOST);
  console.log('[API baseURL]', `${BASE}/api`);
  console.log('==============================');
} catch (e) {
  console.error('Error logging API config:', e);
}

// Instancia de Axios
const API = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 15000, // Increased timeout for Android devices
  validateStatus: function (status) {
    // Aceptar cualquier status para que el error llegue al interceptor
    return status < 500;
  }
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
        const fullUrl = `${config.baseURL || ''}${config.url}`;
        console.log(`[API →] ${config.method?.toUpperCase()} ${fullUrl}`);
        console.log(`[API Config] baseURL=${config.baseURL}, url=${config.url}, timeout=${config.timeout}`);
      } catch (e) {
        // ignore logging errors
      }
      return config;
    } catch (error) {
      console.log("[API ERROR] Token fetch:", error?.message);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Interceptor response: elimina token si 401
API.interceptors.response.use(
  (res) => {
    try {
      const fullUrl = `${res.config.baseURL || ''}${res.config.url}`;
      console.log(`[API ←] ${res.config.method?.toUpperCase()} ${fullUrl} → Status ${res.status}`);
    } catch (e) {}
    return res;
  },
  async (err) => {
    // Log response errors for debugging
    try {
      const fullUrl = `${err?.config?.baseURL || ''}${err?.config?.url}`;
      const status = err?.response?.status || 'NO_RESPONSE';
      const errorMsg = err?.message || 'Unknown error';
      console.error(`[API ERROR ✗] ${err?.config?.method?.toUpperCase() || 'UNKNOWN'} ${fullUrl} → ${status} (${errorMsg})`);
      
      // Agregar información adicional para debugging
      if (err.code === 'ERR_NETWORK') {
        console.error('[API DEBUG] ERR_NETWORK detected - possible DNS/connectivity issue');
        console.error('[API DEBUG] Retrying with full URL instead of baseURL...');
      }
    } catch (e) {
      console.error('[API ERROR] Error logging error:', e?.message);
    }
    if (err.response && err.response.status === 401) {
      try { await AsyncStorage.removeItem("token"); } catch (e) {}
    }
    return Promise.reject(err);
  }
);

// Función con reintentos para manejar ERR_NETWORK
export const apiWithRetry = async (fn, retries = 2, delayMs = 1000) => {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`[API RETRY] Attempt ${i + 1}/${retries + 1}`);
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries && err.code === 'ERR_NETWORK') {
        console.log(`[API RETRY] ERR_NETWORK on attempt ${i + 1}, waiting ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
};

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
