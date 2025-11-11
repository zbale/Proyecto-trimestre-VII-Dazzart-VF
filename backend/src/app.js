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

  // CORS - Configuración específica para Amplify
const corsOptions = {
  origin: true, //
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
};

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

  // Logging
  app.use((req, res, next) => {
    console.log(`PETICIÓN recibida: ${req.method} ${req.originalUrl}`);
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
