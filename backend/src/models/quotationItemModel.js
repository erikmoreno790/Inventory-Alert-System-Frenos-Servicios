// models/quotationItemModel.js
const pool = require('../config/db.js')

const QuotationItemModel = {
    async add(id_quotation, item) {
        const { id_product, cantidad, precio } = item;
        const result = await pool.query(
            `INSERT INTO quotation_items (id_quotation, id_product, cantidad, precio)
       VALUES ($1,$2,$3,$4) RETURNING *`,
            [id_quotation, id_product, cantidad, precio]
        );
        return result.rows[0];
    },

    async findByQuotation(id_quotation) {
        const result = await pool.query(
            `SELECT qi.*, r.nombre AS producto FROM quotation_items qi
       JOIN repuestos r ON qi.id_product = r.id_product
       WHERE qi.id_quotation=$1`,
            [id_quotation]
        );
        return result.rows;
    },

    async update(id_item, data) {
        const { cantidad, precio } = data;
        const result = await pool.query(
            `UPDATE quotation_items SET cantidad=$1, precio=$2 WHERE id_quotation_item=$3 RETURNING *`,
            [cantidad, precio, id_item]
        );
        return result.rows[0];
    },

    async remove(id_item) {
        await pool.query(`DELETE FROM quotation_items WHERE id_quotation_item=$1`, [id_item]);
        return { message: 'Item eliminado' };
    },
};

module.exports = QuotationItemModel;
