import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/CSSA/descuento.css";
import Swal from "sweetalert2";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { useNavigate } from "react-router-dom";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_URL } from '../../config/api';

export default function DescuentosAdmin() {
  const [descuentos, setDescuentos] = useState([]);
  const navigate = useNavigate();

  const cargarDescuentos = async () => {
    try {
  const res = await axios.get(`${API_URL}/api/descuentos`);
      setDescuentos(Array.isArray(res.data) ? res.data : []);

      setTimeout(() => {
        if (!$.fn.DataTable.isDataTable("#tablaDescuentos")) {
          $('#tablaDescuentos').DataTable({
            responsive: true,
            autoWidth: false,
            pageLength: 5,
            lengthMenu: [[5, 10, 20], [5, 10, 20]],
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
            }
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error al cargar descuentos:", error);
    }
  };

  const eliminarDescuento = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
    });

    if (!confirm.isConfirmed) return;

    try {
  await axios.delete(`${API_URL}/api/descuentos/${id}`);
      Swal.fire("Eliminado", "El descuento ha sido eliminado.", "success");
      if ($.fn.DataTable.isDataTable("#tablaDescuentos")) {
        $("#tablaDescuentos").DataTable().destroy();
      }
      cargarDescuentos();
    } catch (error) {
      console.error("Error al eliminar descuento:", error);
      Swal.fire("Error", "No se pudo eliminar el descuento.", "error");
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarDescuentos();
  }, []);

  return (
    <>
      <SidebarAdmin />

      <main className="main-content p-4" style={{ marginLeft: "280px" }}>
        <div className="d-flex justify-content-between align-items-center my-4">
          <h1 className="mb-0">Gestión de Descuentos</h1>
          <a href="/agregar-descuento" className="btn btn-dark">
            Añadir Descuento
          </a>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped" id="tablaDescuentos">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Aplicación</th>
                <th>Producto/Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
  {descuentos.map((d) => (
    <tr key={d.id_descuento}>
      <td>{d.id_descuento}</td>
      <td>{d.tipo_descuento}</td>
      <td>{d.valor}</td>
      <td>{d.fecha_inicio?.split("T")[0]}</td>
      <td>{d.fecha_fin?.split("T")[0]}</td>
      <td>{d.estado_descuento}</td>
      <td>{d.aplicacion}</td>
      <td>
        {d.aplicacion === "producto"
          ? d.nombre_producto
          : d.aplicacion === "categoria"
          ? d.nombre_categoria
          : "Todos"}
      </td>
      <td>
        <div className="d-flex gap-2">
          <a
            href={`/editar-descuento/${d.id_descuento}`}
            className="btn btn-success btn-sm"
          >
            <FontAwesomeIcon icon={faEdit} /> Editar
          </a>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => eliminarDescuento(d.id_descuento)}
          >
            <FontAwesomeIcon icon={faTrash} /> Eliminar
          </button>
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