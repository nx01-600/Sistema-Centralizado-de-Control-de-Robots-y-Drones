/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (error, req, res, next) => {
  console.error('❌ Error capturado:', error);

  // Error de validación de Prisma
  if (error.code === 'P2002') {
    return res.status(400).json({
      error: 'Conflicto de datos únicos',
      message: 'Ya existe un registro con esos datos únicos',
      field: error.meta?.target
    });
  }

  // Error de registro no encontrado en Prisma
  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro no encontrado',
      message: 'El registro solicitado no existe en la base de datos'
    });
  }

  // Error de validación de Express Validator
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'El formato del JSON enviado no es válido'
    });
  }

  // Error de conexión a la base de datos
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Error de conexión',
      message: 'No se puede conectar a la base de datos'
    });
  }

  // Error de archivo demasiado grande
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Archivo demasiado grande',
      message: 'El archivo excede el tamaño máximo permitido'
    });
  }

  // Error de token JWT inválido
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'El token de autenticación no es válido'
    });
  }

  // Error de token JWT expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'El token de autenticación ha expirado'
    });
  }

  // Error personalizado con status
  if (error.status) {
    return res.status(error.status).json({
      error: error.message || 'Error del servidor',
      details: error.details || null
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error inesperado. Por favor contacte al administrador.',
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
};

module.exports = errorHandler;