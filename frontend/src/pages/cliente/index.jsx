import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/cliente/Header';
import Carrusel from '../../components/cliente/Carrusel';
import Footer from '../../components/cliente/Footer';
import MenuLateral from '../../components/cliente/MenuLateral';
import ProductoCard from '../../components/cliente/ProductoCard';
import Marcas from '../../components/cliente/Marcas';
import ModalConfirmacion from '../../components/cliente/ModalConfirmacion';
import ModalProducto from '../../components/cliente/ModalProducto';
import ModalLogin from '../../components/cliente/ModalLogin';

import '../../css/CSS/clienteHome.css';
import '../../css/CSS/CardsProducto.css';
import '../../css/CSS/ModalConfirmacion.css';
import '../../css/CSS/ModalProducto.css';
import { API_URL } from '../../config/api';

const BASE_URL = `${API_URL}/api`;
const IMG_URL = `${API_URL}/productos/img`;

export default function ClienteHome() {
  const [showMenu, setShowMenu] = useState(false);
  const [productos, setProductos] = useState([]);
  const [cicloInfinito, setCicloInfinito] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [modalLupaOpen, setModalLupaOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE_URL}/productos/listar`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('La respuesta no es un array:', data);
          return;
        }
        const ordenados = [...data].sort(
          (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
        );
        const top10 = ordenados.slice(0, 10);
        setProductos(top10);
        setCicloInfinito([...top10, ...top10]);
      })
      .catch(console.error);
  }, []);

  // Recargar productos cuando la página recibe focus (vuelve del admin)
  useEffect(() => {
    const handleFocus = () => {
      fetch(`${BASE_URL}/productos/listar`)
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          const ordenados = [...data].sort(
            (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
          );
          const top10 = ordenados.slice(0, 10);
          setProductos(top10);
          setCicloInfinito([...top10, ...top10]);
        })
        .catch(console.error);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft = 0;

    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = el.scrollLeft - el.scrollWidth / 2;
      }
    };

    const el = scrollRef.current;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [cicloInfinito]);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) setUsuario(JSON.parse(usuarioGuardado));
  }, []);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    if (!usuario || usuario.id_rol !== 2) {
      setMostrarLogin(true);
      return;
    }

    fetch(`${BASE_URL}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: usuario.id_usuario,
        id_producto: producto.id_producto,
        cantidad,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al agregar al carrito');
        return res.json();
      })
      .then(data => {
        setModalMensaje(data.message || 'Producto agregado al carrito');
        setMostrarModal(true);
      })
      .catch(err => {
        console.error(err);
        setModalMensaje('Error al agregar al carrito');
        setMostrarModal(true);
      });
  };

const abrirModalLupa = (producto) => {
  const nombreImg = producto.imagen?.replace(/^\/?.*img\//, '') || '';
  const urlSinCache = nombreImg
    ? `${IMG_URL}/${encodeURIComponent(nombreImg)}`
    : '/default.png';

  const img = new Image();
  img.src = urlSinCache;

  img.onload = () => {
    setProductoSeleccionado({ ...producto, urlImagen: img.src });
    setModalLupaOpen(true);
  };

  img.onerror = () => {
    setProductoSeleccionado({ ...producto, urlImagen: '/default.png' });
    setModalLupaOpen(true);
  };
};


  const cerrarModalLupa = () => {
    setModalLupaOpen(false);
    setProductoSeleccionado(null);
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  return (
    <div className="cliente-home-container">
      <Header
        onOpenMenu={() => setShowMenu(true)}
        onOpenCarrito={() => navigate('/carrito')}
        onOpenLogin={() => setMostrarLogin(true)}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        usuario={usuario}
        onLogout={handleLogout}
      />

      <main className="container-fluid px-2 px-sm-4 px-md-5 my-5">
        <div className="px-3 px-sm-4 px-md-5 mx-auto" style={{ maxWidth: '1500px' }}>
          <Carrusel />
          <h2 className="mt-4 mb-3 text-start fw-bold" style={{ fontSize: '1.8rem' }}>
            Nuevos Productos
          </h2>
        </div>

        <div className="d-flex align-items-center">
          <button className="btn btn-light me-2" onClick={scrollLeft} aria-label="Desplazar izquierda">
            &lt;
          </button>

          <div
            className="productos-scroll-container d-flex overflow-x-auto"
            ref={scrollRef}
            style={{ scrollBehavior: 'smooth', gap: '16px', paddingBottom: 0, marginBottom: '2rem' }}
          >
            {cicloInfinito.map((prod, index) => {
              const nombreImg = prod.imagen?.replace(/^\/?.*img\//, '') || '';
              const urlImagen = nombreImg
                ? `${IMG_URL}/${encodeURIComponent(nombreImg)}?t=${Date.now()}`
                : '/default.png';

              return (
                <div
                  className="producto-item"
                  key={`${prod.id_producto}-${index}`}
                  style={{ minWidth: '250px', maxWidth: '420px' }}
                >
                  <ProductoCard
                    producto={{ ...prod, urlImagen }}
                    onAgregarCarrito={agregarAlCarrito}
                    onVerDetalle={() => abrirModalLupa(prod)}
                    usuario={usuario}
                    onOpenLogin={() => setMostrarLogin(true)}
                  />
                </div>
              );
            })}
          </div>

          <button className="btn btn-light ms-2" onClick={scrollRight} aria-label="Desplazar derecha">
            &gt;
          </button>
        </div>
      </main>

      <Marcas />
      <Footer />

      {showMenu && <MenuLateral onClose={() => setShowMenu(false)} />}

      <ModalConfirmacion
        show={mostrarModal}
        mensaje={modalMensaje}
        onClose={() => setMostrarModal(false)}
        onIrCarrito={() => {
          setMostrarModal(false);
          navigate('/carrito');
        }}
      />

      {modalLupaOpen && productoSeleccionado && (
        <ModalProducto
          producto={productoSeleccionado}
          show={modalLupaOpen}
          onClose={cerrarModalLupa}
          onAgregarCarrito={agregarAlCarrito}
        />
      )}

      {mostrarLogin && (
        <ModalLogin
          visible={mostrarLogin}
          onClose={() => setMostrarLogin(false)}
          onLoginSuccess={user => {
            setUsuario(user);
            localStorage.setItem('usuario', JSON.stringify(user));
          }}
        />
      )}
    </div>
  );
}
