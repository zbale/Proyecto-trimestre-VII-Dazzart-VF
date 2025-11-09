import React, { useEffect, useState } from 'react';
import ModalConfirmacion from './ModalConfirmacion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSignInAlt, faCrown, faBan } from '@fortawesome/free-solid-svg-icons';
import '../../css/CSS/ModalProducto.css';
import '../../css/CSS/ModalLogin.css';
import axios from 'axios';
import { API_URL } from '../../config/api';

export default function ModalLogin({ visible, onClose, onLoginSuccess }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBienvenida, setShowBienvenida] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (visible) body.classList.add('modal-open');
    else body.classList.remove('modal-open');
    return () => body.classList.remove('modal-open');
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setCorreo('');
      setContrasena('');
      setError('');
      setShowBienvenida(false);
      setShowErrorModal(false);
    }
  }, [visible]);

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/login/login`, {
        correo_electronico: correo,
        contrasena
      });
      const data = res.data;
      if (!data.token) {
        setError(data.message || 'Credenciales incorrectas');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));
      if (onLoginSuccess) onLoginSuccess(data.user);
      setError('');
      setLoading(false);

      if (Number(data.user.id_rol) === 1 || Number(data.user.id_rol) === 2) {
        setShowBienvenida(true);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Error de red o servidor.');
      setShowErrorModal(true);
      setLoading(false);
    }
  };

  return (
    <>
      {visible && (
        <div className="modal1" onClick={onClose}>
          <div className="modal-contenido" onClick={e => e.stopPropagation()}>
            <div className="cerrar" onClick={onClose}>&times;</div>
            <h4 className="modal-title fw-semibold">Iniciar Sesión</h4>
            <form onSubmit={handleSubmit} className="w-100">
              <div className="mb-4 input-group">
                <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
                <input
                  type="email"
                  className="form-control rounded-2 border"
                  id="correo"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  required
                  placeholder="Correo electrónico"
                  aria-label="Correo electrónico"
                />
              </div>
              <div className="mb-4 input-group">
                <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                <input
                  type="password"
                  className="form-control rounded-2 border"
                  id="contrasena"
                  value={contrasena}
                  onChange={e => setContrasena(e.target.value)}
                  required
                  placeholder="Contraseña"
                  aria-label="Contraseña"
                />
              </div>
              <button className="agregar-carrito w-100 d-flex align-items-center justify-content-center gap-2" type="submit" disabled={loading}>
                <FontAwesomeIcon icon={faSignInAlt} /> Iniciar sesión
              </button>
            </form>
            <div className="d-flex justify-content-between mt-4 px-1 w-100">
              <button className="btn btn-link p-0" onClick={() => alert('Funcionalidad próximamente')}>
                ¿Olvidó su contraseña?
              </button>
              <button className="btn btn-link p-0" onClick={() => window.location.href = '/registro'}>
                Registrarse
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalConfirmacion
        show={showBienvenida}
        mensaje={
          <div className="fondo-bienvenida">
            <div className="titulo-bienvenida">
              ¡Bienvenido {Number(JSON.parse(localStorage.getItem('usuario'))?.id_rol) === 1 ? 'administrador' : JSON.parse(localStorage.getItem('usuario'))?.nombre}!
            </div>
            <div className="text-light">
              {Number(JSON.parse(localStorage.getItem('usuario'))?.id_rol) === 1 ? 'Acceso concedido' : '¡Nos alegra tenerte de vuelta!'}
            </div>
          </div>
        }
        onClose={() => {
          setShowBienvenida(false);
          onClose();
        }}
        textoBoton={Number(JSON.parse(localStorage.getItem('usuario'))?.id_rol) === 1 ? "Ir a administración" : "Continuar"}
        titulo="Bienvenido"
        icono=""
        onIrCarrito={Number(JSON.parse(localStorage.getItem('usuario'))?.id_rol) === 1 ? () => {
          setShowBienvenida(false);
          onClose();
          window.location.href = '/admin-estadisticas';
        } : undefined}
      />

      <ModalConfirmacion
        show={showErrorModal}
        mensaje={
          <div className="fondo-error">
            <div className="mb-3">
              <span className="icono-error">
                <FontAwesomeIcon icon={faBan} />
              </span>
            </div>
            <div className="fw-bold text-white">¡Credenciales incorrectas!</div>
            <div className="text-light">Intenta nuevamente</div>
          </div>
        }
        onClose={() => setShowErrorModal(false)}
        textoBoton="Cerrar"
        titulo=""
        icono=""
      />
    </>
  );
}
