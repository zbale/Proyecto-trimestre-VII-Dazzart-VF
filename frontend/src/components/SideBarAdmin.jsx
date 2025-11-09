import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFolderTree, faBox, faPercent, faTruck, faGear, faUser, faRightFromBracket, faChartLine } from '@fortawesome/free-solid-svg-icons';

export default function SidebarAdmin() {
  const [openConfig, setOpenConfig] = useState(false);
  const [openConfigMobile, setOpenConfigMobile] = useState(false);

  return (
    <>
      {/* Sidebar para escritorio */}
      <div
        className="sidebar d-none d-md-block bg-dark text-white p-3"
        style={{
          height: "100vh",
          width: "280px",
          position: "fixed",
          top: 0,
          left: 0,
          overflowY: "auto",
          zIndex: 1040,
        }}
      >
        <h5 className="fw-bold mb-4" style={{letterSpacing:'1px', fontSize:'1.2rem'}}>Dazzart Admin</h5>
          <ul className="nav flex-column mt-3">
  <li>
    <a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-estadisticas">
      <FontAwesomeIcon icon={faChartLine} /> Estadísticas
    </a>
  </li>
          <li>
            <a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-categorias">
              <FontAwesomeIcon icon={faFolder} /> Categorías
            </a>
          </li>

          <li>
            <a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-subcategorias">
              <FontAwesomeIcon icon={faFolderTree} /> Subcategorías
            </a>
          </li>

          <li>
            <a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-productos">
              <FontAwesomeIcon icon={faBox} /> Productos
            </a>
          </li>
          <li>
            <a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-descuento">
              <FontAwesomeIcon icon={faPercent} /> Descuentos
            </a>
          </li>
          <li>
            <a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-pedidos">
              <FontAwesomeIcon icon={faTruck} /> Pedidos
            </a>
          </li>
          <li>
            <button
              className="nav-link text-white d-flex align-items-center gap-2 btn btn-link p-0"
              style={{fontWeight:'500'}}
              onClick={() => setOpenConfig(!openConfig)}
            >
              <FontAwesomeIcon icon={faGear} /> Configuración {openConfig ? "▾" : "▸"}
            </button>
            {openConfig && (
              <ul className="ps-3 mt-2">
                <li><a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-usuarios"><FontAwesomeIcon icon={faUser} /> Clientes</a></li>
                <li>
                  <button
                    className="nav-link text-white d-flex align-items-center gap-2 btn btn-link p-0"
                    onClick={() => {
                      localStorage.removeItem('usuario');
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.replace('/'); // replace para limpiar historial
                    }}
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} /> Salir
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* Botón de menú móvil */}
      <button
        className="btn btn-dark d-md-none m-3"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebarMenu"
        aria-controls="sidebarMenu"
      >
        ☰ Menú
      </button>

      {/* Offcanvas móvil */}
      <div className="offcanvas offcanvas-start text-bg-dark" tabIndex="-1" id="sidebarMenu">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Dazzart Components</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Cerrar"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="nav flex-column">
            <li>
             <a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-estadisticas"><FontAwesomeIcon icon={faChartLine} /> Estadísticas</a></li>
            <li><a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-categorias"><FontAwesomeIcon icon={faFolder} /> Categorías</a></li>
            <li><a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-subcategorias"><FontAwesomeIcon icon={faFolderTree} /> Subcategorías</a></li>
            <li><a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-productos"><FontAwesomeIcon icon={faBox} /> Productos</a></li>
            <li><a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-pedidos"><FontAwesomeIcon icon={faTruck} /> Pedidos</a></li>
            <li><a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-descuento"><FontAwesomeIcon icon={faPercent} /> Descuentos</a></li>
            <li>
              <button
                className="nav-link text-white d-flex align-items-center gap-2 btn btn-link p-0"
                style={{fontWeight:'500'}}
                onClick={() => setOpenConfigMobile(!openConfigMobile)}
              >
                <FontAwesomeIcon icon={faGear} /> Configuración {openConfigMobile ? "▾" : "▸"}
              </button>
              {openConfigMobile && (
                <ul className="ps-3 mt-2">
                  <li><a className="nav-link text-white d-flex align-items-center gap-2" href="/admin-usuarios"><FontAwesomeIcon icon={faUser} /> Clientes</a></li>
                  <li>
                    <button
                      className="nav-link text-white d-flex align-items-center gap-2 btn btn-link p-0"
                      onClick={() => {
                        localStorage.removeItem('usuario');
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.replace('/'); // replace para limpiar historial
                      }}
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} /> Salir
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}