import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../../components/cliente/Header';
import Footer from '../../components/cliente/Footer';
import MenuLateral from '../../components/cliente/MenuLateral';
import ProductoCard from '../../components/cliente/ProductoCard';
import ModalConfirmacion from '../../components/cliente/ModalConfirmacion';
import ModalLogin from '../../components/cliente/ModalLogin';
// On case-sensitive filesystems (like the Amplify build VM) filenames are
// case-sensitive. The component file is `carrito.jsx` (lowercase), so import
// using the exact casing to avoid build errors.
import Carrito from '../../components/cliente/carrito';
import ModalProducto from '../../components/cliente/ModalProducto';
import { API_URL } from '../../config/api';

const API_BASE = `${API_URL}/api`;
const IMG_BASE = `${API_URL}/productos/img`;

export default function VistaProductos() {
  const { id_categoria, id_subcategoria } = useParams();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [soloOferta, setSoloOferta] = useState(false);
  const [orden, setOrden] = useState('popularidad');
  const [mostrarCantidad, setMostrarCantidad] = useState(24);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modalLupaOpen, setModalLupaOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) setUsuario(JSON.parse(user));
  }, []);

  useEffect(() => {
    async function fetchNombreCategoria() {
      try {
        const resCat = await fetch(`${API_BASE}/categorias/listar`);
        const cats = await resCat.json();
        const cat = cats.find(c => c.id_categoria === parseInt(id_categoria));
        setNombreCategoria(cat?.nombre_categoria || 'Categoría desconocida');
      } catch (error) {
        console.error('Error al obtener nombre de categoría:', error);
        setNombreCategoria('Categoría desconocida');
      }
    }
    fetchNombreCategoria();
  }, [id_categoria]);

  useEffect(() => {
    async function fetchProductos() {
      try {
        const res = await fetch(`${API_BASE}/productos/listar`);
        const all = await res.json();

        let filtrados = all.filter(
          p =>
            p.id_categoria === parseInt(id_categoria) &&
            p.id_subcategoria === parseInt(id_subcategoria)
        );

        if (soloOferta) filtrados = filtrados.filter(p => p.oferta === true);

        if (busqueda.trim() !== '') {
          const busqLower = busqueda.toLowerCase();
          filtrados = filtrados.filter(p =>
            p.nombre_producto.toLowerCase().includes(busqLower) ||
            (p.marca?.toLowerCase().includes(busqLower)) ||
            (p.descripcion?.toLowerCase().includes(busqLower))
          );
        }

        if (orden === 'popularidad') {
          filtrados.sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0));
        } else if (orden === 'precio_asc') {
          filtrados.sort((a, b) => a.precio - b.precio);
        } else if (orden === 'precio_desc') {
          filtrados.sort((a, b) => b.precio - a.precio);
        }

        filtrados = filtrados.slice(0, mostrarCantidad);

        const productosConImagen = filtrados.map(p => {
          const nombreImg = p.imagen?.replace(/^\/?.*img\//, '') || '';
          const urlImagen = nombreImg
            ? `${IMG_BASE}/${encodeURIComponent(nombreImg)}?t=${Date.now()}`
            : '/default.png';
          return { ...p, urlImagen };
        });

        setProductos(productosConImagen);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    }

    fetchProductos();
  }, [id_categoria, id_subcategoria, soloOferta, orden, mostrarCantidad, busqueda]);

  // Recargar productos al volver del admin
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const res = await fetch(`${API_BASE}/productos/listar`);
        const all = await res.json();

        let filtrados = all.filter(
          p =>
            p.id_categoria === parseInt(id_categoria) &&
            p.id_subcategoria === parseInt(id_subcategoria)
        );

        if (soloOferta) filtrados = filtrados.filter(p => p.oferta === true);

        if (busqueda.trim() !== '') {
          const busqLower = busqueda.toLowerCase();
          filtrados = filtrados.filter(p =>
            p.nombre_producto.toLowerCase().includes(busqLower) ||
            (p.marca?.toLowerCase().includes(busqLower)) ||
            (p.descripcion?.toLowerCase().includes(busqLower))
          );
        }

        if (orden === 'popularidad') {
          filtrados.sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0));
        } else if (orden === 'precio_asc') {
          filtrados.sort((a, b) => a.precio - b.precio);
        } else if (orden === 'precio_desc') {
          filtrados.sort((a, b) => b.precio - a.precio);
        }

        filtrados = filtrados.slice(0, mostrarCantidad);

        const productosConImagen = filtrados.map(p => {
          const nombreImg = p.imagen?.replace(/^\/?.*img\//, '') || '';
          const urlImagen = nombreImg
            ? `${IMG_BASE}/${encodeURIComponent(nombreImg)}?t=${Date.now()}`
            : '/default.png';
          return { ...p, urlImagen };
        });

        setProductos(productosConImagen);
      } catch (err) {
        console.error('Error al recargar productos:', err);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id_categoria, id_subcategoria, soloOferta, orden, mostrarCantidad, busqueda]);

  const handleAgregarCarrito = (producto, cantidad = 1) => {
    if (!usuario || usuario.id_rol !== 2) {
      setMostrarLogin(true);
      return;
    }

    fetch(`${API_BASE}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: usuario.id_usuario,
        id_producto: producto.id_producto,
        cantidad,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al agregar al carrito');
        return res.json();
      })
      .then(data => {
        setModalMensaje(data.message || 'Producto agregado al carrito');
        setMostrarModal(true);
      })
      .catch(() => {
        setModalMensaje('Error al agregar al carrito');
        setMostrarModal(true);
      });
  };

  const abrirModalLupa = producto => {
    const nombreImg = producto.imagen?.replace(/^\/?.*img\//, '') || '';
    const urlImagen = nombreImg
      ? `${IMG_BASE}/${encodeURIComponent(nombreImg)}?t=${Date.now()}`
      : '/default.png';
    setProductoSeleccionado({ ...producto, urlImagen });
    setModalLupaOpen(true);
  };

  const cerrarModalLupa = () => {
    setModalLupaOpen(false);
    setProductoSeleccionado(null);
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    window.location.reload();
  };

  return (
    <>
<Header
  onOpenMenu={() => setShowMenu(true)}
  onOpenCarrito={() => navigate('/carrito')}  // Navegar a la página carrito
  onOpenLogin={() => setMostrarLogin(true)}
  usuario={usuario}
  onLogout={handleLogout}
  busqueda={busqueda}
  setBusqueda={setBusqueda}
  onBuscar={() => {
    if (busqueda.trim() !== '') {
      navigate(`/buscar/${encodeURIComponent(busqueda.trim())}`);
    }
  }}
/>


      {showMenu && <MenuLateral onClose={() => setShowMenu(false)} />}

      <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
        <main className="container my-3 flex-grow-1 d-flex flex-column">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button
                  className="btn btn-link p-0"
                  onClick={() => navigate('/')}
                  style={{ textDecoration: 'underline' }}
                >
                  Inicio
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {nombreCategoria}
              </li>
            </ol>
          </nav>

          <h2 className="mb-3">{nombreCategoria}</h2>

          {/* Filtros */}
          <div className="d-flex align-items-center mb-3" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div className="form-check" style={{ flexGrow: 1, minWidth: '180px' }}>
              <input
                className="form-check-input"
                type="checkbox"
                id="soloOferta"
                checked={soloOferta}
                onChange={() => setSoloOferta(!soloOferta)}
              />
              <label className="form-check-label" htmlFor="soloOferta" style={{ fontWeight: '600', marginLeft: '6px' }}>
                Mostrar sólo productos en oferta
              </label>
            </div>

            <div className="d-flex align-items-center gap-3 flex-wrap" style={{ flexGrow: 1, justifyContent: 'flex-end', minWidth: '280px' }}>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="ordenSelect" className="mb-0" style={{ fontWeight: '600' }}>
                  Ordenar por
                </label>
                <select
                  id="ordenSelect"
                  className="form-select filtro-select"
                  style={{ width: '160px' }}
                  value={orden}
                  onChange={e => setOrden(e.target.value)}
                >
                  <option value="popularidad">Popularidad</option>
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                </select>
              </div>

              <div className="d-flex align-items-center gap-2">
                <label htmlFor="mostrarCantidad" className="mb-0" style={{ fontWeight: '600' }}>
                  Mostrar
                </label>
                <select
                  id="mostrarCantidad"
                  className="form-select filtro-select"
                  style={{ width: '70px' }}
                  value={mostrarCantidad}
                  onChange={e => setMostrarCantidad(parseInt(e.target.value))}
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-grow-1">
            {productos.length === 0 ? (
              <p className="text-muted">No hay productos disponibles en esta categoría y subcategoría.</p>
            ) : (
              <div className="row">
                {productos.map(prod => (
                  <div key={prod.id_producto} className="col-md-4 mb-4">
                    <ProductoCard
                      producto={prod}
                      onAgregarCarrito={handleAgregarCarrito}
                      onVerDetalle={() => abrirModalLupa(prod)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

   {mostrarCarrito && usuario && (
  <Carrito
    id_usuario={usuario.id_usuario}
    show={mostrarCarrito}   // <-- PASAR estado para visibilidad
    onClose={() => setMostrarCarrito(false)}
  />
)}


      {mostrarModal && (
        <ModalConfirmacion
          show={mostrarModal}
          mensaje={modalMensaje}
          onClose={() => setMostrarModal(false)}
          onIrCarrito={() => {
            setMostrarModal(false);
            navigate('/carrito');
          }}
        />
      )}

      {modalLupaOpen && productoSeleccionado && (
        <ModalProducto
          producto={productoSeleccionado}
          show={modalLupaOpen}
          onClose={cerrarModalLupa}
          onAgregarCarrito={handleAgregarCarrito}
        />
      )}

      {mostrarLogin && (
        <ModalLogin
          visible={mostrarLogin}
          onClose={() => setMostrarLogin(false)}
          onLoginSuccess={user => {
            setUsuario(user);
            localStorage.setItem('usuario', JSON.stringify(user));
            setMostrarLogin(false);
          }}
        />
      )}

      <style>{`
        .filtro-select {
          border-radius: 5px;
          border: 1px solid #ccc;
          appearance: none;
          background-color: white;
          font-size: 0.85rem;
          transition: border-color 0.3s ease;
        }
        .filtro-select:focus {
          border-color: #0d6efd;
          outline: none;
          box-shadow: 0 0 3px #0d6efd88;
        }
        main.container {
          padding-left: 0 !important;
          padding-right: 15px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
      `}</style>
    </>
  );
}
