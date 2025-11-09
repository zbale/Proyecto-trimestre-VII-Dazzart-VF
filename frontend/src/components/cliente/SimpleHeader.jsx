// src/components/cliente/SimpleHeader.jsx
import React from "react";
import '../../css/CSS/SimpleHeader.css';


export default function SimpleHeader() {
  return (
    <header className="bg-white py-3 shadow-sm d-flex justify-content-center align-items-center">
   <a href="/" className="navbar-brand text-logo" style={{ fontSize: '17px' }}>
  Dazzart <span>Components</span>
</a>

    </header>
  );
}
