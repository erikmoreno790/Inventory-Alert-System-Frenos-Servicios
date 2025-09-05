const express = require("express");
const router = express.Router();
const quotationTempController = require("../controllers/quotationTempController")
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Todas requieren autenticación
router.use(authenticate);

// Agregar item temporal a cotización
router.post("/", authorize("admin", "user"), quotationTempController.createQuotationTemp);
router.post('/:id_quotation/items', authorize('admin', 'user'), quotationTempController.addItem);

// Listar items temporales por cotización
router.get('/quotation/:id_quotation', authorize('admin', 'user'), quotationTempController.getItemsByQuotation);

// Eliminar item temporal
router.delete('/:id_quotation/items/:id_item', authorize('admin', 'user'), quotationTempController.removeItem);
// -----------------------------

// Exportar el router
module.exports = router;