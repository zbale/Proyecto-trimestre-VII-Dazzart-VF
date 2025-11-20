const mysql = require('mysql2/promise');

// Configuración de la base de datos - usar variables de entorno para producción
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'josedaza',
  password: process.env.DB_PASSWORD || 'natsu2024',
  database: process.env.DB_NAME || 'DAZZART',
  // Opciones adicionales para mejor rendimiento y manejo de desconexiones
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado a MySQL correctamente.');
    connection.release();
  } catch (error) {
    console.error('Error al conectar a MySQL:', error);
  }
})();

module.exports = pool;
