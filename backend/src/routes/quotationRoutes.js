const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController")
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Todas requieren autenticación
router.use(authenticate);

// Acceso según roles (tú puedes ajustarlo)
router.post("/", authorize("admin", "user"), quotationController.createQuotation);
router.post('/:id/approve', quotationController.changeStatus);
router.post('/:quotationId/items', quotationController.checkStock);
router.get("/", authorize("admin", "user"), quotationController.getAll);
router.get("/:id", authorize("admin", "user"), quotationController.getById);
router.put("/:id", authorize("admin", "user"), quotationController.updateQuotation);
router.delete("/:id", authorize("admin"), quotationController.deleteQuotation);
router.get("/search/:placa", authorize("admin", "user"), quotationController.searchByPlaca);
router.post("/update-stock", authorize("admin"), quotationController.updateStock);


// Exportar el router
module.exports = router;