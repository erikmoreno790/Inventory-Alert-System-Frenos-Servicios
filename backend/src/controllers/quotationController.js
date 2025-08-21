// importamos el modelo de cotización
const quotationModel = require('../models/quotationModel');
const PDFDocument = require('pdfkit');

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
const downloadQuotationPDF = async (req, res) => {
    try {
        const quotation = await quotationModel.getQuotationById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        const doc = new PDFDocument();
        let filename = `quotation-${quotation.id}.pdf`;
        filename = encodeURIComponent(filename);
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(20).text(`Quotation #${quotation.id}`, { align: 'center' });
        doc.moveDown();

        // Add client details
        doc.fontSize(12).text(`Client: ${quotation.cliente}`);
        doc.text(`NIT: ${quotation.nit}`);
        doc.text(`Phone: ${quotation.telefono}`);
        doc.text(`Email: ${quotation.email}`);
        doc.moveDown();

        // Add vehicle details
        doc.text(`Vehicle Plate: ${quotation.placa}`);
        doc.text(`Vehicle Model: ${quotation.vehiculo} (${quotation.modelo})`);
        doc.text(`Mileage: ${quotation.kilometraje}`);
        doc.text(`Expiration Date: ${new Date(quotation.fechaVencimiento).toLocaleDateString()}`);
        doc.moveDown();

        // Add items
        if (quotation.items && quotation.items.length > 0) {
            doc.text('Items:', { underline: true });
            quotation.items.forEach(item => {
                doc.text(`${item.tipo}: ${item.descripcion} - Qty: ${item.cantidad}, Price: $${item.precio.toFixed(2)}`);
            });
            doc.moveDown();
        }

        // Add totals
        doc.text(`Subtotal: $${quotation.subtotal.toFixed(2)}`);
        doc.text(`Discount: $${quotation.discount.toFixed(2)}`);
        doc.text(`Total: $${quotation.total.toFixed(2)}`);

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF' });
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

module.exports = {
    newQuotation,
    getAll,
    getById,
    downloadQuotationPDF,
    updateQuotation,
    deleteQuotation
};