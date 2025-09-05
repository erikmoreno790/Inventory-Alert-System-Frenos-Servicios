const QuotationModel = require('../models/QuotationModel');

const QuotationController = {
  // Crear cotización con ítems
  createQuotation: async (req, res) => {
  try {
    console.log("📦 Body recibido:", req.body); // <-- VERIFICA QUÉ LLEGA
    const { cliente, telefono, email, placa, vehiculo, modelo, kilometraje, fechaVencimiento, discountPercent, items } = req.body;

    const quotationData = {
      cliente,
      telefono,
      email,
      placa,
      vehiculo,
      modelo,
      kilometraje,
      fecha: fechaVencimiento,
      descuento: discountPercent,
      subtotal: 0,
      total: 0,
    };

    const quotation = await QuotationModel.createQuotation(quotationData, items);
    res.status(201).json(quotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando la cotización" });
  }
},

  // Obtener cotización por ID
  async getQuotation(req, res) {
    try {
      const { id } = req.params;
      const quotation = await QuotationModel.getQuotationById(id);
      if (!quotation) {
        return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
      }
      res.json({ success: true, quotation });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener la cotización' });
    }
  },

  // Listar cotizaciones con filtros
  async listQuotations(req, res) {
    try {
      const { cliente, placa, estatus, fecha } = req.query;
      const quotations = await QuotationModel.getQuotations({ cliente, placa, estatus, fecha });
      res.json({ success: true, quotations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al listar cotizaciones' });
    }
  },

  // Actualizar cotización
  async updateQuotation(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await QuotationModel.updateQuotation(id, data);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
      }
      res.json({ success: true, quotation: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar la cotización' });
    }
  },

  // Eliminar cotización
  async deleteQuotation(req, res) {
    try {
      const { id } = req.params;
      const deleted = await QuotationModel.deleteQuotation(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
      }
      res.json({ success: true, message: 'Cotización eliminada' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al eliminar la cotización' });
    }
  },

  // Agregar ítem a cotización
  async addItem(req, res) {
    try {
      const { id } = req.params; // ID de la cotización
      const item = req.body;
      const newItem = await QuotationModel.addItemToQuotation(id, item);
      res.status(201).json({ success: true, item: newItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al agregar el ítem' });
    }
  },

  // Actualizar ítem
  async updateItem(req, res) {
    try {
      const { itemId } = req.params;
      const data = req.body;
      const updated = await QuotationModel.updateItem(itemId, data);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Ítem no encontrado' });
      }
      res.json({ success: true, item: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar el ítem' });
    }
  },

  // Eliminar ítem
  async deleteItem(req, res) {
    try {
      const { itemId } = req.params;
      const deleted = await QuotationModel.deleteItem(itemId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Ítem no encontrado' });
      }
      res.json({ success: true, message: 'Ítem eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al eliminar el ítem' });
    }
  },
};

module.exports = QuotationController;
