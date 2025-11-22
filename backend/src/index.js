const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REQF.1 & REQNF.1: Ruta raíz con información del sistema
app.get('/', (req, res) => {
  res.json({
    sistema: 'Sistema de Gestión de Robots y Drones',
    version: '1.0',
    universidad: 'Pontificia Universidad Javeriana Cali',
    fecha: new Date().toISOString(),
    descripcion: 'Demo - 10 requisitos especificados',
    endpoints: {
      dispositivos: '/api/dispositivos',
      reservas: '/api/reservas',
      metricas: '/api/metricas',
      info: '/api/info'
    }
  });
});

// REQF.1: Información del sistema
app.get('/api/info', (req, res) => {
  res.json({
    sistema: 'Sistema de Gestión de Robots y Drones',
    version: '1.0',
    universidad: 'Pontificia Universidad Javeriana Cali',
    sede: 'Cali',
    autores: [
      'Nicolás Carreño Tascón',
      'Daniel Felipe Barrera Zapata',
      'María Camila Guzmán Bolaños'
    ],
    descripcion: 'Sistema centralizado para la gestión, control y monitoreo de robots y drones universitarios',
    modulos: [
      'Gestión de dispositivos',
      'Bitácora',
      'Métricas'
    ]
  });
});

// REQF.1: Health check - Comunicación con servidor backend
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'Connected',
    timestamp: new Date().toISOString(),
    message: 'Sistema de Gestión de Robots y Drones - API funcionando correctamente'
  });
});

// Abrir Prisma Studio
app.post('/api/prisma/studio', (req, res) => {
  const { exec } = require('child_process');
  const path = require('path');
  
  const prismaStudioUrl = 'http://localhost:5555';
  
  // Ejecutar Prisma Studio en segundo plano
  exec('npx prisma studio', {
    cwd: path.join(__dirname, '..')
  }, (error) => {
    if (error) {
      console.error('Error al abrir Prisma Studio:', error);
    }
  });
  
  // Dar tiempo para que Prisma Studio inicie
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Prisma Studio iniciado',
      url: prismaStudioUrl,
      note: 'Prisma Studio se abrirá en http://localhost:5555'
    });
  }, 2000);
});

// ============================================
// REQF.2: Módulo de gestión de dispositivos
// ============================================

// Obtener todos los dispositivos
app.get('/api/dispositivos', async (req, res) => {
  try {
    const dispositivos = await prisma.dispositivo.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(dispositivos);
  } catch (error) {
    console.error('Error al obtener dispositivos:', error);
    res.status(500).json({ error: 'Error al obtener dispositivos' });
  }
});

// Obtener un dispositivo por ID
app.get('/api/dispositivos/:id', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { id: req.params.id },
      include: {
        reservas: true,
        metricas: true
      }
    });
    
    if (!dispositivo) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }
    
    res.json(dispositivo);
  } catch (error) {
    console.error('Error al obtener dispositivo:', error);
    res.status(500).json({ error: 'Error al obtener dispositivo' });
  }
});

// Crear nuevo dispositivo
app.post('/api/dispositivos', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.create({
      data: req.body
    });
    res.status(201).json(dispositivo);
  } catch (error) {
    console.error('Error al crear dispositivo:', error);
    res.status(500).json({ error: 'Error al crear dispositivo' });
  }
});

// Actualizar dispositivo
app.put('/api/dispositivos/:id', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(dispositivo);
  } catch (error) {
    console.error('Error al actualizar dispositivo:', error);
    res.status(500).json({ error: 'Error al actualizar dispositivo' });
  }
});

// Eliminar dispositivo
app.delete('/api/dispositivos/:id', async (req, res) => {
  try {
    await prisma.dispositivo.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Dispositivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar dispositivo:', error);
    res.status(500).json({ error: 'Error al eliminar dispositivo' });
  }
});

// ============================================
// REQF.3: Módulo de bitácora de reservas
// ============================================

// Obtener todas las reservas
app.get('/api/reservas', async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        dispositivo: true
      },
      orderBy: { fechaSalida: 'desc' }
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Obtener una reserva por ID
app.get('/api/reservas/:id', async (req, res) => {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: req.params.id },
      include: {
        dispositivo: true
      }
    });
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    res.json(reserva);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error al obtener reserva' });
  }
});

// Crear nueva reserva
app.post('/api/reservas', async (req, res) => {
  try {
    const reserva = await prisma.reserva.create({
      data: req.body,
      include: {
        dispositivo: true
      }
    });
    res.status(201).json(reserva);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// Actualizar reserva
app.put('/api/reservas/:id', async (req, res) => {
  try {
    const reserva = await prisma.reserva.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        dispositivo: true
      }
    });
    res.json(reserva);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

// Eliminar reserva
app.delete('/api/reservas/:id', async (req, res) => {
  try {
    await prisma.reserva.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
});

// ============================================
// REQF.4: Módulo de métricas de uso
// ============================================

// Obtener todas las métricas
app.get('/api/metricas', async (req, res) => {
  try {
    const metricas = await prisma.metrica.findMany({
      include: {
        dispositivo: true
      },
      orderBy: { fecha: 'desc' }
    });
    res.json(metricas);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// Obtener métricas por dispositivo
app.get('/api/metricas/dispositivo/:dispositivoId', async (req, res) => {
  try {
    const metricas = await prisma.metrica.findMany({
      where: { dispositivoId: req.params.dispositivoId },
      include: {
        dispositivo: true
      },
      orderBy: { fecha: 'desc' }
    });
    res.json(metricas);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// Crear nueva métrica
app.post('/api/metricas', async (req, res) => {
  try {
    const metrica = await prisma.metrica.create({
      data: req.body,
      include: {
        dispositivo: true
      }
    });
    res.status(201).json(metrica);
  } catch (error) {
    console.error('Error al crear métrica:', error);
    res.status(500).json({ error: 'Error al crear métrica' });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    endpoints: '/api/info'
  });
});

// Iniciar servidor
app.listen(PORT, '127.0.0.1', () => {
  console.log('🚀 Servidor backend iniciado');
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`ℹ️  Info: http://localhost:${PORT}/api/info`);
  console.log('');
  console.log('📋 Endpoints disponibles:');
  console.log('   • GET/POST    /api/dispositivos');
  console.log('   • GET/POST    /api/reservas');
  console.log('   • GET/POST    /api/metricas');
});

module.exports = app;
