import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/cliente/Header';
import Footer from '../../components/cliente/Footer';
import MenuLateral from '../../components/cliente/MenuLateral';
// Carrito component filename is `carrito.jsx` (lowercase) so import with exact casing
import Carrito from '../../components/cliente/carrito';

export default function MisCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState('');

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
    setUsuario(parsedUsuario);
  }, [navigate]);

  const cargarCompras = () => {
    if (!usuario) return;
      fetch(`${API_URL}/api/pedidos/usuario/${usuario.id_usuario}`)
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener las compras');
        return res.json();
      })
      .then(data => {
        setCompras(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarCompras();
  }, [usuario]);

  const handleCancelar = async (id_factura) => {
    const confirmacion = window.confirm('¿Estás seguro de cancelar el pedido?');
    if (!confirmacion) return;

    try {
        const res = await fetch(`${API_URL}/api/pedidos/cancelar/${id_factura}`, { method: 'PUT' });
      if (!res.ok) throw new Error();

      cargarCompras(); // Refrescar datos tras cancelación
    } catch {
      alert('Error al cancelar el pedido');
    }
  };

  const handleBuscar = () => {
    const termino = busqueda.trim();
    if (termino.length > 0) {
      navigate(`/buscar/${encodeURIComponent(termino)}`);
      setBusqueda('');
    }
  };

  if (loading) return <div className="container mt-5">Cargando tus compras...</div>;
  if (!usuario) return <div className="container mt-5">Debes iniciar sesión para ver tus compras.</div>;
  if (error) return <div className="container mt-5 text-danger">Error: {error}</div>;

  return (
    <>
      <Header
        onOpenMenu={() => setShowMenu(true)}
        usuario={usuario}
        onLogout={() => {
          setUsuario(null);
          localStorage.removeItem('usuario');
          window.location.reload();
        }}
        onOpenCarrito={() => navigate('/carrito')}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onBuscar={handleBuscar}
      />

      {showMenu && <MenuLateral onClose={() => setShowMenu(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main className="container mt-5 flex-grow-1">
          <h2>Mis compras</h2>

          {compras.length === 0 ? (
            <p>No has realizado compras aún.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>ID Pedido</th>
                    <th>Dirección</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map(pedido => {
                    let productos = [];
                    try {
                      productos = typeof pedido.productos === 'string'
                        ? JSON.parse(pedido.productos)
                        : Array.isArray(pedido.productos)
                          ? pedido.productos
                          : [];
                    } catch {
                      productos = [];
                    }

                    return (
                      <tr key={pedido.id_factura}>
                        <td>{pedido.id_factura}</td>
                        <td>{pedido.direccion}</td>
                        <td>
                          <ul className="mb-0">
                            {productos.length > 0 ? productos.map((p, i) => (
                              <li key={i}>{p.nombre} (x{p.cantidad})</li>
                            )) : <li><em>Sin productos</em></li>}
                          </ul>
                        </td>
                        <td>${Number(pedido.total).toLocaleString("es-CO")}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              pedido.estado === 'cancelado' ? 'danger' :
                              pedido.estado === 'pendiente' ? 'warning text-dark' : 'success'
                            }`}
                          >
                            {pedido.estado}
                          </span>
                        </td>
                        <td>
                          {pedido.estado === 'pendiente' ? (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancelar(pedido.id_factura)}>
                              Cancelar
                            </button>
                          ) : <span>-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {mostrarCarrito && usuario && (
        <Carrito id_usuario={usuario.id_usuario} onClose={() => setMostrarCarrito(false)} />
      )}
    </>
  );
}