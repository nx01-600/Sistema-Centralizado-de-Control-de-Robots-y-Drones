const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.estadoMonitoreo.deleteMany();
  await prisma.videoAlmacenado.deleteMany();
  await prisma.bitacora.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.dispositivo.deleteMany();
  await prisma.configuracionSistema.deleteMany();

  // Crear dispositivos de ejemplo
  const dispositivos = await prisma.dispositivo.createMany({
    data: [
      {
        id: 'robot-001',
        nombre: 'Robot Transporte Alpha',
        tipo: 'ROBOT',
        modelo: 'RT-2024-A',
        numeroSerie: 'RT001-2024',
        estado: 'DISPONIBLE',
        ubicacionActual: 'Biblioteca Central',
        nivelBateria: 85,
        pesoMaximoCarga: 50.0,
        autonomiaMaxima: 480, // 8 horas
        velocidadMaxima: 15.0,
        fechaAdquisicion: new Date('2024-01-15'),
        horasVuelo: 0,
        kilometrosRecorr: 125.5
      },
      {
        id: 'robot-002',
        nombre: 'Robot Transporte Beta',
        tipo: 'ROBOT',
        modelo: 'RT-2024-B',
        numeroSerie: 'RT002-2024',
        estado: 'EN_USO',
        ubicacionActual: 'Cafetería Principal',
        nivelBateria: 62,
        pesoMaximoCarga: 40.0,
        autonomiaMaxima: 360, // 6 horas
        velocidadMaxima: 12.0,
        fechaAdquisicion: new Date('2024-02-01'),
        horasVuelo: 0,
        kilometrosRecorr: 89.2
      },
      {
        id: 'drone-001',
        nombre: 'Drone Grabación Gamma',
        tipo: 'DRONE',
        modelo: 'DG-2024-A',
        numeroSerie: 'DG001-2024',
        estado: 'DISPONIBLE',
        ubicacionActual: 'Torre de Ingeniería',
        nivelBateria: 92,
        pesoMaximoCarga: 5.0,
        autonomiaMaxima: 120, // 2 horas
        velocidadMaxima: 45.0,
        alturaMaxima: 150.0,
        fechaAdquisicion: new Date('2024-01-20'),
        horasVuelo: 45.5,
        kilometrosRecorr: 320.8
      },
      {
        id: 'drone-002',
        nombre: 'Drone Grabación Delta',
        tipo: 'DRONE',
        modelo: 'DG-2024-B',
        numeroSerie: 'DG002-2024',
        estado: 'MANTENIMIENTO',
        ubicacionActual: 'Taller de Mantenimiento',
        nivelBateria: 15,
        pesoMaximoCarga: 8.0,
        autonomiaMaxima: 180, // 3 horas
        velocidadMaxima: 50.0,
        alturaMaxima: 200.0,
        fechaAdquisicion: new Date('2024-03-10'),
        fechaUltimoManten: new Date('2024-10-05'),
        horasVuelo: 28.3,
        kilometrosRecorr: 156.4
      },
      {
        id: 'robot-003',
        nombre: 'Robot Transporte Charlie',
        tipo: 'ROBOT',
        modelo: 'RT-2024-C',
        numeroSerie: 'RT003-2024',
        estado: 'FUERA_DE_SERVICIO',
        ubicacionActual: 'Taller de Reparaciones',
        nivelBateria: 0,
        pesoMaximoCarga: 60.0,
        autonomiaMaxima: 600, // 10 horas
        velocidadMaxima: 18.0,
        fechaAdquisicion: new Date('2024-04-01'),
        horasVuelo: 0,
        kilometrosRecorr: 45.1
      }
    ]
  });

  console.log(`✅ Creados ${dispositivos.count} dispositivos`);

  // Crear reservas de ejemplo
  const reservas = await prisma.reserva.createMany({
    data: [
      {
        id: 'reserva-001',
        dispositivoId: 'robot-001',
        fechaInicio: new Date('2024-10-07 09:00:00'),
        fechaFin: new Date('2024-10-07 11:00:00'),
        tipoServicio: 'TRANSPORTE_INTERNO',
        descripcion: 'Transporte de material bibliográfico',
        ubicacionOrigen: 'Biblioteca Central',
        ubicacionDestino: 'Facultad de Ingeniería',
        solicitadoPor: 'Dr. Juan Carlos Pérez',
        contacto: 'juan.perez@javerianacali.edu.co',
        estado: 'COMPLETADA'
      },
      {
        id: 'reserva-002',
        dispositivoId: 'drone-001',
        fechaInicio: new Date('2024-10-07 14:00:00'),
        fechaFin: new Date('2024-10-07 16:00:00'),
        tipoServicio: 'GRABACION_AUDIOVISUAL',
        descripcion: 'Grabación del evento de graduación',
        ubicacionOrigen: 'Auditorio Principal',
        ubicacionDestino: 'Campus Universitario',
        solicitadoPor: 'María Elena González',
        contacto: 'maria.gonzalez@javerianacali.edu.co',
        estado: 'ACTIVA'
      },
      {
        id: 'reserva-003',
        dispositivoId: 'robot-002',
        fechaInicio: new Date('2024-10-08 08:00:00'),
        fechaFin: new Date('2024-10-08 12:00:00'),
        tipoServicio: 'TRANSPORTE_INTERNO',
        descripcion: 'Distribución de material de laboratorio',
        ubicacionOrigen: 'Almacén Central',
        ubicacionDestino: 'Laboratorios de Química',
        solicitadoPor: 'Prof. Ana Lucía Ramírez',
        contacto: 'ana.ramirez@javerianacali.edu.co',
        estado: 'PENDIENTE'
      }
    ]
  });

  console.log(`✅ Creadas ${reservas.count} reservas`);

  // Crear bitácoras de ejemplo
  const bitacoras = await prisma.bitacora.createMany({
    data: [
      {
        reservaId: 'reserva-001',
        dispositivoId: 'robot-001',
        horaSalida: new Date('2024-10-07 09:05:00'),
        horaRegreso: new Date('2024-10-07 10:45:00'),
        duracionTotal: 100, // minutos
        servicioPrestado: 'TRANSPORTE_INTERNO',
        rutaRecorrida: 'Biblioteca → Ing. Sistemas → Biblioteca',
        distanciaRecorr: 2.8,
        batteryInicio: 85,
        batteryFin: 78,
        observaciones: 'Servicio completado exitosamente. Sin incidencias.',
        energiaConsumida: 2.5
      }
    ]
  });

  console.log(`✅ Creadas ${bitacoras.count} bitácoras`);

  // Crear estados de monitoreo de ejemplo
  const estadosMonitoreo = [];
  const now = new Date();
  
  // Generar estados para los últimos 30 minutos
  for (let i = 0; i < 6; i++) {
    const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000)); // Cada 5 minutos
    
    estadosMonitoreo.push({
      dispositivoId: 'robot-001',
      latitud: 3.4372 + (Math.random() - 0.5) * 0.001,
      longitud: -76.5225 + (Math.random() - 0.5) * 0.001,
      altitud: 1018.0,
      nivelBateria: 85 - i,
      velocidadActual: Math.random() * 10,
      temperatura: 25 + Math.random() * 5,
      sensorOK: true,
      camaraOK: true,
      gpsOK: true,
      senalWiFi: 85 + Math.floor(Math.random() * 15),
      senal4G: 75 + Math.floor(Math.random() * 20),
      enMovimiento: i < 3,
      modoAutonomo: true,
      timestamp
    });

    estadosMonitoreo.push({
      dispositivoId: 'drone-001',
      latitud: 3.4382 + (Math.random() - 0.5) * 0.002,
      longitud: -76.5215 + (Math.random() - 0.5) * 0.002,
      altitud: 50 + Math.random() * 100,
      nivelBateria: 92 - Math.floor(i * 1.5),
      velocidadActual: Math.random() * 25,
      temperatura: 22 + Math.random() * 8,
      sensorOK: true,
      camaraOK: true,
      gpsOK: true,
      senalWiFi: 90 + Math.floor(Math.random() * 10),
      senal4G: 80 + Math.floor(Math.random() * 15),
      enMovimiento: i < 4,
      modoAutonomo: true,
      timestamp
    });
  }

  await prisma.estadoMonitoreo.createMany({
    data: estadosMonitoreo
  });

  console.log(`✅ Creados ${estadosMonitoreo.length} estados de monitoreo`);

  // Crear videos de ejemplo
  const videos = await prisma.videoAlmacenado.createMany({
    data: [
      {
        dispositivoId: 'drone-001',
        nombreArchivo: 'graduacion_2024_parte1.mp4',
        duracion: 1800, // 30 minutos
        tamano: 2048.5, // MB
        resolucion: '1920x1080',
        formato: 'mp4',
        fechaGrabacion: new Date('2024-10-07 14:15:00'),
        ubicacionGrab: 'Auditorio Principal',
        tipoGrabacion: 'Evento Académico',
        urlAlmacenamiento: 'https://storage.javeriana.edu.co/videos/graduacion_2024_parte1.mp4',
        cloudProvider: 'AWS S3',
        bucketName: 'javeriana-drone-videos',
        descripcion: 'Grabación aérea de la ceremonia de graduación 2024',
        etiquetas: ['graduación', '2024', 'ceremonia', 'auditorio'],
        publico: false
      },
      {
        dispositivoId: 'drone-001',
        nombreArchivo: 'campus_tour_ingenieria.mp4',
        duracion: 900, // 15 minutos
        tamano: 1024.2, // MB
        resolucion: '1920x1080',
        formato: 'mp4',
        fechaGrabacion: new Date('2024-10-05 16:30:00'),
        ubicacionGrab: 'Campus Universitario',
        tipoGrabacion: 'Tour Virtual',
        urlAlmacenamiento: 'https://storage.javeriana.edu.co/videos/campus_tour_ingenieria.mp4',
        cloudProvider: 'AWS S3',
        bucketName: 'javeriana-drone-videos',
        descripcion: 'Tour aéreo de las instalaciones de Ingeniería',
        etiquetas: ['tour', 'ingeniería', 'campus', 'promocional'],
        publico: true
      }
    ]
  });

  console.log(`✅ Creados ${videos.count} videos`);

  // Crear configuración del sistema
  await prisma.configuracionSistema.create({
    data: {
      nombreSistema: 'Sistema de Gestión de Robots y Drones - PUJ Cali',
      version: '1.0.0',
      maxReservasSimultaneas: 10,
      tiempoMaximoReserva: 480, // 8 horas
      alertaBateriaMinima: 20,
      intervalMonitoreo: 30, // 30 segundos
      tiempoRetencionDatos: 365, // 1 año
      emailNotificaciones: true,
      smsNotificaciones: false
    }
  });

  console.log('✅ Configuración del sistema creada');

  console.log('🎉 ¡Seed completado exitosamente!');
  console.log('');
  console.log('📊 Datos creados:');
  console.log(`   • ${dispositivos.count} dispositivos (3 robots, 2 drones)`);
  console.log(`   • ${reservas.count} reservas`);
  console.log(`   • ${bitacoras.count} bitácoras`);
  console.log(`   • ${estadosMonitoreo.length} estados de monitoreo`);
  console.log(`   • ${videos.count} videos almacenados`);
  console.log('   • 1 configuración del sistema');
  console.log('');
  console.log('🚀 Ya puedes ejecutar el sistema con datos de prueba!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });