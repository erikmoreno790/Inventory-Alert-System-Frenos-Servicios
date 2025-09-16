const pool = require('../config/db');

const EntradaModel = {
  async create({ repuesto_id, cantidad, proveedor, factura, observacion }) {
    const result = await pool.query(
      `INSERT INTO entrada_repuestos (repuesto_id, cantidad, proveedor, factura, observacion) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [repuesto_id, cantidad, proveedor, factura, observacion]
    );

    // Actualizar stock en la tabla repuestos
    await pool.query(
      `UPDATE repuestos SET stock = stock + $1 WHERE repuesto_id = $2`,
      [cantidad, repuesto_id]
    );

    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT e.*, r.nombre AS repuesto_nombre, r.codigo 
       FROM entrada_repuestos e
       JOIN repuestos r ON r.repuesto_id = e.repuesto_id
       ORDER BY e.fecha DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT e.*, r.nombre AS repuesto_nombre, r.codigo 
       FROM entrada_repuestos e
       JOIN repuestos r ON r.repuesto_id = e.repuesto_id
       WHERE e.entrada_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async delete(id) {
    // Recuperar la entrada antes de eliminarla
    const entrada = await this.findById(id);
    if (!entrada) return null;

    await pool.query(`DELETE FROM entrada_repuestos WHERE entrada_id = $1`, [id]);

    // Revertir stock
    await pool.query(
      `UPDATE repuestos SET stock = stock - $1 WHERE repuesto_id = $2`,
      [entrada.cantidad, entrada.repuesto_id]
    );

    return entrada;
  }
};

module.exports = EntradaModel;
