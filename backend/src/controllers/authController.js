const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const SECRET = 'jose';

exports.login = async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  console.log(" Body recibido:", req.body); 

  if (!correo_electronico || !contrasena) {
    console.warn(" Faltan credenciales:", { correo_electronico, contrasena });
    return res.status(400).json({ message: 'Correo y contraseña requeridos' });
  }

  try {
    const [results] = await db.query(
      'SELECT * FROM usuario WHERE correo_electronico = ?',
      [correo_electronico]
    );

    console.log(" Resultados query:", results); //  log de query

    if (results.length === 0) {
      console.warn(" Usuario no encontrado:", correo_electronico);
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = results[0];
    console.log("Usuario encontrado:", user);

    //  Validar estado
    if (!user.estado || user.estado.toLowerCase() !== 'activo') {
      console.warn("Usuario inactivo:", user.estado);
      return res.status(403).json({ message: 'Tu cuenta está inactiva. Contacta al administrador.' });
    }

    //  Debug extra: ver qué valores está comparando bcrypt
    console.log("Contraseña recibida:", contrasena);
    console.log(" Hash almacenado:", user.contrasena);

    // Validar contraseña
    const match = await bcrypt.compare(contrasena.trim(), user.contrasena); //  trim evita espacios
    console.log(" Comparación contraseña:", match);

    if (!match) {
      console.warn(" Contraseña incorrecta para:", correo_electronico);
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token (sin expiración)
    const token = jwt.sign(
      { id_usuario: user.id_usuario, id_rol: user.id_rol },
      SECRET
    );
    console.log("Token JWT generado:", token); // <-- Aquí se muestra el token en consola

    console.log("Login exitoso para usuario ID:", user.id_usuario);

    res.json({
      message: 'Login exitoso',
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        id_rol: user.id_rol,
        correo_electronico: user.correo_electronico,
        direccion: user.direccion,
        estado: user.estado
      },
      token
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};