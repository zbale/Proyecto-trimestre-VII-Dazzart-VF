import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/CSSA/añadirusuario.css';

import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from '../../config/api';

export default function AgregarUsuario() {
  const navigate = useNavigate();
  const { id } = useParams(); // Se usa para editar (si la ruta incluye un id)
  
  const [formData, setFormData] = useState({
    id_usuario: null,
    cedula: '',
    nombre: '',
    nombre_usuario: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    id_rol: 1 // 1 = admin
  });

  const [verPassword, setVerPassword] = useState(false);

  // Verificación de sesión
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  // Si hay un ID en la URL, se cargan los datos del usuario para editar
  useEffect(() => {
    if (id) {
  axios.get(`${API_URL}/api/usuarios/${id}`)
        .then(res => {
          setFormData({
            ...res.data,
            id_usuario: res.data.id_usuario,
            contrasena: '' // no se muestra la contraseña
          });
        })
        .catch(err => console.error('Error al cargar usuario:', err));
    }
  }, [id]);

  // Manejo de inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Validación de nombre (solo letras y espacios)
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre)) {
      Swal.fire('Error', 'El nombre solo puede contener letras y espacios.', 'warning');
      return;
    }

    // 🔹 Validación de teléfono (exactamente 10 dígitos)
    if (!/^\d{10}$/.test(formData.telefono)) {
      Swal.fire('Error', 'El número de celular debe tener exactamente 10 dígitos numéricos.', 'warning');
      return;
    }

    // 🔹 Validación de cédula (8 a 10 dígitos)
    if (!/^\d{8,10}$/.test(formData.cedula)) {
      Swal.fire('Error', 'La cédula debe tener entre 8 y 10 dígitos numéricos.', 'warning');
      return;
    }

    try {
      let res;

      if (id) {
        // 🔸 Actualizar usuario existente
  res = await axios.put(`${API_URL}/api/usuarios/${id}`, formData);
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
      } else {
        // 🔸 Crear nuevo usuario
  res = await axios.post(`${API_URL}/api/usuarios`, formData);
        if (res.status === 201) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario administrador creado con éxito',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            navigate('/admin-usuarios');
          });
        }
      }

    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.error || 'No se pudo completar la operación', 'error');
    }
  };

  return (
    <>
      <SidebarAdmin />

      <main className="main-content p-4" style={{ marginLeft: '280px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">{id ? 'Editar Administrador' : 'Añadir Administrador'}</h1>
        </div>

        <div className="d-flex justify-content-center align-items-center">
          <form onSubmit={handleSubmit} className="p-4 bg-light rounded shadow-sm w-50">
            
            {/* Cédula */}
            <div className="mb-3">
              <label className="form-label">Cédula</label>
              <input
                type="text"
                className="form-control"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                required
                pattern="\d{8,10}"
                title="Debe contener entre 8 y 10 números"
                maxLength={10}
              />
            </div>

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
              <label className="form-label">Contraseña</label>
              <div className="position-relative">
                <input
                  type={verPassword ? "text" : "password"}
                  className="form-control"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required={!id} // no obligatoria al editar
                />
                <span
                  onClick={() => setVerPassword(prev => !prev)}
                  className="icono-password-ojito"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer'
                  }}
                >
                  <i className={`fa ${verPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
            </div>

            {/* Rol */}
            <div className="mb-3">
              <label className="form-label">Rol</label>
              <input type="text" className="form-control" name="rol" value="admin" readOnly />
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-dark">
                {id ? 'Actualizar' : 'Añadir'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
