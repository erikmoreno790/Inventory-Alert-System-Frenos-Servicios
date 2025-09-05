
const pool = require('../config/db'); // Conexión a PostgreSQL

const QuotationModel = {
  /**
   * Crear una nueva cotización con sus items
   * @param {Object} quotationData - Datos de la cotización
   * @param {Array} items - Lista de items [{cantidad, descripcion, precio_unitario, total}]
   */
  async createQuotation(quotationData, items = []) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 🔹 Buscar o crear cliente
    let idCliente;
    const clientRes = await client.query(
      `SELECT id_cliente FROM clientes WHERE nombre = $1 LIMIT 1`,
      [quotationData.cliente]
    );
    if (clientRes.rows.length > 0) {
      idCliente = clientRes.rows[0].id_cliente;
    } else {
      const insertClient = await client.query(
        `INSERT INTO clientes (nombre, celular, email) VALUES ($1, $2, $3) RETURNING id_cliente`,
        [quotationData.cliente, quotationData.telefono, quotationData.email]
      );
      idCliente = insertClient.rows[0].id_cliente;
    }

    // 🔹 Buscar o crear vehículo
    let idVehiculo;
    const vehRes = await client.query(
      `SELECT id_vehiculo FROM vehiculos WHERE placa = $1 LIMIT 1`,
      [quotationData.placa]
    );
    if (vehRes.rows.length > 0) {
      idVehiculo = vehRes.rows[0].id_vehiculo;
    } else {
      const insertVeh = await client.query(
        `INSERT INTO vehiculos (id_cliente, placa, marca, modelo, año)
         VALUES ($1, $2, $3, $4, $5) RETURNING id_vehiculo`,
        [idCliente, quotationData.placa, quotationData.marca, quotationData.modelo, quotationData.año]
      );
      idVehiculo = insertVeh.rows[0].id_vehiculo;
    }

    // 🔹 Insertar cotización
    const insertQuotationQuery = `
      INSERT INTO cotizaciones 
        (id_cliente, id_vehiculo, tecnico, kilometraje, fecha, observaciones, estatus, descuento, subtotal, total)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const quotationValues = [
      idCliente,
      idVehiculo,
      quotationData.tecnico,
      quotationData.kilometraje,
      quotationData.fecha || new Date(),
      quotationData.observaciones || null,
      quotationData.estatus || "pendiente",
      quotationData.descuento || 0,
      quotationData.subtotal,
      quotationData.total,
    ];
    const { rows: quotationRows } = await client.query(insertQuotationQuery, quotationValues);
    const quotation = quotationRows[0];

    // 🔹 Insertar items
    const insertItemQuery = `
      INSERT INTO cotizacion_items 
        (id_cotizacion, cantidad, descripcion, precio_unitario, total)
      VALUES ($1, $2, $3, $4, $5);
    `;
    for (const item of items) {
      await client.query(insertItemQuery, [
        quotation.id_cotizacion,
        item.cantidad,
        item.descripcion,
        item.precio_unitario,
        item.total,
      ]);
    }

    await client.query("COMMIT");
    return quotation;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
},


  /**
   * Obtener cotización por ID con items
   */
  async getQuotationById(id) {
    const quotationQuery = `
      SELECT c.*, cl.nombre AS cliente_nombre, v.placa AS vehiculo_placa
      FROM cotizaciones c
      JOIN clientes cl ON c.id_cliente = cl.id_cliente
      JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
      WHERE c.id_cotizacion = $1;
    `;

    const itemsQuery = `
      SELECT * FROM cotizacion_items WHERE id_cotizacion = $1;
    `;

    const quotationResult = await pool.query(quotationQuery, [id]);
    const itemsResult = await pool.query(itemsQuery, [id]);

    if (quotationResult.rows.length === 0) return null;

    return {
      ...quotationResult.rows[0],
      items: itemsResult.rows,
    };
  },

  /**
   * Listar cotizaciones con filtros (cliente, placa, estatus, fecha)
   */
  async getQuotations({ cliente, placa, estatus, fecha }) {
    let baseQuery = `
      SELECT c.id_cotizacion, c.fecha, c.estatus, c.total, cl.nombre AS cliente_nombre, v.placa AS vehiculo_placa
      FROM cotizaciones c
      JOIN clientes cl ON c.id_cliente = cl.id_cliente
      JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (cliente) {
      baseQuery += ` AND cl.nombre ILIKE $${paramIndex++}`;
      params.push(`%${cliente}%`);
    }
    if (placa) {
      baseQuery += ` AND v.placa ILIKE $${paramIndex++}`;
      params.push(`%${placa}%`);
    }
    if (estatus) {
      baseQuery += ` AND c.estatus = $${paramIndex++}`;
      params.push(estatus);
    }
    if (fecha) {
      baseQuery += ` AND c.fecha = $${paramIndex++}`;
      params.push(fecha);
    }

    baseQuery += ` ORDER BY c.fecha DESC;`;

    const { rows } = await pool.query(baseQuery, params);
    return rows;
  },

  /**
   * Actualizar cotización
   */
  async updateQuotation(id, data) {
    const query = `
      UPDATE cotizaciones
      SET tecnico = $1, kilometraje = $2, fecha = $3, observaciones = $4,
          estatus = $5, descuento = $6, subtotal = $7, total = $8
      WHERE id_cotizacion = $9
      RETURNING *;
    `;
    const values = [
      data.tecnico,
      data.kilometraje,
      data.fecha || new Date(),
      data.observaciones,
      data.estatus,
      data.descuento,
      data.subtotal,
      data.total,
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Eliminar cotización (y sus items por ON DELETE CASCADE)
   */
  async deleteQuotation(id) {
    const query = `DELETE FROM cotizaciones WHERE id_cotizacion = $1 RETURNING *;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  /**
   * Agregar item a una cotización
   */
  async addItemToQuotation(idCotizacion, item) {
    const query = `
      INSERT INTO cotizacion_items (id_cotizacion, cantidad, descripcion, precio_unitario, total)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      idCotizacion,
      item.cantidad,
      item.descripcion,
      item.precio_unitario,
      item.total,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Actualizar un item específico
   */
  async updateItem(idItem, data) {
    const query = `
      UPDATE cotizacion_items
      SET cantidad = $1, descripcion = $2, precio_unitario = $3, total = $4
      WHERE id_item = $5
      RETURNING *;
    `;
    const values = [
      data.cantidad,
      data.descripcion,
      data.precio_unitario,
      data.total,
      idItem,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Eliminar un item específico
   */
  async deleteItem(idItem) {
    const query = `DELETE FROM cotizacion_items WHERE id_item = $1 RETURNING *;`;
    const { rows } = await pool.query(query, [idItem]);
    return rows[0];
  },
};

module.exports = QuotationModel;
