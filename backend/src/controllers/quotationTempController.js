const quotationTempModel = require('../models/quotationTempModel');

const QuotationTempController = {
    // Crear un nuevo ítem en la cotización temporal
    async createItem(req, res) {
        try {
            const { id_quotation, producto, cantidad, precio, subtotal } = req.body;
            const newItem = await quotationTempModel.createItem({
                id_quotation,
                producto,
                cantidad,
                precio,
                subtotal
            });
            res.status(201).json(newItem);
        } catch (error) {
            console.error('Error creando ítem:', error);
            res.status(500).json({ message: 'Error creando ítem' });
        }
    },

    // Obtener todos los ítems de una cotización temporal
    async getItemsByQuotation(req, res) {
        try {
            const { id_quotation } = req.params;
            const items = await quotationTempModel.getItemsByQuotation(id_quotation);
            res.status(200).json(items);
        } catch (error) {
            console.error('Error obteniendo ítems:', error);
            res.status(500).json({ message: 'Error obteniendo ítems' });
        }
    },

    // Obtener un ítem específico por ID
    async getItemById(req, res) {
        try {
            const { id_quotation_item } = req.params;
            const item = await quotationTempModel.getItemById(id_quotation_item);
            if (!item) {
                return res.status(404).json({ message: 'Ítem no encontrado' });
            }
            res.status(200).json(item);
        } catch (error) {
            console.error('Error obteniendo ítem:', error);
            res.status(500).json({ message: 'Error obteniendo ítem' });
        }
    },
    // Actualizar un ítem
    async updateItem(req, res) {
        try {
            const { id_quotation_item } = req.params;
            const { producto, cantidad, precio, subtotal } = req.body;
            const updatedItem = await quotationTempModel.updateItem(id_quotation_item, {
                producto,
                cantidad,
                precio,
                subtotal
            });
            if (!updatedItem) {
                return res.status(404).json({ message: 'Ítem no encontrado' });
            }
            res.status(200).json(updatedItem);
        } catch (error) {
            console.error('Error actualizando ítem:', error);
            res.status(500).json({ message: 'Error actualizando ítem' });
        }
    },
    // Eliminar un ítem por ID
    async deleteItem(req, res) {
        try {
            const { id_quotation_item } = req.params;
            const deletedItem = await quotationTempModel.deleteItem(id_quotation_item);
            if (!deletedItem) {
                return res.status(404).json({ message: 'Ítem no encontrado' });
            }
            res.status(200).json({ message: 'Ítem eliminado' });
        } catch (error) {
            console.error('Error eliminando ítem:', error);
            res.status(500).json({ message: 'Error eliminando ítem' });
        }
    },
};

module.exports = QuotationTempController;