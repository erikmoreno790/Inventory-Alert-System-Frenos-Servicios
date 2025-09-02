const quotationModel = require('../models/quotationModel');
const { approveQuotation } = require('../services/quotationService');
const { addItemToQuotation } = require('../services/quotationService');


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
        const quotations = await quotationModel.getQuotations();
        res.json(quotations);
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ message: 'Error fetching quotations' });
    }
};

const addItemToQuotationHandler = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const { productId, cantidad, precio } = req.body;

        const result = await addItemToQuotation(
            quotationId,
            productId,
            cantidad,
            precio
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

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

// controlador para obtener cotización con productos
const getQuotationWithItems = async (req, res) => {
    try {
        const { quotationId } = req.params;
        const data = await quotationModel.getQuotationWithItems(quotationId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching quotation with items:', error);
        res.status(500).json({ message: 'Error fetching quotation with items' });
    }
};

const approveQuotationHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await approveQuotation(id);
        res.status(200).json({ message: 'Cotización aprobada', serviceOrderId: result.serviceOrderId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }


}


module.exports = {
    newQuotation,
    getAll,
    getById,
    updateQuotation,
    deleteQuotation,
    getQuotationWithItems,
    approveQuotationHandler,
    addItemToQuotationHandler
};