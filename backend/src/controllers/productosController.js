const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

// Listar todos los productos con descuento aplicado si corresponde
exports.listarProductos = async (req, res) => {
  try {
    // Traer todos los productos
    const [productos] = await pool.query('SELECT * FROM producto');

    // Traer todos los descuentos activos (por producto y por categoría)
    const [descuentos] = await pool.query(`
      SELECT d.*, dp.id_producto, dc.id_categoria
      FROM descuento d
      LEFT JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento
      LEFT JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento
      WHERE d.estado_descuento = 'Activo'
        AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin
    `);

    // Mapear descuentos por producto y por categoría
    const descuentosPorProducto = {};
    const descuentosPorCategoria = {};
    for (const desc of descuentos) {
      if (desc.id_producto) {
        descuentosPorProducto[desc.id_producto] = desc;
      }
      if (desc.id_categoria) {
        descuentosPorCategoria[desc.id_categoria] = desc;
      }
    }

    // Procesar productos para agregar descuento_aplicado y precio_final
    const productosConDescuento = productos.map(prod => {
      let descuento_aplicado = null;
      let precio_final = prod.precio;
      // Prioridad: descuento por producto > descuento por categoría
      let desc = descuentosPorProducto[prod.id_producto] || descuentosPorCategoria[prod.id_categoria];
      if (desc) {
        descuento_aplicado = {
          id_descuento: desc.id_descuento,
          tipo_descuento: desc.tipo_descuento,
          valor: desc.valor,
          aplicacion: desc.aplicacion
        };
        // Asegurarse de que los valores sean numéricos
        const precioBase = Number(prod.precio);
        const valorDescuento = Number(desc.valor);
        // Normalizar el tipo de descuento a minúsculas para evitar errores por mayúsculas
        const tipo = (desc.tipo_descuento || '').toLowerCase();
        if (tipo === 'porcentaje') {
          // Cálculo correcto para porcentaje (ej: 15% de 4.800.000 = 720.000 de descuento)
          precio_final = Math.round(precioBase - (precioBase * valorDescuento / 100));
        } else if (tipo === 'valor' || tipo === 'fijo') {
          precio_final = Math.max(0, precioBase - valorDescuento);
        }
        // Si por algún motivo el precio final es igual al original, forzar a número fijo
        if (precio_final === precioBase) {
          precio_final = Number(precio_final.toFixed(2));
        }
      }
      return {
        ...prod,
        descuento_aplicado,
        precio_final
      };
    });

    res.json(productosConDescuento);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos' });
  }
};

// Listar imágenes en /public/img
// Controlador
exports.listarImagenes = async (req, res) => {
  try {
    const imgDir = path.join(__dirname, '../public/img');
    const files = await fs.promises.readdir(imgDir);
    const imagenes = files.filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f));
    res.json({ imagenes });
  } catch (error) {
    res.status(500).json({ error: 'Error al listar imágenes' });
  }
};


// Obtener un producto por ID
exports.obtenerProducto = async (req, res) => {
  try {
    // 1. Obtener el producto
    const [rows] = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    const prod = rows[0];

    // 2. Traer todos los descuentos activos (por producto y por categoría)
    const [descuentos] = await pool.query(`
      SELECT d.*, dp.id_producto, dc.id_categoria
      FROM descuento d
      LEFT JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento
      LEFT JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento
      WHERE d.estado_descuento = 'Activo'
        AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin
    `);

    // 3. Mapear descuentos por producto y por categoría
    const descuentosPorProducto = {};
    const descuentosPorCategoria = {};
    for (const desc of descuentos) {
      if (desc.id_producto) {
        descuentosPorProducto[desc.id_producto] = desc;
      }
      if (desc.id_categoria) {
        descuentosPorCategoria[desc.id_categoria] = desc;
      }
    }

    // 4. Buscar descuento aplicable
    let descuento_aplicado = null;
    let precio_final = prod.precio;
    let desc = descuentosPorProducto[prod.id_producto] || descuentosPorCategoria[prod.id_categoria];
    if (desc) {
      descuento_aplicado = {
        id_descuento: desc.id_descuento,
        tipo_descuento: desc.tipo_descuento,
        valor: desc.valor,
        aplicacion: desc.aplicacion
      };
      // Asegurarse de que los valores sean numéricos
      const precioBase = Number(prod.precio);
      const valorDescuento = Number(desc.valor);
      // Normalizar el tipo de descuento a minúsculas
      const tipo = (desc.tipo_descuento || '').toLowerCase();
      if (tipo === 'porcentaje') {
        precio_final = Math.round(precioBase - (precioBase * valorDescuento / 100));
      } else if (tipo === 'valor' || tipo === 'fijo') {
        precio_final = Math.max(0, precioBase - valorDescuento);
      }
      if (precio_final === precioBase) {
        precio_final = Number(precio_final.toFixed(2));
      }
    }

    res.json({ ...prod, descuento_aplicado, precio_final });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Agregar un nuevo producto
exports.agregarProducto = async (req, res) => {
  try {
    const {
      numero_serial,
      nombre,
      descripcion,
      precio,
      stock,
      id_categoria,
      id_subcategoria,
      fecha_creacion
    } = req.body;

    const imagen = req.file?.filename || req.body.imagen;

    await pool.query(
      `INSERT INTO producto (numero_serial, nombre, descripcion, precio, stock, id_categoria, id_subcategoria, fecha_creacion, imagen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero_serial, nombre, descripcion, precio, stock, id_categoria, id_subcategoria || null, fecha_creacion, imagen]
    );

    res.json({ message: 'Producto agregado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
};



exports.actualizarProducto = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      numero_serial,
      nombre,
      descripcion,
      precio,
      stock,
      id_categoria,
      id_subcategoria,
      imagen // nombre de imagen (string)
    } = req.body;

    // 1. Obtener el producto actual para tomar la fecha_creacion
    const [rows] = await pool.query(
      "SELECT fecha_creacion, imagen FROM producto WHERE id_producto = ?", [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const fechaCreacionActual = rows[0].fecha_creacion;
    const imagenActual = rows[0].imagen;

    // 2. Gestionar la imagen (igual que antes)
    let nuevaImagen = imagenActual;
    if (req.file) {
      nuevaImagen = req.file.filename;
      // borrar imagen antigua si existe...
    } else if (imagen && imagen !== imagenActual) {
      // Limpiar la imagen para eliminar /img/ si está incluido
      nuevaImagen = imagen.replace(/^\/img\/|^\/?\/?img\//, '');
    }

    // 3. Ejecutar UPDATE usando fechaCreacionActual para no enviarla null
    await pool.query(
      `UPDATE producto SET numero_serial=?, nombre=?, descripcion=?, precio=?, stock=?, id_categoria=?, id_subcategoria=?, fecha_creacion=?, imagen=? WHERE id_producto=?`,
      [
        numero_serial || null,
        nombre,
        descripcion,
        precio,
        stock,
        id_categoria,
        id_subcategoria || null,
        fechaCreacionActual,  // Aquí nunca será null
        nuevaImagen,
        id
      ]
    );

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};



// Eliminar producto y su imagen si existe
exports.eliminarProducto = async (req, res) => {
  try {
    const id = req.params.id;

    // Consultar imagen asociada
    const [rows] = await pool.query('SELECT imagen FROM producto WHERE id_producto = ?', [id]);
    if (rows.length && rows[0].imagen) {
      const filePath = path.join(__dirname, '../public/img', rows[0].imagen);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Eliminar archivo si existe
    }

    await pool.query('DELETE FROM producto WHERE id_producto = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
