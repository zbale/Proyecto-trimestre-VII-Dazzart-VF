import React from 'react';
import '../../css/CSS/Marcas.css';

const marcas = [
  { id: 1, img: "/marcas/MSI.webp", alt: "MSI", url: "https://latam.msi.com/" },
  { id: 2, img: "/marcas/FANTECH.webp", alt: "Fantech", url: "https://fantechworld.com/" },
  { id: 3, img: "/marcas/logitech.png", alt: "Logitech", url: "https://www.logitechstore.com.co/" },
  { id: 4, img: "/marcas/ASTRO.webp", alt: "Astro", url: "https://www.marca4.com" },
  { id: 5, img: "/marcas/LG.webp", alt: "LG", url: "https://www.marca5.com" },
  { id: 6, img: "/marcas/VSG.webp", alt: "VSG", url: "https://www.marca6.com" },
];

export default function Marcas() {
  return (
    <section className="marcas-section">
      <div className="container-fluid">
        <div className="row marcas-grid justify-content-center align-items-center g-4">
          {marcas.map(({ id, img, alt, url }) => (
            <div
              key={id}
              className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center marca-item"
            >
              <a href={url} target="_blank" rel="noopener noreferrer" className="d-block text-center">
                <img src={img} alt={alt} className="img-fluid" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
