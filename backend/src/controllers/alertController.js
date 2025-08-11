const alertsModel = require('../models/alertModel');

const getAlertByProductId = async (req, res) => {
    try {
        const alert = await alertsModel.getAlertsByProductId(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alerta no encontrada' });
        res.json(alert);
    } catch (error) {
        console.error('Error al obtener alerta:', error);
        res.status(500).json({ message: 'Error al obtener alerta' });
    }
}

const getAll = async (req, res) => {
    try {
        const alerts = await alertsModel.getAllAlerts();
        res.json(alerts);
    } catch (error) {
        console.error('Error al obtener alertas:', error);
        res.status(500).json({ message: 'Error al obtener alertas' });
    }
}

const create = async (req, res) => {
    try {
        const alert = await alertsModel.createAlert(req.body);
        res.status(201).json(alert);
    } catch (error) {
        console.error('Error al crear alerta:', error);
        res.status(500).json({ message: 'Error al crear alerta' });
    }
};

const update = async (req, res) => {
    try {
        const updatedAlert = await alertsModel.updateAlert(req.params.id, req.body);
        if (!updatedAlert) return res.status(404).json({ message: 'Alerta no encontrada' });
        res.json(updatedAlert);
    } catch (error) {
        console.error('Error al actualizar alerta:', error);
        res.status(500).json({ message: 'Error al actualizar alerta' });
    }
};

const remove = async (req, res) => {
    try {
        await alertsModel.deleteAlert(req.params.id);
        res.json({ message: 'Alerta eliminada' });
    } catch (error) {
        console.error('Error al eliminar alerta:', error);
        res.status(500).json({ message: 'Error al eliminar alerta' });
    }
};

module.exports = {
    getAlertByProductId,
    getAll,
    create,
    update,
    remove
};
