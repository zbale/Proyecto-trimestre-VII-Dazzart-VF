import React from 'react'; 
import '../../css/CSS/Header.css';

export default function HeaderRegistro() {
  return (

<header className="site-header py-3 bg-white shadow-sm">
  <div className="col-auto d-flex align-items-center">
    <a
      href="/"
      className="navbar-brand text-logo"
      style={{ fontSize: '17px', marginLeft: '10px', marginRight: '10px' }} // margen horizontal
    >
      Dazzart <span>Components</span>
    </a>
  </div>
</header>

  );
}
