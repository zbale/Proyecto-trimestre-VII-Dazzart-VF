import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "../../css/CSSA/actualizardescuento.css";
import { API_URL } from '../../config/api';

export default function EditarDescuento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tipo_descuento: "Porcentaje",
    valor: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado_descuento: "Activo"
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/descuentos/${id}`)
      .then(res => {
        const descuento = res.data;
        setForm({
          tipo_descuento: descuento.tipo_descuento,
          valor: descuento.valor,
          fecha_inicio: descuento.fecha_inicio.split("T")[0],
          fecha_fin: descuento.fecha_fin.split("T")[0],
          estado_descuento: descuento.estado_descuento
        });
      })
      .catch(err => {
        console.error("Error al cargar el descuento:", err);
        alert("No se pudo cargar el descuento.");
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hoy = new Date().toISOString().split("T")[0]; // fecha actual en formato YYYY-MM-DD

    // Validación de fechas
    if (form.fecha_fin < form.fecha_inicio) {
      alert("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }

    // 🚩 Validación especial: si la fecha ya expiró no puede reactivarse
    if (form.fecha_fin < hoy && form.estado_descuento === "Activo") {
      alert("El descuento ya expiró. Debe actualizar las fechas a un rango válido antes de poder activarlo.");
      return;
    }

    axios.put(`${API_URL}/api/descuentos/${id}`, form)
      .then(() => {
        alert("Descuento actualizado correctamente.");
        navigate("/admin-descuento");
      })
      .catch(err => {
        console.error("Error al actualizar descuento:", err);
        alert("Error al actualizar el descuento.");
      });
  };

  return (
    <>
      <SidebarAdmin />
      <div className="main-content p-4" style={{ marginLeft: "280px" }}>
        <h1 className="mb-4">Actualizar Descuento</h1>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <form className="p-4 bg-light rounded shadow-sm w-50" onSubmit={handleSubmit}>
            <h4 className="text-center mb-4">Editar Descuento</h4>

            <div className="mb-3">
              <label className="form-label">Tipo de descuento</label>
              <select className="form-select" name="tipo_descuento" value={form.tipo_descuento} onChange={handleChange} required>
                <option value="Porcentaje">Porcentaje</option>
                <option value="Fijo">Fijo</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Valor del descuento</label>
              <input type="number" name="valor" step="0.01" className="form-control" value={form.valor} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de inicio</label>
              <input type="date" name="fecha_inicio" className="form-control" value={form.fecha_inicio} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de fin</label>
              <input type="date" name="fecha_fin" className="form-control" value={form.fecha_fin} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Estado del descuento</label>
              <select className="form-select" name="estado_descuento" value={form.estado_descuento} onChange={handleChange} required>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-dark">
                <FontAwesomeIcon icon={faEdit} /> Actualizar Descuento
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}