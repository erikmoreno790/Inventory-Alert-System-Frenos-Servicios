const express = require('express');
const router = express.Router();
const cotizacionModel = require('../models/CotizacionModel');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Todas requieren autenticación
router.use(authenticate);

router.post('/', authorize("admin", "user"), cotizacionModel.crearCotizacion);
router.get('/', authorize("admin", "user"), cotizacionModel.mostrarCotizaciones);
router.get('/:id', authorize("admin", "user"), cotizacionModel.verCotizacion);
router.put('/:id', authorize("admin", "user"), cotizacionModel.actualizarCotizacion);

module.exports = router;
