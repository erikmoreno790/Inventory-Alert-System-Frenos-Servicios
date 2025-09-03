const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Todas requieren autenticación
router.use(authenticate);

// Acceso según roles (tú puedes ajustarlo)
router.get('/', authorize('admin', 'inventario'), productController.getAllRepuestos);
router.get('/low-stock', authorize('admin', 'inventario'), productController.getLowStockRepuestos);
router.get('/categorias', authorize('admin', 'inventario'), productController.getAllCategorias);
router.get('/proveedores', authorize('admin', 'inventario'), productController.getProviders);
router.get('/:id', authorize('admin', 'inventario'), productController.getRepuestoById);
router.post('/', authorize('admin', 'inventario'), productController.createRepuesto);
router.put('/:id', authorize('admin', 'inventario'), productController.updateRepuesto);
router.delete('/:id', authorize('admin'), productController.deleteRepuesto);
router.patch('/:id/stock', authorize('admin', 'inventario'), productController.updateStock);

//router.get('/movimientos/:id', authorize('admin', 'inventario'), productController.getMovements);

router.get('/searchbyname/:name', authorize('admin', 'inventario'), productController.searchRepuestosByName);
router.get('/searchbycategory/:category', authorize('admin', 'inventario'), productController.searchRepuestosByCategory);

module.exports = router;
