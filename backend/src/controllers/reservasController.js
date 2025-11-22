const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Controlador para gestión de reservas
 */
class ReservasController {
  
  // GET /api/reservas - Obtener todas las reservas
  async getAllReservas(req, res, next) {
    try {
      const { dispositivoId, page = 1, limit = 10 } = req.query;
      
      const whereClause = {};
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
            }
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
          dispositivo: true
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
        reservaData.fechaSalida,
        reservaData.fechaRegreso
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
          dispositivo: true
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
  
  // DELETE /api/reservas/:id - Eliminar reserva
  async cancelReserva(req, res, next) {
    try {
      const { id } = req.params;
      
      await prisma.reserva.delete({
        where: { id }
      });
      
      res.json({
        message: 'Reserva eliminada exitosamente'
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
        orderBy: { fechaSalida: 'desc' }
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
        prisma.reserva.count({ where: { tipoServicio: 'TRANSPORTE_INTERNO' } }),
        prisma.reserva.count({ where: { tipoServicio: 'GRABACION_EVENTO' } }),
        prisma.reserva.count({ where: { tipoServicio: 'MONITOREO' } }),
        prisma.reserva.count({ where: { tipoServicio: 'ENTREGA' } })
      ]);
      
      res.json({
        total: stats[0],
        porTipoServicio: {
          transporteInterno: stats[1],
          grabacionEvento: stats[2],
          monitoreo: stats[3],
          entrega: stats[4]
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Método auxiliar para verificar conflictos (simplificado)
  async _checkConflictos(dispositivoId, fechaSalida, fechaRegreso) {
    return await prisma.reserva.findMany({
      where: {
        dispositivoId,
        OR: [
          {
            fechaSalida: {
              lt: new Date(fechaRegreso)
            },
            fechaRegreso: {
              gt: new Date(fechaSalida)
            }
          }
        ]
      },
      select: {
        id: true,
        fechaSalida: true,
        fechaRegreso: true,
        tipoServicio: true,
        solicitadoPor: true
      }
    });
  }
}

module.exports = new ReservasController();