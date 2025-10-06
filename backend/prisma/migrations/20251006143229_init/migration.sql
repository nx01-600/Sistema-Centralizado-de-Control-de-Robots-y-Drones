-- CreateEnum
CREATE TYPE "TipoDispositivo" AS ENUM ('ROBOT', 'DRONE');

-- CreateEnum
CREATE TYPE "EstadoDispositivo" AS ENUM ('DISPONIBLE', 'EN_USO', 'MANTENIMIENTO', 'FUERA_DE_SERVICIO');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('TRANSPORTE_INTERNO', 'GRABACION_AUDIOVISUAL', 'MONITOREO', 'MANTENIMIENTO');

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoDispositivo" NOT NULL,
    "modelo" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "estado" "EstadoDispositivo" NOT NULL DEFAULT 'DISPONIBLE',
    "ubicacionActual" TEXT,
    "nivelBateria" INTEGER,
    "pesoMaximoCarga" DOUBLE PRECISION,
    "autonomiaMaxima" INTEGER,
    "velocidadMaxima" DOUBLE PRECISION,
    "alturaMaxima" DOUBLE PRECISION,
    "fechaAdquisicion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimoManten" TIMESTAMP(3),
    "horasVuelo" INTEGER NOT NULL DEFAULT 0,
    "kilometrosRecorr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "tipoServicio" "TipoServicio" NOT NULL,
    "descripcion" TEXT,
    "ubicacionOrigen" TEXT NOT NULL,
    "ubicacionDestino" TEXT,
    "solicitadoPor" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bitacoras" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "horaSalida" TIMESTAMP(3),
    "horaRegreso" TIMESTAMP(3),
    "duracionTotal" INTEGER,
    "servicioPrestado" "TipoServicio" NOT NULL,
    "rutaRecorrida" TEXT,
    "distanciaRecorr" DOUBLE PRECISION,
    "batteryInicio" INTEGER,
    "batteryFin" INTEGER,
    "incidencias" TEXT,
    "observaciones" TEXT,
    "energiaConsumida" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bitacoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_monitoreo" (
    "id" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "altitud" DOUBLE PRECISION,
    "nivelBateria" INTEGER NOT NULL,
    "velocidadActual" DOUBLE PRECISION NOT NULL,
    "temperatura" DOUBLE PRECISION,
    "sensorOK" BOOLEAN NOT NULL DEFAULT true,
    "camaraOK" BOOLEAN NOT NULL DEFAULT true,
    "gpsOK" BOOLEAN NOT NULL DEFAULT true,
    "senalWiFi" INTEGER,
    "senal4G" INTEGER,
    "enMovimiento" BOOLEAN NOT NULL DEFAULT false,
    "modoAutonomo" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estados_monitoreo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos_almacenados" (
    "id" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL,
    "tamano" DOUBLE PRECISION NOT NULL,
    "resolucion" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "fechaGrabacion" TIMESTAMP(3) NOT NULL,
    "ubicacionGrab" TEXT NOT NULL,
    "tipoGrabacion" TEXT NOT NULL,
    "urlAlmacenamiento" TEXT,
    "cloudProvider" TEXT,
    "bucketName" TEXT,
    "descripcion" TEXT,
    "etiquetas" TEXT[],
    "publico" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_almacenados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" TEXT NOT NULL,
    "nombreSistema" TEXT NOT NULL DEFAULT 'Sistema de Gestión de Robots y Drones',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "maxReservasSimultaneas" INTEGER NOT NULL DEFAULT 10,
    "tiempoMaximoReserva" INTEGER NOT NULL DEFAULT 480,
    "alertaBateriaMinima" INTEGER NOT NULL DEFAULT 20,
    "intervalMonitoreo" INTEGER NOT NULL DEFAULT 30,
    "tiempoRetencionDatos" INTEGER NOT NULL DEFAULT 365,
    "emailNotificaciones" BOOLEAN NOT NULL DEFAULT true,
    "smsNotificaciones" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_nombre_key" ON "dispositivos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_numeroSerie_key" ON "dispositivos"("numeroSerie");

-- CreateIndex
CREATE UNIQUE INDEX "bitacoras_reservaId_key" ON "bitacoras"("reservaId");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_monitoreo" ADD CONSTRAINT "estados_monitoreo_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos_almacenados" ADD CONSTRAINT "videos_almacenados_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
