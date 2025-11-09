import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/CSSA/gestionproductos.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { API_URL } from '../../config/api';

const BASE_URL = API_URL;

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/productos/listar`);
      if (Array.isArray(res.data)) {
        setProductos(res.data);
      } else {
        setProductos([]);
        console.error("La respuesta no es un arreglo:", res.data);
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (productos.length === 0) return;

    if ($.fn.DataTable.isDataTable("#tablaProductos")) {
      $("#tablaProductos").DataTable().clear().destroy();
    }

    const timer = setTimeout(() => {
      $("#tablaProductos").DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
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
    }, 50);

    return () => {
      clearTimeout(timer);
      if ($.fn.DataTable.isDataTable("#tablaProductos")) {
        $("#tablaProductos").DataTable().clear().destroy();
      }
    };
  }, [productos]);

  const eliminarProducto = async (id) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Eliminar producto",
      text: "¿Estás seguro de eliminar este producto?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await axios.delete(`${BASE_URL}/api/productos/eliminar/${id}`);
      if (response.status === 200) {
        // Destruye DataTable para evitar duplicados
        if ($.fn.DataTable.isDataTable("#tablaProductos")) {
          $("#tablaProductos").DataTable().destroy();
        }
        // Recarga productos
        cargarProductos();

        await Swal.fire({
          icon: "success",
          title: "Producto eliminado",
          text: "El producto ha sido eliminado con éxito.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el producto.",
      });
    }
  };

  return (
    <>
      <SidebarAdmin />

      <main className="main-content p-4" style={{ marginLeft: "280px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Gestión de Productos</h1>
          <Link to="/agregar-producto" className="btn btn-warning text-white">
            Añadir Producto
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover" id="tablaProductos">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Imagen</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Subcategoría</th>
                <th>Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const imagenNombre = producto.imagen
                  ? producto.imagen.replace(/^\/?img\//, "")
                  : null;

                return (
                  <tr key={producto.id_producto}>
                    <td>{producto.id_producto}</td>
                    <td>{producto.nombre}</td>
                    <td>
                      <img
                        src={
                          imagenNombre
                            ? `${BASE_URL}/productos/img/${encodeURIComponent(imagenNombre)}?t=${Date.now()}`
                            : "/default.png"
                        }
                        alt={producto.nombre}
                        width="100"
                        height="100"
                        style={{ objectFit: "contain", border: "1px solid #ccc" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default.png";
                        }}
                      />
                    </td>
                    <td>{producto.descripcion}</td>
                    <td>${producto.precio}</td>
                    <td>{producto.stock}</td>
                    <td>{producto.id_categoria}</td>
                    <td>{producto.id_subcategoria || "N/A"}</td>
                    <td>{producto.fecha_creacion?.split("T")[0]}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link
                          to={`/editar-producto/${producto.id_producto}`}
                          className="btn btn-success btn-sm"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Editar
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarProducto(producto.id_producto)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}