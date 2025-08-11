const productModel = require('../models/productModel');
const { sendLowStockAlert } = require('../utils/emailService');

const create = async (req, res) => {
    const product = await productModel.createProduct(req.body);
    res.status(201).json(product);
};

// crea un producto con solo el nombre
const createSimpleProduct = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nombre del producto es requerido' });
    const product = await productModel.createProductWithName(name);
    res.status(201).json(product);
};

const getAll = async (req, res) => {
    const products = await productModel.getAllProducts();
    res.json(products);
};

const getById = async (req, res) => {
    const product = await productModel.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
};

// Busca el producto por nombre 
const getByName = async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: 'Nombre del producto es requerido' });
    const product = await productModel.getProductByName(name);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
};

const update = async (req, res) => {
    const updated = await productModel.updateProduct(req.params.id, req.body);
    res.json(updated);
};

const remove = async (req, res) => {
    await productModel.deleteProduct(req.params.id);
    res.json({ message: 'Producto eliminado' });
};

const getLowStock = async (req, res) => {
    const products = await productModel.getLowStockProducts();
    res.json(products);
};

const getCategories = async (req, res) => {
    const categories = await productModel.getAllCategories();
    res.json(categories);
};

const getProviders = async (req, res) => {
    const providers = await productModel.getAllProviders();
    res.json(providers);
};

const updateProductStock = async (req, res) => {
    const { cantidad, operacion } = req.body; // operacion: 'sumar' o 'restar'
    const { id } = req.params;

    if (!['sumar', 'restar'].includes(operacion)) {
        return res.status(400).json({ message: 'Operación inválida. Usa "sumar" o "restar"' });
    }

    try {
        const updated = await updateStock(id, cantidad, operacion);

        if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });

        let alerta = null;
        if (updated.stock_actual < updated.stock_minimo) {

            await createNotification({
                user_id: null, // o puedes poner el ID del responsable de inventario
                message: `⚠️ Stock bajo: ${updated.name} (${updated.stock_actual}/${updated.stock_minimo})`
            });

            await sendLowStockAlert(updated, ['inventario@empresa.com', 'compras@empresa.com']);
        }

        res.json({ message: 'Stock actualizado', producto: updated, alerta });
    } catch (err) {
        res.status(500).json({ message: 'Error actualizando stock', error: err.message });
    }
};

const getMovements = async (req, res) => {
    const { id } = req.params;
    const movements = await productModel.getMovementsByProductId(id);
    if (!movements) return res.status(404).json({ message: 'Movimientos no encontrados para este producto' });
    res.json(movements);
};


module.exports = {
    create, createSimpleProduct, getAll, getById, update, remove, getLowStock, getByName, updateProductStock, getMovements, getCategories, getProviders
};
