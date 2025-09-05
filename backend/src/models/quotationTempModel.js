// quotationModelTemp.js
const pool = require('../config/db');

const QuotationItemSnapshotModel = {
  async create(data) {
    const query = `
      INSERT INTO quotation_items_snapshot (id_quotation, producto, cantidad, precio, subtotal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;
    const values = [data.id_quotation, data.producto, data.cantidad, data.precio, data.subtotal];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteByQuotation(id_quotation) {
    await pool.query(`DELETE FROM quotation_items_snapshot WHERE id_quotation=$1`, [id_quotation]);
    return { message: "Items eliminados" };
  },

  async getByQuotation(id_quotation) {
    const { rows } = await pool.query(`SELECT * FROM quotation_items_snapshot WHERE id_quotation=$1`, [id_quotation]);
    return rows;
  },
};

module.exports = QuotationItemSnapshotModel;

