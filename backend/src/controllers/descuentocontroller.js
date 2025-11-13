const db = require('../config/db');

exports.crearDescuento = async (req, res) => {
  const {
    tipo_descuento,
    valor,
    fecha_inicio,
    fecha_fin,
    estado_descuento,
    aplicacion,
    nombre_producto,
    id_categoria
  } = req.body;

  console.log("Datos del descuento recibidos:", req.body);

  try {
    // Validar campos obligatorios
    if (!tipo_descuento || !valor || !fecha_inicio || !fecha_fin || !estado_descuento || !aplicacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios en el formulario.' });
    }

    // Validar que el valor sea positivo
    if (parseFloat(valor) <= 0) {
      return res.status(400).json({ error: 'El valor del descuento debe ser mayor a 0.' });
    }

    // Validar fechas
    const fechaInicioDate = new Date(fecha_inicio);
    const fechaFinDate = new Date(fecha_fin);
    if (fechaFinDate <= fechaInicioDate) {
      return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio.' });
    }

    let productoId = null;

    //  Validaciones si el descuento es por producto
    if (aplicacion === 'producto') {
      console.log("🔍 Buscando producto:", nombre_producto);

      if (!nombre_producto) {
        return res.status(400).json({ error: 'Debe especificar un nombre de producto.' });
      }

      const [producto] = await db.query(
        `SELECT id_producto, id_categoria FROM producto WHERE nombre = ?`,
        [nombre_producto]
      );

      if (producto.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado en la base de datos.' });
      }

      productoId = producto[0].id_producto;
      const categoriaId = producto[0].id_categoria;

      //  Validaciones si el descuento será Activo
      if (estado_descuento === 'Activo') {
        const [descuentoProductoActivo] = await db.query(
          `SELECT 1 FROM descuento d
           JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento
           WHERE dp.id_producto = ? AND d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin`,
          [productoId]
        );

        if (descuentoProductoActivo.length > 0) {
          return res.status(400).json({
            error: 'Ya existe un descuento activo y vigente directamente para este producto.'
          });
        }

        const [descuentoCategoriaActivo] = await db.query(
          `SELECT 1 FROM descuento d
           JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento
           WHERE dc.id_categoria = ? AND d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin`,
          [categoriaId]
        );

        if (descuentoCategoriaActivo.length > 0) {
          return res.status(400).json({
            error: 'No se puede aplicar descuento al producto porque su categoría ya tiene un descuento activo y vigente.'
          });
        }
      }
    }

    //  Validaciones si el descuento es por categoría
    if (aplicacion === 'categoria') {
      console.log("Validando categoría. ID recibida:", id_categoria);

      if (!id_categoria || isNaN(parseInt(id_categoria))) {
        return res.status(400).json({ error: 'ID de categoría inválido o no enviado.' });
      }

      if (estado_descuento === 'Activo') {
        const [existe] = await db.query(
          `SELECT 1 FROM descuento d
           JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento
           WHERE dc.id_categoria = ? AND d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin`,
          [id_categoria]
        );

        if (existe.length > 0) {
          return res.status(400).json({ error: 'Ya existe un descuento activo y vigente para esta categoría.' });
        }
      }
    }

    // Insertar descuento principal
    const [result] = await db.query(
      `INSERT INTO descuento (tipo_descuento, valor, fecha_inicio, fecha_fin, estado_descuento, aplicacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tipo_descuento, valor, fecha_inicio, fecha_fin, estado_descuento, aplicacion]
    );

    const id_descuento = result.insertId;
    console.log(" Descuento insertado con ID:", id_descuento);

    // Insertar en la tabla intermedia
    if (aplicacion === 'producto') {
      await db.query(
        `INSERT INTO descuento_producto (id_descuento, id_producto) VALUES (?, ?)`,
        [id_descuento, productoId]
      );
      console.log(" Asociado con producto ID:", productoId);
    } else if (aplicacion === 'categoria') {
      await db.query(
        `INSERT INTO descuento_categoria (id_descuento, id_categoria) VALUES (?, ?)`,
        [id_descuento, id_categoria]
      );
      console.log(" Asociado con categoría ID:", id_categoria);
    }

    res.status(201).json({ message: 'Descuento creado correctamente.' });

  } catch (error) {
    console.error(' Error inesperado al crear descuento:', error);
    res.status(500).json({
      error: 'Error interno al crear el descuento. Revisa los datos ingresados o contacta al administrador.',
      detalle: error.message || error
    });
  }
};

//  Listar descuentos //
exports.listarDescuentos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.id_descuento, d.tipo_descuento, d.valor, d.fecha_inicio, d.fecha_fin,
             d.estado_descuento, d.aplicacion,
             p.nombre AS nombre_producto,
             c.nombre_categoria AS nombre_categoria
      FROM descuento d
      LEFT JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento
      LEFT JOIN producto p ON dp.id_producto = p.id_producto
      LEFT JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento
      LEFT JOIN categoria c ON dc.id_categoria = c.id_categoria
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al listar descuentos:', error);
    res.status(500).json({ error: 'Error al obtener descuentos' });
  }
};

// Eliminar descuento//
exports.eliminarDescuento = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM descuento_producto WHERE id_descuento = ?', [id]);
    await db.query('DELETE FROM descuento_categoria WHERE id_descuento = ?', [id]);
    await db.query('DELETE FROM descuento WHERE id_descuento = ?', [id]);

    res.json({ message: 'Descuento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar descuento:', error);
    res.status(500).json({ error: 'Error al eliminar el descuento' });
  }
};

// Obtener descuento por ID (para edición)//
exports.obtenerDescuentoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM descuento WHERE id_descuento = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener descuento:', error);
    res.status(500).json({ error: 'Error al obtener el descuento' });
  }
};
 //Actualizar descuento//
exports.actualizarDescuento = async (req, res) => {
  const { id } = req.params;
  const { tipo_descuento, valor, fecha_inicio, fecha_fin, estado_descuento } = req.body;

  try {
    if (estado_descuento === 'Activo') {
      // Ver si es un descuento aplicado a producto o categoría
      const [productoRelacion] = await db.query(
        `SELECT p.id_producto, p.id_categoria FROM descuento_producto dp
         JOIN producto p ON p.id_producto = dp.id_producto
         WHERE dp.id_descuento = ?`, [id]
      );

      if (productoRelacion.length > 0) {
        const { id_producto, id_categoria } = productoRelacion[0];

        // ¿Este producto ya tiene otro descuento activo?
        const [otroDescuentoActivo] = await db.query(
          `SELECT 1 FROM descuento d
           JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento
           WHERE dp.id_producto = ? AND d.estado_descuento = 'Activo' AND d.id_descuento != ?`,
          [id_producto, id]
        );
        if (otroDescuentoActivo.length > 0) {
          return res.status(400).json({ error: 'Este producto ya tiene otro descuento activo.' });
        }

        // ¿La categoría del producto tiene descuento activo?
        const [categoriaActiva] = await db.query(
          `SELECT 1 FROM descuento d
           JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento
           WHERE dc.id_categoria = ? AND d.estado_descuento = 'Activo'`,
          [id_categoria]
        );
        if (categoriaActiva.length > 0) {
          return res.status(400).json({ error: 'La categoría de este producto ya tiene un descuento activo.' });
        }

      } else {
        // Si no es producto, revisar si es categoría
        const [categoriaRelacion] = await db.query(
          `SELECT dc.id_categoria FROM descuento_categoria dc
           WHERE dc.id_descuento = ?`, [id]
        );

        if (categoriaRelacion.length > 0) {
          const { id_categoria } = categoriaRelacion[0];

          // ¿Esta categoría ya tiene otro descuento activo?
          const [otroDescuentoCategoria] = await db.query(
            `SELECT 1 FROM descuento d
             JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento
             WHERE dc.id_categoria = ? AND d.estado_descuento = 'Activo' AND d.id_descuento != ?`,
            [id_categoria, id]
          );
          if (otroDescuentoCategoria.length > 0) {
            return res.status(400).json({ error: 'Ya existe otro descuento activo para esta categoría.' });
          }

          // ¿Algún producto de la categoría tiene un descuento activo?
          const [productoConDescuento] = await db.query(
            `SELECT 1 FROM descuento d
             JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento
             JOIN producto p ON dp.id_producto = p.id_producto
             WHERE p.id_categoria = ? AND d.estado_descuento = 'Activo'`,
            [id_categoria]
          );
          if (productoConDescuento.length > 0) {
            return res.status(400).json({
              error: 'Algún producto de esta categoría ya tiene un descuento activo.'
            });
          }
        }
      }
    }

    // Si pasa validaciones, actualiza
    await db.query(
      `UPDATE descuento
       SET tipo_descuento = ?, valor = ?, fecha_inicio = ?, fecha_fin = ?, estado_descuento = ?
       WHERE id_descuento = ?`,
      [tipo_descuento, valor, fecha_inicio, fecha_fin, estado_descuento, id]
    );

    res.json({ message: 'Descuento actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar descuento:', error);
    res.status(500).json({ error: 'Error al actualizar el descuento' });
  }
};