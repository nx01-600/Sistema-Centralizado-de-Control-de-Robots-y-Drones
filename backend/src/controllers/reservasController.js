const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Controlador para gestión de reservas
 */
class ReservasController {
  
  // GET /api/reservas - Obtener todas las reservas
  async getAllReservas(req, res, next) {
    try {
      const { estado, dispositivoId, page = 1, limit = 10 } = req.query;
      
      const whereClause = {};
      if (estado) whereClause.estado = estado;
      if (dispositivoId) whereClause.dispositivoId = dispositivoId;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [reservas, total] = await Promise.all([
        prisma.reserva.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            dispositivo: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                estado: true
              }
            },
            bitacora: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.reserva.count({ where: whereClause })
      ]);
      
      res.json({
        reservas,
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
  
  // GET /api/reservas/:id - Obtener reserva por ID
  async getReservaById(req, res, next) {
    try {
      const { id } = req.params;
      
      const reserva = await prisma.reserva.findUnique({
        where: { id },
        include: {
          dispositivo: true,
          bitacora: true
        }
      });
      
      if (!reserva) {
        return res.status(404).json({
          error: 'Reserva no encontrada',
          message: `No existe una reserva con ID: ${id}`
        });
      }
      
      res.json(reserva);
    } catch (error) {
      next(error);
    }
  }
  
  // POST /api/reservas - Crear nueva reserva
  async createReserva(req, res, next) {
    try {
      const reservaData = req.body;
      
      // Verificar que el dispositivo existe y está disponible
      const dispositivo = await prisma.dispositivo.findUnique({
        where: { id: reservaData.dispositivoId }
      });
      
      if (!dispositivo) {
        return res.status(404).json({
          error: 'Dispositivo no encontrado',
          message: 'El dispositivo especificado no existe'
        });
      }
      
      if (dispositivo.estado !== 'DISPONIBLE') {
        return res.status(400).json({
          error: 'Dispositivo no disponible',
          message: `El dispositivo está en estado: ${dispositivo.estado}`
        });
      }
      
      // Verificar conflictos de horario
      const conflictos = await this._checkConflictos(
        reservaData.dispositivoId,
        reservaData.fechaInicio,
        reservaData.fechaFin
      );
      
      if (conflictos.length > 0) {
        return res.status(409).json({
          error: 'Conflicto de horario',
          message: 'Ya existe una reserva en el horario solicitado',
          conflictos
        });
      }
      
      // Crear la reserva
      const nuevaReserva = await prisma.reserva.create({
        data: reservaData,
        include: {
          dispositivo: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        }
      });
      
      res.status(201).json({
        message: 'Reserva creada exitosamente',
        reserva: nuevaReserva
      });
    } catch (error) {
      next(error);
    }
  }
  
  // PUT /api/reservas/:id - Actualizar reserva
  async updateReserva(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const reservaActualizada = await prisma.reserva.update({
        where: { id },
        data: updateData,
        include: {
          dispositivo: true,
          bitacora: true
        }
      });
      
      res.json({
        message: 'Reserva actualizada exitosamente',
        reserva: reservaActualizada
      });
    } catch (error) {
      next(error);
    }
  }
  
  // DELETE /api/reservas/:id - Cancelar reserva
  async cancelReserva(req, res, next) {
    try {
      const { id } = req.params;
      
      const reserva = await prisma.reserva.findUnique({
        where: { id }
      });
      
      if (!reserva) {
        return res.status(404).json({
          error: 'Reserva no encontrada'
        });
      }
      
      if (reserva.estado === 'COMPLETADA') {
        return res.status(400).json({
          error: 'No se puede cancelar',
          message: 'La reserva ya está completada'
        });
      }
      
      await prisma.reserva.update({
        where: { id },
        data: { estado: 'CANCELADA' }
      });
      
      res.json({
        message: 'Reserva cancelada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // PATCH /api/reservas/:id/estado - Cambiar estado
  async changeEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      const reserva = await prisma.reserva.update({
        where: { id },
        data: { estado },
        include: {
          dispositivo: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });
      
      res.json({
        message: `Estado cambiado a ${estado}`,
        reserva
      });
    } catch (error) {
      next(error);
    }
  }
  
  // GET /api/reservas/dispositivo/:dispositivoId - Reservas por dispositivo
  async getReservasByDispositivo(req, res, next) {
    try {
      const { dispositivoId } = req.params;
      
      const reservas = await prisma.reserva.findMany({
        where: { dispositivoId },
        include: {
          bitacora: true
        },
        orderBy: { fechaInicio: 'desc' }
      });
      
      res.json(reservas);
    } catch (error) {
      next(error);
    }
  }
  
  // GET /api/reservas/estadisticas/resumen - Estadísticas
  async getReservasStats(req, res, next) {
    try {
      const stats = await Promise.all([
        prisma.reserva.count(),
        prisma.reserva.count({ where: { estado: 'PENDIENTE' } }),
        prisma.reserva.count({ where: { estado: 'ACTIVA' } }),
        prisma.reserva.count({ where: { estado: 'COMPLETADA' } }),
        prisma.reserva.count({ where: { estado: 'CANCELADA' } }),
        prisma.reserva.count({ where: { tipoServicio: 'TRANSPORTE_INTERNO' } }),
        prisma.reserva.count({ where: { tipoServicio: 'GRABACION_AUDIOVISUAL' } }),
        prisma.reserva.count({ where: { tipoServicio: 'MONITOREO' } }),
        prisma.reserva.count({ where: { tipoServicio: 'MANTENIMIENTO' } })
      ]);
      
      res.json({
        total: stats[0],
        porEstado: {
          pendientes: stats[1],
          activas: stats[2],
          completadas: stats[3],
          canceladas: stats[4]
        },
        porTipoServicio: {
          transporteInterno: stats[5],
          grabacionAudiovisual: stats[6],
          monitoreo: stats[7],
          mantenimiento: stats[8]
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // GET /api/reservas/conflictos/:dispositivoId - Verificar conflictos
  async checkConflictos(req, res, next) {
    try {
      const { dispositivoId } = req.params;
      const { fechaInicio, fechaFin } = req.query;
      
      const conflictos = await this._checkConflictos(dispositivoId, fechaInicio, fechaFin);
      
      res.json({
        hayConflictos: conflictos.length > 0,
        conflictos
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Método auxiliar para verificar conflictos
  async _checkConflictos(dispositivoId, fechaInicio, fechaFin) {
    return await prisma.reserva.findMany({
      where: {
        dispositivoId,
        estado: { in: ['PENDIENTE', 'ACTIVA'] },
        OR: [
          {
            fechaInicio: {
              lt: new Date(fechaFin)
            },
            fechaFin: {
              gt: new Date(fechaInicio)
            }
          }
        ]
      },
      select: {
        id: true,
        fechaInicio: true,
        fechaFin: true,
        tipoServicio: true,
        solicitadoPor: true
      }
    });
  }
}

module.exports = new ReservasController();