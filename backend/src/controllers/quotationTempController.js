const QuotationTempModel = require('../models/quotationTempModel');

const quotationTempController = {
    async createQuotationTemp(req, res) {
        try {
            const quotation = await QuotationTempModel.create(req.body);
            res.json(quotation);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAllQuotationsTemp(req, res) {
        try {
            const quotations = await QuotationTempModel.findAll();
            res.json(quotations);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getQuotationTempById(req, res) {
        try {
            const quotation = await QuotationTempModel.findById(req.params.id_quotation);
            res.json(quotation);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async addItem(req, res) {
        try {
            const item = await QuotationTempModel.addItem(req.params.id_quotation, req.body);
            res.json(item);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getItemsByQuotation(req, res) {
        try {
            const items = await QuotationTempModel.getItems(req.params.id_quotation);
            res.json(items);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateItem(req, res) {
        try {
            const updated = await QuotationTempModel.updateItem(req.params.id_item, req.body);
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async removeItem(req, res) {
        try {
            const result = await QuotationTempModel.removeItem(req.params.id_item);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};

module.exports = quotationTempController;