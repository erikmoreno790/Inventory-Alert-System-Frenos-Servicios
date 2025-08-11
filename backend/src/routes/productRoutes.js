const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Todas requieren autenticación
router.use(authenticate);

// Acceso según roles (tú puedes ajustarlo)
router.get('/', authorize('admin', 'inventario'), productController.getAll);
router.get('/low-stock', authorize('admin', 'inventario'), productController.getLowStock);
router.get('/:id', authorize('admin', 'inventario'), productController.getById);
router.post('/', authorize('admin', 'inventario'), productController.create);
router.put('/:id', authorize('admin', 'inventario'), productController.update);
router.delete('/:id', authorize('admin'), productController.remove);
router.patch('/:id/stock', authorize('admin', 'inventario'), productController.updateProductStock);

router.get('/movimientos/:id', authorize('admin', 'inventario'), productController.getMovements);
router.get('/categorias', authorize('admin', 'inventario'), productController.getCategories);
router.get('/proveedores', authorize('admin', 'inventario'), productController.getProviders);
router.get('/searchbyname/:name', authorize('admin', 'inventario'), productController.getByName);
router.post('/minimal', authorize('admin', 'inventario'), productController.createSimpleProduct);

module.exports = router;
