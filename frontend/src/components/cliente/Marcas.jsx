import React, { useEffect, useRef, useState } from 'react';
import '../../css/CSS/Marcas.css';

// Importación de imágenes
import marca1 from '../../../../backend/public/img/MSI.webp';
import marca2 from '../../../../backend/public/img/FANTECH.webp';
import marca3 from '../../../../backend/public/img/High_Resolution_PNG-LogitechG_horz_RGB_cyan_SM-1024x307.png';
import marca4 from '../../../../backend/public/img/ASTRO-1.webp';
import marca5 from '../../../../backend/public/img/LG-ULTRAGEAR-1.webp';
import marca6 from '../../../../backend/public/img/VSG.webp';

const marcasOriginal = [
  { id: 1, img: marca1, alt: 'MSI', url: 'https://latam.msi.com/' },
  { id: 2, img: marca2, alt: 'Fantech', url: 'https://fantechworld.com/' },
  { id: 3, img: marca3, alt: 'Logitech', url: 'https://www.logitechstore.com.co/' },
  { id: 4, img: marca4, alt: 'Astro', url: 'https://www.marca4.com' },
  { id: 5, img: marca5, alt: 'LG', url: 'https://www.marca5.com' },
  { id: 6, img: marca6, alt: 'VSG', url: 'https://www.marca6.com' },
];

// Repetir marcas para carrusel infinito (21 veces)
const marcas = Array(21).fill(marcasOriginal).flat();

export default function Marcas() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const itemWidth = 16.66; // 100% / 6 marcas por fila en desktop

  useEffect(() => {
    // Posicionar en el medio al montar
    const middleIndex = marcasOriginal.length * Math.floor(21 / 2);
    setCurrentIndex(middleIndex);
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${middleIndex * itemWidth}%)`;
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        let nextIndex = prev + 1;

        // Si llegamos al final, reiniciar desde el medio
        if (nextIndex >= marcas.length - marcasOriginal.length) {
          nextIndex = marcasOriginal.length * Math.floor(21 / 2);
          if (carouselRef.current) {
            carouselRef.current.style.transition = 'none';
            carouselRef.current.style.transform = `translateX(-${nextIndex * itemWidth}%)`;
            setTimeout(() => {
              if (carouselRef.current) {
                carouselRef.current.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              }
            }, 50);
          }
        } else {
          if (carouselRef.current) {
            carouselRef.current.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            carouselRef.current.style.transform = `translateX(-${nextIndex * itemWidth}%)`;
          }
        }
        return nextIndex;
      });
    }, 2500); // Cada 2.5 segundos (desfiladero continuo sin pausas)

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="marcas-section">
      <div className="marcas-carousel-container">
        <div className="marcas-carousel-track" ref={carouselRef}>
          {marcas.map(({ id, img, alt, url }, index) => (
            <div
              key={`${id}-${index}`}
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
