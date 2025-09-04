const quotationModel = require('../models/quotationModel');


const newQuotation = async (req, res) => {
    try {
        const quotationId = await quotationModel.createQuotation(req.body);
        res.status(201).json({ id: quotationId });
    } catch (error) {
        console.error('Error creating quotation:', error);
        res.status(500).json({ message: 'Error creating quotation' });
    }
}

const getAll = async (req, res) => {
    try {
        const quotations = await quotationModel.getAllQuotations();
        res.json(quotations);
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ message: 'Error fetching quotations' });
    }
};


const getById = async (req, res) => {
    try {
        const quotation = await quotationModel.getQuotationById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.json(quotation);
    } catch (error) {
        console.error('Error fetching quotation:', error);
        res.status(500).json({ message: 'Error fetching quotation' });
    }
};

const updateQuotation = async (req, res) => {
    try {
        const updatedQuotation = await quotationModel.updateQuotation(req.params.id, req.body);
        if (!updatedQuotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.json(updatedQuotation);
    } catch (error) {
        console.error('Error updating quotation:', error);
        res.status(500).json({ message: 'Error updating quotation' });
    }
};

const deleteQuotation = async (req, res) => {
    try {
        const deleted = await quotationModel.deleteQuotation(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting quotation:', error);
        res.status(500).json({ message: 'Error deleting quotation' });
    }
};


// Controlador para buscar cotizaciones por placa
const searchByPlaca = async (req, res) => {
    try {
        const { placa } = req.query;
        const quotations = await quotationModel.findQuotationsByPlaca(placa);
        res.json(quotations);
    } catch (error) {
        console.error('Error searching quotations by placa:', error);
        res.status(500).json({ message: 'Error searching quotations by placa' });
    }
};

// Controlador para cambiar el estado de una cotización
const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedQuotation = await quotationModel.updateQuotationStatus(id, status);
        if (!updatedQuotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.json(updatedQuotation);
    } catch (error) {
        console.error('Error updating quotation status:', error);
        res.status(500).json({ message: 'Error updating quotation status' });
    }
};

// Controlador para verificar disponibilidad de stock
const checkStock = async (req, res) => {
    try {
        const { items } = req.body; // items: [{id_product, quantity}]
        const insufficientStock = await quotationModel.checkStockAvailability(items);
        res.json({ insufficientStock });
    } catch (error) {
        console.error('Error checking stock availability:', error);
        res.status(500).json({ message: 'Error checking stock availability' });
    }
};

// Controlador para actualizar stock al aprobar una cotización
const updateStock = async (req, res) => {
    try {
        const { items } = req.body; // items: [{id_product, quantity}]
        await quotationModel.updateStockOnApproval(items);
        res.json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Error updating stock' });
    }
};





module.exports = {
    newQuotation,
    getAll,
    getById,
    updateQuotation,
    deleteQuotation,
    searchByPlaca,
    changeStatus,
    checkStock,
    updateStock
};