import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import '../../css/CSS/ModalProducto.css'; // Unificar estilos modernos

export default function ModalConfirmarPedido({ 
  show, 
  onConfirm, 
  onClose,
  direccion,
  setDireccion,
  textoConfirmar = "Confirmar Compra",
  textoCancelar = "Cancelar",
  titulo = "Confirmar Pedido"
}) {
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-llenar la dirección desde el perfil del usuario si no está definida
  useEffect(() => {
    if (show && !direccion) {
      try {
        const usuarioJSON = localStorage.getItem('usuario');
        if (usuarioJSON) {
          const usuario = JSON.parse(usuarioJSON);
          if (usuario.direccion && usuario.direccion.trim()) {
            setDireccion(usuario.direccion);
          }
        }
      } catch (error) {
        console.error('Error al leer dirección del usuario:', error);
      }
    }
  }, [show, direccion, setDireccion]);

  if (!show) return null;

  const handleConfirm = async () => {
    if (!direccion || !direccion.trim()) {
      setErrorMsg('Verifique su dirección');
      return;
    }
    setCargando(true);
    try {
      await onConfirm();
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    if (!cargando) {
      setErrorMsg('');
      onClose();
    }
  };

  const handleDireccionChange = (e) => {
    setDireccion(e.target.value);
    setErrorMsg('');
  };

  const modal = (
    <div className="modal1" style={{zIndex: 9999}}>
      <div className="modal-contenido" style={{maxWidth: 550, minHeight: 0, flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch', justifyContent: 'flex-start'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0'}}>
          <div className="modal-title" style={{fontWeight:'bold', fontSize:'1.4rem', color:'#222', margin: 0}}>
            {titulo}
          </div>
          <button 
            onClick={handleClose}
            disabled={cargando}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.8rem',
              cursor: cargando ? 'not-allowed' : 'pointer',
              color: '#999',
              padding: '0',
              width: '30px',
              height: '30px',
              opacity: cargando ? 0.5 : 1
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{textAlign: 'center'}}>
          <div className="modal-message" style={{color:'#666', fontSize:'1.05rem', marginBottom: '1.5rem'}}>
            Por favor ingresa tu dirección de entrega
          </div>
          
          <div style={{textAlign: 'left'}}>
            <label style={{fontWeight: '600', color: '#333', marginBottom: '0.7rem', display: 'block', fontSize: '0.95rem'}}>
              Dirección de entrega:
            </label>
            <textarea
              value={direccion || ''}
              onChange={handleDireccionChange}
              placeholder="Ej: Calle 123 #45-67, Apartamento 8B"
              disabled={cargando}
              style={{
                width: '100%',
                padding: '0.9rem',
                border: errorMsg ? '2px solid #d32f2f' : '2px solid #ddd',
                borderRadius: '6px',
                minHeight: '100px',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                resize: 'vertical',
                boxSizing: 'border-box',
                opacity: cargando ? 0.6 : 1,
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => !errorMsg && (e.target.style.borderColor = '#3483fa')}
              onBlur={(e) => !errorMsg && (e.target.style.borderColor = '#ddd')}
            />
            {errorMsg && (
              <div style={{
                color: '#d32f2f',
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="d-flex gap-3 mt-3" style={{gap:'1rem'}}>
          <button 
            className="agregar-carrito" 
            style={{
              flex: 1,
              background:'#fff', 
              color:'#0084ff', 
              border:'2px solid #0084ff',
              fontWeight: '600',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.6 : 1,
              transition: 'all 0.2s'
            }} 
            onClick={handleClose}
            disabled={cargando}
            onMouseEnter={(e) => {
              if (!cargando) {
                e.target.style.background = '#f0f8ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!cargando) {
                e.target.style.background = '#fff';
              }
            }}
          >
            {textoCancelar}
          </button>
          <button 
            className="agregar-carrito" 
            onClick={handleConfirm}
            disabled={cargando}
            style={{
              flex: 1,
              background: '#0084ff', 
              color:'#fff', 
              border:'none',
              fontWeight: '600',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!cargando) {
                e.target.style.background = '#0066cc';
              }
            }}
            onMouseLeave={(e) => {
              if (!cargando) {
                e.target.style.background = '#0084ff';
              }
            }}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );

  // Usa React Portal para evitar conflictos con la estructura del DOM
  return ReactDOM.createPortal(modal, document.body);
}
