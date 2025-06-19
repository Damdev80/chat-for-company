# � Sistema Colaborativo Empresarial

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Versión">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="Licencia">
  <img src="https://img.shields.io/badge/deploy-Vercel%20%2B%20Render-black.svg" alt="Deploy">
  <img src="https://img.shields.io/badge/database-Turso%20(SQLite)-orange.svg" alt="Database">
  <img src="https://img.shields.io/badge/AI-DeepSeek-purple.svg" alt="AI">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Speech%20Balloon.png" alt="Chat Icon" width="200" />
</p>

## 📋 Tabla de Contenidos

- [📝 Descripción](#-descripción)
- [✨ Características](#-características)
- [� Nuevas Funcionalidades](#-nuevas-funcionalidades)
- [�🏗️ Arquitectura](#-arquitectura)
- [🚀 Instalación](#-instalación)
- [💻 Desarrollo Local](#-desarrollo-local)
- [🤖 Configuración de IA](#-configuración-de-ia)
- [📦 Despliegue](#-despliegue)
- [📚 Documentación API](#-documentación-api)
- [� Seguridad](#-seguridad)
- [�👥 Contribuciones](#-contribuciones)
- [📄 Licencia](#-licencia)

## 📝 Descripción

**Sistema Colaborativo Empresarial** es una plataforma integral de comunicación y gestión empresarial que revoluciona la forma en que los equipos colaboran, innovan y ejecutan proyectos. 

Combina **comunicación en tiempo real**, **gestión de ideas colaborativa**, **calendario inteligente**, **gestión de objetivos** y un **asistente de IA personalizado** en una sola solución empresarial.

### 🎯 **Arquitectura Tecnológica**
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Socket.IO
- **Base de datos**: Turso (SQLite distribuido)
- **Autenticación**: JWT (JSON Web Tokens)
- **IA**: DeepSeek API para asistente inteligente
- **Real-time**: WebSockets para comunicación instantánea

## ✨ Características

### 🔐 **Autenticación y Seguridad**
- Sistema de registro e inicio de sesión robusto
- Autenticación basada en tokens JWT seguros
- Roles de usuario granulares (administrador, usuario)
- Protección de rutas y endpoints por permisos
- Middleware de seguridad multicapa

### 💬 **Comunicación Empresarial Avanzada**
- Chat global de empresa accesible para todos
- Grupos de chat privados por departamento/proyecto
- Mensajería en tiempo real con Socket.IO
- Indicadores de estado de escritura en vivo
- Historial completo de conversaciones
- Envío optimista para mejor UX

### 🎯 **Gestión de Objetivos y Tareas**
- Creación de objetivos empresariales estratégicos
- Desglose de objetivos en tareas específicas
- Asignación de tareas a miembros del equipo
- Seguimiento de progreso en tiempo real
- Priorización inteligente (bajo, medio, alto, crítico)
- Estados dinámicos (pendiente, en progreso, completado)
- Fechas límite y recordatorios automáticos

### 👥 **Gestión de Equipos**
- Creación y administración de grupos de trabajo
- Listado de usuarios activos y permisos
- Notificaciones de actividad en tiempo real
- Perfiles de usuario con roles específicos

### 🎨 **Interfaz de Usuario Moderna**
- Diseño responsivo para todas las pantallas
- Tema oscuro profesional y elegante
- Avatares dinámicos con colores únicos
- Animaciones fluidas y microinteracciones
- Estado de conexión en tiempo real
- Cards interactivas con efectos hover

## 🆕 **Nuevas Funcionalidades**

### � **Muro de Ideas Colaborativo**
- **Captura de Ideas**: Sistema para registrar ideas innovadoras instantáneamente
- **Votación Democrática**: Sistema de likes/dislikes para evaluar ideas
- **Categorización Inteligente**: Ideas organizadas por categorías (general, feature, mejora, bug, otros)
- **Gestión de Estados**: Draft → Propuesta → En Revisión → Aprobada → Implementada
- **Priorización**: Sistema de prioridades (bajo, medio, alto, urgente)
- **Solo Admins Aprueban**: Control de calidad en la implementación de ideas
- **Ideas por Grupo**: Cada equipo tiene su propio muro de ideas
- **Métricas de Engagement**: Seguimiento de participación y popularidad

### 📅 **Calendario de Fechas Especiales**
- **Eventos Empresariales**: Gestión centralizada de fechas importantes
- **Vinculación con Objetivos**: Eventos conectados a objetivos específicos
- **Tipos de Eventos**: Deadlines, reuniones, hitos, recordatorios, celebraciones
- **Vista de Calendario**: Interfaz visual intuitiva por meses
- **Recordatorios Inteligentes**: Notificaciones automáticas configurables
- **Priorización de Eventos**: Sistema de importancia visual
- **Estados Dinámicos**: Programado, completado, cancelado, pospuesto
- **Calendario por Grupo**: Eventos específicos para cada equipo

### 🤖 **Asistente de IA Personalizado (ALEXANDRA)**
- **IA Experta**: Asistente empresarial especializado en múltiples áreas
- **Consultas de Base de Datos**: Acceso seguro a información de proyectos
- **Chat Individual**: Cada usuario tiene su propio asistente personal
- **Restricciones de Seguridad**: Protecciones robustas contra accesos no autorizados
- **Conocimiento Empresarial**: Consejos sobre gestión, productividad y mejores prácticas
- **Soporte 24/7**: Disponible siempre para consultas y asistencia
- **Respuestas Contextuales**: Entiende el contexto del usuario y empresa
- **Integración con DeepSeek**: IA económica y eficiente
- **Modo Demo**: Funciona sin API key para pruebas

### 🔒 **Seguridad Empresarial Avanzada**
- **Validación de Mensajes**: Filtros contra comandos peligrosos
- **Restricciones de IA**: El asistente no puede acceder a datos sensibles
- **Logs de Auditoría**: Registro de actividades críticas
- **Protección de Datos**: Encriptación y manejo seguro de información
- **Control de Acceso**: Permisos granulares por funcionalidad

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura cliente-servidor robusta** con separación clara de responsabilidades:

### Frontend (React + Vite)
```
frontEnd/
├── src/
│   ├── components/
│   │   ├── chat/           # Componentes de chat y comunicación
│   │   ├── ideas/          # Muro de ideas colaborativo
│   │   ├── calendar/       # Calendario de fechas especiales
│   │   ├── support/        # Chat de apoyo con IA
│   │   ├── objectives/     # Gestión de objetivos y tareas
│   │   └── common/         # Componentes reutilizables
│   ├── pages/              # Páginas principales (Login, Register, Dashboard)
│   ├── utils/              # Utilidades (API, Auth, Socket)
│   ├── context/            # Contextos de React (Auth, Socket)
│   ├── hooks/              # Custom hooks
│   └── routes/             # Configuración de rutas
├── styles/                 # Estilos CSS y Tailwind
└── public/                 # Assets estáticos
```

### Backend (Express + Socket.IO)
```
BackEnd/
├── src/
│   ├── config/
│   │   ├── database-schema.sql  # Esquema completo de BD
│   │   ├── turso.js            # Configuración Turso DB
│   │   └── socket.io.js        # Configuración WebSockets
│   ├── controllers/
│   │   ├── user.controller.js       # Gestión de usuarios
│   │   ├── message.controller.js    # Mensajería
│   │   ├── group.controller.js      # Grupos de trabajo
│   │   ├── objective.controller.js  # Objetivos empresariales
│   │   ├── task.controller.js       # Tareas y asignaciones
│   │   ├── idea.controller.js       # Muro de ideas
│   │   ├── event.controller.js      # Calendario de eventos
│   │   └── supportChat.controller.js # Chat de apoyo IA
│   ├── models/
│   │   ├── user.js         # Modelo de usuarios
│   │   ├── message.js      # Modelo de mensajes
│   │   ├── group.js        # Modelo de grupos
│   │   ├── objective.js    # Modelo de objetivos
│   │   ├── task.js         # Modelo de tareas
│   │   ├── idea.js         # Modelo de ideas
│   │   ├── event.js        # Modelo de eventos
│   │   └── supportChat.js  # Modelo de chat IA
│   ├── services/
│   │   └── aiService.js    # Servicio de IA (DeepSeek)
│   ├── middlewares/
│   │   ├── auth.middleware.js       # Autenticación JWT
│   │   ├── role.middleware.js       # Control de roles
│   │   ├── validation.middleware.js # Validaciones Zod
│   │   └── error.middleware.js      # Manejo de errores
│   ├── routes/             # Definición de endpoints API
│   ├── validations/        # Esquemas de validación Zod
│   └── utils/              # Utilidades del servidor
├── uploads/                # Archivos subidos
└── server.js              # Punto de entrada
```

### Base de Datos (Turso/SQLite)
```sql
-- Principales tablas
users           # Usuarios del sistema
groups          # Grupos de trabajo
messages        # Mensajes de chat
objectives      # Objetivos empresariales
tasks           # Tareas específicas
ideas           # Muro de ideas
idea_votes      # Sistema de votación
events          # Calendario de fechas
support_chats   # Chats de apoyo IA
support_messages # Mensajes con IA
```

## 🚀 Instalación

### Requisitos Previos
- **Node.js** (v18.x o superior)
- **NPM** o Yarn
- **Cuenta en Turso** para la base de datos distribuida
- **API Key de DeepSeek** para el asistente de IA (opcional)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/sistema-colaborativo-empresarial.git
cd sistema-colaborativo-empresarial
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
```env
# Servidor
NODE_ENV=development
PORT=3000
JWT_SECRET=tu_secreto_jwt_super_seguro
CORS_ORIGIN=http://localhost:5173

# Base de datos Turso
TURSO_URL=libsql://tu-instancia.turso.io
TURSO_AUTH_TOKEN=tu_token_turso

# DeepSeek IA (opcional - funciona en modo demo sin esto)
DEEPSEEK_API_KEY=sk-tu_api_key_deepseek
```

*Frontend (.env.local)*
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

5. **Crear las tablas en la base de datos**
```bash
cd BackEnd
node src/config/create-tables.js
```

## 💻 Desarrollo Local

### Iniciar Backend
```bash
cd BackEnd
npm run dev
# El servidor se iniciará en http://localhost:3000
```

### Iniciar Frontend
```bash
cd frontEnd
npm run dev
# La aplicación se abrirá en http://localhost:5173
```

### 🎯 **Primer Uso**
1. **Regístrate** como el primer usuario (automáticamente será admin)
2. **Crea grupos** de trabajo desde el panel de administración
3. **Invita usuarios** a los grupos correspondientes
4. **Empieza a colaborar** con chat, ideas, objetivos y calendario

## 🤖 Configuración de IA

### Obtener API Key de DeepSeek

1. **Registrarse**: Ve a [platform.deepseek.com](https://platform.deepseek.com)
2. **Verificar email** y completar registro
3. **Obtener créditos gratis**: $5 USD al registrarte (suficiente para meses)
4. **Crear API Key**: En el dashboard → "API Keys" → "Create new key"
5. **Configurar**: Agregar la key al archivo `.env` del backend

```env
DEEPSEEK_API_KEY=sk-tu_api_key_aqui
```

### Características de DeepSeek

- **💰 Económico**: 20x más barato que OpenAI/Anthropic
- **🚀 Rápido**: Respuestas en menos de 2 segundos
- **🆓 Créditos gratis**: $5 USD al registrarte
- **🔒 Seguro**: Restricciones robustas implementadas
- **📚 Inteligente**: Especializado en consultas empresariales

### Modo Demo Sin API Key

Si no tienes API key, el sistema funciona en **modo demo** con respuestas simuladas inteligentes:

```env
# Deja esto vacío o comenta la línea
# DEEPSEEK_API_KEY=
```

## 📦 Despliegue

La aplicación está optimizada para desplegarse en:
- **Frontend**: Vercel (recomendado)
- **Backend**: Render, Railway, o similar
- **Base de datos**: Turso (SQLite distribuido global)

### Despliegue en Vercel (Frontend)

El archivo `vercel.json` está configurado para despliegue automático:
```json
{
  "buildCommand": "cd frontEnd && npm install && npm run build",
  "outputDirectory": "frontEnd/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_URL": "https://tu-backend.onrender.com/api",
    "VITE_SOCKET_URL": "https://tu-backend.onrender.com"
  }
}
```

### Variables de Entorno de Producción

**Backend (Render/Railway)**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_secreto_jwt_super_seguro_produccion
TURSO_URL=libsql://tu-instancia-prod.turso.io
TURSO_AUTH_TOKEN=tu_token_turso_produccion
DEEPSEEK_API_KEY=sk-tu_api_key_deepseek
CORS_ORIGIN=https://tu-frontend.vercel.app
```

**Frontend (Vercel)**
```env
VITE_API_URL=https://tu-backend.onrender.com/api
VITE_SOCKET_URL=https://tu-backend.onrender.com
```

## 📚 Documentación API

### 🔐 **Autenticación**
```http
POST /api/users/login     # Iniciar sesión
POST /api/users/register  # Registrar nuevo usuario
GET  /api/users/verify    # Verificar token JWT
```

### 💬 **Mensajes y Chat**
```http
GET    /api/messages           # Obtener historial de mensajes
POST   /api/messages           # Enviar nuevo mensaje
DELETE /api/messages/:id       # Eliminar mensaje (admin)
GET    /api/messages/group/:id # Mensajes de grupo específico
```

### 👥 **Usuarios y Grupos**
```http
GET    /api/users              # Listar usuarios (admin)
GET    /api/users/:id          # Obtener usuario específico
GET    /api/groups             # Listar grupos
POST   /api/groups             # Crear grupo (admin)
PUT    /api/groups/:id         # Actualizar grupo (admin)
DELETE /api/groups/:id         # Eliminar grupo (admin)
```

### 🎯 **Objetivos y Tareas**
```http
GET    /api/objectives         # Listar objetivos
POST   /api/objectives         # Crear objetivo
PUT    /api/objectives/:id     # Actualizar objetivo
DELETE /api/objectives/:id     # Eliminar objetivo
GET    /api/tasks              # Listar tareas
POST   /api/tasks              # Crear tarea
PUT    /api/tasks/:id          # Actualizar tarea
DELETE /api/tasks/:id          # Eliminar tarea
```

### 💡 **Muro de Ideas**
```http
GET    /api/ideas              # Listar ideas por grupo
POST   /api/ideas              # Crear nueva idea
PUT    /api/ideas/:id          # Actualizar idea
DELETE /api/ideas/:id          # Eliminar idea (admin)
POST   /api/ideas/:id/vote     # Votar por idea (like/dislike)
PUT    /api/ideas/:id/status   # Cambiar estado (admin)
```

### 📅 **Calendario de Eventos**
```http
GET    /api/events             # Listar eventos por grupo
POST   /api/events             # Crear evento
PUT    /api/events/:id         # Actualizar evento
DELETE /api/events/:id         # Eliminar evento
GET    /api/events/month/:date # Eventos del mes
```

### 🤖 **Chat de Apoyo IA**
```http
GET    /api/support/chat       # Obtener/crear chat activo
POST   /api/support/:chatId/message # Enviar mensaje a IA
GET    /api/support/:chatId/messages # Historial del chat
PUT    /api/support/:chatId/status  # Cambiar estado del chat
```

### 📡 **WebSocket Events**
```javascript
// Cliente → Servidor
socket.emit('join_group', { groupId })
socket.emit('send_message', { content, groupId })
socket.emit('user_typing', { groupId, isTyping })

// Servidor → Cliente
socket.on('receive_message', (message))
socket.on('user_typing', ({ userId, isTyping }))
socket.on('user_connected', (user))
socket.on('user_disconnected', (userId))
```

## 🔒 Seguridad

### 🛡️ **Medidas de Seguridad Implementadas**

#### **Autenticación y Autorización**
- ✅ JWT tokens seguros con expiración
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ Control de roles granular (admin/usuario)
- ✅ Validación de permisos por endpoint

#### **Asistente de IA Seguro**
- ✅ **Restricciones robustas**: No puede acceder a contraseñas, crear/eliminar tablas
- ✅ **Validación de comandos**: Filtros contra SQL injection y comandos peligrosos
- ✅ **Contexto limitado**: Solo acceso a información no sensible
- ✅ **Logs de auditoría**: Registro de todas las consultas a IA
- ✅ **Rate limiting**: Límites de uso por usuario

#### **Validación de Datos**
- ✅ Esquemas Zod para validación de entrada
- ✅ Sanitización de inputs del usuario
- ✅ Protección contra XSS y CSRF
- ✅ Validación de tipos de archivo en uploads

#### **Base de Datos**
- ✅ Consultas parametrizadas (prevención SQL injection)
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Indices optimizados para mejor rendimiento
- ✅ Backup automático en Turso

### 🚨 **Restricciones del Asistente IA (ALEXANDRA)**

#### **❌ NO PUEDE:**
- Acceder a contraseñas o tokens de autenticación
- Modificar, crear o eliminar tablas de base de datos
- Ejecutar comandos del sistema operativo
- Acceder a información personal de otros usuarios
- Realizar transacciones financieras
- Revelar detalles de infraestructura

#### **✅ SÍ PUEDE:**
- Consultar información pública de proyectos
- Dar consejos sobre gestión y productividad
- Explicar funcionalidades de la plataforma
- Ayudar con planificación y organización
- Proporcionar mejores prácticas empresariales

## 👥 Contribuciones

¡Nos encantaría recibir tu ayuda para mejorar el Sistema Colaborativo Empresarial! 

### 🚀 **Cómo Contribuir**

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre un Pull Request**

### 📋 **Áreas de Mejora**

- 🔍 **Búsqueda avanzada** en mensajes e ideas
- 📊 **Dashboard analítico** con métricas empresariales
- 🔔 **Sistema de notificaciones** push en tiempo real
- 📱 **App móvil nativa** con React Native
- 🌍 **Internacionalización** (múltiples idiomas)
- 🎨 **Temas personalizables** y modo claro
- 🔗 **Integraciones** con herramientas terceras (Slack, Trello, etc.)

### 🐛 **Reportar Bugs**

Si encuentras un bug, por favor:
1. Verifica que no esté ya reportado
2. Incluye pasos para reproducirlo
3. Agrega screenshots si es posible
4. Especifica tu entorno (OS, navegador, etc.)

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - Consulta el archivo [LICENSE](LICENSE) para más detalles.

### 📈 **Estadísticas del Proyecto**

- **📦 Tecnologías**: 8+ tecnologías modernas integradas
- **🔧 Funcionalidades**: 25+ características empresariales
- **🛡️ Seguridad**: Múltiples capas de protección implementadas
- **⚡ Rendimiento**: Optimizado para teams de 5-500+ usuarios
- **🚀 Escalabilidad**: Arquitectura preparada para crecimiento

---

<div align="center">

### 🏢 **Transformando la Colaboración Empresarial**

*Desarrollado con ❤️ para revolucionar la forma en que los equipos trabajan juntos*

**[⭐ Star este repo](https://github.com/tu-usuario/sistema-colaborativo-empresarial)** | **[🐛 Reportar Bug](https://github.com/tu-usuario/sistema-colaborativo-empresarial/issues)** | **[💡 Solicitar Feature](https://github.com/tu-usuario/sistema-colaborativo-empresarial/issues)**

</div>
