// models/QuotationModel.js
// ================================================
// Modelo para gestionar la tabla "quotations"
// CRUD completo + funciones para stock
// ================================================

const pool = require('../config/db'); // Conexión a PostgreSQL

const QuotationModel = {
    /**
     * Crear nueva cotización
     */
    async createQuotation({
        cliente,
        nit,
        telefono,
        email,
        placa,
        vehiculo,
        modelo,
        kilometraje,
        fecha_cotizacion,
        discount,
    }) {
        const query = `
      INSERT INTO quotations (
        cliente, nit, telefono, email, placa, vehiculo, modelo, kilometraje,
        fecha_cotizacion, discount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
      RETURNING id_quotation;
    `;
        const values = [
            cliente,
            nit,
            telefono,
            email,
            placa,
            vehiculo,
            modelo,
            kilometraje,
            discount,
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },
    /**
     * Obtener todas las quotations
     */
    async getAllQuotations() {
        const query = `SELECT * FROM quotations ORDER BY fecha_cotizacion DESC;`;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener cotización por ID con sus items
     */
    async getQuotationById(id) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // 🔹 Buscar la cotización principal
            const quotationQuery = `
      SELECT * FROM quotations WHERE id_quotation = $1;
    `;
            const quotationResult = await client.query(quotationQuery, [id]);

            if (quotationResult.rows.length === 0) return null;

            const quotation = quotationResult.rows[0];

            // 🔹 Obtener los items y unir con la tabla repuestos
            const itemsQuery = `
      SELECT 
        qi.id_quotation_item,
        qi.id_product,
        qi.cantidad,
        qi.precio,
        r.nombre,
        r.descripcion
      FROM quotation_items qi
      JOIN repuestos r ON qi.id_product = r.id_product
      WHERE qi.id_quotation = $1;
    `;
            const itemsResult = await client.query(itemsQuery, [id]);
            quotation.items = itemsResult.rows;

            await client.query("COMMIT");
            return quotation;
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Error al obtener cotización:", error);
            throw error;
        } finally {
            client.release();
        }
    },


    /**
     * Actualizar cotización
     */
    async updateQuotation(id, data) {
        const {
            cliente, nit, telefono, email, placa, vehiculo, modelo,
            fecha_cotizacion, estado, total, kilometraje, subtotal, discount
        } = data;

        const query = `
      UPDATE quotations
      SET cliente=$1, nit=$2, telefono=$3, email=$4,
          placa=$5, vehiculo=$6, modelo=$7,
          fecha_cotizacion=$8, estado=$9, total=$10,
          kilometraje=$11, subtotal=$12, discount=$13
      WHERE id_quotation=$14
      RETURNING *;
    `;

        const result = await pool.query(query, [
            cliente, nit, telefono, email, placa, vehiculo, modelo,
            fecha_cotizacion, estado, total, kilometraje, subtotal, discount, id
        ]);

        return result.rows[0];
    },

    /**
     * Eliminar cotización
     */
    async deleteQuotation(id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`DELETE FROM quotation_items WHERE id_quotation = $1;`, [id]);
            await client.query(`DELETE FROM quotations WHERE id_quotation = $1;`, [id]);

            await client.query('COMMIT');
            return { success: true, message: 'Cotización eliminada correctamente' };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al eliminar cotización:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Buscar quotations por placa
     */
    async findQuotationsByPlaca(placa) {
        const query = `
      SELECT * FROM quotations
      WHERE placa ILIKE $1
      ORDER BY fecha_cotizacion DESC;
    `;
        const result = await pool.query(query, [`%${placa}%`]);
        return result.rows;
    },

    /**
     * Cambiar estado de cotización
     */
    async updateQuotationStatus(id, status) {
        const query = `UPDATE quotations SET estado=$1 WHERE id_quotation=$2 RETURNING *;`;
        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    },

    /**
     * Verificar si hay stock suficiente para cada producto
     * items: [{id_product, quantity}]
     */
    async checkStockAvailability(items) {
        const client = await pool.connect();
        try {
            const insufficientStock = [];

            for (const item of items) {
                const { id_product, quantity } = item;
                const query = `SELECT stock_actual, nombre FROM repuestos WHERE id_product = $1;`;
                const result = await client.query(query, [id_product]);

                if (result.rows.length === 0) {
                    insufficientStock.push({ id_product, message: 'Producto no encontrado' });
                    continue;
                }

                const { stock_actual, nombre } = result.rows[0];
                if (stock_actual < quantity) {
                    insufficientStock.push({
                        id_product,
                        nombre,
                        disponible: stock_actual,
                        requerido: quantity
                    });
                }
            }

            return insufficientStock; // Vacío si todo ok
        } catch (error) {
            console.error('Error al verificar stock:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Actualizar stock al aprobar una cotización
     * Resta la cantidad de cada producto en "repuestos.stock_actual"
     */
    async updateStockOnApproval(quotationId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Obtener los items de la cotización
            const itemsQuery = `SELECT id_product, quantity FROM quotation_items WHERE id_quotation = $1;`;
            const itemsResult = await client.query(itemsQuery, [quotationId]);

            for (const item of itemsResult.rows) {
                const { id_product, quantity } = item;
                await client.query(
                    `UPDATE repuestos
           SET stock_actual = stock_actual - $1
           WHERE id_product = $2;`,
                    [quantity, id_product]
                );
            }

            await client.query('COMMIT');
            return { success: true, message: 'Stock actualizado correctamente' };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al actualizar stock:', error);
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = QuotationModel;