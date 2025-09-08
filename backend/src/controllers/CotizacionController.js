const Cotizacion = require('../models/cotizacionModel');
const CotizacionItem = require('../models/cotizacionItemModel');

const cotizacionController = {
    async getAll(req, res) {
        try {
            const cotizaciones = await Cotizacion.getAll();
            res.json(cotizaciones);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const cotizacion = await Cotizacion.getById(id);
            if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });

            const items = await CotizacionItem.getByCotizacionId(id);
            res.json({ ...cotizacion, items });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const nueva = await Cotizacion.create(req.body);
            res.status(201).json(nueva);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const actualizada = await Cotizacion.update(id, req.body);
            res.json(actualizada);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await Cotizacion.delete(id);
            res.json({ message: 'Cotización eliminada' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = cotizacionController;
