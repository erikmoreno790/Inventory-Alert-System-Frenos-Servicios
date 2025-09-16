const pool = require('../config/db');

const SalidaModel = {
  async create({ repuesto_id, cantidad, destino, observacion }) {
    const result = await pool.query(
      `INSERT INTO salida_repuestos (repuesto_id, cantidad, destino, observacion) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [repuesto_id, cantidad, destino, observacion]
    );

    // Actualizar stock en la tabla repuestos
    await pool.query(
      `UPDATE repuestos SET stock = stock - $1 WHERE repuesto_id = $2`,
      [cantidad, repuesto_id]
    );

    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT s.*, r.nombre AS repuesto_nombre, r.codigo 
       FROM salida_repuestos s
       JOIN repuestos r ON r.repuesto_id = s.repuesto_id
       ORDER BY s.fecha DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT s.*, r.nombre AS repuesto_nombre, r.codigo 
       FROM salida_repuestos s
       JOIN repuestos r ON r.repuesto_id = s.repuesto_id
       WHERE s.salida_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async delete(id) {
    // Recuperar la salida antes de eliminarla
    const salida = await this.findById(id);
    if (!salida) return null;

    await pool.query(`DELETE FROM salida_repuestos WHERE salida_id = $1`, [id]);

    // Revertir stock
    await pool.query(
      `UPDATE repuestos SET stock = stock + $1 WHERE repuesto_id = $2`,
      [salida.cantidad, salida.repuesto_id]
    );

    return salida;
  }
};

module.exports = SalidaModel;
