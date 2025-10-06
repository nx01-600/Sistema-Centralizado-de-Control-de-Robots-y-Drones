# Sistema Centralizado de Gestión de Robots y Drones

## ✅ PROYECTO COMPLETAMENTE CONFIGURADO Y LISTO PARA USAR

Este proyecto implementa un sistema de información centralizado para la administración y monitoreo de robots y drones universitarios que prestan servicios de transporte interno y grabación audiovisual.

## 🚀 Inicio Rápido

### Para Windows (Recomendado):
```bash
# 1. Hacer doble clic en:
iniciar-sistema.bat
```

### Manual:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🌐 URLs del Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Info**: http://localhost:4000/api/info
- **Health Check**: http://localhost:4000/health
- **Prisma Studio**: http://localhost:5555 (ejecutar `npx prisma studio` en backend)

## 📁 Estructura del Proyecto

```
Proyecto/
│
├── 📱 frontend/              ← Interfaz (Next.js + TypeScript + Tailwind)
│   ├── src/
│   │   ├── app/             ← Páginas principales
│   │   ├── components/      ← Componentes reutilizables
│   │   ├── services/        ← Conexión con API
│   │   ├── types/           ← Tipos TypeScript
│   │   └── styles/          ← Estilos globales
│   ├── package.json         ← Dependencias del frontend
│   └── .env.local          ← Configuración del frontend
│
├── 🔧 backend/               ← API REST (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/     ← Lógica de negocio
│   │   ├── routes/          ← Rutas de la API
│   │   ├── middlewares/     ← Middlewares de validación
│   │   └── index.js         ← Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma    ← Modelos de datos
│   │   └── seed.js          ← Datos de prueba
│   ├── package.json         ← Dependencias del backend
│   └── .env                 ← Configuración de base de datos
│
├── 📚 Documentación/
│   ├── README.md            ← Este archivo
│   └── SETUP.md             ← Guía detallada de configuración
│
└── 🎯 Archivos de configuración
    ├── iniciar-sistema.bat  ← Script de inicio para Windows
    └── .gitignore           ← Archivos a ignorar en Git
```

## 🗄️ Configuración de PostgreSQL

### ⚠️ IMPORTANTE: Antes de ejecutar, configura PostgreSQL:

1. **Instalar PostgreSQL** desde https://www.postgresql.org/download/
2. **Crear la base de datos**:
   ```sql
   CREATE DATABASE robots_drones;
   ```
3. **Configurar las credenciales** en `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/robots_drones"
   ```
4. **Inicializar la base de datos**:
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed  # Opcional: datos de prueba
   ```

### 📖 Guía Completa de Setup
Para instrucciones detalladas, consulta: **[SETUP.md](./SETUP.md)**

## 🎯 Funcionalidades Implementadas

### ✅ Backend (100% Funcional)
- 🔗 **API REST completa** con Express.js
- 🗄️ **Base de datos** con Prisma + PostgreSQL
- 📱 **5 módulos principales**:
  - **Dispositivos**: CRUD completo de robots y drones
  - **Reservas**: Sistema de reservas con validación de conflictos
  - **Bitácoras**: Registro de salidas, regresos y servicios
  - **Monitoreo**: Estados en tiempo real (simulado)
  - **Videos**: Gestión de videos almacenados
- ✅ **Validaciones** con express-validator
- 🛡️ **Manejo de errores** centralizado
- 📊 **Estadísticas** y reportes
- 🌱 **Datos de prueba** incluidos

### ✅ Frontend (Estructura Base Lista)
- ⚛️ **Next.js 14** con App Router
- 🎨 **TypeScript** para tipado fuerte
- 💅 **Tailwind CSS** para estilos
- 🔗 **Servicios** para comunicación con API
- 📱 **Tipos TypeScript** definidos
- 🏠 **Página principal** funcional

## 📊 Datos de Prueba Incluidos

El sistema incluye datos de ejemplo:
- **5 dispositivos** (3 robots, 2 drones)
- **3 reservas** en diferentes estados
- **1 bitácora** completa
- **Estados de monitoreo** de los últimos 30 minutos
- **2 videos** almacenados
- **Configuración** del sistema

## 🔧 Comandos Útiles

### Backend:
```bash
npm run dev        # Iniciar servidor de desarrollo
npm run db:studio  # Abrir Prisma Studio
npm run db:seed    # Llenar con datos de prueba
npm run db:reset   # Resetear DB y aplicar seed
```

### Frontend:
```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Construir para producción
npm run lint       # Ejecutar linter
```

## 🛡️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18+ | Entorno de ejecución |
| Express.js | 4.18 | Framework web |
| Prisma | 5.6 | ORM de base de datos |
| PostgreSQL | 12+ | Base de datos |
| Express Validator | 7.0 | Validación de datos |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.0 | Framework React |
| React | 18.2 | Librería UI |
| TypeScript | 5.3 | Tipado estático |
| Tailwind CSS | 3.3 | Framework CSS |
| Axios | 1.6 | Cliente HTTP |

## 🔗 Endpoints Principales de la API

| Módulo | Endpoint | Descripción |
|--------|----------|-------------|
| 📱 **Dispositivos** | `GET /api/dispositivos` | Listar dispositivos |
| | `POST /api/dispositivos` | Crear dispositivo |
| | `GET /api/dispositivos/:id` | Obtener por ID |
| 📅 **Reservas** | `GET /api/reservas` | Listar reservas |
| | `POST /api/reservas` | Crear reserva |
| | `GET /api/reservas/conflictos/:id` | Verificar conflictos |
| 📋 **Bitácoras** | `GET /api/bitacoras` | Listar bitácoras |
| | `POST /api/bitacoras` | Crear bitácora |
| | `PATCH /api/bitacoras/:id/salida` | Registrar salida |
| 📡 **Monitoreo** | `GET /api/monitoreo` | Estados de monitoreo |
| | `GET /api/monitoreo/:id/actual` | Estado actual |
| | `POST /api/monitoreo/:id/simular` | Simular datos |
| 🎬 **Videos** | `GET /api/videos` | Listar videos |
| | `POST /api/videos` | Registrar video |

**Documentación completa**: http://localhost:4000/api/info

## 👥 Desarrolladores

- **Nicolás Carreño Tascón**
- **Daniel Felipe Barrera Zapata**  
- **Maria Camila Guzman Bolaños**

**Institución**: Pontificia Universidad Javeriana de Cali  
**Programa**: Ingeniería de Sistemas y Computación

## 📄 Licencia

Proyecto académico desarrollado como prototipo funcional.  
Uso educativo y demostrativo sin fines comerciales.

---

## 🆘 ¿Problemas?

1. **Consulta [SETUP.md](./SETUP.md)** para configuración detallada
2. **Verifica que PostgreSQL esté ejecutándose**
3. **Revisa las variables de entorno** en `.env` y `.env.local`
4. **Ejecuta los comandos de migración** de Prisma

## 🎉 ¡Todo Listo!

El proyecto está **100% configurado y funcional**. Solo necesitas:
1. ✅ Instalar PostgreSQL
2. ✅ Configurar la base de datos  
3. ✅ Ejecutar `iniciar-sistema.bat`

¡Happy coding! 🚀
