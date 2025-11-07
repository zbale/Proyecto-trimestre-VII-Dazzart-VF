import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/CSSA/gestionproductos.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { API_URL } from '../../config/api';

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id_categoria: null, nombre: "", descripcion: "" });
  const navigate = useNavigate();

  const cargarCategorias = () => {
    axios
      .get(`${API_URL}/api/categorias/listar`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCategorias(res.data);
        } else {
          setCategorias([]);
          console.error("La respuesta no es un arreglo:", res.data);
        }
        setTimeout(() => {
          if (!$.fn.DataTable.isDataTable("#tablaCategorias")) {
            $("#tablaCategorias").DataTable({
              responsive: true,
              autoWidth: false,
              pageLength: 10,
              lengthMenu: [
                [5, 10, 15],
                [5, 10, 15],
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
            });
          }
        }, 100);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.descripcion) return;

    try {
  await axios.post(`${API_URL}/api/categorias/agregar`, form);
      Swal.fire("Agregado", "Categoría agregada con éxito", "success");
      setForm({ nombre: "", descripcion: "" });
      if ($.fn.DataTable.isDataTable("#tablaCategorias")) {
        $("#tablaCategorias").DataTable().destroy();
      }
      cargarCategorias();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo agregar la categoría", "error");
    }
  };

  const eliminarCategoria = async (id) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Eliminar categoría",
      text: "¿Estás seguro de eliminar esta categoría?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
  const response = await axios.delete(`${API_URL}/api/categorias/eliminar/${id}`);
      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Categoría eliminada",
          text: "La categoría ha sido eliminada con éxito.",
        });
        if ($.fn.DataTable.isDataTable("#tablaCategorias")) {
          $("#tablaCategorias").DataTable().destroy();
        }
        cargarCategorias();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la categoría.",
      });
    }
  };

  const abrirEditarModal = (categoria) => {
    setEditForm({
      id_categoria: categoria.id_categoria,
      nombre: categoria.nombre_categoria,
      descripcion: categoria.descripcion_categoria,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

const guardarEdicion = async (e) => {
  e.preventDefault();
  const { id_categoria, nombre, descripcion } = editForm;

  if (!nombre || !descripcion) {
    Swal.fire("Error", "Nombre y descripción son obligatorios", "error");
    return;
  }

  try {
    // Enviamos las claves correctas según espera el backend
    await axios.put(`${API_URL}/api/categorias/editar/${id_categoria}`, {
      nombre: nombre,
      descripcion: descripcion,
    });

    Swal.fire("Guardado", "Categoría actualizada con éxito", "success");
    setShowEditModal(false);

    if ($.fn.DataTable.isDataTable("#tablaCategorias")) {
      $("#tablaCategorias").DataTable().destroy();
    }
    cargarCategorias();
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo actualizar la categoría", "error");
  }
};


  return (
    <>
      <div className="d-flex">
        <SidebarAdmin />

        <main className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
          <button
            className="btn btn-dark d-md-none mb-3"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarMenu"
            aria-controls="sidebarMenu"
          >
            ☰ Menú
          </button>

          <h2>Agregar nueva categoría</h2>
          <form className="row g-3 mb-4" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <input
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="descripcion"
                className="form-control"
                placeholder="Descripción"
                value={form.descripcion}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-warning text-white w-100">
                Añadir
              </button>
            </div>
          </form>

          <table className="table table-striped table-hover" id="tablaCategorias">
            <thead className="table-dark">
              <tr>
                <th>ID Categoría</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id_categoria}>
                  <td>{categoria.id_categoria}</td>
                  <td>{categoria.nombre_categoria}</td>
                  <td>{categoria.descripcion_categoria}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => abrirEditarModal(categoria)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarCategoria(categoria.id_categoria)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>

      {/* Modal para editar */}
      <div
        className={`modal fade ${showEditModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: showEditModal ? "rgba(0,0,0,0.5)" : "transparent" }}
        onClick={() => setShowEditModal(false)}
      >
        <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <form onSubmit={guardarEdicion}>
              <div className="modal-header">
                <h5 className="modal-title">Editar Categoría</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={editForm.nombre}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    className="form-control"
                    value={editForm.descripcion}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}