import React from 'react';
import '../../css/CSS/Footer.css';

export default function Footer() {
  return (
    <footer className="footer-container">


      <div className="footer-bottom container">
        <p>© 2022－2025 Dazzart Components. Todos los derechos reservados.</p>
        <div className="footer-legal-links">
          <a href="#">Términos de uso</a>
          <a href="#">Política de privacidad</a>
          <a href="#">Preferencias de privacidad</a>
          <a href="#">Gestión de anuncios</a>
        </div>
      </div>
    </footer>
  );
}
