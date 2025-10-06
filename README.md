# Sistema Centralizado de Gestión de Robots y Drones

## Descripción General

Este proyecto implementa un sistema de información centralizado para la administración y monitoreo de robots y drones universitarios que prestan servicios de transporte interno y grabación audiovisual.

El sistema permite administrar los dispositivos, gestionar reservas, almacenar bitácoras de uso y simular el monitoreo de estado (ubicación, batería, sensores, etc.), así como guardar registros de video en la nube.  
Está diseñado para uso de los administradores del sistema, no para los usuarios finales.

## Objetivos del Proyecto

- Centralizar la gestión e inventario de los dispositivos.
- Registrar y consultar bitácoras con hora de salida, regreso y servicio.
- Implementar un sistema de reservas para asignar robots y drones.
- Simular un monitoreo en tiempo real de los dispositivos.
- Emular el almacenamiento en la nube de videos de recorridos.
- Crear una arquitectura modular y profesional separando el backend y el frontend.

## Arquitectura General

```
Proyecto/
│
├── backend/          ← API REST (Node.js + Express + Prisma + PostgreSQL)
│
└── frontend/         ← Interfaz (Next.js + Tailwind + consumo del backend)
```

Separación de responsabilidades:

- Backend: maneja la lógica del negocio, base de datos y API REST.  
- Frontend: presenta la interfaz de usuario y consume los datos del backend.  
Ambos pueden ejecutarse de manera independiente, pero se comunican vía HTTP local (http://localhost:4000).

## Tecnologías Utilizadas

### Backend
| Tecnología | Propósito |
|-------------|------------|
| Node.js | Entorno de ejecución de JavaScript del lado del servidor. |
| Express.js | Framework minimalista para crear APIs REST. |
| Prisma ORM | Manejador de base de datos relacional moderno y tipado. |
| PostgreSQL | Sistema de base de datos relacional para almacenar toda la información. |

### Frontend
| Tecnología | Propósito |
|-------------|------------|
| Next.js | Framework de React con soporte para SSR, rutas y API routes. |
| React | Librería para construir interfaces de usuario reactivas. |
| TailwindCSS | Framework CSS para un diseño moderno y responsivo. |
| TypeScript | Superset de JavaScript que agrega tipado estático. |

## Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:

- Node.js (versión 18 o superior)
- PostgreSQL
- Git
- Un editor de código (se recomienda Visual Studio Code)

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sistema-robots-drones.git
cd sistema-robots-drones
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

#### 2.1 Crear archivo .env
Dentro de la carpeta backend/, crear un archivo `.env` con la conexión a PostgreSQL:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/robots_drones"
PORT=4000
```

#### 2.2 Inicializar Prisma
```bash
npx prisma init
npx prisma migrate dev --name init
```

Esto crea la base de datos y genera el cliente de Prisma.

#### 2.3 Ejecutar el servidor backend
```bash
npm run dev
```

El backend estará disponible en:
```
http://localhost:4000
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```

#### 3.1 Crear archivo .env.local
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

#### 3.2 Ejecutar el servidor frontend
```bash
npm run dev
```

El frontend estará disponible en:
```
http://localhost:3000
```

## Estructura de Carpetas

```
Proyecto/
│
├── backend/
│   ├── src/
│   │   ├── index.js             # Punto de entrada del servidor Express
│   │   ├── routes/              # Rutas de la API
│   │   ├── controllers/         # Lógica de negocio
│   │   ├── prisma/              # Configuración y cliente de Prisma
│   │   └── middlewares/         # Middlewares de validación y seguridad
│   ├── prisma/
│   │   └── schema.prisma        # Definición del modelo de datos
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── app/                 # Páginas principales (Next.js)
    │   ├── components/          # Componentes reutilizables
    │   ├── styles/              # Estilos y Tailwind
    │   ├── hooks/               # Hooks personalizados
    │   ├── services/            # Conexión con la API backend
    │   └── types/               # Definiciones de tipos (TypeScript)
    ├── package.json
    └── .env.local
```

## Ejecución Completa

1. En una terminal:  
   ```bash
   cd backend
   npm run dev
   ```

2. En otra terminal:  
   ```bash
   cd frontend
   npm run dev
   ```

3. Abrir en el navegador:  
   http://localhost:3000

## Comunicación entre Módulos

El frontend (Next.js) realiza peticiones HTTP al backend (Express) utilizando fetch o axios.  
Ejemplo:

```ts
// frontend/src/services/dispositivos.ts
export async function obtenerDispositivos() {
  const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dispositivos`);
  return await respuesta.json();
}
```

## Notas Finales

- El sistema puede ejecutarse completamente en local, no requiere despliegue en la nube.
- Los datos de los drones y robots pueden emularse desde la base de datos (no se requiere hardware real).
- Se recomienda usar Prisma Studio para visualizar los datos de forma gráfica:
  ```bash
  npx prisma studio
  ```
  Luego abrir http://localhost:5555

## Licencia

Proyecto académico desarrollado como prototipo funcional dentro de la Universidad.  
Uso educativo y demostrativo sin fines comerciales.

Autor:  
Nicolás Carreño Tascón  
Ingeniería de Sistemas y Computación
