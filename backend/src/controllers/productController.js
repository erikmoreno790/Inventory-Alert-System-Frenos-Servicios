const productModel = require('../models/productModel');
const { sendLowStockAlert } = require('../utils/emailService');

// Crear un nuevo repuesto
exports.createRepuesto = async (req, res) => {
    try {
        const repuesto = await productModel.createRepuesto(req.body);
        res.status(201).json(repuesto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los repuestos
exports.getAllRepuestos = async (req, res) => {
    try {
        const repuestos = await productModel.getAllRepuestos();
        res.json(repuestos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un repuesto por ID
exports.getRepuestoById = async (req, res) => {
    try {
        const repuesto = await productModel.getRepuestoById(req.params.id);
        if (!repuesto) {
            return res.status(404).json({ error: 'Repuesto no encontrado' });
        }
        res.json(repuesto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un repuesto
exports.deleteRepuesto = async (req, res) => {
    try {
        const result = await productModel.deleteRepuesto(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Repuesto no encontrado' });
        }
        res.json({ message: 'Repuesto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar repuestos por nombre
exports.searchRepuestosByName = async (req, res) => {
    try {
        const repuestos = await productModel.searchRepuestosByName(req.query.name);
        res.json(repuestos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar repuestos por categoría
exports.searchRepuestosByCategory = async (req, res) => {
    try {
        const repuestos = await productModel.searchRepuestosByCategory(req.query.category);
        res.json(repuestos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener repuestos con bajo stock
exports.getLowStockRepuestos = async (req, res) => {
    try {
        const repuestos = await productModel.getLowStockRepuestos();
        res.json(repuestos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un repuesto
exports.updateRepuesto = async (req, res) => {
    try {
        const result = await productModel.updateRepuesto(req.params.id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Repuesto no encontrado' });
        }
        res.json({ message: 'Repuesto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener repuestos por categoría
exports.getRepuestosByCategory = async (req, res) => {
    try {
        const repuestos = await productModel.getRepuestosByCategory(req.params.category);
        res.json(repuestos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las categorías
exports.getAllCategorias = async (req, res) => {
    try {
        const categorias = await productModel.getAllCategorias();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los proveedores
exports.getProviders = async (req, res) => {
    try {
        const providers = await productModel.getProviders();
        res.json(providers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Contar repuestos
exports.countRepuestos = async (req, res) => {
    try {
        const count = await productModel.countRepuestos();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar stock de un repuesto
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        const result = await productModel.updateStock(id, stock);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Repuesto no encontrado' });
        }
        // Opcional: enviar alerta si el stock es bajo
        if (stock < 5) {
            const repuesto = await productModel.getRepuestoById(id);
            await sendLowStockAlert(repuesto);
        }
        res.json({ message: 'Stock actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

