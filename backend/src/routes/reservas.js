const express = require('express');
const { body, param, query } = require('express-validator');
const reservasController = require('../controllers/reservasController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Validaciones para crear reserva
const createReservaValidation = [
  body('dispositivoId')
    .notEmpty()
    .withMessage('El ID del dispositivo es obligatorio'),
  
  body('fechaInicio')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida (ISO 8601)')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('La fecha de inicio debe ser futura');
      }
      return true;
    }),
  
  body('fechaFin')
    .isISO8601()
    .withMessage('La fecha de fin debe ser válida (ISO 8601)')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.fechaInicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  
  body('tipoServicio')
    .isIn(['TRANSPORTE_INTERNO', 'GRABACION_AUDIOVISUAL', 'MONITOREO', 'MANTENIMIENTO'])
    .withMessage('Tipo de servicio inválido'),
  
  body('solicitadoPor')
    .notEmpty()
    .withMessage('El nombre del solicitante es obligatorio')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('contacto')
    .notEmpty()
    .withMessage('El contacto es obligatorio'),
  
  body('ubicacionOrigen')
    .notEmpty()
    .withMessage('La ubicación de origen es obligatoria'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
];

// GET /api/reservas - Obtener todas las reservas
router.get('/',
  query('estado').optional().isIn(['PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA']).withMessage('Estado inválido'),
  query('dispositivoId').optional().notEmpty().withMessage('ID de dispositivo inválido'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
  validateRequest,
  reservasController.getAllReservas
);

// GET /api/reservas/:id - Obtener reserva por ID
router.get('/:id',
  param('id').notEmpty().withMessage('ID de reserva requerido'),
  validateRequest,
  reservasController.getReservaById
);

// POST /api/reservas - Crear nueva reserva
router.post('/',
  createReservaValidation,
  validateRequest,
  reservasController.createReserva
);

// PUT /api/reservas/:id - Actualizar reserva
router.put('/:id',
  param('id').notEmpty().withMessage('ID de reserva requerido'),
  body('estado').optional().isIn(['PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA']).withMessage('Estado inválido'),
  validateRequest,
  reservasController.updateReserva
);

// DELETE /api/reservas/:id - Cancelar reserva
router.delete('/:id',
  param('id').notEmpty().withMessage('ID de reserva requerido'),
  validateRequest,
  reservasController.cancelReserva
);

// PATCH /api/reservas/:id/estado - Cambiar estado de reserva
router.patch('/:id/estado',
  param('id').notEmpty().withMessage('ID de reserva requerido'),
  body('estado').isIn(['PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA']).withMessage('Estado inválido'),
  validateRequest,
  reservasController.changeEstado
);

// GET /api/reservas/dispositivo/:dispositivoId - Reservas por dispositivo
router.get('/dispositivo/:dispositivoId',
  param('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  validateRequest,
  reservasController.getReservasByDispositivo
);

// GET /api/reservas/estadisticas/resumen - Estadísticas de reservas
router.get('/estadisticas/resumen',
  reservasController.getReservasStats
);

// GET /api/reservas/conflictos/:dispositivoId - Verificar conflictos de horario
router.get('/conflictos/:dispositivoId',
  param('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  query('fechaInicio').isISO8601().withMessage('Fecha de inicio inválida'),
  query('fechaFin').isISO8601().withMessage('Fecha de fin inválida'),
  validateRequest,
  reservasController.checkConflictos
);

module.exports = router;