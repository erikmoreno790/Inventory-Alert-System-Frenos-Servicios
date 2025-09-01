// importamos el modelo de cotización
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
        const quotations = await quotationModel.getQuotations();
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

// Controlador para descargar cotización como PDF
/*const downloadQuotationPDF = async (req, res) => {
    try {
        console.log("📄 Datos recibidos para PDF:", req.body);
        await generatePDF(req.body, res); // 👈 Ahora es async
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: "Error generating PDF" });
    }
};*/

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

module.exports = {
    newQuotation,
    getAll,
    getById,
    updateQuotation,
    deleteQuotation
};