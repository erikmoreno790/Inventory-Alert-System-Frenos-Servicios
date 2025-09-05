const express = require("express");
const router = express.Router();
const QuotationController = require('../controllers/QuotationController');
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Todas requieren autenticación
router.use(authenticate);


router.post('/', authorize("admin","user"), QuotationController.createQuotation);          // Crear cotización
router.get('/', authorize("admin","user"), QuotationController.listQuotations);            // Listar cotizaciones con filtros
router.get('/:id', authorize("admin","user"), QuotationController.getQuotation);           // Obtener cotización por ID
router.put('/:id', authorize("admin","user"), QuotationController.updateQuotation);        // Actualizar cotización
router.delete('/:id', authorize("admin","user"), QuotationController.deleteQuotation);     // Eliminar cotización

// Ítems de cotización
router.post('/:id/items', authorize("admin","user"), QuotationController.addItem);         // Agregar ítem
router.put('/items/:itemId', authorize("admin","user"), QuotationController.updateItem);   // Actualizar ítem
router.delete('/items/:itemId', authorize("admin","user"), QuotationController.deleteItem);// Eliminar ítem


// Exportar el router
module.exports = router;