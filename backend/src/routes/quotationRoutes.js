const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController")
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Todas requieren autenticación
router.use(authenticate);

// Acceso según roles (tú puedes ajustarlo)
router.post("/", authorize("admin", "user"), quotationController.newQuotation);
router.post('/:id/approve', quotationController.approveQuotationHandler);
router.post('/:quotationId/items', quotationController.addItemToQuotationHandler);
router.get("/", authorize("admin", "user"), quotationController.getAll);
router.get("/:id", authorize("admin", "user"), quotationController.getById);
router.put("/:id", authorize("admin", "user"), quotationController.updateQuotation);
router.delete("/:id", authorize("admin"), quotationController.deleteQuotation);
router.get("/with-items/:id", authorize("admin", "user"), quotationController.getQuotationWithItems);

// Exportar el router
module.exports = router;