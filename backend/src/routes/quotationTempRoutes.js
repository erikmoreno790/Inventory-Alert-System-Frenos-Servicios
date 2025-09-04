const express = require("express");
const router = express.Router();
const quotationTempController = require("../controllers/quotationTempController")
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Todas requieren autenticación
router.use(authenticate);

// Acceso según roles (tú puedes ajustarlo)
router.post("/", authorize("admin", "user"), quotationTempController.createItem);
router.get("/quotation/:id_quotation", authorize("admin", "user"), quotationTempController.getItemsByQuotation);
router.get("/:id_quotation_item", authorize("admin", "user"), quotationTempController.getItemById);
router.put("/:id_quotation_item", authorize("admin", "user"), quotationTempController.updateItem);
router.delete("/:id_quotation_item", authorize("admin", "user"), quotationTempController.deleteItem);


// Exportar el router
module.exports = router;