const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productosController');
const upload = require('../middlewares/upload'); // multer configurado para subir imágenes
const fs = require('fs');
const path = require('path');

// Obtener todos los productos
router.get('/listar', productoController.listarProductos);

// Listar imágenes existentes en la carpeta pública (DEBE IR ANTES DE /:id)
router.get('/listar-imagenes', (req, res) => {
  const imgDir = path.join(__dirname, '../public/img');
  fs.readdir(imgDir, (err, files) => {
    if (err) {
      console.error("Error leyendo la carpeta de imágenes:", err);
      return res.status(500).json({ error: 'No se pudo leer la carpeta de imágenes' });
    }
    const imagenes = files.filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f));
    res.json({ imagenes });
  });
});

// Servir imagen individual
router.get('/imagen/:nombre', (req, res) => {
  const imgDir = path.join(__dirname, '../public/img');
  const imagenPath = path.join(imgDir, req.params.nombre);
  
  // Seguridad: evitar path traversal
  if (!imagenPath.startsWith(imgDir)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  res.sendFile(imagenPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Imagen no encontrada' });
    }
  });
});

// Obtener un producto por ID
router.get('/:id', productoController.obtenerProducto);

// Agregar un nuevo producto (con posible imagen)
router.post('/agregar', upload.single('imagen'), productoController.agregarProducto);

// Editar un producto (con posible cambio de imagen)
router.put('/editar/:id', upload.single('imagen'), productoController.actualizarProducto);

// Eliminar producto y su imagen si existe
router.delete('/eliminar/:id', productoController.eliminarProducto);

module.exports = router;
