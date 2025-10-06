const express = require('express');
const { body, param, query } = require('express-validator');
const dispositivosController = require('../controllers/dispositivosController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Validaciones para crear dispositivo
const createDeviceValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  
  body('tipo')
    .isIn(['ROBOT', 'DRONE'])
    .withMessage('El tipo debe ser ROBOT o DRONE'),
  
  body('modelo')
    .notEmpty()
    .withMessage('El modelo es obligatorio'),
  
  body('numeroSerie')
    .notEmpty()
    .withMessage('El número de serie es obligatorio'),
  
  body('pesoMaximoCarga')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El peso máximo debe ser un número positivo'),
  
  body('autonomiaMaxima')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La autonomía máxima debe ser un número entero positivo'),
  
  body('velocidadMaxima')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La velocidad máxima debe ser un número positivo'),
  
  body('alturaMaxima')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La altura máxima debe ser un número positivo')
];

// Validaciones para actualizar dispositivo
const updateDeviceValidation = [
  param('id').notEmpty().withMessage('ID del dispositivo requerido'),
  body('estado')
    .optional()
    .isIn(['DISPONIBLE', 'EN_USO', 'MANTENIMIENTO', 'FUERA_DE_SERVICIO'])
    .withMessage('Estado inválido'),
  
  body('ubicacionActual')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres'),
  
  body('nivelBateria')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('El nivel de batería debe estar entre 0 y 100')
];

// Rutas CRUD para dispositivos

// GET /api/dispositivos - Obtener todos los dispositivos
router.get('/', 
  query('tipo').optional().isIn(['ROBOT', 'DRONE']).withMessage('Tipo inválido'),
  query('estado').optional().isIn(['DISPONIBLE', 'EN_USO', 'MANTENIMIENTO', 'FUERA_DE_SERVICIO']).withMessage('Estado inválido'),
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
  validateRequest,
  dispositivosController.getAllDevices
);

// GET /api/dispositivos/:id - Obtener dispositivo por ID
router.get('/:id',
  param('id').notEmpty().withMessage('ID del dispositivo requerido'),
  validateRequest,
  dispositivosController.getDeviceById
);

// POST /api/dispositivos - Crear nuevo dispositivo
router.post('/',
  createDeviceValidation,
  validateRequest,
  dispositivosController.createDevice
);

// PUT /api/dispositivos/:id - Actualizar dispositivo completo
router.put('/:id',
  updateDeviceValidation,
  validateRequest,
  dispositivosController.updateDevice
);

// PATCH /api/dispositivos/:id - Actualizar parcialmente dispositivo
router.patch('/:id',
  param('id').notEmpty().withMessage('ID del dispositivo requerido'),
  validateRequest,
  dispositivosController.patchDevice
);

// DELETE /api/dispositivos/:id - Eliminar dispositivo
router.delete('/:id',
  param('id').notEmpty().withMessage('ID del dispositivo requerido'),
  validateRequest,
  dispositivosController.deleteDevice
);

// Rutas específicas

// GET /api/dispositivos/:id/disponibilidad - Verificar disponibilidad
router.get('/:id/disponibilidad',
  param('id').notEmpty().withMessage('ID del dispositivo requerido'),
  validateRequest,
  dispositivosController.checkAvailability
);

// PATCH /api/dispositivos/:id/bateria - Actualizar nivel de batería
router.patch('/:id/bateria',
  param('id').notEmpty().withMessage('ID del dispositivo requerido'),
  body('nivelBateria').isInt({ min: 0, max: 100 }).withMessage('Nivel de batería inválido'),
  validateRequest,
  dispositivosController.updateBattery
);

// PATCH /api/dispositivos/:id/ubicacion - Actualizar ubicación
router.patch('/:id/ubicacion',
  param('id').notEmpty().withMessage('ID del dispositivo requerido'),
  body('ubicacion').notEmpty().withMessage('La ubicación es obligatoria'),
  validateRequest,
  dispositivosController.updateLocation
);

// GET /api/dispositivos/estadisticas/resumen - Obtener estadísticas generales
router.get('/estadisticas/resumen',
  dispositivosController.getDeviceStats
);

// GET /api/dispositivos/tipo/:tipo - Obtener dispositivos por tipo
router.get('/tipo/:tipo',
  param('tipo').isIn(['ROBOT', 'DRONE']).withMessage('Tipo inválido'),
  validateRequest,
  dispositivosController.getDevicesByType
);

// GET /api/dispositivos/disponibles/ahora - Obtener dispositivos disponibles ahora
router.get('/disponibles/ahora',
  dispositivosController.getAvailableDevices
);

module.exports = router;