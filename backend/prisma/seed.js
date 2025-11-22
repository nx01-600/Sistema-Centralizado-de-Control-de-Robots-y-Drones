const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.metrica.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.dispositivo.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Crear dispositivos de ejemplo
  const dispositivos = await prisma.dispositivo.createMany({
    data: [
      {
        nombre: 'Robot Transporte RT-01',
        tipo: 'ROBOT',
        identificador: 'RT-001',
        ubicacion: 'Edificio Central',
        nivelBateria: 85,
        estado: 'DISPONIBLE'
      },
      {
        nombre: 'Drone Grabación DG-01',
        tipo: 'DRONE',
        identificador: 'DG-001',
        ubicacion: 'Laboratorio Audiovisual',
        nivelBateria: 92,
        estado: 'DISPONIBLE'
      },
      {
        nombre: 'Robot Entrega RE-01',
        tipo: 'ROBOT',
        identificador: 'RE-001',
        ubicacion: 'Biblioteca',
        nivelBateria: 78,
        estado: 'EN_CARGA'
      },
      {
        nombre: 'Drone Monitoreo DM-01',
        tipo: 'DRONE',
        identificador: 'DM-001',
        ubicacion: 'Centro de Operaciones',
        nivelBateria: 95,
        estado: 'DISPONIBLE'
      },
      {
        nombre: 'Robot Transporte RT-02',
        tipo: 'ROBOT',
        identificador: 'RT-002',
        ubicacion: 'Cafetería Principal',
        nivelBateria: 45,
        estado: 'EN_MANTENIMIENTO'
      }
    ]
  });

  console.log(`✅ ${dispositivos.count} dispositivos creados`);

  console.log(`✅ ${dispositivos.count} dispositivos creados`);

  // Obtener dispositivos para crear reservas
  const allDispositivos = await prisma.dispositivo.findMany();

  // Crear reservas de ejemplo
  await prisma.reserva.create({
    data: {
      dispositivoId: allDispositivos[0].id,
      fechaSalida: new Date('2024-11-22T09:00:00'),
      horaSalida: '09:00',
      fechaRegreso: new Date('2024-11-22T12:00:00'),
      horaRegreso: '12:00',
      solicitadoPor: 'Juan Pérez',
      tipoServicio: 'TRANSPORTE_INTERNO',
      ubicacionOrigen: 'Edificio Central',
      ubicacionDestino: 'Laboratorio de Robótica',
      observaciones: 'Transporte de equipo de laboratorio'
    }
  });

  await prisma.reserva.create({
    data: {
      dispositivoId: allDispositivos[1].id,
      fechaSalida: new Date('2024-11-23T14:00:00'),
      horaSalida: '14:00',
      fechaRegreso: new Date('2024-11-23T16:00:00'),
      horaRegreso: '16:00',
      solicitadoPor: 'María García',
      tipoServicio: 'GRABACION_EVENTO',
      ubicacionOrigen: 'Laboratorio Audiovisual',
      ubicacionDestino: 'Auditorio Principal',
      observaciones: 'Grabación de ceremonia de grados'
    }
  });

  console.log('✅ Reservas creadas');

  // Crear métricas de ejemplo
  await prisma.metrica.createMany({
    data: [
      {
        dispositivoId: allDispositivos[0].id,
        temperatura: 25.5,
        humedad: 45.2,
        velocidad: 1.2,
        tiempoVuelo: 0,
        horasTotales: 48.5,
        distanciaTotal: 12.3,
        fecha: new Date('2024-11-20T10:00:00')
      },
      {
        dispositivoId: allDispositivos[1].id,
        temperatura: 28.3,
        humedad: 50.1,
        velocidad: 5.5,
        altitud: 25.0,
        tiempoVuelo: 45,
        horasTotales: 32.2,
        distanciaTotal: 8.7,
        fecha: new Date('2024-11-20T15:30:00')
      },
      {
        dispositivoId: allDispositivos[3].id,
        temperatura: 26.8,
        humedad: 48.5,
        velocidad: 4.2,
        altitud: 30.0,
        tiempoVuelo: 60,
        horasTotales: 25.5,
        distanciaTotal: 15.2,
        fecha: new Date('2024-11-21T09:00:00')
      }
    ]
  });

  console.log('✅ Métricas creadas');
  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });