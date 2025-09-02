const pool = require('../config/db');

const QuotationModel = {
    // Crear una nueva cotización
    async createQuotation(data) {
        const clientFields = [
            "cliente",
            "nit",
            "telefono",
            "email",
            "placa",
            "vehiculo",
            "modelo",
            "kilometraje",
            "fecha_cotizacion",
            "subtotal",
            "discount"
        ];

        const { items = [], total = 0, ...clientData } = data;

        // Insertar cotización principal
        const insertQuotationQuery = `
      INSERT INTO quotations (${clientFields.join(", ")}, estado, total)
      VALUES (${clientFields.map((_, i) => `$${i + 1}`).join(", ")}, 'pending', $${clientFields.length + 1
            })
      RETURNING id_quotation
    `;

        const values = clientFields.map((f) => clientData[f] || null).concat([total]);
        const result = await pool.query(insertQuotationQuery, values);
        const quotationId = result.rows[0].id_quotation;

        // Insertar productos de la cotización
        if (items.length > 0) {
            const insertItemsQuery = `
        INSERT INTO quotation_items
        (id_quotation, id_product, descripcion, cantidad, precio, origen) //TODO: Modificar esquema de BD para agregar campo 'origen'
        VALUES ${items
                    .map(
                        (_, i) =>
                            `($1, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5}, $${i * 5 + 6
                            })`
                    )
                    .join(", ")}
      `;
            const itemsValues = [];
            items.forEach((item) => {
                itemsValues.push(
                    item.id_product,
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

    // Listar cotizaciones
    async getQuotations() {
        const res = await pool.query(
            "SELECT * FROM quotations ORDER BY fecha_cotizacion DESC"
        );
        return res.rows;
    },

    // Obtener cotización por ID
    async getQuotationById(id) {
        const quotationRes = await pool.query(
            "SELECT * FROM quotations WHERE id_quotation = $1",
            [id]
        );
        if (quotationRes.rows.length === 0) return null;

        const itemsRes = await pool.query(
            "SELECT * FROM quotation_items WHERE id_quotation = $1",
            [id]
        );

        return { ...quotationRes.rows[0], items: itemsRes.rows };
    },

    // Obtener cotización con datos de productos
    async getQuotationWithItems(quotationId) {
        const quotationRes = await pool.query(
            "SELECT * FROM quotations WHERE id_quotation = $1",
            [quotationId]
        );
        const itemsRes = await pool.query(
            `SELECT qi.*, p.nombre, p.stock_actual
       FROM quotation_items qi
       JOIN products p ON qi.id_product = p.id_product
       WHERE qi.id_quotation = $1`,
            [quotationId]
        );
        return { quotation: quotationRes.rows[0], items: itemsRes.rows };
    },
};

module.exports = QuotationModel;
