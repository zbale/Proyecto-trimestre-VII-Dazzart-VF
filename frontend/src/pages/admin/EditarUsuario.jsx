import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/CSSA/actualizarusuario.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';

import SidebarAdmin from '../../components/SideBarAdmin.jsx';
import { API_URL } from '../../config/api';

export default function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  const [formData, setFormData] = useState({
    nombre: '',
    nombre_usuario: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    rol: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
  const res = await axios.get(`${API_URL}/api/usuarios/usuario/${id}`);
        setFormData({
          nombre: res.data.nombre,
          nombre_usuario: res.data.nombre_usuario,
          correo: res.data.correo_electronico,
          telefono: res.data.telefono,
          direccion: res.data.direccion,
          contrasena: '',
          rol: res.data.rol,
        });
      } catch (err) {
        console.error('Error al obtener usuario:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del usuario.',
        });
      }
    };

    cargarUsuario();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones simples
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre)) {
      Swal.fire('Error', 'El nombre solo puede contener letras y espacios.', 'warning');
      return;
    }

    if (!/^\d{10}$/.test(formData.telefono)) {
      Swal.fire('Error', 'El número de celular debe tener exactamente 10 dígitos numéricos.', 'warning');
      return;
    }

    try {
  const res = await axios.put(`${API_URL}/api/usuarios/${id}`, formData);
      if (res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado con éxito',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate('/admin-usuarios');
        });
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el usuario.',
      });
    }
  };

  return (
    <>
      <SidebarAdmin />

      <main className="main-content p-4" style={{ marginLeft: '280px' }}>
        <h1>Actualizar Usuario</h1>

        <div className="d-flex justify-content-center align-items-center vh-80">
          <form onSubmit={handleSubmit} className="p-4 bg-light rounded shadow-sm w-50">
            
            {/* Nombre */}
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
                title="Solo se permiten letras y espacios"
              />
            </div>

            {/* Nombre de usuario */}
            <div className="mb-3">
              <label className="form-label">Nombre de usuario</label>
              <input
                type="text"
                className="form-control"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleChange}
                required
              />
            </div>

            {/* Correo */}
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>

            {/* Celular */}
            <div className="mb-3">
              <label className="form-label">Celular</label>
              <input
                type="text"
                className="form-control"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                pattern="\d{10}"
                title="Debe contener exactamente 10 números"
                maxLength={10}
              />
            </div>

            {/* Dirección */}
            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                className="form-control"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>

            {/* Contraseña */}
            <div className="mb-3">
              <label className="form-label">Nueva contraseña (opcional)</label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="Déjalo vacío para no cambiarla"
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#888',
                    fontSize: '1.2rem',
                  }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Rol */}
            <div className="mb-3">
              <label className="form-label">Rol</label>
              <input
                type="text"
                className="form-control"
                name="rol"
                value={formData.rol}
                readOnly
              />
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-dark">
                <FontAwesomeIcon icon={faEdit} /> Actualizar
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
