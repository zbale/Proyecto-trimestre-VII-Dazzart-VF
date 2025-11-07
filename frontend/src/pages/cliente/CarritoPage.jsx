import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Headersimple from '../../components/cliente/SimpleHeader'
import Footer from '../../components/cliente/Footer';
// Carrito component filename is `carrito.jsx` (lowercase)
import Carrito from '../../components/cliente/carrito';
import ModalConfirmacion from '../../components/cliente/ModalConfirmacion';
import ModalLogin from '../../components/cliente/ModalLogin';

import '../../css/CSS/carritopage.css';

export default function Carritopage() {
  const navigate = useNavigate();

  // Usuario desde localStorage
  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const id_usuario = usuario ? usuario.id_usuario : null;
  const direccion = usuario ? usuario.direccion : '';

  // Estados para modales
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    window.location.reload();
  };

  // Abrir login modal
  const handleOpenLogin = () => setMostrarLogin(true);

  // Cerrar login modal
  const handleCloseLogin = () => setMostrarLogin(false);

  // Al hacer login con éxito
  const onLoginSuccess = (user) => {
    localStorage.setItem('usuario', JSON.stringify(user));
    setMostrarLogin(false);
    window.location.reload();
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      navigate('/');
      return;
    }
    const parsedUsuario = JSON.parse(usuarioGuardado);
    if (Number(parsedUsuario.id_rol) !== 2) {
      navigate('/');
      return;
    }
  }, [navigate]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
     <Headersimple/>

      {/* Main */}
      <main className="container mt-5 flex-grow-1">
        <Carrito
          id_usuario={id_usuario}
          direccion={direccion}
          onOpenLogin={handleOpenLogin}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modales */}
      <ModalConfirmacion
        show={mostrarModal}
        mensaje={modalMensaje}
        onClose={() => setMostrarModal(false)}
        onIrCarrito={() => {
          setMostrarModal(false);
          navigate('/carrito');
        }}
      />

      {mostrarLogin && (
        <ModalLogin
          visible={mostrarLogin}
          onClose={handleCloseLogin}
          onLoginSuccess={onLoginSuccess}
        />
      )}

      {/* Aquí podrías agregar menú lateral o carrito modal si los manejas desde aquí */}
    </div>
  );
}
