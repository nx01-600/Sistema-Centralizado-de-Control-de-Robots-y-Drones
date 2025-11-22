const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Controlador para gestión de dispositivos (robots y drones)
 */
class DispositivosController {
  
  // GET /api/dispositivos - Obtener todos los dispositivos con filtros
  async getAllDevices(req, res, next) {
    try {
      const { tipo, estado, page = 1, limit = 10 } = req.query;
      
      const whereClause = {};
      if (tipo) whereClause.tipo = tipo;
      if (estado) whereClause.estado = estado;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [dispositivos, total] = await Promise.all([
        prisma.dispositivo.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            _count: {
              select: {
                reservas: true,
                metricas: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.dispositivo.count({ where: whereClause })
      ]);
      
      res.json({
        dispositivos,
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
  
  // GET /api/dispositivos/:id - Obtener dispositivo por ID
  async getDeviceById(req, res, next) {
    try {
      const { id } = req.params;
      
      const dispositivo = await prisma.dispositivo.findUnique({
        where: { id },
        include: {
          reservas: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          metricas: {
            orderBy: { fecha: 'desc' },
            take: 5
          },
          _count: {
            select: {
              reservas: true,
              metricas: true
            }
          }
        }
      });
      
      if (!dispositivo) {
        return res.status(404).json({
          error: 'Dispositivo no encontrado',
          message: `No existe un dispositivo con ID: ${id}`
        });
      }
      
      res.json(dispositivo);
    } catch (error) {
      next(error);
    }
  }
  
  // POST /api/dispositivos - Crear nuevo dispositivo
  async createDevice(req, res, next) {
    try {
      const dispositivoData = req.body;
      
      const nuevoDispositivo = await prisma.dispositivo.create({
        data: {
          ...dispositivoData,
          fechaAdquisicion: new Date()
        }
      });
      
      res.status(201).json({
        message: 'Dispositivo creado exitosamente',
        dispositivo: nuevoDispositivo
      });
    } catch (error) {
      next(error);
    }
  }
  
  // PUT /api/dispositivos/:id - Actualizar dispositivo completo
  async updateDevice(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const dispositivoActualizado = await prisma.dispositivo.update({
        where: { id },
        data: updateData
      });
      
      res.json({
        message: 'Dispositivo actualizado exitosamente',
        dispositivo: dispositivoActualizado
      });
    } catch (error) {
      next(error);
    }
  }
  
  // PATCH /api/dispositivos/:id - Actualizar parcialmente dispositivo
  async patchDevice(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const dispositivoActualizado = await prisma.dispositivo.update({
        where: { id },
        data: updateData
      });
      
      res.json({
        message: 'Dispositivo actualizado parcialmente',
        dispositivo: dispositivoActualizado
      });
    } catch (error) {
      next(error);
    }
  }
  
  // DELETE /api/dispositivos/:id - Eliminar dispositivo
  async deleteDevice(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar si tiene reservas
      const reservasCount = await prisma.reserva.count({
        where: {
          dispositivoId: id
        }
      });
      
      if (reservasCount > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar',
          message: 'El dispositivo tiene reservas registradas.'
        });
      }
      
      await prisma.dispositivo.delete({
        where: { id }
      });
      
      res.json({
        message: 'Dispositivo eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // GET /api/dispositivos/:id/disponibilidad - Verificar disponibilidad
  async checkAvailability(req, res, next) {
    try {
      const { id } = req.params;
      
      const dispositivo = await prisma.dispositivo.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          estado: true,
          nivelBateria: true,
          reservas: {
            where: {
              fechaRegreso: { gte: new Date() }
            },
            select: {
              id: true,
              fechaSalida: true,
              fechaRegreso: true
            }
          }
        }
      });
      
      if (!dispositivo) {
        return res.status(404).json({
          error: 'Dispositivo no encontrado'
        });
      }
      
      const disponible = dispositivo.estado === 'DISPONIBLE' && 
                        dispositivo.reservas.length === 0 &&
                        (dispositivo.nivelBateria === null || dispositivo.nivelBateria > 20);
      
      res.json({
        disponible,
        dispositivo: {
          id: dispositivo.id,
          nombre: dispositivo.nombre,
          estado: dispositivo.estado,
          nivelBateria: dispositivo.nivelBateria,
          reservasActivas: dispositivo.reservas.length
        },
        razon: !disponible ? this._getUnavailableReason(dispositivo) : null
      });
    } catch (error) {
      next(error);
    }
  }
  
  // PATCH /api/dispositivos/:id/bateria - Actualizar nivel de batería
  async updateBattery(req, res, next) {
    try {
      const { id } = req.params;
      const { nivelBateria } = req.body;
      
      const dispositivo = await prisma.dispositivo.update({
        where: { id },
        data: { nivelBateria }
      });
      
      res.json({
        message: 'Nivel de batería actualizado',
        dispositivo: {
          id: dispositivo.id,
          nombre: dispositivo.nombre,
          nivelBateria: dispositivo.nivelBateria
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // PATCH /api/dispositivos/:id/ubicacion - Actualizar ubicación
  async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const { ubicacion } = req.body;
      
      const dispositivo = await prisma.dispositivo.update({
        where: { id },
        data: { ubicacion }
      });
      
      res.json({
        message: 'Ubicación actualizada',
        dispositivo: {
          id: dispositivo.id,
          nombre: dispositivo.nombre,
          ubicacion: dispositivo.ubicacion
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // GET /api/dispositivos/estadisticas/resumen - Obtener estadísticas
  async getDeviceStats(req, res, next) {
    try {
      const stats = await Promise.all([
        prisma.dispositivo.count(),
        prisma.dispositivo.count({ where: { tipo: 'ROBOT' } }),
        prisma.dispositivo.count({ where: { tipo: 'DRONE' } }),
        prisma.dispositivo.count({ where: { estado: 'DISPONIBLE' } }),
        prisma.dispositivo.count({ where: { estado: 'EN_USO' } }),
        prisma.dispositivo.count({ where: { estado: 'EN_MANTENIMIENTO' } }),
        prisma.dispositivo.count({ where: { estado: 'EN_CARGA' } }),
      ]);
      
      res.json({
        total: stats[0],
        porTipo: {
          robots: stats[1],
          drones: stats[2]
        },
        porEstado: {
          disponibles: stats[3],
          enUso: stats[4],
          enMantenimiento: stats[5],
          enCarga: stats[6]
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // GET /api/dispositivos/tipo/:tipo - Obtener por tipo
  async getDevicesByType(req, res, next) {
    try {
      const { tipo } = req.params;
      
      const dispositivos = await prisma.dispositivo.findMany({
        where: { tipo: tipo.toUpperCase() },
        orderBy: { nombre: 'asc' }
      });
      
      res.json(dispositivos);
    } catch (error) {
      next(error);
    }
  }
  
  // GET /api/dispositivos/disponibles/ahora - Obtener disponibles ahora
  async getAvailableDevices(req, res, next) {
    try {
      const dispositivos = await prisma.dispositivo.findMany({
        where: {
          estado: 'DISPONIBLE',
          OR: [
            { nivelBateria: null },
            { nivelBateria: { gt: 20 } }
          ]
        },
        include: {
          reservas: {
            where: {
              fechaRegreso: { gte: new Date() }
            }
          }
        }
      });
      
      // Filtrar solo los que no tienen reservas activas
      const disponibles = dispositivos.filter(dispositivo => 
        dispositivo.reservas.length === 0
      );
      
      res.json(disponibles);
    } catch (error) {
      next(error);
    }
  }
  
  // Método auxiliar para determinar razón de no disponibilidad
  _getUnavailableReason(dispositivo) {
    if (dispositivo.estado !== 'DISPONIBLE') {
      return `Estado del dispositivo: ${dispositivo.estado}`;
    }
    if (dispositivo.reservas.length > 0) {
      return 'Tiene reservas activas';
    }
    if (dispositivo.nivelBateria !== null && dispositivo.nivelBateria <= 20) {
      return `Batería baja: ${dispositivo.nivelBateria}%`;
    }
    return 'Razón desconocida';
  }
}

module.exports = new DispositivosController();