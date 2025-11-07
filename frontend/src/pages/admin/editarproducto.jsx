import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import SidebarAdmin from "../../components/SideBarAdmin.jsx";
import { API_URL } from '../../config/api';

const BASE_URL = API_URL;

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.replace("/");
    }
  }, []);

  const [producto, setProducto] = useState(null);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [form, setForm] = useState({
    numero_serial: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_categoria: "",
    id_subcategoria: "",
    fecha_creacion: "",
  });

  // Estado para forzar recarga de imagen (cache buster)
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  // Ref para manejar la URL de la imagen temporal
  const previewUrlRef = useRef(null);

  // Carga datos iniciales
  useEffect(() => {
    axios.get(`${BASE_URL}/api/productos/${id}`).then((res) => {
      const data = res.data;
      setProducto(data);
      setForm({
        numero_serial: data.numero_serial || "",
        nombre: data.nombre || "",
        descripcion: data.descripcion || "",
        precio: data.precio || "",
        stock: data.stock || "",
        id_categoria: data.id_categoria || "",
        id_subcategoria: data.id_subcategoria || "",
        fecha_creacion: data.fecha_creacion?.split("T")[0] || "",
      });
      setImagenSeleccionada(data.imagen || "");
      setCacheBuster(Date.now()); // Forzar recarga imagen inicial
    });

    axios.get(`${BASE_URL}/api/categorias/listar`).then((res) => {
      setCategorias(res.data || []);
    });

    axios.get(`${BASE_URL}/api/productos/listar-imagenes`).then((res) => {
      setImagenesExistentes(res.data.imagenes || []);
    });
  }, [id]);

  // Filtrar subcategorías cuando cambia la categoría seleccionada
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

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar selección de nueva imagen (archivo)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
      // No limpiar imagenSeleccionada para mantener preview correcto
    }
  };

  // Manejar selección de imagen existente
  const handleImageSelect = (imgName) => {
    setImagenSeleccionada(imgName);
    setImagenArchivo(null);
    setCacheBuster(Date.now()); // Forzar recarga imagen seleccionada
  };

  // Liberar URL temporal cuando cambia la imagen de archivo
  useEffect(() => {
    if (imagenArchivo) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      previewUrlRef.current = URL.createObjectURL(imagenArchivo);
    }
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [imagenArchivo]);

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "fecha_creacion") fd.append(key, value);
    });

    if (imagenArchivo) {
      fd.append("imagen", imagenArchivo);
    } else if (imagenSeleccionada) {
      fd.append("imagen", imagenSeleccionada);
    }

    try {
      await axios.put(`${BASE_URL}/api/productos/editar/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Éxito", "Producto actualizado correctamente", "success");
      navigate("/admin-productos");
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      Swal.fire("Error", "No se pudo actualizar el producto", "error");
    }
  };

  if (!producto) return <p>Cargando producto...</p>;

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
          <h2 className="mb-4 text-center">Editar Producto</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Número Serial */}
            <div className="mb-3">
              <label className="form-label">Número Serial</label>
              <input
                type="text"
                name="numero_serial"
                value={form.numero_serial}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Nombre */}
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Descripción */}
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="form-control"
                rows={3}
                required
              />
            </div>

            {/* Precio y Stock lado a lado */}
            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Precio</label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  className="form-control"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Fecha Creación (solo visual) */}
            <div className="mb-3">
              <label className="form-label">Fecha de Creación</label>
              <input
                type="text"
                value={form.fecha_creacion}
                readOnly
                className="form-control"
              />
            </div>

            {/* Categoría */}
            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <select
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
                <label className="form-label">Subcategoría</label>
                <select
                  name="id_subcategoria"
                  value={form.id_subcategoria}
                  onChange={handleChange}
                  className="form-select"
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

            {/* Imagen */}
            <div className="mb-3">
              <label className="form-label">Subir imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-control"
              />
            </div>

            {/* Selección de imagen existente */}
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-2">
                {imagenesExistentes.map((img) => (
                  <img
                    key={img}
                    src={`${BASE_URL}/productos/img/${encodeURIComponent(img)}`}
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
            {(imagenArchivo || imagenSeleccionada) && (
              <div className="mb-3">
                <strong>Vista previa:</strong>
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    marginTop: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <img
                    src={
                      imagenArchivo
                        ? previewUrlRef.current
                        : imagenSeleccionada
                        ? `${BASE_URL}/productos/img/${encodeURIComponent(
                            imagenSeleccionada
                          )}?t=${cacheBuster}`
                        : "/default.png"
                    }
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => (e.target.src = "/default.png")}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-dark w-100">
              Guardar Cambios
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
