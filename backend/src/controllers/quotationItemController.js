const QuotationItemModel = require('../models/quotationItemModel');

const quotationItemSnapshotController = {
    async create(req, res) {
        try {
            const { id } = req.params;
            const { producto, cantidad, precio } = req.body;
            const subtotal = cantidad * precio;
            const item = await QuotationItemModel.add({
                id_quotation: id,
                producto,
                cantidad,
                precio,
                subtotal,
            });
            res.status(201).json(item);
        } catch (err) {
            res.status(500).json({ message: "Error al agregar item", error: err.message });
        }
    },

    async deleteByQuotation(req, res) {
        try {
            const { id } = req.params;
            await QuotationItemModel.remove(id);
            res.json({ message: "Items eliminados" });
        } catch (err) {
            res.status(500).json({ message: "Error al eliminar items", error: err.message });
        }
    },

    async getByQuotation(req, res) {
        try {
            const { id } = req.params;
            const items = await QuotationItemModel.findByQuotation(id);
            res.json(items);
        } catch (err) {
            res.status(500).json({ message: "Error al obtener items", error: err.message });
        }
    },
};

module.exports = quotationItemController;
