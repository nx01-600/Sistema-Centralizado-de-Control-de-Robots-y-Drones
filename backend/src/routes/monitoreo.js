const express = require('express');
const { body, param, query } = require('express-validator');
const monitoreoController = require('../controllers/monitoreoController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// GET /api/monitoreo - Obtener estados de monitoreo
router.get('/',
  query('dispositivoId').optional().notEmpty().withMessage('ID de dispositivo inválido'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Límite inválido'),
  validateRequest,
  monitoreoController.getEstadosMonitoreo
);

// GET /api/monitoreo/:dispositivoId/actual - Estado actual de un dispositivo
router.get('/:dispositivoId/actual',
  param('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  validateRequest,
  monitoreoController.getEstadoActual
);

// POST /api/monitoreo - Crear nuevo estado de monitoreo
router.post('/',
  body('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  body('latitud').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitud').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('nivelBateria').isInt({ min: 0, max: 100 }).withMessage('Nivel de batería inválido'),
  body('velocidadActual').isFloat({ min: 0 }).withMessage('Velocidad inválida'),
  validateRequest,
  monitoreoController.createEstadoMonitoreo
);

// GET /api/monitoreo/:dispositivoId/historial - Historial de monitoreo
router.get('/:dispositivoId/historial',
  param('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  query('desde').optional().isISO8601().withMessage('Fecha desde inválida'),
  query('hasta').optional().isISO8601().withMessage('Fecha hasta inválida'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Límite inválido'),
  validateRequest,
  monitoreoController.getHistorialMonitoreo
);

// GET /api/monitoreo/tiempo-real/todos - Monitoreo en tiempo real de todos
router.get('/tiempo-real/todos',
  monitoreoController.getMonitoreoTiempoReal
);

// POST /api/monitoreo/:dispositivoId/simular - Simular datos de monitoreo
router.post('/:dispositivoId/simular',
  param('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  body('duracion').optional().isInt({ min: 1, max: 3600 }).withMessage('Duración inválida (1-3600 segundos)'),
  validateRequest,
  monitoreoController.simularMonitoreo
);

module.exports = router;