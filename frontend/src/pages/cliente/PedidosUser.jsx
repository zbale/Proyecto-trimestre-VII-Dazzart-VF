import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../config/api';

export default function PedidosUser() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();

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

    // Cargar pedidos del usuario
    const cargarPedidosUsuario = async () => {
      try {
        // Suponiendo que tu backend tiene ruta para pedidos por usuario
  const res = await fetch(`${API_URL}/api/pedidos/usuario/${parsedUsuario.id_usuario}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPedidos(data);
        } else {
          setPedidos([]);
          console.error("Respuesta no es arreglo:", data);
        }
      } catch (error) {
        console.error("Error al obtener pedidos del usuario:", error);
      }
    };

    cargarPedidosUsuario();
  }, [navigate]);

  return (
    <main className="container mt-5">
      <h1>Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <p>No tienes pedidos realizados.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
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
              {pedidos.map((pedido) => (
                <tr key={pedido.id_factura}>
                  <td>{pedido.id_factura}</td>
                  <td>{pedido.direccion}</td>
                  <td>{pedido.nombre_cliente}</td>
                  <td>
                    {Array.isArray(pedido.productos)
                      ? pedido.productos.map((p) => p.nombre || p.nombre_producto).join(", ")
                      : pedido.productos}
                  </td>
                  <td>{pedido.total_productos}</td>
                  <td>${Number(pedido.total).toLocaleString("es-CO")}</td>
                  <td>{pedido.estado}</td>
                  <td>
                    <button
                      className="btn btn-info"
                      onClick={() => navigate(`/factura/${pedido.id_factura}`)}
                    >
                      Ver Factura
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
