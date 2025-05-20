# CHAT_EMPRESARIAL

CHAT_DEV es una aplicación de chat en tiempo real desarrollada con Node.js, Express y Socket.io. Permite la gestión de usuarios, roles y mensajes, integrando autenticación y validaciones.

## Características principales
- Chat en tiempo real con Socket.io
- Gestión de usuarios y roles
- Validación de datos en endpoints
- Arquitectura modular (MVC)
- API RESTful para mensajes, usuarios y roles

## Tecnologías utilizadas
- Node.js
- Express
- Socket.io
- Sequelize (ORM)
- Base de datos relacional (ej: MySQL, PostgreSQL)

## Instalación
1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd CHAT_DEV
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura la base de datos y variables de entorno en `src/config/config.js`.
4. Inicia el servidor:
   ```bash
   npm start
   ```

## Estructura del proyecto
```
CHAT_DEV/
├── app.js                # Configuración principal de la app Express
├── server.js             # Inicialización del servidor y Socket.io
├── src/
│   ├── config/           # Configuración de la app y la base de datos
│   ├── controllers/      # Lógica de negocio para usuarios, roles y mensajes
│   ├── middlewares/      # Middlewares personalizados
│   ├── models/           # Modelos Sequelize (User, Role, Message)
│   ├── routes/           # Definición de rutas para la API
│   ├── utils/            # Utilidades varias
│   ├── validations/      # Validaciones de datos
│   └── views/            # Vistas (si aplica)
├── public/               # Archivos estáticos (frontend)
├── test/                 # Pruebas
├── package.json          # Dependencias y scripts
└── README.md             # Documentación
```

## Scripts disponibles
- `npm start`: Inicia la aplicación en modo producción
- `npm run dev`: Inicia la aplicación en modo desarrollo (si está configurado)
- `npm test`: Ejecuta las pruebas

## Endpoints principales
- `/api/users` - Gestión de usuarios
- `/api/roles` - Gestión de roles
- `/api/messages` - Gestión de mensajes

## Contribución
¡Las contribuciones son bienvenidas! Por favor, abre un issue o pull request para sugerencias o mejoras.

## Licencia
Este proyecto está bajo la licencia MIT.