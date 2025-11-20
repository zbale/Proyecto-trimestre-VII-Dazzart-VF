import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import '../../css/CSS/ProductoCard.css';

export default function ProductoCard({ producto, onAgregarCarrito, onVerDetalle }) {
  const navigate = useNavigate();

  const irADetalle = () => {
    navigate(`/producto/${producto.id_producto}`);
  };

  return (
    <div className="card h-100 shadow-sm product-card p-2" style={{ cursor: 'pointer' }}>
      <div className="img-container" onClick={irADetalle}>
        <img
          src={producto.urlImagen}
          className="card-img-top producto-imagen"
          alt={producto.nombre}
        />
        <div className="iconos-accion">
          <span
            className="icono cuadrado"
            onClick={(e) => {
              e.stopPropagation();
              if (onVerDetalle) onVerDetalle(producto);
            }}
            title="Ver detalle"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onVerDetalle && onVerDetalle(producto)}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <span
            className="icono cuadrado"
            onClick={(e) => {
              e.stopPropagation();
              onAgregarCarrito(producto);
            }}
            title="Agregar al carrito"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onAgregarCarrito(producto)}
          >
            <FontAwesomeIcon icon={faCartShopping} />
          </span>
        </div>
      </div>
      <div className="card-body text-center d-flex flex-column justify-content-between">
        <h5 className="card-title mb-1">{producto.nombre}</h5>
        <p className="descripcion-producto small mb-2">{producto.descripcion}</p>
        {producto.descuento_aplicado && producto.precio_final && producto.precio_final !== producto.precio ? (
          <>
            <span className="text-muted text-decoration-line-through me-2">
              $ {Number(producto.precio).toLocaleString('es-CO')}
            </span>
            <span className="fw-bold text-danger" style={{ fontSize: '1.2rem' }}>
              $ {Number(producto.precio_final).toLocaleString('es-CO')}
            </span>
            {(producto.descuento_aplicado.tipo_descuento || '').toLowerCase() === 'porcentaje' && (
              <span className="badge bg-success ms-2">
                -{producto.descuento_aplicado.valor}%
              </span>
            )}
            {((producto.descuento_aplicado.tipo_descuento || '').toLowerCase() === 'valor' || 
              (producto.descuento_aplicado.tipo_descuento || '').toLowerCase() === 'fijo') && (
              <span className="badge bg-success ms-2">
                -$ {Number(producto.descuento_aplicado.valor).toLocaleString('es-CO')}
              </span>
            )}
          </>
        ) : (
          <p className="text-muted fw-bold">$ {Number(producto.precio).toLocaleString('es-CO')}</p>
        )}
      </div>
    </div>
  );
}
