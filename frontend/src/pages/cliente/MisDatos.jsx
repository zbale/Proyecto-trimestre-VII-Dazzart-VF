import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faPhone, faIdCard,
  faMapMarkerAlt, faUserTag, faLock
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import Header from '../../components/cliente/Header';
import Footer from '../../components/cliente/Footer';
import MenuLateral from '../../components/cliente/MenuLateral';
import ModalConfirmacion from '../../components/cliente/ModalConfirmacion';
import fondoGif from '../../assets/giphy.gif';
import { API_URL } from '../../config/api';

export default function MisDatos() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    nombre_usuario: '',
    correo_electronico: '',
    telefono: '',
    cedula: '',
    direccion: '',
    contrasena: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    setUsuario(parsedUsuario);
  }, [navigate]);

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        nombre_usuario: usuario.nombre_usuario || '',
        correo_electronico: usuario.correo_electronico || '',
        telefono: usuario.telefono || '',
        cedula: usuario.cedula || '',
        direccion: usuario.direccion || '',
        contrasena: '',
      });
    }
  }, [usuario]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    const datosEnviar = {
      nombre: form.nombre.trim() || usuario.nombre,
      nombre_usuario: form.nombre_usuario.trim() || usuario.nombre_usuario,
      correo: form.correo_electronico.trim() || usuario.correo_electronico,
      telefono: form.telefono.trim() || usuario.telefono,
      cedula: form.cedula.trim() || usuario.cedula,
      direccion: form.direccion.trim() || usuario.direccion,
      contrasena: form.contrasena.trim(),
    };

    try {
      const res = await fetch(`${API_URL}/api/usuarios/${usuario.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje('Datos actualizados correctamente');
        const nuevoUsuario = {
          ...usuario,
          nombre: datosEnviar.nombre,
          nombre_usuario: datosEnviar.nombre_usuario,
          correo_electronico: datosEnviar.correo,
          telefono: datosEnviar.telefono,
          cedula: datosEnviar.cedula,
          direccion: datosEnviar.direccion
        };
        localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
        setUsuario(nuevoUsuario);
        setForm(f => ({ ...f, contrasena: '' }));
        setShowModal(true);
      } else {
        setMensaje(data.error || 'Error al actualizar los datos');
      }
    } catch (err) {
      console.error(err);
      setMensaje('Error de red o servidor');
    }

    setLoading(false);
  };

  return (
    <>
      <Header
        onOpenMenu={() => setShowMenu(true)}
        onOpenCarrito={() => navigate('/carrito')}
        onOpenLogin={() => setMostrarLogin(true)}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        usuario={usuario}
        onLogout={handleLogout}
      />

      {showMenu && <MenuLateral onClose={() => setShowMenu(false)} />}

      <div style={{
        minHeight: '100vh',
        backgroundImage: `url(${fondoGif})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px 15px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.92)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 className="text-center fw-bold mb-4" style={{ color: '#000000FF' }}>
            <FontAwesomeIcon icon={faUser} className="me-2" /> Mis Datos
          </h2>
          <form onSubmit={handleSubmit}>
            {[
              { name: 'nombre', icon: faUser, type: 'text', label: 'Nombre' },
              { name: 'nombre_usuario', icon: faUserTag, type: 'text', label: 'Usuario' },
              { name: 'correo_electronico', icon: faEnvelope, type: 'email', label: 'Correo electrónico' },
              { name: 'telefono', icon: faPhone, type: 'text', label: 'Teléfono' },
              { name: 'cedula', icon: faIdCard, type: 'text', label: 'Cédula' }
            ].map(({ name, icon, type, label }) => (
              <div className="mb-3" key={name} style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={icon} style={{
                  position: 'absolute',
                  left: 15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6c757d'
                }} />
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={label}
                  className="form-control"
                  style={{
                    paddingLeft: 40,
                    borderRadius: 10,
                    fontSize: 16
                  }}
                />
              </div>
            ))}

            <div className="mb-3" style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} style={{
                position: 'absolute',
                left: 15,
                top: 20,
                color: '#6c757d'
              }} />
              <textarea
                name="direccion"
                rows="2"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                className="form-control"
                style={{
                  paddingLeft: 40,
                  borderRadius: 10,
                  fontSize: 16
                }}
              />
            </div>

            <div className="mb-4" style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faLock} style={{
                position: 'absolute',
                left: 15,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6c757d'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="contrasena"
                value={form.contrasena}
                onChange={handleChange}
                placeholder="Nueva contraseña (opcional)"
                className="form-control"
                autoComplete="new-password"
                style={{
                  paddingLeft: 40,
                  borderRadius: 10,
                  fontSize: 16
                }}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: 15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                  fontSize: '1.2rem',
                  zIndex: 2
                }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              className="btn w-100 fw-bold"
              style={{
                borderRadius: 12,
                fontSize: 17,
                backgroundColor: '#000',
                color: '#fff',
                padding: '12px 0',
                border: 'none',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4fc3f7'}
              onMouseLeave={e => e.currentTarget.style.background = '#000'}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>

            {mensaje && !showModal && (
              <div className="alert alert-info text-center mt-4" style={{ borderRadius: 10 }}>
                {mensaje}
              </div>
            )}
          </form>
        </div>
      </div>

      <Footer />

      <ModalConfirmacion
        show={showModal}
        mensaje={mensaje || 'Datos actualizados correctamente'}
        onClose={() => setShowModal(false)}
        onIrCarrito={() => {
          setShowModal(false);
          navigate('/');
        }}
        textoBoton="Volver"
        textoCerrar="Cerrar"
        titulo="¡Datos actualizados!"
        icono={<FontAwesomeIcon icon={faUser} style={{ color: '#0084ff' }} />}
      />
    </>
  );
}
