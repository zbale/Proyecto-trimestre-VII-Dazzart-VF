import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductoDetalle from '../../pages/cliente/ProductoDetalle';
import ModalConfirmarPedido from './ModalConfirmarPedido';
import ModalConfirmacion from './ModalConfirmacion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../../config/api';

const IMG_BASE = `${API_URL}/productos/img`;

export default function Carrito({ id_usuario, direccion, onOpenLogin }) {
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
  const [recomendados, setRecomendados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id_usuario) return;
    fetch(`${API_URL}/api/carrito/${id_usuario}`)
      .then(res => res.json())
      .then(data => {
        const carritoConImagen = data.map(item => ({
          ...item,
          urlImagen: item.imagen
            ? `${IMG_BASE}/${encodeURIComponent(item.imagen.replace(/^.*[\\/]/, ''))}?t=${Date.now()}`
            : '/default.png'
        }));
        setCarrito(carritoConImagen);
      })
      .catch(() => setCarrito([]));
  }, [id_usuario]);

  useEffect(() => {
    fetch(`${API_URL}/api/productos/listar`)
      .then(res => res.json())
      .then(data => {
        const idsEnCarrito = carrito.map(item => item.id_producto);
        const recomendadosFiltrados = data
          .filter(prod => !idsEnCarrito.includes(prod.id_producto))
          .slice(0, 5)
          .map(prod => ({
            ...prod,
            urlImagen: prod.imagen
              ? `${IMG_BASE}/${encodeURIComponent(prod.imagen.replace(/^.*[\\/]/, ''))}?t=${Date.now()}`
              : '/default.png'
          }));
        setRecomendados(recomendadosFiltrados);
      })
      .catch(() => setRecomendados([]));
  }, [carrito]);

  const eliminarProducto = (id_carrito) => {
  fetch(`${API_URL}/api/carrito/${id_carrito}`, { method: 'DELETE' })
      .then(() => {
        setCarrito(carrito.filter(item => item.id_carrito !== id_carrito));
      })
      .catch(() => {
        setModalMensaje('Error al eliminar el producto');
        setMostrarModal(true);
      });
  };

  const calcularTotalRaw = () => {
    return carrito.reduce((sum, item) => {
      const precio = item.precio_final ?? item.precio;
      return sum + precio * item.cantidad;
    }, 0);
  };

  const calcularTotal = () => {
    return calcularTotalRaw().toLocaleString('es-CO');
  };

  const comprar = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    setMostrarModalPedido(true);
  };

  const confirmarCompra = async () => {
    setMostrarModalPedido(false);

    const total_productos = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    const total = calcularTotalRaw();

    try {
  const res = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario,
          direccion,
          productos: carrito,
          total_productos,
          total,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCarrito([]);
        await fetch(`${API_URL}/api/carrito/vaciar/${id_usuario}`, { method: 'DELETE' });
        sessionStorage.setItem("ultimaFactura", JSON.stringify(data));
        navigate(`/factura/${data.id_factura}`);
      } else {
        setModalMensaje(data.error || 'Error al realizar la compra');
        setMostrarModal(true);
      }
    } catch {
      setModalMensaje('Error al realizar la compra');
      setMostrarModal(true);
    }
  };

  const cancelarCompra = () => setMostrarModalPedido(false);
  const volver = () => navigate(-1);

  const agregarAlCarrito = (producto, cantidad = 1) => {
  fetch(`${API_URL}/api/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario, id_producto: producto.id_producto, cantidad })
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al agregar al carrito');
        return res.json();
      })
      .then(data => {
        setModalMensaje(data.message || 'Producto agregado al carrito');
        setMostrarModal(true);
  return fetch(`${API_URL}/api/carrito/${id_usuario}`);
      })
      .then(res => res.json())
      .then(data => {
        const carritoConImagen = data.map(item => ({
          ...item,
          urlImagen: item.imagen
            ? `${IMG_BASE}/${encodeURIComponent(item.imagen.replace(/^.*[\\/]/, ''))}?t=${Date.now()}`
            : '/default.png'
        }));
        setCarrito(carritoConImagen);
      })
      .catch(() => {
        setModalMensaje('Error al agregar al carrito');
        setMostrarModal(true);
      });
  };

  const handleVerProducto = (producto) => {
    if (!id_usuario) {
      if (onOpenLogin) onOpenLogin();
      else {
        setModalMensaje('Debes iniciar sesión para ver y añadir productos al carrito.');
        setMostrarModal(true);
      }
      return;
    }
    setProductoSeleccionado(producto);
  };

  if (productoSeleccionado) {
    return (
      <ProductoDetalle
        producto={productoSeleccionado}
        onVolver={() => setProductoSeleccionado(null)}
        onAgregarCarrito={agregarAlCarrito}
        mostrarModal={mostrarModal}
        modalMensaje={modalMensaje}
        onCloseModal={() => setMostrarModal(false)}
        onIrCarrito={() => {
          setProductoSeleccionado(null);
          setMostrarModal(false);
          navigate('/carrito');
        }}
      />
    );
  }

  return (
    <>
      <div className="row">
        <section className="col-md-8">
          <h2 className="text-start mb-4">Tu Carrito de Compras</h2>
          {carrito.length === 0 ? (
            <p>El carrito está vacío.</p>
          ) : (
            carrito.map(item => (
              <div key={item.id_carrito} className="row mb-3 align-items-center border-bottom pb-3">
                <div className="col-4 col-md-2">
                  <img
                    src={item.urlImagen}
                    alt={item.nombre}
                    className="img-fluid rounded"
                    style={{ maxHeight: '100px', objectFit: 'contain' }}
                  />
                </div>
                <div className="col-8 col-md-4">
                  <p><strong>{item.nombre}</strong></p>
                  {item.precio_final && parseFloat(item.precio_final) < parseFloat(item.precio) ? (
                 <>
               <del className="text-muted">${parseFloat(item.precio).toLocaleString('es-CO')}</del><br />
              <span className="text-success fw-bold">
               ${parseFloat(item.precio_final).toLocaleString('es-CO')}
               </span>
               </>
               ) : (
               <p className="text-primary fw-bold">${parseFloat(item.precio).toLocaleString('es-CO')}</p>
               )}

                </div>
                <div className="col-12 col-md-3 text-center">
                  <span>Cantidad: {item.cantidad}</span>
                </div>
                <div className="col-12 col-md-2 text-end">
                  <button className="btn btn-danger" onClick={() => eliminarProducto(item.id_carrito)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          )}
          <div className="text-end mt-3">
            <p className="fs-5"><strong>Total: $ {calcularTotal()}</strong></p>
          </div>
        </section>

        <div className="col-md-4">
          <div className="pago border p-4 rounded mt-4 bg-light">
            <h2 className="fs-4">Información de Pago</h2>
            <div className="detalles">
              <div className="detalle d-flex justify-content-between">
                <p><strong>SubTotal:</strong></p>
                <p className="text-primary fw-bold">$ {calcularTotal()}</p>
              </div>
              <div className="detalle d-flex justify-content-between">
                <p><strong>Envío:</strong></p>
                <p>Envío Gratuito a Distrito Capital</p>
              </div>
              <div className="detalle d-flex justify-content-between">
                <p><strong>Pago:</strong></p>
                <p>Pago ContraEntrega</p>
              </div>
              <div className="detalle d-flex justify-content-between border-top pt-2">
                <p><strong>Total:</strong></p>
                <p className="text-primary fw-bold">$ {calcularTotal()}</p>
              </div>
            </div>
            <button className="btn btn-success w-100 mt-3" onClick={comprar}>
              Realizar Un Pedido
            </button>
            <button className="btn btn-secondary w-100 mt-2" onClick={volver}>
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-5">
        <div className="card-body">
          <h5 className="mb-4">
            <FontAwesomeIcon icon={faLightbulb} className="me-2 text-warning" />
            Recomendaciones para ti
          </h5>
          <div className="row">
            {recomendados.length > 0 ? (
              recomendados.map(producto => (
                <div className="col-md-3 mb-4" key={producto.id_producto}>
                  <div className="card h-100 border-light shadow-sm">
                    <img
                      src={producto.urlImagen}
                      className="card-img-top"
                      alt={producto.nombre}
                      style={{ height: '150px', objectFit: 'contain' }}
                    />
                    <div className="card-body text-center">
                      <h6 className="card-title">{producto.nombre}</h6>
                      {producto.descuento_aplicado ? (
                        <>
                          <span className="text-muted text-decoration-line-through me-2">
                            ${Number(producto.precio).toLocaleString('es-CO')}
                          </span>
                          <span className="fw-bold text-danger">
                            ${Number(producto.precio_final).toLocaleString('es-CO')}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted">
                          ${Number(producto.precio).toLocaleString('es-CO')}
                        </span>
                      )}
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleVerProducto(producto)}
                      >
                        Ver producto
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No hay productos recomendados.</p>
            )}
          </div>
        </div>
      </div>

      <ModalConfirmacion
        show={mostrarModal}
        mensaje={modalMensaje}
        onClose={() => setMostrarModal(false)}
      />

      <ModalConfirmarPedido
        show={mostrarModalPedido}
        mensaje={`¿Confirmas realizar la compra por un total de $${calcularTotalRaw().toLocaleString('es-CO')}?`}
        onConfirm={confirmarCompra}
        onCancel={cancelarCompra}
      />
    </>
  );
}
