const express = require('express');
const { body, param, query } = require('express-validator');
const bitacorasController = require('../controllers/bitacorasController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// GET /api/bitacoras - Obtener todas las bitácoras
router.get('/',
  query('dispositivoId').optional().notEmpty().withMessage('ID de dispositivo inválido'),
  query('servicio').optional().isIn(['TRANSPORTE_INTERNO', 'GRABACION_AUDIOVISUAL', 'MONITOREO', 'MANTENIMIENTO']).withMessage('Tipo de servicio inválido'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
  validateRequest,
  bitacorasController.getAllBitacoras
);

// GET /api/bitacoras/:id - Obtener bitácora por ID
router.get('/:id',
  param('id').notEmpty().withMessage('ID de bitácora requerido'),
  validateRequest,
  bitacorasController.getBitacoraById
);

// POST /api/bitacoras - Crear nueva bitácora
router.post('/',
  body('reservaId').notEmpty().withMessage('ID de reserva requerido'),
  body('servicioPrestado').isIn(['TRANSPORTE_INTERNO', 'GRABACION_AUDIOVISUAL', 'MONITOREO', 'MANTENIMIENTO']).withMessage('Tipo de servicio inválido'),
  validateRequest,
  bitacorasController.createBitacora
);

// PATCH /api/bitacoras/:id/salida - Registrar hora de salida
router.patch('/:id/salida',
  param('id').notEmpty().withMessage('ID de bitácora requerido'),
  body('batteryInicio').optional().isInt({ min: 0, max: 100 }).withMessage('Nivel de batería inválido'),
  validateRequest,
  bitacorasController.registrarSalida
);

// PATCH /api/bitacoras/:id/regreso - Registrar hora de regreso
router.patch('/:id/regreso',
  param('id').notEmpty().withMessage('ID de bitácora requerido'),
  body('batteryFin').optional().isInt({ min: 0, max: 100 }).withMessage('Nivel de batería inválido'),
  body('distanciaRecorr').optional().isFloat({ min: 0 }).withMessage('Distancia inválida'),
  body('incidencias').optional().isLength({ max: 1000 }).withMessage('Incidencias muy largas'),
  body('observaciones').optional().isLength({ max: 1000 }).withMessage('Observaciones muy largas'),
  validateRequest,
  bitacorasController.registrarRegreso
);

// GET /api/bitacoras/dispositivo/:dispositivoId - Bitácoras por dispositivo
router.get('/dispositivo/:dispositivoId',
  param('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  validateRequest,
  bitacorasController.getBitacorasByDispositivo
);

// GET /api/bitacoras/estadisticas/resumen - Estadísticas de bitácoras
router.get('/estadisticas/resumen',
  bitacorasController.getBitacorasStats
);

module.exports = router;