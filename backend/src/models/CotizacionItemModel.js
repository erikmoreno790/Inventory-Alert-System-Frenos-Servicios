const pool = require('../config/db');

const CotizacionItem = {
    async getByCotizacionId(idCotizacion) {
        const { rows } = await pool.query(
            `SELECT ci.*, i.descripcion, i.precio_unitario
       FROM cotizacion_items ci
       JOIN items i ON ci.id_item = i.id_item
       WHERE ci.id_cotizacion = $1`,
            [idCotizacion]
        );
        return rows;
    },

    async create(data) {
        const { id_cotizacion, id_item, cantidad, total } = data;
        const { rows } = await pool.query(
            `INSERT INTO cotizacion_items (id_cotizacion, id_item, cantidad, total)
       VALUES ($1,$2,$3,$4) RETURNING *`,
            [id_cotizacion, id_item, cantidad, total]
        );
        return rows[0];
    },

    async update(id, data) {
        const { id_cotizacion, id_item, cantidad, total } = data;
        const { rows } = await pool.query(
            `UPDATE cotizacion_items 
       SET id_cotizacion=$1, id_item=$2, cantidad=$3, total=$4
       WHERE id_cotizacion_item=$5 RETURNING *`,
            [id_cotizacion, id_item, cantidad, total, id]
        );
        return rows[0];
    },

    async delete(id) {
        await pool.query('DELETE FROM cotizacion_items WHERE id_cotizacion_item=$1', [id]);
        return { message: 'Item eliminado' };
    }
};

module.exports = CotizacionItem;
