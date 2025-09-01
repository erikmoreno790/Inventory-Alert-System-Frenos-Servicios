const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController")
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Todas requieren autenticación
router.use(authenticate);

// Acceso según roles (tú puedes ajustarlo)
router.post("/", authorize("admin", "user"), quotationController.newQuotation);
router.get("/", authorize("admin", "user"), quotationController.getAll);
router.get("/:id", authorize("admin", "user"), quotationController.getById);

// Exportar el router
module.exports = router;