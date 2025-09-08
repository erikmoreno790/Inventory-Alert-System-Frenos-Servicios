const pool = require('../config/db');

const crearCotizacion = async (req, res) => {
  const {
    fecha,
    nombre_cliente,
    vehiculo,
    modelo,
    placa,
    kilometraje,
    nombre_mecanico,
    observaciones,
    estatus,
    porcentaje_descuento,
    descuento,
    subtotal,
    total,
    items
  } = req.body;

  // Normalizar valores vacíos
  const safeValues = {
    fecha: fecha || new Date(),
    nombre_cliente,
    vehiculo: vehiculo || null,
    modelo: modelo || null,
    placa,
    kilometraje: kilometraje ? Number(kilometraje) : null,
    nombre_mecanico: nombre_mecanico || null,
    observaciones: observaciones || "",
    estatus: estatus || "Pendiente",
    porcentaje_descuento: porcentaje_descuento || 0,
    descuento: descuento || 0,
    subtotal: subtotal || 0,
    total: total || 0,
  };

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insertar cotización usando safeValues
    const cotizacionRes = await client.query(
      `INSERT INTO cotizaciones 
        (fecha, nombre_cliente, vehiculo, modelo, placa, kilometraje, nombre_mecanico, observaciones, estatus, porcentaje_descuento, descuento, subtotal, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id_cotizacion`,
      [
        safeValues.fecha,
        safeValues.nombre_cliente,
        safeValues.vehiculo,
        safeValues.modelo,
        safeValues.placa,
        safeValues.kilometraje,
        safeValues.nombre_mecanico,
        safeValues.observaciones,
        safeValues.estatus,
        safeValues.porcentaje_descuento,
        safeValues.descuento,
        safeValues.subtotal,
        safeValues.total
      ]
    );

    const idCotizacion = cotizacionRes.rows[0].id_cotizacion;

    // Insertar items
    for (const item of items) {
      await client.query(
        `INSERT INTO cotizacion_items
          (id_cotizacion, descripcion, cantidad, precio_unitario, total)
         VALUES ($1, $2, $3, $4, $5)`,
        [idCotizacion, item.descripcion, item.cantidad, item.precio_unitario, item.sub_total]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Cotización creada', id: idCotizacion });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error guardando cotización' });
  } finally {
    client.release();
  }
};

const mostrarCotizaciones = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cotizaciones ORDER BY id_cotizacion DESC');
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener cotizaciones' });
  }
};

const verCotizacion = async (req, res) => {
  const { id } = req.params;
  try {
    const cotizacionRes = await pool.query('SELECT * FROM cotizaciones WHERE id_cotizacion = $1', [id]);
    if (cotizacionRes.rows.length === 0) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }
    const itemsRes = await pool.query('SELECT * FROM cotizacion_items WHERE id_cotizacion = $1', [id]);
    const cotizacion = cotizacionRes.rows[0];
    cotizacion.items = itemsRes.rows;
    res.status(200).json(cotizacion);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener cotización' });
  }
};

const actualizarCotizacion = async (req, res) => {
  const {
    id_cotizacion,
    fecha,
    nombre_cliente,
    vehiculo,
    modelo,
    placa,
    kilometraje,
    nombre_mecanico,
    observaciones,
    estatus,
    porcentaje_descuento,
    descuento,
    subtotal,
    total,
    items
  } = req.body;

  const safeValues = {
    fecha: fecha || new Date(),
    nombre_cliente,
    vehiculo: vehiculo || null,
    modelo: modelo || null,
    placa,
    kilometraje: kilometraje ? Number(kilometraje) : null,
    nombre_mecanico: nombre_mecanico || null,
    observaciones: observaciones || "",
    estatus: estatus || "Pendiente",
    porcentaje_descuento: porcentaje_descuento || 0,
    descuento: descuento || 0,
    subtotal: subtotal || 0,
    total: total || 0,
  };

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1️⃣ Actualizar cotización
    await client.query(
      `UPDATE cotizaciones SET
        fecha=$1, nombre_cliente=$2, vehiculo=$3, modelo=$4, placa=$5, kilometraje=$6,
        nombre_mecanico=$7, observaciones=$8, estatus=$9,
        porcentaje_descuento=$10, descuento=$11, subtotal=$12, total=$13
       WHERE id_cotizacion=$14`,
      [
        safeValues.fecha,
        safeValues.nombre_cliente,
        safeValues.vehiculo,
        safeValues.modelo,
        safeValues.placa,
        safeValues.kilometraje,
        safeValues.nombre_mecanico,
        safeValues.observaciones,
        safeValues.estatus,
        safeValues.porcentaje_descuento,
        safeValues.descuento,
        safeValues.subtotal,
        safeValues.total,
        id_cotizacion
      ]
    );

    // 2️⃣ Manejar items
    // a) Obtener ids actuales de la DB
    const existingItemsRes = await client.query(
      'SELECT id_cotizacion_item FROM cotizacion_items WHERE id_cotizacion=$1',
      [id_cotizacion]
    );
    const existingIds = existingItemsRes.rows.map(r => r.id_cotizacion_item);

    // b) Separar items a actualizar vs insertar
    const itemsToUpdate = items.filter(i => i.id_cotizacion_item); // tienen id
    const itemsToInsert = items.filter(i => !i.id_cotizacion_item); // nuevos

    // Actualizar items existentes
    for (const item of itemsToUpdate) {
      await client.query(
        `UPDATE cotizacion_items SET
          descripcion=$1, cantidad=$2, precio_unitario=$3, total=$4
         WHERE id_cotizacion_item=$5`,
        [item.descripcion, item.cantidad, item.precio_unitario, item.sub_total, item.id_cotizacion_item]
      );
    }

    // Insertar nuevos items
    for (const item of itemsToInsert) {
      await client.query(
        `INSERT INTO cotizacion_items
          (id_cotizacion, descripcion, cantidad, precio_unitario, total)
         VALUES ($1,$2,$3,$4,$5)`,
        [id_cotizacion, item.descripcion, item.cantidad, item.precio_unitario, item.sub_total]
      );
    }

    // Eliminar items que fueron removidos
    const updatedIds = itemsToUpdate.map(i => i.id_cotizacion_item);
    const idsToDelete = existingIds.filter(id => !updatedIds.includes(id));
    if (idsToDelete.length > 0) {
      await client.query(
        `DELETE FROM cotizacion_items WHERE id_cotizacion_item = ANY($1)`,
        [idsToDelete]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Cotización actualizada', id: id_cotizacion });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error actualizando cotización' });
  } finally {
    client.release();
  }
};

module.exports = { crearCotizacion, mostrarCotizaciones, verCotizacion, actualizarCotizacion };
