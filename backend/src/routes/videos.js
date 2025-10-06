const express = require('express');
const { body, param, query } = require('express-validator');
const videosController = require('../controllers/videosController');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// GET /api/videos - Obtener todos los videos
router.get('/',
  query('dispositivoId').optional().notEmpty().withMessage('ID de dispositivo inválido'),
  query('tipoGrabacion').optional().notEmpty().withMessage('Tipo de grabación inválido'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
  validateRequest,
  videosController.getAllVideos
);

// GET /api/videos/:id - Obtener video por ID
router.get('/:id',
  param('id').notEmpty().withMessage('ID de video requerido'),
  validateRequest,
  videosController.getVideoById
);

// POST /api/videos - Registrar nuevo video
router.post('/',
  body('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  body('nombreArchivo').notEmpty().withMessage('Nombre de archivo requerido'),
  body('duracion').isInt({ min: 1 }).withMessage('Duración inválida'),
  body('tamaño').isFloat({ min: 0.1 }).withMessage('Tamaño inválido'),
  body('resolucion').notEmpty().withMessage('Resolución requerida'),
  body('formato').notEmpty().withMessage('Formato requerido'),
  body('ubicacionGrab').notEmpty().withMessage('Ubicación de grabación requerida'),
  body('tipoGrabacion').notEmpty().withMessage('Tipo de grabación requerido'),
  validateRequest,
  videosController.createVideo
);

// PUT /api/videos/:id - Actualizar video
router.put('/:id',
  param('id').notEmpty().withMessage('ID de video requerido'),
  validateRequest,
  videosController.updateVideo
);

// DELETE /api/videos/:id - Eliminar video
router.delete('/:id',
  param('id').notEmpty().withMessage('ID de video requerido'),
  validateRequest,
  videosController.deleteVideo
);

// GET /api/videos/dispositivo/:dispositivoId - Videos por dispositivo
router.get('/dispositivo/:dispositivoId',
  param('dispositivoId').notEmpty().withMessage('ID de dispositivo requerido'),
  validateRequest,
  videosController.getVideosByDispositivo
);

// GET /api/videos/estadisticas/resumen - Estadísticas de videos
router.get('/estadisticas/resumen',
  videosController.getVideosStats
);

// POST /api/videos/:id/simular-subida - Simular subida a la nube
router.post('/:id/simular-subida',
  param('id').notEmpty().withMessage('ID de video requerido'),
  body('cloudProvider').optional().notEmpty().withMessage('Proveedor de nube requerido'),
  validateRequest,
  videosController.simularSubidaNube
);

module.exports = router;