import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  // Solo permite acceso si el usuario existe y su id_rol es 1 (admin)
  if (!usuario || usuario.id_rol !== 1) {
    return <Navigate to="/" replace />;
  }
  return children;
}
