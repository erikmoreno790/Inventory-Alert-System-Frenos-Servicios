const express = require("express");
const router = express.Router();
const quotationItemController = require("../controllers/quotationItemController")
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Todas las rutas requieren autenticación
router.use(authenticate);

// Agregar item a cotización
router.post('/:id_quotation/items', authorize('admin', 'user'), quotationItemController.addItem);

// Listar items de una cotización
router.get('/quotation/:id_quotation', authorize('admin', 'user'), quotationItemController.getItemsByQuotation);

// Actualizar item
router.put('/:id_quotation/items/:id_item', authorize('admin', 'user'), quotationItemController.updateItem);

// Eliminar item
router.delete('/:id_quotation/items/:id_item', authorize('admin', 'user'), quotationItemController.deleteItem);

module.exports = router;
