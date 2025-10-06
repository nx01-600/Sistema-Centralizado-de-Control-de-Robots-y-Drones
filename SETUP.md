# 🚀 Guía de Configuración y Setup

Esta guía te ayudará a configurar todo lo necesario para ejecutar el Sistema de Gestión de Robots y Drones.

## 📋 Requisitos Previos

### Software Necesario

1. **Node.js** (versión 18 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **PostgreSQL** (versión 12 o superior)
   - Descargar desde: https://www.postgresql.org/download/
   - Durante la instalación, recordar:
     - Usuario: `postgres`
     - Contraseña: (anota tu contraseña)
     - Puerto: `5432` (por defecto)

3. **Git** (para control de versiones)
   - Descargar desde: https://git-scm.com/

4. **Editor de código** (recomendado: Visual Studio Code)
   - Descargar desde: https://code.visualstudio.com/

## 🗄️ Configuración de PostgreSQL

### Paso 1: Crear la Base de Datos

1. **Abrir pgAdmin** (incluido con PostgreSQL) o usar línea de comandos
2. **Conectarse al servidor** con las credenciales de instalación
3. **Crear nueva base de datos:**
   ```sql
   CREATE DATABASE robots_drones;
   ```

### Paso 2: Crear Usuario (Opcional - Recomendado para producción)

```sql
-- Crear usuario específico para la aplicación
CREATE USER app_user WITH PASSWORD 'tu_password_seguro';

-- Otorgar permisos sobre la base de datos
GRANT ALL PRIVILEGES ON DATABASE robots_drones TO app_user;
```

### Paso 3: Verificar Conexión

Puedes verificar que PostgreSQL está funcionando:
```bash
psql -h localhost -p 5432 -U postgres -d robots_drones
```

## ⚙️ Configuración del Proyecto

### Paso 1: Configurar Variables de Entorno

#### Backend (.env)
1. Abrir `backend/.env`
2. Modificar la línea `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/robots_drones"
   ```
   - Reemplazar `TU_PASSWORD` con la contraseña de PostgreSQL
   - Si creaste un usuario específico, usar esas credenciales

#### Frontend (.env.local)
El archivo ya está configurado correctamente, pero puedes verificar:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Paso 2: Inicializar la Base de Datos

1. **Navegar al directorio backend:**
   ```bash
   cd backend
   ```

2. **Generar el cliente de Prisma:**
   ```bash
   npx prisma generate
   ```

3. **Ejecutar las migraciones:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Opcional - Sembrar datos de prueba:**
   ```bash
   npm run db:seed
   ```

### Paso 3: Verificar la Configuración

1. **Abrir Prisma Studio** (interfaz visual de la base de datos):
   ```bash
   npx prisma studio
   ```
   - Se abrirá en http://localhost:5555
   - Deberías ver todas las tablas creadas

## 🚀 Ejecutar el Proyecto

### Opción 1: Ejecutar Ambos Servidores por Separado

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
- El backend estará en http://localhost:4000
- Verificar que dice "🚀 Servidor backend iniciado en puerto 4000"

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
- El frontend estará en http://localhost:3000
- Se abrirá automáticamente en el navegador

### Opción 2: Script de Inicio (Crear script personalizado)

Puedes crear un archivo `start.bat` (Windows) en la raíz del proyecto:
```batch
@echo off
echo Iniciando Sistema de Gestión de Robots y Drones...
start /d "backend" cmd /k "npm run dev"
timeout /t 3
start /d "frontend" cmd /k "npm run dev"
echo Servidores iniciados!
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000
pause
```

## 🔍 Verificación de Funcionamiento

### 1. Verificar Backend
- Abrir: http://localhost:4000/health
- Deberías ver: `{"status": "OK", "message": "Sistema funcionando..."}`

### 2. Verificar Frontend
- Abrir: http://localhost:3000
- Deberías ver la página principal del sistema

### 3. Verificar API
- Abrir: http://localhost:4000/api/info
- Deberías ver información del sistema y endpoints disponibles

## 🛠️ Herramientas de Desarrollo

### Prisma Studio
```bash
cd backend
npx prisma studio
```
- Interfaz gráfica para visualizar y editar datos
- URL: http://localhost:5555

### Logs y Debugging
- **Backend**: Los logs aparecen en la terminal donde ejecutaste `npm run dev`
- **Frontend**: Los logs aparecen en la consola del navegador (F12)

## 🔧 Solución de Problemas Comunes

### Error: "Can't reach database server"
- **Causa**: PostgreSQL no está ejecutándose
- **Solución**: 
  - Windows: Ir a Servicios y iniciar "postgresql-x64-XX"
  - Verificar que el puerto 5432 esté libre

### Error: "Permission denied for database"
- **Causa**: Usuario sin permisos
- **Solución**: Ejecutar el SQL de creación de usuario con permisos

### Error: "Port 4000 already in use"
- **Causa**: El puerto está ocupado
- **Solución**: 
  - Cambiar el puerto en `backend/.env`: `PORT=4001`
  - Actualizar en `frontend/.env.local`: `NEXT_PUBLIC_API_URL="http://localhost:4001"`

### Error: "Module not found"
- **Causa**: Dependencias no instaladas
- **Solución**: Ejecutar `npm install` en backend y frontend

## 📊 Datos de Prueba

Para poblar la base de datos con datos de ejemplo, puedes usar estos comandos SQL en Prisma Studio o pgAdmin:

```sql
-- Insertar dispositivos de prueba
INSERT INTO dispositivos (id, nombre, tipo, modelo, "numeroSerie", estado, "nivelBateria") VALUES
('dev1', 'Robot Transporte 01', 'ROBOT', 'RT-2024', 'RT001', 'DISPONIBLE', 85),
('dev2', 'Drone Grabacion 01', 'DRONE', 'DG-2024', 'DG001', 'DISPONIBLE', 92);

-- Insertar reserva de ejemplo
INSERT INTO reservas (id, "dispositivoId", "fechaInicio", "fechaFin", "tipoServicio", "ubicacionOrigen", "solicitadoPor", contacto) VALUES
('res1', 'dev1', '2024-10-07 09:00:00', '2024-10-07 11:00:00', 'TRANSPORTE_INTERNO', 'Biblioteca Central', 'Juan Pérez', 'juan.perez@javerianacali.edu.co');
```

## 🆘 Soporte

Si encuentras problemas:

1. **Revisar logs** en las terminales del backend y frontend
2. **Verificar configuración** de las variables de entorno
3. **Consultar la documentación** de las tecnologías:
   - [Prisma Docs](https://www.prisma.io/docs/)
   - [Next.js Docs](https://nextjs.org/docs)
   - [Express.js Docs](https://expressjs.com/)

## 🎯 Próximos Pasos

Una vez que el sistema esté funcionando:

1. **Explorar las funcionalidades** en http://localhost:3000
2. **Revisar la API** en http://localhost:4000/api/info
3. **Experimentar con Prisma Studio** para gestionar datos
4. **Revisar el código** para entender la arquitectura

¡El sistema está listo para desarrollo! 🚀