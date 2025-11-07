import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "../../css/CSSA/formulariodescuento.css";
import { API_URL } from '../../config/api';

export default function FormularioDescuento() {
  const [tipoDescuento, setTipoDescuento] = useState("");
  const [valor, setValor] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estadoDescuento, setEstadoDescuento] = useState("Activo");
  const [aplicacion, setAplicacion] = useState("producto");

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [nombreProducto, setNombreProducto] = useState("");
  const [idCategoria, setIdCategoria] = useState("");

  const fechaHoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  useEffect(() => {
    axios.get(`${API_URL}/api/productos/listar`)
      .then(res => setProductos(res.data))
      .catch(err => console.error("Error al cargar productos:", err));

    axios.get(`${API_URL}/api/categorias/listar`)
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Error al cargar categorías:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar fechas
    if (fechaFin < fechaInicio) {
      alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    const data = {
      tipo_descuento: tipoDescuento,
      valor,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado_descuento: estadoDescuento,
      aplicacion,
    };

    if (aplicacion === "producto") {
      data.nombre_producto = nombreProducto;
    } else {
      data.id_categoria = idCategoria;
    }

    axios.post(`${API_URL}/api/descuentos`, data)
      .then(() => {
        alert("Descuento creado correctamente");
      })
      .catch((err) => {
        console.error("Error al crear descuento:", err);
        alert("Hubo un error al crear el descuento.");
      });
  };

  const handleEditar = (descuento) => {
    // Lógica para editar descuento
  };

  const handleEliminar = (id_descuento) => {
    // Lógica para eliminar descuento
  };

  return (
    <>
      <SidebarAdmin />
      <main className="main-content p-4" style={{ marginLeft: "280px" }}>
        <h1 className="mb-4">Añadir Descuento</h1>
        <div className="d-flex justify-content-center align-items-center vh-80">
          <form className="p-4 bg-light rounded shadow-sm w-50" onSubmit={handleSubmit}>
            <h4 className="text-center mb-4">Añadir Descuento</h4>

            <div className="mb-3">
              <label className="form-label">Tipo de descuento</label>
              <select className="form-select" value={tipoDescuento} onChange={e => setTipoDescuento(e.target.value)} required>
                <option value="" disabled>Seleccione...</option>
                <option value="Porcentaje">Porcentaje</option>
                <option value="Fijo">Fijo</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Valor del descuento</label>
              <input type="number" step="0.01" className="form-control" value={valor} onChange={e => setValor(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de inicio</label>
              <input
                type="date"
                className="form-control"
                value={fechaInicio}
                min={fechaHoy}
                onChange={e => setFechaInicio(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de fin</label>
              <input
                type="date"
                className="form-control"
                value={fechaFin}
                min={fechaInicio || fechaHoy}
                onChange={e => setFechaFin(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Estado del descuento</label>
              <select className="form-select" value={estadoDescuento} onChange={e => setEstadoDescuento(e.target.value)} required>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Aplicar a:</label><br />
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="aplicacion" value="producto" checked={aplicacion === "producto"} onChange={() => setAplicacion("producto")} />
                <label className="form-check-label">Producto específico</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="aplicacion" value="categoria" checked={aplicacion === "categoria"} onChange={() => setAplicacion("categoria")} />
                <label className="form-check-label">Categoría específica</label>
              </div>
            </div>

            {aplicacion === "producto" ? (
              <div className="mb-3">
                <label className="form-label">Buscar producto:</label>
                <input
                  className="form-control"
                  list="lista-productos"
                  value={nombreProducto}
                  onChange={e => setNombreProducto(e.target.value)}
                  required
                />
                <datalist id="lista-productos">
                  {productos.map((prod, i) => (
                    <option key={i} value={prod.nombre} />
                  ))}
                </datalist>
              </div>
            ) : (
              <div className="mb-3">
                <label className="form-label">Selecciona una categoría:</label>
                <select className="form-select" value={idCategoria} onChange={e => setIdCategoria(e.target.value)} required>
                  <option value="">Seleccione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-dark">Guardar Descuento</button>
            </div>
          </form>
        </div>

      </main>
    </>
  );
}
