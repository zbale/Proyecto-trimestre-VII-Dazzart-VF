import ReactDOM from 'react-dom';
import React from 'react';
import '../../css/CSS/ModalProducto.css'; // Unificar estilos modernos

export default function ModalConfirmacion({
  show,
  mensaje,
  onClose,
  onIrCarrito,
  textoBoton = "Ir al carrito",
  textoCerrar = "Cerrar",
  titulo = "Producto agregado",
  icono = "\u2714"
}) {
  if (!show) return null;

  const modal = (
    <div className="modal1" style={{zIndex: 9999}}>
      <div className="modal-contenido" style={{maxWidth: 400, minHeight: 0, flexDirection: 'column', gap: '1.2rem', alignItems: 'center', justifyContent: 'center'}}>
        <div className="cerrar" onClick={onClose}>&times;</div>
        {icono && <div className="modal-icon" style={{fontSize:'2.5rem', color:'#0084ff', marginBottom:'0.5rem'}}>{icono}</div>}
        <div className="modal-title" style={{fontWeight:'bold', fontSize:'1.3rem', color:'#222'}}>{titulo}</div>
        <div className="modal-message" style={{color:'#444', fontSize:'1.05rem'}}>{mensaje}</div>
        <div className="d-flex justify-content-around mt-4 w-100" style={{gap:'1rem'}}>
          <button className="agregar-carrito w-100" style={{background:'#fff', color:'#0084ff', border:'2px solid #0084ff'}} onClick={onClose}>
            {textoCerrar}
          </button>
          {onIrCarrito && (
            <button className="agregar-carrito w-100" onClick={onIrCarrito}>
              {textoBoton}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Usa React Portal para evitar conflictos con la estructura del DOM
  return ReactDOM.createPortal(modal, document.body);
}
