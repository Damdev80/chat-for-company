# 💬 Thinkchat

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Versión">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="Licencia">
  <img src="https://img.shields.io/badge/deploy-Vercel%20%2B%20Render-black.svg" alt="Deploy">
  <img src="https://img.shields.io/badge/database-Turso%20(SQLite)-orange.svg" alt="Database">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Speech%20Balloon.png" alt="Chat Icon" width="200" />
</p>

## 📋 Tabla de Contenidos

- [📝 Descripción](#-descripción)
- [✨ Características](#-características)
- [🏗️ Arquitectura](#-arquitectura)
- [🚀 Instalación](#-instalación)
- [💻 Desarrollo Local](#-desarrollo-local)
- [📦 Despliegue](#-despliegue)
- [📚 Documentación API](#-documentación-api)
- [👥 Contribuciones](#-contribuciones)
- [📄 Licencia](#-licencia)

## 📝 Descripción

Thinkchat es una solución de mensajería empresarial en tiempo real, diseñada para facilitar la comunicación dentro de equipos de trabajo. Permite intercambio de mensajes instantáneos, creación de grupos y gestión de usuarios con diferentes niveles de permisos.

La aplicación está construida con una arquitectura moderna:
- **Frontend**: React + Vite con Tailwind CSS
- **Backend**: Express.js con Socket.IO 
- **Base de datos**: Turso (SQLite distribuido)
- **Autenticación**: JWT (JSON Web Tokens)

## ✨ Características

### 🔐 Autenticación y Seguridad
- Registro e inicio de sesión de usuarios
- Autenticación basada en tokens JWT
- Roles de usuario (administrador, usuario regular)
- Protección de rutas por rol

### 💬 Mensajería
- Chat global accesible para todos los usuarios
- Mensajería en tiempo real con Socket.IO
- Grupos de chat privados
- Indicadores de estado de escritura
- Envío de mensajes con interfaz optimista (aparecen instantáneamente)

### 👥 Gestión de Usuarios y Grupos
- Creación y administración de grupos (solo admin)
- Listado de usuarios activos
- Notificaciones de nuevos mensajes

### 🎨 Interfaz de Usuario
- Diseño responsivo para móviles y escritorio
- Tema oscuro moderno y elegante
- Avatares con iniciales y colores únicos
- Estado de conexión en tiempo real

## 🏗️ Arquitectura

El proyecto sigue una arquitectura cliente-servidor:

### Frontend (React + Vite)
```
frontEnd/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas principales (Login, Register, Chat)
│   ├── utils/          # Utilidades (API, Auth, Socket)
│   └── routes/         # Configuración de rutas
└── styles/             # Estilos CSS y Tailwind
```

### Backend (Express + Socket.IO)
```
BackEnd/
├── src/
│   ├── config/         # Configuración (DB, Socket.IO, etc)
│   ├── controllers/    # Controladores para manejar peticiones
│   ├── middlewares/    # Middlewares (auth, roles, logging)
│   ├── models/         # Modelos de datos
│   ├── routes/         # Definición de rutas API
│   └── validations/    # Validaciones con Zod
└── server.js           # Punto de entrada
```

## 🚀 Instalación

### Requisitos Previos
- Node.js (v16.x o superior)
- NPM o Yarn
- Cuenta en Turso para la base de datos (o SQLite local para desarrollo)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/thinkchat.git
cd thinkchat
```

2. **Instalar dependencias del backend**
```bash
cd BackEnd
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontEnd
npm install
```

4. **Configurar variables de entorno**

*Backend (.env)*
```
NODE_ENV=development
PORT=3000
JWT_SECRET=tu_secreto_jwt
CORS_ORIGIN=http://localhost:5173
TURSO_URL=libsql://tu-instancia.turso.io
TURSO_AUTH_TOKEN=tu_token_turso
```

*Frontend (.env.local)*
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## 💻 Desarrollo Local

### Iniciar Backend
```bash
cd BackEnd
npm run dev
```

### Iniciar Frontend
```bash
cd frontEnd
npm run dev
```

Abre tu navegador en [http://localhost:5173](http://localhost:5173)

## 📦 Despliegue

La aplicación está configurada para desplegarse en:
- **Frontend**: Vercel
- **Backend**: Render
- **Base de datos**: Turso (SQLite distribuido)

### Despliegue en Vercel (Frontend)

El archivo `vercel.json` ya está configurado para el despliegue correcto:
```json
{
  "buildCommand": "cd frontEnd && npm install && npm run build",
  "outputDirectory": "frontEnd/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_URL": "https://chat-for-company.onrender.com/api",
    "VITE_SOCKET_URL": "https://chat-for-company.onrender.com"
  }
}
```

### Despliegue en Render (Backend)

El archivo `render.yaml` está configurado para el despliegue automático:
```yaml
services:
  - type: web
    name: chat-app-backend
    env: node
    plan: free
    buildCommand: cd BackEnd && npm install
    startCommand: cd BackEnd && npm run prod
    # ... configuración adicional
```

## 📚 Documentación API

La API RESTful proporciona los siguientes endpoints principales:

### Autenticación
- `POST /api/users/login` - Iniciar sesión
- `POST /api/users/register` - Registrar nuevo usuario

### Mensajes
- `GET /api/messages` - Obtener todos los mensajes
- `POST /api/messages` - Enviar un nuevo mensaje
- `DELETE /api/messages/:id` - Eliminar un mensaje (solo admin)

### Grupos
- `GET /api/groups` - Obtener todos los grupos
- `POST /api/groups` - Crear un nuevo grupo (solo admin)
- `PUT /api/groups/:id` - Actualizar grupo (solo admin)
- `DELETE /api/groups/:id` - Eliminar grupo (solo admin)

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (solo admin)
- `GET /api/users/:id` - Obtener un usuario específico

### Socket.IO Events
- `join_group` - Unirse a un grupo de chat
- `send_message` - Enviar un mensaje
- `receive_message` - Recibir un mensaje
- `user_typing` - Notificar que un usuario está escribiendo
- `ping_server` / `pong_client` - Verificar conexión

## 👥 Contribuciones

¡Nos encantaría recibir tu ayuda para mejorar Thinkchat! Consulta nuestras [guías de contribución](CONTRIBUTING.md) para empezar.

## 📄 Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE) - Consulta el archivo LICENSE para más detalles.

---

<p align="center">
  Desarrollado con ❤️ por el equipo de Thinkchat
</p>
