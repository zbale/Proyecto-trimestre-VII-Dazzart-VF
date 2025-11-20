const db = require('../config/db');
// Obtener los productos en el carrito de un usuario
exports.obtenerCarrito = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [productos] = await db.query(`
      SELECT c.id_carrito, c.id_producto, c.cantidad, p.nombre, p.precio, p.imagen, p.id_categoria
      FROM carrito c
      JOIN producto p ON c.id_producto = p.id_producto
      WHERE c.id_usuario = ?`, [id_usuario]);

    const productosConDescuento = await Promise.all(productos.map(async (prod) => {
      const idProd = prod.id_producto;
      const idCat = prod.id_categoria;
      const precioOriginal = parseFloat(prod.precio);  // Aseguramos tipo
      let precioFinal = precioOriginal;
      let descuentoAplicado = null;

      // Buscar descuento por producto
      const [descProducto] = await db.query(`
        SELECT d.tipo_descuento, d.valor
        FROM descuento d
        JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento
        WHERE dp.id_producto = ? AND d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin`, [idProd]);

      if (descProducto.length > 0) {
        const { tipo_descuento, valor } = descProducto[0];
        const tipo = tipo_descuento.toLowerCase();
        const val = parseFloat(valor);

        descuentoAplicado = { tipo_descuento, valor: val, origen: 'producto' };

        if (tipo === 'porcentaje') {
          precioFinal = Math.round(precioOriginal - (precioOriginal * val / 100));
        } else if (tipo === 'fijo' || tipo === 'valor') {
          precioFinal = Math.max(0, precioOriginal - val);
        }

      } else {
        // Buscar descuento por categoría
        const [descCategoria] = await db.query(`
          SELECT d.tipo_descuento, d.valor
          FROM descuento d
          JOIN descuento_categoria dc ON d.id_descuento = dc.id_descuento
          WHERE dc.id_categoria = ? AND d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin`, [idCat]);

        if (descCategoria.length > 0) {
          const { tipo_descuento, valor } = descCategoria[0];
          const tipo = tipo_descuento.toLowerCase();
          const val = parseFloat(valor);

          descuentoAplicado = { tipo_descuento, valor: val, origen: 'categoria' };

          if (tipo === 'porcentaje') {
            precioFinal = Math.round(precioOriginal - (precioOriginal * val / 100));
          } else if (tipo === 'fijo' || tipo === 'valor') {
            precioFinal = Math.max(0, precioOriginal - val);
          }
        }
      }

      // Aseguramos que precioFinal sea válido
      if (isNaN(precioFinal)) precioFinal = precioOriginal;

      // 🔍 Log para depurar el descuento aplicado
      console.log({
        producto: prod.nombre,
        precio_original: precioOriginal,
        descuento_aplicado: descuentoAplicado,
        precio_final: parseFloat(precioFinal.toFixed(2))
      });

      return {
        ...prod,
        urlImagen: prod.imagen,
        precio_original: precioOriginal,
        precio_final: parseFloat(precioFinal.toFixed(2)),
        descuento_aplicado: descuentoAplicado
      };
    }));

    res.json(productosConDescuento);

  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};
// Agregar un producto al carrito
exports.agregarProducto = async (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;

  try {
    // Verificar si ya está en el carrito
    const [existente] = await db.query(
      'SELECT id_carrito, cantidad FROM carrito WHERE id_usuario = ? AND id_producto = ?',
      [id_usuario, id_producto]
    );

    if (existente.length > 0) {
      // Si ya está, actualiza cantidad
      const nuevaCantidad = existente[0].cantidad + cantidad;
      await db.query('UPDATE carrito SET cantidad = ? WHERE id_carrito = ?', [nuevaCantidad, existente[0].id_carrito]);
      return res.json({ message: 'Cantidad actualizada en el carrito' });
    }

    // Si no está, inserta nuevo
    await db.query(
      'INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)',
      [id_usuario, id_producto, cantidad]
    );
    res.status(201).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
};

// Eliminar un producto del carrito
exports.eliminarProducto = async (req, res) => {
  const { id_carrito } = req.params;
  try {
    await db.query('DELETE FROM carrito WHERE id_carrito = ?', [id_carrito]);
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// Vaciar el carrito de un usuario
exports.vaciarCarrito = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    await db.query('DELETE FROM carrito WHERE id_usuario = ?', [id_usuario]);
    res.json({ message: 'Carrito vaciado correctamente' });
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};
