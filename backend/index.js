require('dotenv').config();

const createApp = require('../backend/src/app');

const app = createApp();

const PORT = process.env.PORT || 3001;

// Servidor con manejo de errores mejorado
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║         🚀 BACKEND DAZZART INICIADO');
  console.log(`║         🌐 URL Publica: http://67.202.48.5:${PORT}`);
  console.log(`║         🔒 URL Privada: http://172.31.29.194:${PORT}`);
  console.log('║         ✅ Status: ESCUCHANDO');
  console.log('╚════════════════════════════════════════════════════╝\n');
});

// Manejo de errores del servidor
server.on('error', (err) => {
  console.error('❌ Error del servidor:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM recibido, cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT recibido, cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});
