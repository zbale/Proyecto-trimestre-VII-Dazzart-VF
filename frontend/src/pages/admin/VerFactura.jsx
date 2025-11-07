import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { API_URL } from '../../config/api';

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [estadoEditable, setEstadoEditable] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");

  const estadosDisponibles = ["en proceso", "en camino", "entregado"];

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  const cargarFactura = () => {
    fetch(`${API_URL}/api/pedidos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFactura(data);
        setEstadoEditable(data.estado);
        setNuevoEstado(""); // Forzar selección manual
      })
      .catch((err) => console.error("Error al obtener factura:", err));
  };

  useEffect(() => {
    cargarFactura();
  }, [id]);

  const guardarCambioEstado = async () => {
    if (!nuevoEstado || nuevoEstado === estadoEditable) {
      alert("No has realizado ningún cambio en el estado");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/pedidos/actualizar-estado/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevo_estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar el estado");

      setEstadoEditable(nuevoEstado);
      cargarFactura();
      alert("Estado actualizado con éxito");
    } catch (err) {
      alert("Error al actualizar el estado del pedido");
    }
  };

  if (!factura) {
    return (
      <div className="d-flex">
        <SidebarAdmin />
        <div
          className="d-flex justify-content-center align-items-center flex-grow-1"
          style={{ minHeight: "70vh", marginLeft: "280px" }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2">Cargando factura...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <SidebarAdmin />
      <div
        className="d-flex justify-content-center align-items-center flex-grow-1"
        style={{ minHeight: "80vh", marginLeft: "280px" }}
      >
        <div className="card p-4 shadow" style={{ width: "500px" }}>
          <h2 className="text-center mb-4">Detalle Pedido</h2>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>ID:</strong> {factura.id_factura}</li>
            <li className="list-group-item"><strong>Nombre:</strong> {factura.nombre_cliente}</li>
            <li className="list-group-item"><strong>Dirección:</strong> {factura.direccion}</li>
            <li className="list-group-item">
              <strong>Productos:</strong>
              <ul className="mt-2">
                {(typeof factura.productos === "string"
                  ? JSON.parse(factura.productos)
                  : factura.productos
                ).map((prod, index) => (
                  <li key={index}>
                    {prod.nombre} (x{prod.cantidad}) - ${Number(prod.precio_final ?? prod.precio ?? 0).toLocaleString("es-CO")}
                  </li>
                ))}
              </ul>
            </li>
            <li className="list-group-item"><strong>Cantidad:</strong> {factura.total_productos}</li>
            <li className="list-group-item">
              <strong>Total:</strong> ${Number(factura.total).toLocaleString("es-CO")}
            </li>
            <li className="list-group-item">
              <strong>Estado:</strong>{" "}
              {(factura.estado === "cancelado" || factura.estado === "entregado") ? (
                <span className={`badge bg-${factura.estado === "cancelado" ? "danger" : "success"}`}>{factura.estado}</span>
              ) : (
                <>
                  <select
                    value={nuevoEstado}
                    className="form-select mb-2"
                    onChange={(e) => setNuevoEstado(e.target.value)}
                  >
                    <option value="">-- Selecciona un estado --</option>
                    {estadosDisponibles.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>

                  <div className="text-center">
                    <button
                      className="btn btn-primary mt-2"
                      onClick={guardarCambioEstado}
                      disabled={!nuevoEstado || nuevoEstado === estadoEditable}
                    >
                      Guardar estado
                    </button>
                  </div>
                </>
              )}
            </li>
          </ul>

          <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}