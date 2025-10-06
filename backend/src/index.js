const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Importar rutas
const dispositivosRoutes = require('./routes/dispositivos');
const reservasRoutes = require('./routes/reservas');
const bitacorasRoutes = require('./routes/bitacoras');
const monitoreoRoutes = require('./routes/monitoreo');
const videosRoutes = require('./routes/videos');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares de seguridad y configuración
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sistema de Gestión de Robots y Drones - Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas principales de la API
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/bitacoras', bitacorasRoutes);
app.use('/api/monitoreo', monitoreoRoutes);
app.use('/api/videos', videosRoutes);

// Ruta para información general del sistema
app.get('/api/info', (req, res) => {
  res.json({
    sistema: 'Sistema Centralizado de Gestión de Robots y Drones',
    version: '1.0.0',
    descripción: 'API REST para administración y monitoreo de robots y drones universitarios',
    autores: [
      'Nicolás Carreño Tascón',
      'Daniel Felipe Barrera Zapata',
      'Maria Camila Guzman Bolaños'
    ],
    endpoints: [
      '/api/dispositivos - Gestión de robots y drones',
      '/api/reservas - Sistema de reservas',
      '/api/bitacoras - Registro de bitácoras de uso',
      '/api/monitoreo - Monitoreo en tiempo real',
      '/api/videos - Gestión de videos almacenados'
    ]
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe en esta API`,
    availableEndpoints: '/api/info'
  });
});

// Iniciar servidor
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Servidor backend iniciado en puerto ${PORT}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`ℹ️  Información: http://localhost:${PORT}/api/info`);
});

module.exports = app;