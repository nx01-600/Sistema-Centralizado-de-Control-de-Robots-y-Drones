# Sistema Centralizado de Control de Robots y Drones
**Pontificia Universidad Javeriana Cali**

Sistema de gestión para dispositivos robóticos y drones con interfaz web, desarrollado con PostgreSQL, Express.js, React (Next.js) y Prisma ORM.

---

## 📋 Requisitos Implementados

### Funcionales (REQF)
- **REQF.1**: Botón "Actualizar" para refrescar datos desde la base de datos
- **REQF.2**: Módulo de gestión de dispositivos (CRUD completo)
- **REQF.3**: Módulo de bitácora de reservas (CRUD completo)
- **REQF.4**: Módulo de métricas de uso (CREATE + visualización)

### No Funcionales (REQNF)
- **REQNF.1**: Footer con información del sistema y datos técnicos
- **REQNF.2**: Colores institucionales (azul #1e40af, gris #374151, fondo blanco)
- **REQNF.3**: Fuente tipográfica Roboto + navegación en pestañas únicas
- **REQNF.4**: Módulo de verificación técnica (Health Check, API Tests, DB Stats)
- **REQNF.5**: Uso exclusivo en escritorio (no responsive, mensaje de advertencia en móvil)

### Restricción (REQR)
- **REQR-001**: Base de datos normalizada con 3 tablas relacionadas (Dispositivo, Reserva, Metrica)

---

## 🛠️ Tecnologías

- **Base de datos**: PostgreSQL 12+
- **Backend**: Node.js + Express.js + Prisma ORM 5.22
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Estilos**: CSS (Tailwind + CSS personalizado)

---

## 📦 Requisitos Previos

1. **Node.js** v18 o superior
2. **PostgreSQL** v12 o superior
3. **npm** o **yarn**

---

## ⚙️ Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Sistema-Centralizado-de-Control-de-Robots-y-Drones
```

### 2. Configurar Base de Datos

**Crear base de datos PostgreSQL:**
```sql
CREATE DATABASE robots_drones;
```

**Configurar variables de entorno del backend:**

Crear archivo `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/robots_drones"
PORT=4000
```

### 3. Instalar dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Ejecutar migraciones de Prisma

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 5. (Opcional) Cargar datos de prueba

```bash
cd backend
npx prisma db seed
```

---

## 🚀 Ejecución Manual

### Opción 1: Ejecutar en terminales separadas

**Terminal 1 - Backend:**
```bash
cd backend
node src/index.js
```
✅ El backend estará disponible en: `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ El frontend estará disponible en: `http://localhost:3001`

### Opción 2: Ejecutar con un solo comando (PowerShell)

```powershell
# Desde la raíz del proyecto
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node src/index.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

---

## 🔍 Verificación del Sistema

### 1. Verificar Backend
Abrir en navegador: `http://localhost:4000/health`

Respuesta esperada:
```json
{
  "status": "OK",
  "database": "Connected",
  "message": "Sistema de Gestión de Robots y Drones - API funcionando correctamente",
  "timestamp": "2025-11-22T..."
}
```

### 2. Verificar Frontend
Abrir en navegador: `http://localhost:3001`

Deberías ver el panel principal con 4 pestañas:
- ✅ Gestión de dispositivos
- ✅ Bitácora (reservas)
- ✅ Métricas
- ✅ Verificación Técnica

---

## 📁 Estructura del Proyecto

```
Sistema-Centralizado-de-Control-de-Robots-y-Drones/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de base de datos
│   │   ├── seed.js                # Datos de prueba
│   │   └── migrations/            # Migraciones de BD
│   ├── src/
│   │   ├── index.js               # Servidor Express principal
│   │   ├── controllers/           # Lógica de negocio
│   │   ├── routes/                # Rutas de la API
│   │   └── middlewares/           # Middlewares
│   ├── .env                       # Variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Layout principal
│   │   │   └── page.tsx           # Página principal (SPA)
│   │   ├── styles/
│   │   │   └── globals.css        # Estilos globales
│   │   └── types/
│   │       └── index.ts           # Tipos TypeScript
│   ├── .env.local                 # Variables de entorno
│   └── package.json
│
└── README.md                      # Este archivo
```

---

## 🎯 Ubicación de Requisitos en el Código

### REQF.1 - Botón Actualizar
📍 **Ubicación**: `frontend/src/app/page.tsx` líneas 564-573  
- Función `actualizarDatos()` líneas 131-155
- Botón en header línea 567

### REQF.2 - Gestión de Dispositivos (CRUD)
📍 **Backend**: `backend/src/routes/dispositivos.js`  
📍 **Frontend**: `frontend/src/app/page.tsx` líneas 589-773
- Funciones CREATE, READ, UPDATE, DELETE líneas 238-333

### REQF.3 - Bitácora de Reservas (CRUD)
📍 **Backend**: `backend/src/routes/reservas.js`  
📍 **Frontend**: `frontend/src/app/page.tsx` líneas 775-1052
- Funciones CREATE, READ, UPDATE, DELETE líneas 334-428

### REQF.4 - Métricas de Uso
📍 **Backend**: `backend/src/routes/metricas.js`  
📍 **Frontend**: `frontend/src/app/page.tsx` líneas 1054-1177
- Función CREATE líneas 429-446

### REQNF.1 - Footer Informativo
📍 **Ubicación**: `frontend/src/app/layout.tsx` líneas 20-56

### REQNF.2 - Colores Institucionales
📍 **Ubicación**: `frontend/src/styles/globals.css` líneas 13-22  
Variables CSS: `--color-azul-primario`, `--color-gris-oscuro`, `--color-blanco`

### REQNF.3 - Fuente Roboto + Navegación Única
📍 **Fuente**: `frontend/src/styles/globals.css` línea 8  
📍 **Navegación**: `frontend/src/app/page.tsx` líneas 574-587

### REQNF.4 - Verificación Técnica
📍 **Ubicación**: `frontend/src/app/page.tsx` líneas 1179-1299
- Health Check líneas 158-173
- API Tests líneas 175-207
- DB Stats líneas 209-226

### REQNF.5 - Solo Escritorio
📍 **Ubicación**: `frontend/src/styles/globals.css` líneas 71-91  
Media query: `@media (max-width: 1024px)`

### REQR-001 - Base de Datos Normalizada
📍 **Ubicación**: `backend/prisma/schema.prisma`  
3 modelos: `Dispositivo`, `Reserva`, `Metrica` con relaciones definidas

---

## 🧪 API Endpoints

### Dispositivos
- `GET /api/dispositivos` - Listar todos
- `POST /api/dispositivos` - Crear nuevo
- `PUT /api/dispositivos/:id` - Actualizar
- `DELETE /api/dispositivos/:id` - Eliminar

### Reservas
- `GET /api/reservas` - Listar todas
- `POST /api/reservas` - Crear nueva
- `PUT /api/reservas/:id` - Actualizar
- `DELETE /api/reservas/:id` - Eliminar

### Métricas
- `GET /api/metricas` - Listar todas
- `POST /api/metricas` - Crear nueva

### Sistema
- `GET /health` - Health check del sistema

---

## 🐛 Solución de Problemas

### Backend no inicia
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `backend/.env`
- Verificar que el puerto 4000 esté libre

### Frontend no carga datos
- Verificar que el backend esté corriendo en puerto 4000
- Revisar consola del navegador (F12)
- Verificar configuración en `frontend/.env.local`

### Error de migraciones
```bash
cd backend
npx prisma migrate reset
npx prisma migrate deploy
npx prisma generate
```

---

## 📄 Licencia

Proyecto académico - Pontificia Universidad Javeriana Cali © 2025

---

## 👥 Autor

Desarrollado como proyecto de demostración académica.
