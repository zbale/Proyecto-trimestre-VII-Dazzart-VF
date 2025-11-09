import { BrowserRouter, Routes, Route } from "react-router-dom";

import ClienteHome from "./pages/cliente/index";
import ProductoDetalle from "./pages/cliente/ProductoDetalle";
import VistaProductos from "./pages/cliente/VistaProductos.jsx";
import RegistroDazzart from "./pages/cliente/Registro.jsx";
import VistaBusqueda from "./pages/cliente/VistaBusqueda.jsx";
import CarritoPage from "./pages/cliente/CarritoPage";
import MisCompras from "./pages/cliente/MisCompras";
import MisDatos from "./pages/cliente/MisDatos";
import Factura from './pages/cliente/Factura.jsx';
import PedidosUser from './pages/cliente/PedidosUser.jsx';


import ProductosAdmin from "./pages/admin/productos";
import ProductosAñadir from "./pages/admin/añadirproducto";
import EditarProducto from "./pages/admin/editarproducto";
import Categorias from "./pages/admin/categorias";
import Subcategorias from "./pages/admin/subcategorias";
import Pedidos from "./pages/admin/pedidos";
import VerFactura from "./pages/admin/VerFactura";

import UsuariosAdmin from "./pages/admin/GestionUsuarios";
import AgregarUsuario from "./pages/admin/AgregarUsuarios";
import EditarUsuario from "./pages/admin/EditarUsuario";

import DescuentosAdmin from "./pages/admin/Descuento";
import FormularioDescuento from "./pages/admin/FormularioDescuento";
import EditarDescuento from "./pages/admin/EditarDescuento";
import EstadisticasAdmin from "./pages/admin/EstadisticasAdmin.jsx";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Cliente */}
        <Route path="/" element={<ClienteHome />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/producto/:id_producto" element={<ProductoDetalle />} />
        <Route path="/productos/:id_categoria/:id_subcategoria" element={<VistaProductos />} />
        <Route path="/registro" element={<RegistroDazzart />} />
        <Route path="/buscar/:termino" element={<VistaBusqueda />} />
        <Route path="/mis-compras" element={<MisCompras />} />
        <Route path="/mis-datos" element={<MisDatos />} />
        <Route path="/factura/:id_factura" element={<Factura />} />
        <Route path="/mis-pedidos" element={<PedidosUser />} />


        {/* Rutas Admin protegidas */}
        <Route path="/admin-usuarios" element={<ProtectedRoute><UsuariosAdmin /></ProtectedRoute>} />
        <Route path="/agregar-usuarios" element={<ProtectedRoute><AgregarUsuario /></ProtectedRoute>} />
        <Route path="/editar-usuario/:id" element={<ProtectedRoute><EditarUsuario /></ProtectedRoute>} />

        <Route path="/admin-descuento" element={<ProtectedRoute><DescuentosAdmin /></ProtectedRoute>} />
        <Route path="/agregar-descuento" element={<ProtectedRoute><FormularioDescuento /></ProtectedRoute>} />
        <Route path="/editar-descuento/:id" element={<ProtectedRoute><EditarDescuento /></ProtectedRoute>} />

        <Route path="/admin-productos" element={<ProtectedRoute><ProductosAdmin /></ProtectedRoute>} />
        <Route path="/agregar-producto" element={<ProtectedRoute><ProductosAñadir /></ProtectedRoute>} />
        <Route path="/editar-producto/:id" element={<ProtectedRoute><EditarProducto /></ProtectedRoute>} />

        <Route path="/admin-categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
        <Route path="/admin-subcategorias" element={<ProtectedRoute><Subcategorias /></ProtectedRoute>} />

        <Route path="/admin-pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
        <Route path="/ver-factura/:id" element={<ProtectedRoute><VerFactura /></ProtectedRoute>} />
        <Route path="/admin-estadisticas" element={<ProtectedRoute><EstadisticasAdmin /></ProtectedRoute>} />

     </Routes>
    </BrowserRouter>
  );
}

export default App;