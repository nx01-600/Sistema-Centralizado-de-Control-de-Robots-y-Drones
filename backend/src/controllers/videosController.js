const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class VideosController {
  
  async getAllVideos(req, res, next) {
    try {
      const { dispositivoId, tipoGrabacion, page = 1, limit = 10 } = req.query;
      
      const whereClause = {};
      if (dispositivoId) whereClause.dispositivoId = dispositivoId;
      if (tipoGrabacion) whereClause.tipoGrabacion = { contains: tipoGrabacion, mode: 'insensitive' };
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [videos, total] = await Promise.all([
        prisma.videoAlmacenado.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          include: {
            dispositivo: { select: { id: true, nombre: true, tipo: true } }
          },
          orderBy: { fechaGrabacion: 'desc' }
        }),
        prisma.videoAlmacenado.count({ where: whereClause })
      ]);
      
      res.json({
        videos,
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
  
  async getVideoById(req, res, next) {
    try {
      const { id } = req.params;
      
      const video = await prisma.videoAlmacenado.findUnique({
        where: { id },
        include: {
          dispositivo: true
        }
      });
      
      if (!video) {
        return res.status(404).json({
          error: 'Video no encontrado'
        });
      }
      
      res.json(video);
    } catch (error) {
      next(error);
    }
  }
  
  async createVideo(req, res, next) {
    try {
      const videoData = req.body;
      
      // Verificar que el dispositivo existe
      const dispositivo = await prisma.dispositivo.findUnique({
        where: { id: videoData.dispositivoId }
      });
      
      if (!dispositivo) {
        return res.status(404).json({
          error: 'Dispositivo no encontrado'
        });
      }
      
      const nuevoVideo = await prisma.videoAlmacenado.create({
        data: {
          ...videoData,
          fechaGrabacion: videoData.fechaGrabacion ? new Date(videoData.fechaGrabacion) : new Date(),
          etiquetas: videoData.etiquetas || []
        },
        include: {
          dispositivo: { select: { id: true, nombre: true, tipo: true } }
        }
      });
      
      res.status(201).json({
        message: 'Video registrado exitosamente',
        video: nuevoVideo
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateVideo(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const videoActualizado = await prisma.videoAlmacenado.update({
        where: { id },
        data: updateData,
        include: {
          dispositivo: true
        }
      });
      
      res.json({
        message: 'Video actualizado exitosamente',
        video: videoActualizado
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteVideo(req, res, next) {
    try {
      const { id } = req.params;
      
      await prisma.videoAlmacenado.delete({
        where: { id }
      });
      
      res.json({
        message: 'Video eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getVideosByDispositivo(req, res, next) {
    try {
      const { dispositivoId } = req.params;
      
      const videos = await prisma.videoAlmacenado.findMany({
        where: { dispositivoId },
        orderBy: { fechaGrabacion: 'desc' }
      });
      
      res.json(videos);
    } catch (error) {
      next(error);
    }
  }
  
  async getVideosStats(req, res, next) {
    try {
      const stats = await Promise.all([
        prisma.videoAlmacenado.count(),
        prisma.videoAlmacenado.aggregate({
          _sum: { duracion: true, tamaño: true },
          _avg: { duracion: true, tamaño: true }
        }),
        prisma.videoAlmacenado.groupBy({
          by: ['tipoGrabacion'],
          _count: { tipoGrabacion: true }
        }),
        prisma.videoAlmacenado.groupBy({
          by: ['formato'],
          _count: { formato: true }
        })
      ]);
      
      res.json({
        total: stats[0],
        duracionTotal: stats[1]._sum.duracion || 0,
        tamañoTotal: stats[1]._sum.tamaño || 0,
        duracionPromedio: stats[1]._avg.duracion || 0,
        tamañoPromedio: stats[1]._avg.tamaño || 0,
        porTipoGrabacion: stats[2],
        porFormato: stats[3]
      });
    } catch (error) {
      next(error);
    }
  }
  
  async simularSubidaNube(req, res, next) {
    try {
      const { id } = req.params;
      const { cloudProvider = 'AWS S3' } = req.body;
      
      const video = await prisma.videoAlmacenado.findUnique({
        where: { id }
      });
      
      if (!video) {
        return res.status(404).json({
          error: 'Video no encontrado'
        });
      }
      
      // Simular URL de almacenamiento
      const simulatedUrl = `https://${cloudProvider.toLowerCase().replace(' ', '-')}.amazonaws.com/robot-drone-videos/${video.nombreArchivo}`;
      const bucketName = `robot-drone-videos-${Date.now()}`;
      
      const videoActualizado = await prisma.videoAlmacenado.update({
        where: { id },
        data: {
          urlAlmacenamiento: simulatedUrl,
          cloudProvider,
          bucketName
        }
      });
      
      res.json({
        message: 'Subida a la nube simulada exitosamente',
        video: videoActualizado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VideosController();