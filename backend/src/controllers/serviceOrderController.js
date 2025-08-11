const serviceOrderModel = require('../models/serviceOrderModel');


const create = async (req, res) => {
    try {
        const order = await serviceOrderModel.createServiceOrder(req.body);
        res.status(201).json(order);

    } catch (error) {
        console.error('Error al crear la orden de servicio:', error);
        res.status(500).json({ message: 'Error al crear la orden de servicio' });
    }
}


const getAll = async (req, res) => {
    try {
        const orders = await serviceOrderModel.getAllServiceOrders();
        res.json(orders);
    } catch (error) {
        console.error('Error al obtener las órdenes de servicio:', error);
        res.status(500).json({ message: 'Error al obtener las órdenes de servicio' });
    }
};

const getById = async (req, res) => {
    try {
        const order = await serviceOrderModel.getServiceOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Orden de servicio no encontrada' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Error al obtener la orden de servicio:', error);
        res.status(500).json({ message: 'Error al obtener la orden de servicio' });
    }
}

const update = async (req, res) => {
    try {
        const updatedOrder = await serviceOrderModel.updateServiceOrder(req.params.id, req.body);
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Orden de servicio no encontrada' });
        }
        res.json(updatedOrder);
    }
    catch (error) {
        console.error('Error al actualizar la orden de servicio:', error);
        res.status(500).json({ message: 'Error al actualizar la orden de servicio' });
    }
}

const addUsedParts = async (req, res) => {
    try {
        //Vemos por consola los repuestos recibidos
        console.log('Repuestos recibidos para la orden', req.params.id, ':', req.body.parts);
        const result = await serviceOrderModel.addUsedParts(req.params.id, req.body.parts);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error al agregar repuestos usados:', error);
        res.status(500).json({ message: 'Error al agregar repuestos usados' });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    update,
    addUsedParts
};