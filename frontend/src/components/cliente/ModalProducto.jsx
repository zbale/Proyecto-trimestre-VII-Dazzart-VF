import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../../css/CSS/ModalProducto.css';

export default function ModalProducto({ producto, onClose, onAgregarCarrito }) {
  const [cantidad, setCantidad] = useState(1);

  const incrementar = () => setCantidad(prev => prev + 1);
  const decrementar = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));

  const handleAgregar = () => {
    onAgregarCarrito(producto, cantidad);
    onClose();
  };

  return (
    <div className="modal1" onClick={onClose}>
      <div
        className="modal-contenido"
        onClick={e => e.stopPropagation()}
      >
        <span className="cerrar" onClick={onClose}>&times;</span>

        <div className="modal-imagen" style={{ textAlign: 'center' }}>
          <img
            src={producto.urlImagen}
            alt={producto.nombre || 'Producto'}
            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        </div>

        <div className="modal-detalles">
          <div className="mini-menu" style={{ marginBottom: '1rem' }}>
            <a href="/" style={{ marginRight: '1rem' }}>Inicio</a>
          </div>

          <h2 id="titulo">{producto.nombre || producto.titulo}</h2>

          <div className="precio" id="precio-modal" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {producto.descuento_aplicado ? (
              <>
                <span className="text-muted text-decoration-line-through me-2" style={{ color: '#888', textDecoration: 'line-through', marginRight: 8 }}>
                  $ {Number(producto.precio).toLocaleString('es-CO')}
                </span>
                <span className="fw-bold text-danger" style={{ color: '#d32f2f', fontSize: '1.3rem' }}>
                  $ {Number(producto.precio_final).toLocaleString('es-CO')}
                </span>
                {producto.descuento_aplicado.tipo_descuento?.toLowerCase() === 'porcentaje' && (
                  <span className="badge bg-success ms-2" style={{ marginLeft: 8, fontSize: '0.9rem' }}>
                    -{producto.descuento_aplicado.valor}%
                  </span>
                )}
                {(producto.descuento_aplicado.tipo_descuento?.toLowerCase() === 'valor' ||
                  producto.descuento_aplicado.tipo_descuento?.toLowerCase() === 'fijo') && (
                  <span className="badge bg-success ms-2" style={{ marginLeft: 8, fontSize: '0.9rem' }}>
                    -$ {Number(producto.descuento_aplicado.valor).toLocaleString('es-CO')}
                  </span>
                )}
                <span style={{ color: '#999', fontWeight: 'normal', marginLeft: '10px', fontSize: '0.9rem' }}>
                  ({producto.stock}) disponibles
                </span>
              </>
            ) : (
              <>
                $ {producto.precio?.toLocaleString('es-CO') || 'N/A'}
                <span style={{ color: '#999', fontWeight: 'normal', marginLeft: '10px', fontSize: '0.9rem' }}>
                  ({producto.stock}) disponibles
                </span>
              </>
            )}
          </div>

          <div className="linea-separadora" />

          <div className="modalp">
            <p>Cantidad</p>
          </div>

          <div className="cantidad" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={decrementar} className="btn-cantidad">-</button>
            <input
              type="number"
              value={cantidad}
              min={1}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) setCantidad(val);
              }}
              style={{ width: '50px', textAlign: 'center' }}
            />
            <button onClick={incrementar} className="btn-cantidad">+</button>

            <div className="botoncarrito" style={{ marginLeft: 'auto' }}>
              <button
                className="agregar-carrito"
                onClick={handleAgregar}
              >
                + Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ModalProducto.propTypes = {
  producto: PropTypes.shape({
    urlImagen: PropTypes.string,
    nombre: PropTypes.string,
    titulo: PropTypes.string,
    precio: PropTypes.number,
    stock: PropTypes.number, // <-- Añadido
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onAgregarCarrito: PropTypes.func.isRequired,
};
