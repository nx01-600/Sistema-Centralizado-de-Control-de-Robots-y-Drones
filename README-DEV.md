# Sistema Centralizado de Control de Robots y Drones 🤖🚁

## 🎉 **PROYECTO LISTO PARA DESARROLLAR**

Este proyecto está completamente configurado y listo para usar.

### 🏗️ Arquitectura del Sistema

```
📁 backend/          ← API REST con Node.js + Express + Prisma
📁 frontend/         ← Interfaz web con Next.js + TypeScript + Tailwind
📁 database/         ← PostgreSQL con datos de prueba
```

### 🚀 Cómo Iniciar el Sistema

#### Opción 1: Inicio Automático (Recomendado)
```bash
# Ejecutar desde la raíz del proyecto
./start-dev.bat
```

#### Opción 2: Inicio Manual
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 🌐 URLs del Sistema

- **Backend API**: http://localhost:4000
- **Frontend Web**: http://localhost:3000
- **Base de Datos**: PostgreSQL en puerto 5432

### 📊 API Endpoints Disponibles

#### 🤖 Dispositivos
- `GET    /api/dispositivos`           - Listar todos
- `POST   /api/dispositivos`           - Crear nuevo
- `GET    /api/dispositivos/:id`       - Obtener por ID
- `PUT    /api/dispositivos/:id`       - Actualizar
- `DELETE /api/dispositivos/:id`       - Eliminar

#### 📅 Reservas
- `GET    /api/reservas`               - Listar todas
- `POST   /api/reservas`               - Crear nueva
- `GET    /api/reservas/:id`           - Obtener por ID
- `PUT    /api/reservas/:id`           - Actualizar
- `DELETE /api/reservas/:id`           - Eliminar

#### 📝 Bitácoras
- `GET    /api/bitacoras`              - Listar todas
- `POST   /api/bitacoras`              - Crear nueva
- `GET    /api/bitacoras/:id`          - Obtener por ID
- `PUT    /api/bitacoras/:id`          - Actualizar
- `DELETE /api/bitacoras/:id`          - Eliminar

#### 📡 Monitoreo
- `GET    /api/monitoreo`              - Estados actuales
- `POST   /api/monitoreo`              - Registrar estado
- `GET    /api/monitoreo/:dispositivoId` - Historial del dispositivo

#### 🎥 Videos
- `GET    /api/videos`                 - Listar videos
- `POST   /api/videos`                 - Subir video
- `GET    /api/videos/:id`             - Obtener video
- `DELETE /api/videos/:id`             - Eliminar video

### 🗄️ Base de Datos

La base de datos ya está configurada con:

- ✅ 5 dispositivos (3 robots, 2 drones)
- ✅ 3 reservas de ejemplo
- ✅ 1 bitácora de muestra
- ✅ 12 estados de monitoreo
- ✅ 2 videos almacenados
- ✅ Configuración del sistema

### 🛠️ Tecnologías Utilizadas

#### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express.js 4.18** - Framework web
- **Prisma 5.6** - ORM para base de datos
- **PostgreSQL 12+** - Base de datos
- **Express Validator** - Validación de datos
- **CORS** - Cross-Origin Resource Sharing

#### Frontend
- **Next.js 14.0** - Framework de React
- **React 18.2** - Librería de UI
- **TypeScript 5.3** - Tipado estático
- **Tailwind CSS 3.3** - Framework de CSS
- **Lucide React** - Iconos
- **SWR** - Data fetching

### 📁 Estructura del Proyecto

```
Sistema-Centralizado-de-Control-de-Robots-y-Drones/
├── backend/
│   ├── src/
│   │   ├── controllers/     ← Lógica de negocio
│   │   ├── routes/         ← Rutas de la API
│   │   ├── middleware/     ← Middlewares
│   │   └── index.js        ← Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma   ← Esquema de la BD
│   │   └── seed.js         ← Datos de prueba
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     ← Componentes React
│   │   ├── pages/         ← Páginas Next.js
│   │   ├── types/         ← Tipos TypeScript
│   │   └── services/      ← Servicios API
│   └── package.json
├── start-dev.bat          ← Script de inicio
└── README.md             ← Esta documentación
```

### 🔧 Comandos Útiles

```bash
# Backend
cd backend
npm run dev          # Iniciar servidor de desarrollo
npm run db:studio    # Abrir Prisma Studio (GUI de BD)
npm run db:seed      # Llenar BD con datos de prueba
npm run db:reset     # Resetear BD completa

# Frontend
cd frontend
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar en modo producción
```

### 🎯 Estado del Proyecto

- ✅ **Backend API** - 100% Funcional
- ✅ **Base de Datos** - Configurada con datos
- ✅ **Frontend Structure** - Estructura creada
- ✅ **Dependencies** - Todas instaladas
- ✅ **Development Ready** - Listo para desarrollar

### 🚀 Próximos Pasos

1. **Ejecutar** `./start-dev.bat` para iniciar ambos servidores
2. **Abrir** http://localhost:3000 para ver el frontend
3. **Probar** los endpoints en http://localhost:4000/api
4. **Desarrollar** las funcionalidades específicas del frontend

---

## 🎉 ¡El proyecto está completamente listo para desarrollar!

Todos los sistemas están configurados, la base de datos tiene datos de prueba, y los servidores pueden iniciarse inmediatamente.