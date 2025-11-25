import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../../components/cliente/Footer';
import Header from '../../components/cliente/Header';
import MenuLateral from '../../components/cliente/MenuLateral';
import ModalConfirmacion from '../../components/cliente/ModalConfirmacion';
import ModalConfirmarPedido from '../../components/cliente/ModalConfirmarPedido';
import ProductoCard from '../../components/cliente/ProductoCard';
import ModalLogin from '../../components/cliente/ModalLogin'; // <-- Asegúrate de importarlo
import { API_URL, API } from '../../config/api';

const BASE_URL = API_URL;

export default function ProductoDetalle({
  producto: productoProp,
  onVolver,
  onAgregarCarrito,
  mostrarModal: mostrarModalProp,
  modalMensaje: modalMensajeProp,
  onCloseModal,
  onIrCarrito,
  id_usuario: idUsuarioProp,
  onOpenLogin
}) {
  const params = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(productoProp || null);
  const [cantidad, setCantidad] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [usuario, setUsuario] = useState(null); // <-- Usuario local
  const [mostrarLogin, setMostrarLogin] = useState(false); // <-- Modal login
  const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [mostrarErrorCantidad, setMostrarErrorCantidad] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) setUsuario(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (productoProp) {
      setProducto(productoProp);
      return;
    }
    const fetchProducto = async () => {
      try {
        const res = await fetch(`/api/productos/${params.id_producto}`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error('Producto no encontrado: ' + errorText);
        }
        const data = await res.json();
        const nombreImg = data.imagen?.replace(/^\/?..*img\//, '') || '';
        const urlImagen = nombreImg
          ? `/productos/img/${encodeURIComponent(nombreImg)}?t=${Date.now()}`
          : '/default.png';
        setProducto({ ...data, urlImagen });
      } catch (error) {
        console.error('Error al buscar producto:', error);
        setModalMensaje(error.message);
        setMostrarModal(true);
      }
    };
    fetchProducto();
  }, [params.id_producto, productoProp]);

  // Recargar producto cuando vuelve del admin
  useEffect(() => {
    const handleFocus = async () => {
      if (!params.id_producto) return;
      try {
        const res = await fetch(`/api/productos/${params.id_producto}`);
        if (!res.ok) return;
        const data = await res.json();
        const nombreImg = data.imagen?.replace(/^\/?..*img\//, '') || '';
        const urlImagen = nombreImg
          ? `/productos/img/${encodeURIComponent(nombreImg)}?t=${Date.now()}`
          : '/default.png';
        setProducto({ ...data, urlImagen });
      } catch (error) {
        console.error('Error recargando producto:', error);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [params.id_producto]);

  const handleAgregarCarrito = () => {
    const id_usuario = idUsuarioProp || usuario?.id_usuario;

    if (!id_usuario) {
      if (onOpenLogin) onOpenLogin();
      else setMostrarLogin(true);
      return;
    }

    // Validar que hay stock disponible
    if (!producto.stock || producto.stock <= 0) {
      setErrorMensaje('Producto sin stock disponible');
      setMostrarErrorCantidad(true);
      return;
    }

    // Validar que la cantidad no exceda el stock disponible
    if (cantidad > producto.stock) {
      setErrorMensaje(`Solo hay ${producto.stock} unidad(es) disponible(s)`);
      setMostrarErrorCantidad(true);
      return;
    }

    if (onAgregarCarrito) {
      onAgregarCarrito(producto, cantidad);
    } else {
      API.post(`carrito`, {
        id_usuario,
        id_producto: producto.id_producto,
        cantidad,
      })
        .then((res) => {
          setModalMensaje(res.data.message || 'Producto agregado al carrito');
          setMostrarModal(true);
        })
        .catch((error) => {
          console.error('Error al agregar al carrito:', error);
          setModalMensaje(error.response?.data?.error || 'Error al agregar al carrito');
          setMostrarModal(true);
        });
    }
  };

  const handleComprarAhora = () => {
    const id_usuario = idUsuarioProp || usuario?.id_usuario;

    if (!id_usuario) {
      if (onOpenLogin) onOpenLogin();
      else setMostrarLogin(true);
      return;
    }

    // Validar que hay stock disponible
    if (!producto.stock || producto.stock <= 0) {
      setErrorMensaje('Producto sin stock disponible');
      setMostrarErrorCantidad(true);
      return;
    }

    // Validar que la cantidad no exceda el stock disponible
    if (cantidad > producto.stock) {
      setErrorMensaje(`Solo hay ${producto.stock} unidad(es) disponible(s)`);
      setMostrarErrorCantidad(true);
      return;
    }

    // Mostrar modal de confirmación de pedido
    setMostrarModalPedido(true);
  };

  const confirmarCompraDirecta = async () => {
    setMostrarModalPedido(false);
    const id_usuario = idUsuarioProp || usuario?.id_usuario;

    if (!direccion.trim()) {
      setModalMensaje('Por favor ingresa una dirección de entrega');
      setMostrarModal(true);
      return;
    }

    try {
      const res = await API.post(`pedidos`, {
        id_usuario,
        direccion,
        productos: [{ ...producto, cantidad }],
        total_productos: cantidad,
        total: (producto.precio || 0) * cantidad,
      });

      if (res.status === 201 || res.status === 200) {
        const pedidoData = res.data;
        sessionStorage.setItem('ultimaFactura', JSON.stringify(pedidoData));
        
        // El backend puede retornar id_pedido o id_factura
        const factura_id = pedidoData.id_factura || pedidoData.id_pedido;
        
        if (factura_id) {
          navigate(`/factura/${factura_id}`);
        } else {
          setModalMensaje('Pedido creado pero sin ID de factura');
          setMostrarModal(true);
        }
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setModalMensaje(error.response?.data?.message || 'Error al realizar la compra');
      setMostrarModal(true);
    }
  };

  const cancelarCompra = () => setMostrarModalPedido(false);

  const showModal = typeof mostrarModalProp !== "undefined" ? mostrarModalProp : mostrarModal;
  const mensajeModal = typeof modalMensajeProp !== "undefined" ? modalMensajeProp : modalMensaje;
  const closeModal = typeof onCloseModal === "function" ? onCloseModal : () => setMostrarModal(false);
  const irCarrito = typeof onIrCarrito === "function" ? onIrCarrito : () => navigate('/carrito');

  if (!producto) return <p className="text-center mt-5">Cargando producto...</p>;
  const maxCantidad = producto.stock || 10;

  return (
    <>
      <Header
        onOpenMenu={() => setShowMenu(true)}
        onOpenCarrito={() => navigate('/carrito')}
        onOpenLogin={() => setMostrarLogin(true)}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onBuscar={() => {
          if (busqueda.trim() !== '') {
            navigate(`/buscar/${encodeURIComponent(busqueda.trim())}`);
          }
        }}
        usuario={usuario}
        onLogout={() => {
          setUsuario(null);
          localStorage.removeItem('usuario');
        }}
      />

      {showMenu && <MenuLateral onClose={() => setShowMenu(false)} />}

      <div className="container mt-5" style={{ marginBottom: '6rem', position: 'relative', zIndex: 1 }}>
        <button
          className="btn btn-link text-secondary mb-4"
          onClick={onVolver ? onVolver : () => navigate(-1)}
          style={{ fontWeight: '600', fontSize: '1.1rem' }}
          aria-label="Volver"
        >
          ← Volver
        </button>

        <div className="row g-5">
          <div className="col-md-6 d-flex justify-content-center align-items-center" style={{ minHeight: '450px', backgroundColor: '#f5f9ff', borderRadius: '8px', padding: '15px' }}>
            <img
              src={producto.urlImagen}
              alt={producto.nombre}
              style={{
                width: '100%',
                maxWidth: '500px',
                height: 'auto',
                maxHeight: '450px',
                objectFit: 'contain',
              }}
              className="img-fluid rounded shadow-sm"
            />
          </div>

          <div className="col-md-6">
            <h1 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{producto.nombre}</h1>
            <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#3483fa', marginBottom: '1.5rem' }}>
              {producto.descuento_aplicado && producto.precio_final && producto.precio_final !== producto.precio ? (
                <>
                  <span className="text-muted text-decoration-line-through me-2" style={{ fontSize: '1.2rem' }}>
                    ${Number(producto.precio).toLocaleString('es-CO')}
                  </span>
                  <span className="fw-bold text-danger" style={{ fontSize: '1.75rem' }}>
                    ${Number(producto.precio_final).toLocaleString('es-CO')}
                  </span>
                  {(producto.descuento_aplicado.tipo_descuento || '').toLowerCase() === 'porcentaje' && (
                    <span className="badge bg-success ms-2">
                      -{producto.descuento_aplicado.valor}%
                    </span>
                  )}
                  {((producto.descuento_aplicado.tipo_descuento || '').toLowerCase() === 'valor' ||
                    (producto.descuento_aplicado.tipo_descuento || '').toLowerCase() === 'fijo') && (
                    <span className="badge bg-success ms-2">
                      -${Number(producto.descuento_aplicado.valor).toLocaleString('es-CO')}
                    </span>
                  )}
                </>
              ) : (
                <span>
                  ${Number(producto.precio).toLocaleString('es-CO')}
                </span>
              )}
            </p>

            <div className="mb-4">
              <label htmlFor="cantidad" style={{ fontWeight: '600', display: 'block' }}>
                Cantidad:
              </label>
              <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                <select
                  id="cantidad"
                  className="form-select text-center"
                  value={cantidad}
                  onChange={e => setCantidad(parseInt(e.target.value))}
                  aria-label="Seleccionar cantidad"
                  style={{ width: '150px' }}
                >
                  {Array.from({ length: maxCantidad }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Producto' : 'Productos'}
                    </option>
                  ))}
                </select>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  {producto.stock} disponibles
                </p>
              </div>
            </div>

            <div className="d-flex gap-3 flex-wrap mb-4">
              <button
                className="btn btn-primary px-4"
                onClick={handleAgregarCarrito}
                style={{ backgroundColor: '#3483fa', borderColor: '#3483fa', fontWeight: '600' }}
              >
                + Añadir al carrito
              </button>
              <button
                className="btn btn-outline-primary px-4"
                style={{ fontWeight: '600' }}
                onClick={handleComprarAhora}
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs mt-5" role="tablist">
          <li className="nav-item">
            <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#desc" style={{ fontWeight: '600' }}>
              Descripción
            </button>
          </li>
        </ul>

        <div className="tab-content p-4 border border-top-0 rounded-bottom" style={{ backgroundColor: '#fff' }}>
          <div className="tab-pane fade show active" id="desc">
            <p style={{ fontSize: '1rem' }}>{producto.descripcion}</p>
          </div>
        </div>
      </div>

      <ModalConfirmacion
        show={showModal}
        mensaje={mensajeModal}
        onClose={closeModal}
        onIrCarrito={irCarrito}
      />

      {mostrarLogin && (
        <ModalLogin
          visible={mostrarLogin}
          onClose={() => setMostrarLogin(false)}
          onLoginSuccess={(user) => {
            setUsuario(user);
            localStorage.setItem('usuario', JSON.stringify(user));
            setMostrarLogin(false);
          }}
        />
      )}

      {/* Modal de error de cantidad */}
      {mostrarErrorCantidad && ReactDOM.createPortal(
        <div className="modal1" style={{ zIndex: 9999 }}>
          <div
            className="modal-contenido"
            style={{
              maxWidth: 400,
              minHeight: 0,
              flexDirection: 'column',
              gap: '1.2rem',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="cerrar" onClick={() => setMostrarErrorCantidad(false)}>&times;</div>
            <div className="modal-title" style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#222' }}>
              Cantidad Inválida
            </div>
            <div className="modal-message" style={{ color: '#444', fontSize: '1.05rem' }}>
              {errorMensaje}
            </div>
            <button
              className="agregar-carrito"
              onClick={() => setMostrarErrorCantidad(false)}
              style={{
                background: '#0084ff',
                color: 'white',
                border: 'none',
                padding: '0.6rem 2rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                marginTop: '0.5rem',
              }}
            >
              Entendido
            </button>
          </div>
        </div>,
        document.body
      )}

      <ModalConfirmarPedido
        show={mostrarModalPedido}
        onClose={cancelarCompra}
        onConfirm={confirmarCompraDirecta}
        direccion={direccion}
        setDireccion={setDireccion}
      />

      <Footer />
    </>
  );
}
