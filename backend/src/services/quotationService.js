// services/quotationService.js
const pool = require('../config/db');
const { getQuotationWithItems } = require('../models/quotationModel');
const { createServiceOrder } = require('../models/serviceOrderModel');
const { updateStock } = require('../models/productModel');
const { getStock } = require('../models/productModel');

async function approveQuotation(quotationId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Obtener cotización e ítems
        const { quotation, items } = await getQuotationWithItems(quotationId);

        if (!quotation) throw new Error('Cotización no encontrada');
        if (quotation.estado === 'approved') throw new Error('Ya está aprobada');

        // 2. Crear orden de servicio
        const serviceOrderId = await createServiceOrder(client, quotation);

        // 3. Copiar productos a used_parts y actualizar stock
        for (const item of items) {
            if (item.stock_actual < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.nombre}`);
            }

            await client.query(
                `INSERT INTO used_parts (id_service_order, id_product, cantidad)
         VALUES ($1, $2, $3)`,
                [serviceOrderId, item.id_product, item.cantidad]
            );

            await updateStock(client, item.id_product, item.cantidad);
        }

        // 4. Cambiar estado de cotización
        await client.query(
            `UPDATE quotations SET estado = 'approved' WHERE id_quotation = $1`,
            [quotationId]
        );

        await client.query('COMMIT');
        return { serviceOrderId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function addItemToQuotation(quotationId, productId, cantidad, precio) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Consultar stock actual
        const stock = await getStock(productId);
        if (stock === null) throw new Error('Producto no encontrado');

        // 2. Validar stock
        if (cantidad > stock) {
            throw new Error(`Stock insuficiente: disponible ${stock}, solicitado ${cantidad}`);
        }

        // 3. Insertar en quotation_items
        await client.query(
            `INSERT INTO quotation_items (id_quotation, id_product, cantidad, precio)
       VALUES ($1, $2, $3, $4)`,
            [quotationId, productId, cantidad, precio]
        );

        await client.query('COMMIT');
        return { message: 'Producto agregado a la cotización' };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    approveQuotation,
    addItemToQuotation
};
