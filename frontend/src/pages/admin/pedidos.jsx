import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../../config/api';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [mostrarPapelera, setMostrarPapelera] = useState(false);
  const [pedidosPapelera, setPedidosPapelera] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

const cargarPedidos = async () => {
  try {
  const res = await fetch(`${API_URL}/api/pedidos`);
    const data = await res.json();

    if (Array.isArray(data)) {
      // Parsear productos si vienen como string
      const pedidosParseados = data.map(pedido => {
        if (typeof pedido.productos === 'string') {
          try {
            pedido.productos = JSON.parse(pedido.productos);
          } catch (e) {
            console.warn(`Error al parsear productos del pedido ${pedido.id_factura}`);
            pedido.productos = [];
          }
        }
        return pedido;
      });

      setPedidos(pedidosParseados);
    } else {
      setPedidos([]);
      console.error("Respuesta no es arreglo:", data);
    }
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
  }
};
  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    if (pedidos.length === 0) return;

    if ($.fn.DataTable.isDataTable("#tablaPedidos")) {
      $("#tablaPedidos").DataTable().clear().destroy();
    }

    const timer = setTimeout(() => {
      $("#tablaPedidos").DataTable({
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
      if ($.fn.DataTable.isDataTable("#tablaPedidos")) {
        $("#tablaPedidos").DataTable().clear().destroy();
      }
    };
  }, [pedidos]);

  const renderProductos = (productos) => {
    if (!Array.isArray(productos)) return "Sin productos";
    return productos.map((p, i) => `${p.nombre} (x${p.cantidad})`).join(", ");
  };

  // Cargar pedidos en papelera
  const cargarPapelera = async () => {
    try {
    const res = await fetch(`${API_URL}/api/pedidos?papelera=1`);
      const data = await res.json();
      // Filtrar solo los pedidos con estado cancelado o entregado
      const filtrados = Array.isArray(data)
        ? data.filter(p => ["cancelado", "entregado"].includes((p.estado || "").toLowerCase()))
        : [];
      setPedidosPapelera(filtrados);
    } catch (error) {
      setPedidosPapelera([]);
      console.error("Error al obtener papelera:", error);
    }
  };

  useEffect(() => {
    if (mostrarPapelera) cargarPapelera();
  }, [mostrarPapelera]);

  // Utilidad para formatear fecha a local (puedes mover esto a un utils si lo usas en más lugares)
  const formatFechaLocal = (fechaUTC) => {
    if (!fechaUTC) return '';
    const fecha = new Date(fechaUTC);
    return fecha.toLocaleString('es-CO', { hour12: false });
  };

  return (
    <>
      <SidebarAdmin />
      <main className="main-content p-4" style={{ marginLeft: "280px" }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, marginRight: 12 }}>Gestión de pedidos</h1>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#dc3545', marginLeft: 4 }}
            onClick={() => setMostrarPapelera(true)}
            title="Ver papelera de pedidos"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover" id="tablaPedidos">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Dirección</th>
                <th>Nombre</th>
                <th>Productos</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos
                .filter(pedido => !["cancelado", "entregado"].includes((pedido.estado || '').toLowerCase()))
                .map((pedido) => (
                  <tr key={pedido.id_factura}>
                    <td>{pedido.id_factura}</td>
                    <td>{pedido.direccion}</td>
                    <td>{pedido.nombre_cliente}</td>
                    <td>{renderProductos(pedido.productos)}</td>
                    <td>{pedido.total_productos}</td>
                    <td>${Number(pedido.total).toLocaleString("es-CO")}</td>
                    <td>{pedido.estado}</td>
                    <td>
                      <button
                        className="btn btn-info"
                        onClick={() => navigate(`/ver-factura/${pedido.id_factura}`)}
                      >
                        <FontAwesomeIcon icon={faEye} /> Observar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {mostrarPapelera && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
            onClick={() => setMostrarPapelera(false)}
          >
            <div
              style={{
                background: '#fff', borderRadius: 12, padding: 32, minWidth: 350, maxWidth: 900,
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)', position: 'relative', maxHeight: '80vh', overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setMostrarPapelera(false)} style={{
                position: 'absolute', top: 10, right: 15, background: 'transparent', border: 'none',
                fontSize: 24, cursor: 'pointer', color: '#888'
              }} title="Cerrar">&times;</button>
              <h3 style={{ marginBottom: 20 }}>Pedidos en papelera</h3>
              <button
                className="btn btn-danger mb-3"
                onClick={async () => {
                  if (window.confirm('¿Vaciar papelera? Esta acción eliminará definitivamente los pedidos con más de 7 días.')) {
                    await fetch(`${API_URL}/api/pedidos/vaciar-papelera`, { method: 'DELETE' });
                    cargarPapelera();
                  }
                }}
              >Vaciar papelera</button>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Fecha eliminado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosPapelera
                    .filter(p => ["cancelado", "entregado"].includes((p.estado || '').toLowerCase()))
                    .map(p => (
                      <tr key={p.id_factura}>
                        <td>{p.id_factura}</td>
                        <td>{p.nombre_cliente}</td>
                        <td>{p.estado}</td>
                        <td>{formatFechaLocal(p.fecha_eliminado)}</td>
                        <td>
                          <button
                            className="btn btn-info"
                            onClick={() => navigate(`/ver-factura/${p.id_factura}`)}
                          >
                            Observar
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}