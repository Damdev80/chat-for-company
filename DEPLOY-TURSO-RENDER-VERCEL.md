# Deployment Guide: Turso + Render + Vercel

Este documento explica cómo desplegar la aplicación de chat con control de acceso basado en roles (RBAC) utilizando:

- **Turso** para la base de datos
- **Render** para el backend
- **Vercel** para el frontend

## Pasos de Despliegue

### 1. Configurar Base de Datos Turso

1. **Crear una cuenta y base de datos en Turso**:
   - Regístrate en [Turso](https://turso.tech/) (tiene un plan gratuito)
   - Instala la CLI de Turso y autentica:
     ```bash
     curl -sSfL https://get.tur.so/install.sh | bash
     turso auth login
     ```

2. **Crear una base de datos**:
   ```bash
   turso db create chat-app-db
   ```

3. **Importar el esquema de la base de datos**:
   ```bash
   turso db shell chat-app-db < schema.sql
   ```

4. **Obtener las credenciales**:
   - URL de conexión:
     ```bash
     turso db show chat-app-db --url
     ```
   - Token de autenticación:
     ```bash
     turso db tokens create chat-app-db
     ```
   
   Guarda estos valores; los necesitarás para configurar Render.

### 2. Desplegar Backend en Render

1. **Crear una cuenta en [Render](https://render.com/)** si aún no tienes una.

2. **Crear un nuevo servicio Web**:
   - Conecta tu repositorio de GitHub/GitLab
   - En la configuración del servicio:
     - **Nombre**: `chat-app-backend`
     - **Runtime**: Node
     - **Build Command**: `cd BackEnd && npm install`
     - **Start Command**: `cd BackEnd && npm run prod`
     - **Plan**: Free (o superior según necesites)

3. **Configurar variables de entorno**:
   Agrega las siguientes variables de entorno:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = `[genera-un-secreto-aleatorio]`
   - `CORS_ORIGIN` = `https://tu-app-frontend.vercel.app` (actualizar cuando tengas el dominio de Vercel)
   - `TURSO_URL` = `[URL de tu base de datos Turso]`
   - `TURSO_AUTH_TOKEN` = `[Token de autenticación de Turso]`

4. **Iniciar implementación**: Haz clic en "Create Web Service" y espera a que se complete el despliegue.

5. **Anotar URL del backend**: Cuando el despliegue termine, anota la URL (será algo como `https://chat-app-backend.onrender.com`).

### 3. Desplegar Frontend en Vercel

1. **Actualizar archivo de entorno para producción**:
   Edita el archivo `frontEnd/.env.production`:
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   VITE_SOCKET_URL=https://tu-backend.onrender.com
   ```

2. **Crear una cuenta en [Vercel](https://vercel.com/)** si aún no tienes una.

3. **Importar repositorio**:
   - Conecta tu cuenta de GitHub/GitLab
   - Selecciona el repositorio de tu aplicación
   
4. **Configurar el proyecto**:
   - Framework preset: Vite
   - Root Directory: frontEnd
   - Build Command: `npm run build`
   - Output Directory: dist
   
5. **Variables de entorno** (opcional, también puedes usar el archivo .env.production):
   - `VITE_API_URL` = `https://tu-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://tu-backend.onrender.com`

6. **Desplegar**: Haz clic en "Deploy" y espera a que se complete el proceso.

7. **Anotar URL del frontend**: Cuando termine, anota la URL de tu aplicación (será algo como `https://chat-app.vercel.app`).

### 4. Actualizar la configuración de CORS

Una vez que tengas la URL de tu frontend, debes actualizar la configuración de CORS en tu backend en Render:

1. Ve a tu servicio backend en el panel de Render
2. Encuentra la sección "Environment"
3. Actualiza la variable `CORS_ORIGIN` con la URL exacta de tu frontend de Vercel
4. Guarda los cambios y reinicia el servicio

## Verificación Post-Despliegue

1. **Verificar la conexión del frontend al backend**:
   - Abre la URL de tu aplicación frontend
   - Intenta iniciar sesión o registrar un usuario
   - Verifica que la comunicación con el backend funcione correctamente

2. **Verificar la funcionalidad de chat**:
   - Inicia sesión con dos usuarios diferentes (puedes usar dos navegadores o el modo incógnito)
   - Intenta enviar mensajes entre ellos
   - Verifica que los mensajes se envían y reciben en tiempo real

3. **Verificar el RBAC (control de acceso basado en roles)**:
   - Inicia sesión con una cuenta de administrador
   - Verifica que puedes acceder a las funciones de administración
   - Inicia sesión con una cuenta normal y verifica que no puedas acceder a esas funciones

## Resolución de Problemas

### Problemas de conexión a Turso
- Verifica que las variables `TURSO_URL` y `TURSO_AUTH_TOKEN` estén correctamente configuradas
- Asegúrate de que la importación del esquema SQL fue exitosa

### Errores de CORS
- Verifica que la variable `CORS_ORIGIN` en Render apunte exactamente a la URL de tu frontend
- Asegúrate de incluir el protocolo (`https://`) y eliminar cualquier barra final (`/`)

### Socket.IO no conecta
- Verifica la URL de socket configurada en el frontend
- Asegúrate de que no haya bloqueos por firewall o redes

### Errores en el despliegue de Render o Vercel
- Revisa los logs de despliegue para identificar errores específicos
- Asegúrate de que las rutas en los comandos de build sean correctas

## Mantenimiento Continuo

- Los cambios en la rama principal del repositorio se desplegarán automáticamente
- Para cambios en el esquema de la base de datos, deberás ejecutar las migraciones manualmente en Turso
- Monitorea el uso de recursos en los paneles de Turso, Render y Vercel para evitar alcanzar límites de los planes gratuitos