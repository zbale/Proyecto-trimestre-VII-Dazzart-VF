import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { API_URL } from '../../config/api';

const BASE_URL = API_URL;

export default function AñadirProducto() {
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  const [form, setForm] = useState({
    numero_serial: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_categoria: "",
    id_subcategoria: "",
    fecha_creacion: new Date().toISOString().split("T")[0],
  });

  const [imagenNueva, setImagenNueva] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/categorias/listar`).then((res) => {
      setCategorias(res.data || []);
    });
    axios.get(`${BASE_URL}/api/productos/listar-imagenes`).then((res) => {
      setImagenesExistentes(res.data.imagenes || []);
    });
  }, []);

  useEffect(() => {
    if (form.id_categoria) {
      axios.get(`${BASE_URL}/api/subcategorias/listar`).then((res) => {
        const filtradas = res.data.filter(
          (s) => String(s.id_categoria) === String(form.id_categoria)
        );
        setSubcategorias(filtradas);
      });
    } else {
      setSubcategorias([]);
    }
  }, [form.id_categoria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenNueva(file);
      setImagenSeleccionada("");
    }
  };

  const handleImageSelect = (imgName) => {
    setImagenSeleccionada(imgName);
    setImagenNueva(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      fd.append(key, value);
    });

    if (imagenNueva) {
      fd.append("imagen", imagenNueva);
    } else if (imagenSeleccionada) {
      // Si no subes archivo, envías solo el nombre de la imagen
      fd.append("imagen_nombre", imagenSeleccionada);
    }

    try {
      await axios.post(`${BASE_URL}/api/productos/agregar`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Éxito", "Producto agregado correctamente", "success");
      navigate("/admin-productos");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      Swal.fire("Error", "No se pudo agregar el producto", "error");
    }
  };

  return (
    <div className="d-flex">
      <SidebarAdmin />
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          padding: "20px",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 className="mb-4 text-center">Añadir Producto</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Número Serial */}
            <div className="mb-3">
              <label htmlFor="numero_serial" className="form-label">
                Número Serial
              </label>
              <input
                type="text"
                id="numero_serial"
                name="numero_serial"
                value={form.numero_serial}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Nombre */}
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Descripción */}
            <div className="mb-3">
              <label htmlFor="descripcion" className="form-label">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="form-control"
                rows={3}
                required
              />
            </div>

{/* Precio y Stock en la misma fila */}
<div className="mb-3 d-flex gap-3">
  <div style={{ flex: 1 }}>
    <label htmlFor="precio" className="form-label">
      Precio
    </label>
    <input
      type="number"
      id="precio"
      name="precio"
      value={form.precio}
      onChange={handleChange}
      className="form-control"
      min="0"
      step="0.01"
      required
    />
  </div>

  <div style={{ flex: 1 }}>
    <label htmlFor="stock" className="form-label">
      Stock
    </label>
    <input
      type="number"
      id="stock"
      name="stock"
      value={form.stock}
      onChange={handleChange}
      className="form-control"
      min="0"
      required
    />
  </div>
</div>

            {/* Categoría */}
            <div className="mb-3">
              <label htmlFor="id_categoria" className="form-label">
                Categoría
              </label>
              <select
                id="id_categoria"
                name="id_categoria"
                value={form.id_categoria}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Selecciona categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategoría */}
            {subcategorias.length > 0 && (
              <div className="mb-3">
                <label htmlFor="id_subcategoria" className="form-label">
                  Subcategoría
                </label>
                <select
                  id="id_subcategoria"
                  name="id_subcategoria"
                  value={form.id_subcategoria}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Selecciona subcategoría</option>
                  {subcategorias.map((s) => (
                    <option key={s.id_subcategoria} value={s.id_subcategoria}>
                      {s.nombre_subcategoria}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fecha de Creación */}
            <div className="mb-3">
              <label htmlFor="fecha_creacion" className="form-label">
                Fecha de Creación
              </label>
              <input
                type="date"
                id="fecha_creacion"
                name="fecha_creacion"
                value={form.fecha_creacion}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Subir nueva imagen */}
            <div className="mb-3">
              <label className="form-label">Subir imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-control"
              />
            </div>

            {/* Seleccionar imagen existente */}
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-2">
                {imagenesExistentes.map((img) => (
                  <img
                    key={img}
                    src={`${BASE_URL}/productos/img/${img}`}
                    onClick={() => handleImageSelect(img)}
                    alt={img}
                    style={{
                      width: "80px",
                      height: "80px",
                      border:
                        imagenSeleccionada === img
                          ? "3px solid blue"
                          : "1px solid gray",
                      cursor: "pointer",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Vista previa */}
            {(imagenNueva || imagenSeleccionada) && (
              <div className="mb-3">
                <strong>Vista previa:</strong>
                <div>
                  <img
                    src={
                      imagenNueva
                        ? URL.createObjectURL(imagenNueva)
                        : `${BASE_URL}/productos/img/${imagenSeleccionada}`
                    }
                    alt="preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "contain",
                      marginTop: "10px",
                    }}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-dark w-100">
              Guardar Producto
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}