import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faSearch,
  faUser,
  faShoppingCart,
  faSignOutAlt,
  faList,
  faIdBadge
} from '@fortawesome/free-solid-svg-icons';
import '../../css/CSS/Header.css';

export default function Header({
  onOpenMenu,
  onOpenCarrito,
  onOpenLogin,
  busqueda,
  setBusqueda,
  usuario,
  onLogout
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && busqueda.trim() !== '') {
      navigate(`/buscar/${encodeURIComponent(busqueda.trim())}`);
      setBusqueda('');
    }
  };

  const handleCarritoClick = () => {
    if (usuario) {
      onOpenCarrito();
    } else {
      onOpenLogin();
    }
  };

  return (
    <header className="site-header py-3 bg-white shadow-sm">
      <div className="container-fluid">
        <div className="row align-items-center g-3">

          {/* Logo */}
          <div className="col-auto d-flex align-items-center">
            <Link to="/" className="navbar-brand text-logo" style={{ fontSize: '17px' }}>
              Dazzart <span>Components</span>
            </Link>
          </div>

          {/* Menú lateral */}
          <div className="col-auto">
            <button
              className="btn btn-outline-primary header-btn"
              onClick={onOpenMenu}
              aria-label="Abrir menú lateral"
              type="button"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="col flex-grow-1 d-flex justify-content-end">
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar productos"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={handleSearch}
              />
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
          </div>

          {/* Íconos usuario y carrito */}
          <div className="col-auto d-flex align-items-center gap-2 position-relative">

            {/* Usuario logueado */}
            {usuario ? (
              <>
                <button
                  className="btn btn-outline-info header-btn"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  title="Mi cuenta"
                  aria-haspopup="true"
                  aria-expanded={showUserMenu}
                  type="button"
                >
                  <FontAwesomeIcon icon={faUser} />
                </button>

                {showUserMenu && (
                  <div
                    className="user-menu-dropdown card shadow position-absolute end-0 top-100 mt-2"
                    style={{ minWidth: 240, zIndex: 100 }}
                    role="menu"
                    aria-label="Menú de usuario"
                  >
                    <div className="card-body p-2">
                      <div className="mb-2">
                        <FontAwesomeIcon icon={faIdBadge} className="me-2 text-primary" aria-hidden="true" />
                        <strong>{usuario.nombre}</strong>
                        <div className="small text-muted">{usuario.correo_electronico}</div>
                      </div>
                      <hr className="my-2" />
                      <button
                        className="dropdown-item w-100 text-start mb-2"
                        onClick={() => {
                          navigate('/mis-compras');
                          setShowUserMenu(false);
                        }}
                        type="button"
                      >
                        <FontAwesomeIcon icon={faList} className="me-2" aria-hidden="true" /> Mis compras
                      </button>
                      <button
                        className="dropdown-item w-100 text-start mb-2"
                        onClick={() => {
                          navigate('/mis-datos');
                          setShowUserMenu(false);
                        }}
                        type="button"
                      >
                        <FontAwesomeIcon icon={faUser} className="me-2" aria-hidden="true" /> Mis datos
                      </button>
                      <hr className="my-2" />
                      <button
                        className="dropdown-item w-100 text-start text-danger"
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        type="button"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" aria-hidden="true" /> Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                className="btn btn-outline-info header-btn"
                onClick={onOpenLogin}
                aria-label="Iniciar sesión"
                type="button"
              >
                <FontAwesomeIcon icon={faUser} />
              </button>
            )}

            {/* Carrito */}
            <button
              className="btn btn-outline-warning header-btn"
              onClick={handleCarritoClick}
              aria-label="Abrir carrito"
              type="button"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
