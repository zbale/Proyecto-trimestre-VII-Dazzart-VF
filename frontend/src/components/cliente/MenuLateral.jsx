import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/CSS/MenuLateral.css";
import { API_URL } from '../../config/api';

const BASE_URL = API_URL;

export default function MenuLateral({ onClose }) {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/api/categorias/listar`)
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (categoriaActiva) {
      fetch(`${BASE_URL}/api/subcategorias/listar`)
        .then((res) => res.json())
        .then((data) => {
          const filtradas = data.filter(
            (sub) => sub.id_categoria === categoriaActiva
          );
          setSubcategorias(filtradas);
        })
        .catch(console.error);
    } else {
      setSubcategorias([]);
    }
  }, [categoriaActiva]);

  const handleCategoriaClick = (id) => {
    setCategoriaActiva(id);
  };

  const handleSubcategoriaClick = (id_subcategoria) => {
    // Navegar a la ruta productos con categoria y subcategoria
    navigate(`/productos/${categoriaActiva}/${id_subcategoria}`);
    onClose();
  };

  return (
    <aside className="menu-lateral activo" aria-label="Menú lateral de categorías y subcategorías">
      <header className="menu-header">
        <h2 className="menu-title">Menú</h2>
        <button className="cerrar-menu" onClick={onClose} aria-label="Cerrar menú" type="button">✖</button>
      </header>

      <section className="menu-categorias" aria-label="Categorías principales">
        <h3>Categorías</h3>
        <nav className="nav-categorias" role="list">
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              className={`nav-categoria ${categoriaActiva === cat.id_categoria ? "activo" : ""}`}
              onClick={() => handleCategoriaClick(cat.id_categoria)}
              aria-pressed={categoriaActiva === cat.id_categoria}
              type="button"
            >
              {cat.nombre_categoria}
            </button>
          ))}
        </nav>
      </section>

      {categoriaActiva && (
        <section className="menu-subcategorias" aria-label="Subcategorías">
          <h3>Subcategorías</h3>
          {subcategorias.length > 0 ? (
            <nav className="nav-subcategorias" role="list">
              {subcategorias.map((sub) => (
                <button
                  key={sub.id_subcategoria}
                  className="nav-subcategoria"
                  type="button"
                  onClick={() => handleSubcategoriaClick(sub.id_subcategoria)}
                >
                  {sub.nombre_subcategoria}
                </button>
              ))}
            </nav>
          ) : (
            <p className="sin-subcategorias">No hay subcategorías para esta categoría.</p>
          )}
        </section>
      )}
    </aside>
  );
}
