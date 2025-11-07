import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarAdmin from '../../components/SideBarAdmin.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faShoppingCart, faUsers, faBoxOpen, faStar, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../../config/api';

export default function EstadisticasAdmin() {
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    totalPedidos: 0,
    totalClientes: 0,
    totalProductos: 0,
    productosMasVendidos: [],
    stockTotal: 0
  });
  const [mostrarStock, setMostrarStock] = useState(false);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [productosRes, pedidosRes] = await Promise.all([
          axios.get(`${API_URL}/api/productos/listar`),
          axios.get(`${API_URL}/api/pedidos`),
        ]);

        const productos = productosRes.data;
        setProductos(productos); // Guardar productos para la tabla de stock

        const pedidos = pedidosRes.data;

        // Filtrar pedidos que NO estén cancelados
        const pedidosValidos = pedidos.filter(p => p.estado !== 'cancelado');

        // Suma total de ventas, excluyendo pedidos cancelados
        const totalVentas = pedidosValidos
          .reduce((acc, p) => acc + Number(p.total || 0), 0);

        const totalPedidos = pedidos.length;

        // Clientes únicos
        const clientesUnicos = new Set(pedidos.map(p => p.nombre_cliente)).size;

        const productosVendidos = {};

        pedidosValidos.forEach(p => {
          if (!p.productos) return;

          let productosArray = Array.isArray(p.productos) ? p.productos : [];

          productosArray.forEach(prod => {
            const nombre = prod.nombre?.trim() || 'Desconocido';
            const cantidad = Number(prod.cantidad) || 0;
            productosVendidos[nombre] = (productosVendidos[nombre] || 0) + cantidad;
          });
        });

        // Ordenar y obtener top 5 productos vendidos
        const productosMasVendidos = Object.entries(productosVendidos)
          .map(([nombre, vendidos]) => ({ nombre, vendidos }))
          .sort((a, b) => b.vendidos - a.vendidos)
          .slice(0, 5);

        // Sumar stock total disponible
        const stockTotal = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);

        setEstadisticas({
          totalVentas,
          totalPedidos,
          totalClientes: clientesUnicos,
          totalProductos: productos.reduce((acc, p) => acc + Number(p.stock || 0), 0),
          productosMasVendidos,
          stockTotal
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };

    cargarEstadisticas();
  }, []);

  const formatoDinero = (num) => {
    return num.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  };

  // Modal de stock por producto
  const cerrarModalStock = () => setMostrarStock(false);

  return (
    <div style={{ display: "flex" }}>
      <SidebarAdmin />
      <div style={{ marginLeft: 300, padding: 20, width: "100%" }}>
        <h2 className="mb-4"><FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 28, marginRight: 10, color: '#007bff' }} /> Estadísticas del eCommerce</h2>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 30 }}>
          <div style={{ flex: '1 1 200px', background: '#007bff', color: '#fff', padding: 20, borderRadius: 10 }}>
            <FontAwesomeIcon icon={faMoneyBillWave} style={{ fontSize: 32, marginBottom: 10 }} />
            <h4>Total Ganancias</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatoDinero(estadisticas.totalVentas)}</p>
          </div>
          <div style={{ flex: '1 1 200px', background: '#28a745', color: '#fff', padding: 20, borderRadius: 10 }}>
            <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: 32, marginBottom: 10 }} />
            <h4>Total Pedidos</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{estadisticas.totalPedidos}</p>
          </div>
          <div style={{ flex: '1 1 200px', background: '#17a2b8', color: '#fff', padding: 20, borderRadius: 10 }}>
            <FontAwesomeIcon icon={faUsers} style={{ fontSize: 32, marginBottom: 10 }} />
            <h4>Total Clientes</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{estadisticas.totalClientes}</p>
          </div>
          <div style={{ flex: '1 1 200px', background: '#ffc107', color: '#000', padding: 20, borderRadius: 10, cursor: 'pointer' }}
            onClick={() => setMostrarStock(true)}>
            <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 32, marginBottom: 10, color: '#333' }} />
            <h4>Stock total disponible</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{estadisticas.totalProductos}</p>
          </div>
        </div>
        {/* Modal de stock por producto */}
        {mostrarStock && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.4)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={cerrarModalStock}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 32,
                minWidth: 350,
                maxWidth: 900,
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                position: 'relative',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={cerrarModalStock} style={{
                position: 'absolute',
                top: 10,
                right: 15,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#888'
              }} title="Cerrar">&times;</button>
              <h3 style={{ marginBottom: 20 }}>Stock por producto</h3>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock disponible</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod.id_producto}>
                      <td>{prod.nombre}</td>
                      <td>{prod.stock}</td>
                      <td>{formatoDinero(prod.precio_final ?? prod.precio)}</td>
                      <td style={{ width: 100, textAlign: 'center' }}>
                        <button className="btn btn-sm btn-outline-primary" title="Editar producto" style={{ marginRight: 5 }}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" title="Eliminar producto">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <h3 className="mb-3"><FontAwesomeIcon icon={faStar} style={{ fontSize: 22, marginRight: 8, color: '#ffc107' }} /> Productos Más Vendidos</h3>
        <table className="table table-striped" style={{ maxWidth: 800 }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades Vendidas</th>
            </tr>
          </thead>
          <tbody>
            {estadisticas.productosMasVendidos.map((prod) => (
              <tr key={prod.nombre}>
                <td>{prod.nombre}</td>
                <td>{prod.vendidos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
