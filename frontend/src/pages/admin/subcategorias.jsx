import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import Swal from "sweetalert2";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { useNavigate } from "react-router-dom";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_URL } from '../../config/api';

export default function SubcategoriasAdmin() {
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre_subcategoria: "",
    descripcion_subcategoria: "",
    id_categoria: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id_subcategoria: null,
    nombre_subcategoria: "",
    descripcion_subcategoria: "",
    id_categoria: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
    cargarSubcategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
  const res = await axios.get(`${API_URL}/api/categorias/listar`);
      if (Array.isArray(res.data)) setCategorias(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarSubcategorias = () => {
    axios
      .get(`${API_URL}/api/subcategorias/listar`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setSubcategorias(res.data);
          setTimeout(() => {
            if (!$.fn.DataTable.isDataTable("#tablaSubcategorias")) {
              $("#tablaSubcategorias").DataTable({
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
        } else {
          setSubcategorias([]);
          console.error("Respuesta no válida:", res.data);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_categoria || !form.descripcion_subcategoria) {
      Swal.fire("Error", "La categoría y descripción son obligatorias", "error");
      return;
    }
    try {
  await axios.post(`${API_URL}/api/subcategorias/agregar`, form);
      Swal.fire("Agregado", "Subcategoría agregada con éxito", "success");
      setForm({ nombre_subcategoria: "", descripcion_subcategoria: "", id_categoria: "" });
      if ($.fn.DataTable.isDataTable("#tablaSubcategorias")) {
        $("#tablaSubcategorias").DataTable().destroy();
      }
      cargarSubcategorias();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo agregar la subcategoría", "error");
    }
  };

  const eliminarSubcategoria = async (id) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Eliminar subcategoría",
      text: "¿Estás seguro de eliminar esta subcategoría?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
  const response = await axios.delete(`${API_URL}/api/subcategorias/eliminar/${id}`);
      if (response.status === 200) {
        Swal.fire("Eliminado", "Subcategoría eliminada con éxito", "success");
        if ($.fn.DataTable.isDataTable("#tablaSubcategorias")) {
          $("#tablaSubcategorias").DataTable().destroy();
        }
        cargarSubcategorias();
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar la subcategoría", "error");
    }
  };

  const abrirEditarModal = (subcat) => {
    setEditForm({
      id_subcategoria: subcat.id_subcategoria,
      nombre_subcategoria: subcat.nombre_subcategoria,
      descripcion_subcategoria: subcat.descripcion_subcategoria,
      id_categoria: subcat.id_categoria,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    const { id_subcategoria, nombre_subcategoria, descripcion_subcategoria, id_categoria } = editForm;
    try {
      await axios.put(`${API_URL}/api/subcategorias/editar/${id_subcategoria}`, {
        nombre_subcategoria,
        descripcion_subcategoria,
        id_categoria,
      });
      Swal.fire("Actualizado", "Subcategoría actualizada con éxito", "success");
      setShowEditModal(false);
      if ($.fn.DataTable.isDataTable("#tablaSubcategorias")) {
        $("#tablaSubcategorias").DataTable().destroy();
      }
      cargarSubcategorias();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar la subcategoría", "error");
    }
  };

  return (
    <>
      <div className="d-flex">
        <SidebarAdmin />

        <main className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
          <h2>Agregar nueva Subcategoría</h2>
          <form className="row g-3 mb-4" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <input
                type="text"
                name="nombre_subcategoria"
                className="form-control"
                placeholder="Nombre"
                value={form.nombre_subcategoria}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <select
                name="id_categoria"
                className="form-select"
                value={form.id_categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona Categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="descripcion_subcategoria"
                className="form-control"
                placeholder="Descripción"
                value={form.descripcion_subcategoria}
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

          <table className="table table-striped table-hover" id="tablaSubcategorias">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subcategorias.map((subcat) => (
                <tr key={subcat.id_subcategoria}>
                  <td>{subcat.id_subcategoria}</td>
                  <td>{subcat.nombre_subcategoria}</td>
                  <td>{subcat.nombre_categoria}</td>
                  <td>{subcat.descripcion_subcategoria}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => abrirEditarModal(subcat)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarSubcategoria(subcat.id_subcategoria)}
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

      {/* Modal de edición */}
      <div
        className={`modal fade ${showEditModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ backgroundColor: showEditModal ? "rgba(0,0,0,0.5)" : "transparent" }}
        onClick={() => setShowEditModal(false)}
      >
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <form onSubmit={guardarEdicion}>
              <div className="modal-header">
                <h5 className="modal-title">Editar Subcategoría</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  name="nombre_subcategoria"
                  value={editForm.nombre_subcategoria}
                  onChange={handleEditChange}
                  required
                />
                <select
                  className="form-select mb-3"
                  name="id_categoria"
                  value={editForm.id_categoria}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Selecciona Categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-control mb-3"
                  name="descripcion_subcategoria"
                  value={editForm.descripcion_subcategoria}
                  onChange={handleEditChange}
                  required
                />
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
