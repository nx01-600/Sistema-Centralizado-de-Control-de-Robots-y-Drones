const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BitacorasController {
  
  async getAllBitacoras(req, res, next) {
    try {
      const { dispositivoId, servicio, page = 1, limit = 10 } = req.query;
      
      const whereClause = {};
      if (dispositivoId) whereClause.dispositivoId = dispositivoId;
      if (servicio) whereClause.servicioPrestado = servicio;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [bitacoras, total] = await Promise.all([
        prisma.bitacora.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            dispositivo: { select: { id: true, nombre: true, tipo: true } },
            reserva: { select: { id: true, solicitadoPor: true, tipoServicio: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.bitacora.count({ where: whereClause })
      ]);
      
      res.json({
        bitacoras,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getBitacoraById(req, res, next) {
    try {
      const { id } = req.params;
      
      const bitacora = await prisma.bitacora.findUnique({
        where: { id },
        include: {
          dispositivo: true,
          reserva: true
        }
      });
      
      if (!bitacora) {
        return res.status(404).json({
          error: 'Bitácora no encontrada'
        });
      }
      
      res.json(bitacora);
    } catch (error) {
      next(error);
    }
  }
  
  async createBitacora(req, res, next) {
    try {
      const { reservaId, servicioPrestado } = req.body;
      
      // Verificar que la reserva existe
      const reserva = await prisma.reserva.findUnique({
        where: { id: reservaId },
        include: { dispositivo: true }
      });
      
      if (!reserva) {
        return res.status(404).json({
          error: 'Reserva no encontrada'
        });
      }
      
      const nuevaBitacora = await prisma.bitacora.create({
        data: {
          reservaId,
          dispositivoId: reserva.dispositivoId,
          servicioPrestado
        },
        include: {
          dispositivo: true,
          reserva: true
        }
      });
      
      res.status(201).json({
        message: 'Bitácora creada exitosamente',
        bitacora: nuevaBitacora
      });
    } catch (error) {
      next(error);
    }
  }
  
  async registrarSalida(req, res, next) {
    try {
      const { id } = req.params;
      const { batteryInicio } = req.body;
      
      const bitacora = await prisma.bitacora.update({
        where: { id },
        data: {
          horaSalida: new Date(),
          batteryInicio
        }
      });
      
      res.json({
        message: 'Hora de salida registrada',
        bitacora
      });
    } catch (error) {
      next(error);
    }
  }
  
  async registrarRegreso(req, res, next) {
    try {
      const { id } = req.params;
      const { batteryFin, distanciaRecorr, incidencias, observaciones } = req.body;
      
      const bitacora = await prisma.bitacora.findUnique({
        where: { id }
      });
      
      if (!bitacora.horaSalida) {
        return res.status(400).json({
          error: 'Debe registrar la salida primero'
        });
      }
      
      const horaRegreso = new Date();
      const duracionTotal = Math.floor((horaRegreso - new Date(bitacora.horaSalida)) / (1000 * 60));
      
      const bitacoraActualizada = await prisma.bitacora.update({
        where: { id },
        data: {
          horaRegreso,
          duracionTotal,
          batteryFin,
          distanciaRecorr,
          incidencias,
          observaciones
        }
      });
      
      res.json({
        message: 'Hora de regreso registrada',
        bitacora: bitacoraActualizada
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getBitacorasByDispositivo(req, res, next) {
    try {
      const { dispositivoId } = req.params;
      
      const bitacoras = await prisma.bitacora.findMany({
        where: { dispositivoId },
        include: {
          reserva: { select: { id: true, solicitadoPor: true, tipoServicio: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(bitacoras);
    } catch (error) {
      next(error);
    }
  }
  
  async getBitacorasStats(req, res, next) {
    try {
      const stats = await Promise.all([
        prisma.bitacora.count(),
        prisma.bitacora.count({ where: { servicioPrestado: 'TRANSPORTE_INTERNO' } }),
        prisma.bitacora.count({ where: { servicioPrestado: 'GRABACION_AUDIOVISUAL' } }),
        prisma.bitacora.count({ where: { servicioPrestado: 'MONITOREO' } }),
        prisma.bitacora.count({ where: { servicioPrestado: 'MANTENIMIENTO' } }),
        prisma.bitacora.aggregate({
          _avg: { duracionTotal: true },
          _sum: { distanciaRecorr: true }
        })
      ]);
      
      res.json({
        total: stats[0],
        porServicio: {
          transporteInterno: stats[1],
          grabacionAudiovisual: stats[2],
          monitoreo: stats[3],
          mantenimiento: stats[4]
        },
        promedios: {
          duracionPromedio: stats[5]._avg.duracionTotal || 0,
          distanciaTotalRecorrida: stats[5]._sum.distanciaRecorr || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BitacorasController();