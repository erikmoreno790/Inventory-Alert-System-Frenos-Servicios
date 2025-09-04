// quotationModelTemp.js
const pool = require('../config/db');

/**
 * Modelo para manejar los items de cotizaciones de forma temporal,
 * sin afectar el inventario real en la tabla "repuestos".
 */
const QuotationItemsTempModel = {
    /**
     * Crear un nuevo ítem en la cotización temporal
     * @param {Object} data - Datos del ítem
     * @param {number} data.id_quotation - ID de la cotización
     * @param {string} data.producto - Nombre/descripcion del producto
     * @param {number} data.cantidad - Cantidad cotizada
     * @param {number} data.precio - Precio unitario
     * @param {number} data.subtotal - Subtotal calculado (cantidad * precio)
     */
    async createItem({ id_quotation, producto, cantidad, precio, subtotal }) {
        const query = `
      INSERT INTO quotation_items_snapshot (id_quotation, producto, cantidad, precio, subtotal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        const values = [id_quotation, producto, cantidad, precio, subtotal];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    /**
     * Obtener todos los ítems de una cotización temporal
     * @param {number} id_quotation - ID de la cotización
     */
    async getItemsByQuotation(id_quotation) {
        const query = `
      SELECT * FROM quotation_items_snapshot
      WHERE id_quotation = $1
      ORDER BY id_quotation_item ASC;
    `;
        const { rows } = await pool.query(query, [id_quotation]);
        return rows;
    },

    /**
     * Obtener un ítem específico por ID
     * @param {number} id_quotation_item - ID del ítem
     */
    async getItemById(id_quotation_item) {
        const query = `
      SELECT * FROM quotation_items_snapshot
      WHERE id_quotation_item = $1;
    `;
        const { rows } = await pool.query(query, [id_quotation_item]);
        return rows[0];
    },

    /**
     * Actualizar un ítem
     * @param {number} id_quotation_item - ID del ítem
     * @param {Object} data - Campos a actualizar
     */
    async updateItem(id_quotation_item, { producto, cantidad, precio, subtotal }) {
        const query = `
      UPDATE quotation_items_snapshot
      SET producto = $1,
          cantidad = $2,
          precio = $3,
          subtotal = $4
      WHERE id_quotation_item = $5
      RETURNING *;
    `;
        const values = [producto, cantidad, precio, subtotal, id_quotation_item];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    /**
     * Eliminar un ítem por ID
     * @param {number} id_quotation_item - ID del ítem
     */
    async deleteItem(id_quotation_item) {
        const query = `
      DELETE FROM quotation_items_snapshot
      WHERE id_quotation_item = $1
      RETURNING *;
    `;
        const { rows } = await pool.query(query, [id_quotation_item]);
        return rows[0];
    },

    /**
     * Eliminar todos los ítems de una cotización
     * @param {number} id_quotation - ID de la cotización
     */
    async deleteItemsByQuotation(id_quotation) {
        const query = `
      DELETE FROM quotation_items_snapshot
      WHERE id_quotation = $1;
    `;
        await pool.query(query, [id_quotation]);
        return { message: "Items eliminados correctamente" };
    }
};

module.exports = QuotationItemsTempModel;
