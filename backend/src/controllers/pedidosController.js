const pool = require('../config/db');  

// Obtener todos los pedidos
exports.obtenerPedidos = async (req, res) => {
  try {
    let query = `
      SELECT 
        p.id_factura,
        p.direccion,
        u.nombre AS nombre_cliente,
        p.productos,
        p.total_productos,
        p.total,
        p.estado,
        p.fecha_pedido`;
    // Si se pide la papelera, incluir fecha_eliminado y filtrar
    if (req.query.papelera === '1') {
      query += ', p.fecha_eliminado FROM pedidos p INNER JOIN usuario u ON p.id_usuario = u.id_usuario WHERE u.id_rol = 2 AND p.en_papelera = 1';
    } else {
      query += ' FROM pedidos p INNER JOIN usuario u ON p.id_usuario = u.id_usuario WHERE u.id_rol = 2';
    }

    const [rows] = await pool.query(query);

    // Parsear productos
    const pedidos = rows.map(p => {
      let parsed = [];
      try {
        parsed = (typeof p.productos === 'string') ? JSON.parse(p.productos || '[]') : (p.productos || []);
      } catch (e) {
        parsed = [];
      }
      return { ...p, productos: parsed };
    });

    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Obtener un pedido por ID
exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        p.id_factura,
        p.direccion,
        u.nombre AS nombre_cliente,
        p.productos,
        p.total_productos,
        p.total,
        p.estado,
        p.fecha_pedido
      FROM pedidos p
      INNER JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_factura = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = rows[0];
    try {
      pedido.productos = (typeof pedido.productos === 'string') ? JSON.parse(pedido.productos || '[]') : (pedido.productos || []);
    } catch (e) {
      pedido.productos = [];
    }

    res.json(pedido);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Crear nuevo pedido
exports.crearPedido = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id_usuario, direccion, productos, total_productos, total } = req.body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'No hay productos en el pedido' });
    }

    await connection.beginTransaction();

    // Verificar stock y descontar
    for (const item of productos) {
      const [rows] = await connection.query(
        'SELECT stock FROM producto WHERE id_producto = ?',
        [item.id_producto]
      );

      if (rows.length === 0) {
        throw new Error(`Producto ID ${item.id_producto} no encontrado`);
      }

      const stockActual = rows[0].stock;
      if (stockActual < item.cantidad) {
        throw new Error(`Stock insuficiente para el producto ID ${item.id_producto}`);
      }

      await connection.query(
        'UPDATE producto SET stock = stock - ? WHERE id_producto = ?',
        [item.cantidad, item.id_producto]
      );
    }

    // Obtener nombres, precios y descuentos igual que en carritoController
    const db = connection;
    const productosConDescuento = await Promise.all(productos.map(async (item) => {
      const [prodRows] = await db.query(
        'SELECT nombre, precio, id_categoria FROM producto WHERE id_producto = ?',
        [item.id_producto]
      );
      const prod = prodRows[0] || {};
      const precioOriginal = parseFloat(prod.precio) || 0;
      let precioFinal = precioOriginal;
      let descuentoAplicado = null;

      // Buscar descuento por producto
      const [descProducto] = await db.query(`
        SELECT d.tipo_descuento, d.valor
        FROM descuento d
        JOIN descuento_producto dp ON d.id_descuento = dp.id_descuento
        WHERE dp.id_producto = ? AND d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin`, [item.id_producto]);

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
          WHERE dc.id_categoria = ? AND d.estado_descuento = 'Activo' AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin`, [prod.id_categoria]);
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
      if (isNaN(precioFinal)) precioFinal = precioOriginal;
      return {
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        nombre: prod.nombre || 'Desconocido',
        precio_original: precioOriginal,
        precio_final: parseFloat(precioFinal.toFixed(2)),
        descuento_aplicado: descuentoAplicado
      };
    }));

    const productosJSON = JSON.stringify(productosConDescuento);

    // Insertar pedido con productos serializados como JSON
    const [result] = await connection.query(
      `INSERT INTO pedidos (id_usuario, direccion, productos, total_productos, total, estado)
       VALUES (?, ?, ?, ?, ?, 'pendiente')`,
      [id_usuario, direccion, productosJSON, total_productos, total]
    );

    await connection.commit();

    res.json({ message: 'Pedido creado exitosamente', id_factura: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: error.message || 'Error al crear el pedido' });
  } finally {
    connection.release();
  }
};

// Obtener pedidos por ID de usuario
exports.obtenerPedidosPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        p.id_factura,
        p.direccion,
        u.nombre AS nombre_cliente,
        p.productos,
        p.total_productos,
        p.total,
        p.estado,
        p.fecha_pedido
      FROM pedidos p
      INNER JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_usuario = ?
    `, [id_usuario]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pedidos para este usuario' });
    }

    const pedidos = rows.map(p => {
      let parsed = [];
      try {
        parsed = (typeof p.productos === 'string') ? JSON.parse(p.productos || '[]') : (p.productos || []);
      } catch (e) {
        parsed = [];
      }
      return { ...p, productos: parsed };
    });

    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Cancelar pedido y reintegrar stock
exports.cancelarPedido = async (req, res) => {
  const { id_factura } = req.params;

  try {
    // Cambiar estado a cancelado y mover a papelera
    const [result] = await pool.query(
      'UPDATE pedidos SET estado = ?, en_papelera = 1, fecha_eliminado = NOW() WHERE id_factura = ?',
      ['cancelado', id_factura]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ message: 'Pedido cancelado y movido a papelera' });
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({ error: 'Error al cancelar el pedido' });
  }
};

// Actualizar estado del pedido
exports.actualizarEstadoPedido = async (req, res) => {
  const { id_factura } = req.params;
  const { nuevo_estado } = req.body;

  const estadosPermitidos = ['en proceso', 'en camino', 'entregado'];

  if (!estadosPermitidos.includes(nuevo_estado)) {
    return res.status(400).json({ error: 'Estado no permitido' });
  }

  try {
    // Verificar existencia, estado actual y si está en papelera
    const [rows] = await pool.query(
      'SELECT estado, en_papelera FROM pedidos WHERE id_factura = ?',
      [id_factura]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = rows[0];

    if (pedido.estado === 'cancelado' || pedido.en_papelera === 1) {
      return res.status(400).json({ error: 'No se puede cambiar el estado de un pedido cancelado, entregado o en papelera' });
    }

    // Si el nuevo estado es entregado, mover a papelera
    if (nuevo_estado === 'entregado') {
      await pool.query(
        'UPDATE pedidos SET estado = ?, en_papelera = 1, fecha_eliminado = NOW() WHERE id_factura = ?',
        [nuevo_estado, id_factura]
      );
    } else {
      // Solo actualizar estado
      await pool.query(
        'UPDATE pedidos SET estado = ? WHERE id_factura = ?',
        [nuevo_estado, id_factura]
      );
    }

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el estado' });
  }
};

// Vaciar papelera: eliminar pedidos en papelera con más de 7 días
exports.vaciarPapelera = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM pedidos WHERE en_papelera = 1 AND fecha_eliminado <= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    res.json({ message: "Pedidos en papelera eliminados definitivamente", deleted: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: "Error al vaciar la papelera" });
  }
};

// Restaurar pedido desde la papelera
exports.restaurarPedido = async (req, res) => {
  const { id_factura } = req.params;
  try {
    await pool.query(
      "UPDATE pedidos SET en_papelera = 0, fecha_eliminado = NULL, estado = 'pendiente' WHERE id_factura = ?",
      [id_factura]
    );
    res.json({ message: "Pedido restaurado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al restaurar el pedido" });
  }
};
