const pool = require('../config/db');

// Modelo para cotizaciones (quotations)
const QuotationModel = {
    async createQuotation(data) {
        const clientFields = [
            'cliente', 'nit', 'telefono', 'email',
            'placa', 'vehiculo', 'modelo', 'kilometraje', 'fechaVencimiento'
        ];
        const {
            items = [],
            subtotal = 0,
            discount = 0,
            total = 0,
            ...clientData
        } = data;

        // Insertar cotización principal
        const insertQuotationQuery = `
            INSERT INTO quotations (${clientFields.join(', ')}, subtotal, discount, total, created_at)
            VALUES (${clientFields.map((_, i) => `$${i + 1}`).join(', ')}, $${clientFields.length + 1}, $${clientFields.length + 2}, $${clientFields.length + 3}, NOW())
            RETURNING id
        `;
        const values = clientFields.map(f => clientData[f] || null)
            .concat([subtotal, discount, total]);
        const result = await pool.query(insertQuotationQuery, values);
        const quotationId = result.rows[0].id;

        // Insertar items de la cotización
        if (items.length > 0) {
            const insertItemsQuery = `
                INSERT INTO quotation_items
                (quotation_id, tipo, descripcion, cantidad, precio, origen)
                VALUES ${items.map((_, i) =>
                `($1, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5}, $${i * 5 + 6})`
            ).join(', ')}
            `;
            const itemsValues = [];
            items.forEach(item => {
                itemsValues.push(
                    item.tipo,
                    item.descripcion,
                    item.cantidad,
                    item.precio,
                    item.origen || null
                );
            });
            await pool.query(insertItemsQuery, [quotationId, ...itemsValues]);
        }

        return quotationId;
    },

    async getQuotations() {
        const res = await pool.query('SELECT * FROM quotations ORDER BY created_at DESC');
        return res.rows;
    },

    async getQuotationById(id) {
        const quotationRes = await pool.query('SELECT * FROM quotations WHERE id = $1', [id]);
        if (quotationRes.rows.length === 0) return null;
        const itemsRes = await pool.query('SELECT * FROM quotation_items WHERE quotation_id = $1', [id]);
        return {
            ...quotationRes.rows[0],
            items: itemsRes.rows
        };
    }
};

module.exports = QuotationModel;
