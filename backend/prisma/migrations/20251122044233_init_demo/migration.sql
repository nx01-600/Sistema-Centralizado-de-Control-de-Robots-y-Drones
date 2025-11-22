-- CreateEnum
CREATE TYPE "TipoDispositivo" AS ENUM ('ROBOT', 'DRONE');

-- CreateEnum
CREATE TYPE "EstadoDispositivo" AS ENUM ('DISPONIBLE', 'EN_USO', 'EN_MANTENIMIENTO', 'EN_CARGA');

-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('TRANSPORTE_INTERNO', 'GRABACION_EVENTO', 'MONITOREO', 'ENTREGA');

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoDispositivo" NOT NULL,
    "identificador" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "nivelBateria" INTEGER NOT NULL DEFAULT 100,
    "estado" "EstadoDispositivo" NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL,
    "horaSalida" TEXT NOT NULL,
    "fechaRegreso" TIMESTAMP(3) NOT NULL,
    "horaRegreso" TEXT NOT NULL,
    "solicitadoPor" TEXT NOT NULL,
    "tipoServicio" "TipoServicio" NOT NULL,
    "ubicacionOrigen" TEXT,
    "ubicacionDestino" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metricas" (
    "id" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "temperatura" DOUBLE PRECISION,
    "humedad" DOUBLE PRECISION,
    "velocidad" DOUBLE PRECISION,
    "altitud" DOUBLE PRECISION,
    "tiempoVuelo" INTEGER NOT NULL,
    "horasTotales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "distanciaTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metricas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_identificador_key" ON "dispositivos"("identificador");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metricas" ADD CONSTRAINT "metricas_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
