const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MonitoreoController {
  
  async getEstadosMonitoreo(req, res, next) {
    try {
      const { dispositivoId, limit = 100 } = req.query;
      
      const whereClause = {};
      if (dispositivoId) whereClause.dispositivoId = dispositivoId;
      
      const estados = await prisma.estadoMonitoreo.findMany({
        where: whereClause,
        take: parseInt(limit),
        include: {
          dispositivo: { select: { id: true, nombre: true, tipo: true } }
        },
        orderBy: { timestamp: 'desc' }
      });
      
      res.json(estados);
    } catch (error) {
      next(error);
    }
  }
  
  async getEstadoActual(req, res, next) {
    try {
      const { dispositivoId } = req.params;
      
      const estadoActual = await prisma.estadoMonitoreo.findFirst({
        where: { dispositivoId },
        include: {
          dispositivo: { select: { nombre: true, tipo: true, estado: true } }
        },
        orderBy: { timestamp: 'desc' }
      });
      
      if (!estadoActual) {
        return res.status(404).json({
          error: 'No hay datos de monitoreo para este dispositivo'
        });
      }
      
      res.json(estadoActual);
    } catch (error) {
      next(error);
    }
  }
  
  async createEstadoMonitoreo(req, res, next) {
    try {
      const estadoData = req.body;
      
      const nuevoEstado = await prisma.estadoMonitoreo.create({
        data: {
          ...estadoData,
          timestamp: new Date()
        },
        include: {
          dispositivo: { select: { id: true, nombre: true, tipo: true } }
        }
      });
      
      // Actualizar el nivel de batería del dispositivo
      await prisma.dispositivo.update({
        where: { id: estadoData.dispositivoId },
        data: { 
          nivelBateria: estadoData.nivelBateria,
          ubicacionActual: `${estadoData.latitud}, ${estadoData.longitud}`
        }
      });
      
      res.status(201).json({
        message: 'Estado de monitoreo registrado',
        estado: nuevoEstado
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getHistorialMonitoreo(req, res, next) {
    try {
      const { dispositivoId } = req.params;
      const { desde, hasta, limit = 500 } = req.query;
      
      const whereClause = { dispositivoId };
      
      if (desde || hasta) {
        whereClause.timestamp = {};
        if (desde) whereClause.timestamp.gte = new Date(desde);
        if (hasta) whereClause.timestamp.lte = new Date(hasta);
      }
      
      const historial = await prisma.estadoMonitoreo.findMany({
        where: whereClause,
        take: parseInt(limit),
        orderBy: { timestamp: 'desc' }
      });
      
      res.json(historial);
    } catch (error) {
      next(error);
    }
  }
  
  async getMonitoreoTiempoReal(req, res, next) {
    try {
      // Obtener el último estado de cada dispositivo
      const dispositivos = await prisma.dispositivo.findMany({
        where: { estado: { in: ['DISPONIBLE', 'EN_USO'] } },
        include: {
          estadosMonitoreo: {
            take: 1,
            orderBy: { timestamp: 'desc' }
          }
        }
      });
      
      const estadosActuales = dispositivos.map(dispositivo => ({
        dispositivo: {
          id: dispositivo.id,
          nombre: dispositivo.nombre,
          tipo: dispositivo.tipo,
          estado: dispositivo.estado
        },
        ultimoEstado: dispositivo.estadosMonitoreo[0] || null
      }));
      
      res.json(estadosActuales);
    } catch (error) {
      next(error);
    }
  }
  
  async simularMonitoreo(req, res, next) {
    try {
      const { dispositivoId } = req.params;
      const { duracion = 60 } = req.body;
      
      // Verificar que el dispositivo existe
      const dispositivo = await prisma.dispositivo.findUnique({
        where: { id: dispositivoId }
      });
      
      if (!dispositivo) {
        return res.status(404).json({
          error: 'Dispositivo no encontrado'
        });
      }
      
      // Generar datos simulados
      const estadosSimulados = [];
      const startTime = new Date();
      
      for (let i = 0; i < duracion; i += 10) {
        const timestamp = new Date(startTime.getTime() + i * 1000);
        
        const estadoSimulado = {
          dispositivoId,
          latitud: this._randomLatitude(),
          longitud: this._randomLongitude(),
          altitud: dispositivo.tipo === 'DRONE' ? this._randomAltitude() : 0,
          nivelBateria: Math.max(20, 100 - Math.floor(i / 10)),
          velocidadActual: this._randomSpeed(),
          temperatura: this._randomTemperature(),
          sensorOK: Math.random() > 0.05, // 95% probabilidad OK
          camaraOK: Math.random() > 0.02, // 98% probabilidad OK
          gpsOK: Math.random() > 0.01, // 99% probabilidad OK
          señalWiFi: this._randomSignal(),
          señal4G: this._randomSignal(),
          enMovimiento: Math.random() > 0.3,
          modoAutonomo: Math.random() > 0.5,
          timestamp
        };
        
        estadosSimulados.push(estadoSimulado);
      }
      
      // Insertar todos los estados simulados
      await prisma.estadoMonitoreo.createMany({
        data: estadosSimulados
      });
      
      res.json({
        message: `Simulación de monitoreo creada para ${duracion} segundos`,
        estadosGenerados: estadosSimulados.length,
        dispositivo: dispositivo.nombre
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Métodos auxiliares para simulación
  _randomLatitude() {
    return 3.4372 + (Math.random() - 0.5) * 0.01; // Alrededor de Cali
  }
  
  _randomLongitude() {
    return -76.5225 + (Math.random() - 0.5) * 0.01;
  }
  
  _randomAltitude() {
    return Math.random() * 100; // 0-100 metros
  }
  
  _randomSpeed() {
    return Math.random() * 25; // 0-25 km/h
  }
  
  _randomTemperature() {
    return 20 + Math.random() * 15; // 20-35°C
  }
  
  _randomSignal() {
    return Math.floor(Math.random() * 101); // 0-100%
  }
}

module.exports = new MonitoreoController();