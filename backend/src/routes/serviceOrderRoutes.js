const express = require('express');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrderController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Todas requieren autenticación
router.use(authenticate);

// Acceso según roles (ajusta según tus necesidades)
router.get('/', authorize('admin', 'tecnico'), serviceOrderController.getAll);
router.post('/', authorize('admin', 'tecnico'), serviceOrderController.create);
router.get('/:id', authorize('admin', 'tecnico', 'cliente'), serviceOrderController.getById);
router.post('/:id/used-parts', authorize('admin', 'tecnico'), serviceOrderController.addUsedParts);
router.put('/:id', authorize('admin', 'tecnico'), serviceOrderController.update);

module.exports = router;