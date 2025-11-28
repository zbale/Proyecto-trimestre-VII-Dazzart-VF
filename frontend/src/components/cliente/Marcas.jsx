import React, { useEffect, useRef, useState } from 'react';
import '../../css/CSS/Marcas.css';

// Importación de imágenes
import marca1 from '../../../../backend/public/img/MSI.webp';
import marca2 from '../../../../backend/public/img/FANTECH.webp';
import marca3 from '../../../../backend/public/img/High_Resolution_PNG-LogitechG_horz_RGB_cyan_SM-1024x307.png';
import marca4 from '../../../../backend/public/img/ASTRO-1.webp';
import marca5 from '../../../../backend/public/img/LG-ULTRAGEAR-1.webp';
import marca6 from '../../../../backend/public/img/VSG.webp';

const marcas = [
  { id: 1, img: marca1, alt: 'MSI', url: 'https://latam.msi.com/' },
  { id: 2, img: marca2, alt: 'Fantech', url: 'https://fantechworld.com/' },
  { id: 3, img: marca3, alt: 'Logitech', url: 'https://www.logitechstore.com.co/' },
  { id: 4, img: marca4, alt: 'Astro', url: 'https://www.marca4.com' },
  { id: 5, img: marca5, alt: 'LG', url: 'https://www.marca5.com' },
  { id: 6, img: marca6, alt: 'VSG', url: 'https://www.marca6.com' },
];

export default function Marcas() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % marcas.length);
    }, 3000); // Cambiar cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.querySelector('.marca-item')?.offsetWidth || 0;
      carouselRef.current.scrollLeft = currentIndex * itemWidth;
    }
  }, [currentIndex]);

  return (
    <section className="marcas-section">
      <div className="marcas-carousel" ref={carouselRef}>
        <div className="marcas-carousel-track">
          {marcas.map(({ id, img, alt, url }) => (
            <div
              key={id}
              className="marca-item"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="d-block text-center"
              >
                <img src={img} alt={alt} className="img-fluid" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
