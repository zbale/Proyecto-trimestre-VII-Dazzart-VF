import React from 'react';

import banner1 from '../../../../backend/public/img/imgi_24_SIM-Holidays_BannerWeb_Desktop-scaled.jpg';
import banner3 from '../../../../backend/public/img/BANNER1.jpg';

import '../../css/CSS/Carrousel.css';

export default function Carrusel() {
  return (
    <div
      id="carouselExampleIndicators"
      className="carousel slide my-4 mx-auto carrusel-contenedor"
      data-bs-ride="carousel"
      data-bs-interval="3000"
      data-bs-wrap="true"
      style={{ userSelect: 'none' }} // evita selección
    >
      {/* Indicadores */}
      <div className="carousel-indicators">
        <button
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="0"
          className="active"
          aria-current="true"
          aria-label="Slide 1"
        />
        <button
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="1"
          aria-label="Slide 2"
        />
      </div>

      {/* Imágenes */}
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img
            src={banner1}
            className="d-block w-100 carousel-image"
            alt="Banner 1"
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            style={{ objectFit: 'contain', maxHeight: '400px' }}
          />
        </div>

        <div className="carousel-item">
          <img
            src={banner3}
            className="d-block w-100 carousel-image"
            alt="Banner 3"
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            style={{ objectFit: 'contain', maxHeight: '400px' }}
          />
        </div>
      </div>

      {/* Controles */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev"
      >
        <span
          className="carousel-control-prev-icon"
          aria-hidden="true"
          style={{ filter: 'brightness(0) invert(1)' }} // flechas blancas
        />
        <span className="visually-hidden">Anterior</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next"
      >
        <span
          className="carousel-control-next-icon"
          aria-hidden="true"
          style={{ filter: 'brightness(0) invert(1)' }} // flechas blancas
        />
        <span className="visually-hidden">Siguiente</span>
      </button>
    </div>
  );
}
