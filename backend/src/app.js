const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const express = require('express');
const cors = require('cors');
const path = require('path');

// Routers
const productosRouter = require('./routes/productosrouter');
const categoriasRouter = require('./routes/categoriasrouter');
const subcategoriasRouter = require('./routes/subcategoriasrouter');
const pedidosRouter = require('./routes/pedidosRouter');
const carritoRouter = require('./routes/carritoRouter');
const userRoutes = require('./routes/userRouter');
const descuentoRoutes = require('./routes/descuentoRouter');
const authRouter = require('./routes/authRouter');

const createApp = () => {
  const app = express();

  // CORS - Configuración específica para Amplify y APK nativa
  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',  // Frontend local Vue/React
        'http://localhost:3000',   // Frontend local alternativo
        'http://localhost:19000', // Expo Go
        'http://127.0.0.1:19000', // Expo Go local
        'http://67.202.48.5:3001', // IP pública - APK
        'http://67.202.48.5:5173', // Frontend IP pública
        'http://172.31.29.194:3001', // IP privada - red local
        'http://192.168.1.3:3001'  // Desarrollo local
      ];
      
      // Permitir requests sin origin (típico de APK nativa y Expo)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Origin no permitido: ${origin}`);
        callback(null, true); // Permitir igual pero loguear
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    optionsSuccessStatus: 204,
    maxAge: 86400 // Cache preflight por 24 horas
  };

  // Aplicar CORS a todas las rutas
  app.use(cors(corsOptions));

  // Manejar OPTIONS para preflight en todas las rutas
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
      res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
      return res.status(204).send();
    }
    next();
  });

  // Middleware
  app.use(express.json());

  // Logging mejorado
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const clientIp = req.ip || req.connection.remoteAddress;
    console.log(`\n[${timestamp}] 📥 ENTRADA`);
    console.log(`  ├─ Método: ${req.method}`);
    console.log(`  ├─ Ruta: ${req.originalUrl}`);
    console.log(`  ├─ IP Cliente: ${clientIp}`);
    console.log(`  ├─ Origin: ${req.get('origin') || 'NO ESPECIFICADO'}`);
    console.log(`  └─ User-Agent: ${req.get('user-agent')}`);
    next();
  });

  // Ruta raíz
  app.get('/', (req, res) => {
    res.send('Bienvenido a la API de DAZZART ');
  });

  // API Routes (todas bajo /api)
  app.use('/api/login', authRouter);
  app.use('/api/productos', productosRouter);
  app.use('/api/categorias', categoriasRouter);
  app.use('/api/subcategorias', subcategoriasRouter);
  app.use('/api/pedidos', pedidosRouter);
  app.use('/api/carrito', carritoRouter);
  app.use('/api/usuarios', userRoutes);
  app.use('/api/descuentos', descuentoRoutes);
  

  // Imágenes
  app.use('/productos/img', express.static(path.join(__dirname, '../public/img')));

   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  // Error handling middleware (JSON responses) - last middleware
  app.use((err, req, res, next) => {
    console.error('ERROR HANDLER:', err && err.stack ? err.stack : err);
    const status = err && err.status ? err.status : 500;
    res.status(status).json({
      success: false,
      message: err && err.message ? err.message : 'Error interno del servidor'
    });
  });

  return app;
};

module.exports = createApp;
