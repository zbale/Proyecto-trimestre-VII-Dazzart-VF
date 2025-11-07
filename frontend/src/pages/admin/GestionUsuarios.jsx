import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/CSSA/gestionusuarios.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SideBarAdmin";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_URL } from '../../config/api';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const cargarUsuarios = () => {
    axios
      .get(`${API_URL}/api/usuarios`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setUsuarios(res.data);
        } else {
          setUsuarios([]);
        }

        setTimeout(() => {
          if (!$.fn.DataTable.isDataTable("#tablaUsuarios")) {
            $("#tablaUsuarios").DataTable({
              responsive: true,
              autoWidth: false,
              pageLength: 4,
              lengthMenu: [
                [4, 8, 10],
                [4, 8, 10],
              ],
              language: {
                lengthMenu: "Mostrar _MENU_ registros por página",
                zeroRecords: "No se encontraron resultados",
                info: "Mostrando página _PAGE_ de _PAGES_",
                infoEmpty: "No hay registros disponibles",
                infoFiltered: "(filtrado de _MAX_ registros en total)",
                search: "Buscar:",
                paginate: {
                  first: "Primero",
                  last: "Último",
                  next: "Siguiente",
                  previous: "Anterior",
                },
              },
              columnDefs: [
                {
                  targets: [0, 3, 4],
                  searchable: true,
                },
                {
                  targets: "_all",
                  searchable: false,
                },
              ],
            });
          }
        }, 100);
      })
      .catch((err) => console.error(err));
  };

  const cambiarEstadoUsuario = async (id, nuevoEstado) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: `${nuevoEstado === "Activo" ? "Activar" : "Inactivar"} usuario`,
      text: `¿Estás seguro de ${nuevoEstado === "Activo" ? "activar" : "inactivar"} este usuario?`,
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await axios.put(
        `${API_URL}/api/usuarios/${id}/estado`,
        { estado: nuevoEstado }
      );

      if (response.status === 200) {
        await Swal.fire(
          "Éxito",
          `El usuario ahora está ${nuevoEstado}.`,
          "success"
        );

        if ($.fn.DataTable.isDataTable("#tablaUsuarios")) {
          $("#tablaUsuarios").DataTable().destroy();
        }
        cargarUsuarios();
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Swal.fire("Error", "No se pudo cambiar el estado del usuario.", "error");
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <>
      <SidebarAdmin />

      <main className="main-content p-4" style={{ marginLeft: "280px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Gestión de usuarios</h1>
          <a href="/agregar-usuarios" className="btn btn-warning text-white">
            Añadir Administrador
          </a>
        </div>

        <div className="table-responsive">
          <table
            className="table table-bordered table-striped"
            id="tablaUsuarios"
          >
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Nombre de usuario</th>
                <th>Correo electrónico</th>
                <th>Celular</th>
                <th>Dirección</th>
                <th>Contraseña</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.id_usuario}</td>
                  <td>{usuario.cedula}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.nombre_usuario}</td>
                  <td>{usuario.correo_electronico}</td>
                  <td>{usuario.telefono}</td>
                  <td>{usuario.direccion}</td>
                  <td>*******</td>
                  <td>{usuario.rol}</td>
                  <td>
                    <span
                      className={`badge ${
                        usuario.estado.toLowerCase() === "activo"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {usuario.estado}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          navigate(`/editar-usuario/${usuario.id_usuario}`)
                        }
                      >
                        <FontAwesomeIcon icon={faEdit} /> Editar
                      </button>

                      {/*  Bloqueamos botones si es admin principal */}
                      {usuario.id_usuario === 1 ||
                      usuario.correo_electronico ===
                        "josecrack13113@gmail.com" ? (
                        <span className="text-muted">Admin principal</span>
                      ) : usuario.estado.toLowerCase() === "activo" ? (
                        <button
                          onClick={() =>
                            cambiarEstadoUsuario(usuario.id_usuario, "Inactivo")
                          }
                          className="btn btn-warning btn-sm"
                        >
                          Inactivar
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            cambiarEstadoUsuario(usuario.id_usuario, "Activo")
                          }
                          className="btn btn-primary btn-sm"
                        >
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
