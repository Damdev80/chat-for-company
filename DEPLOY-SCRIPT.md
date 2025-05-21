# Deploy Script

Este script te guiará paso a paso para desplegar tu aplicación en Turso, Render y Vercel.

## Preparativos

Asegúrate de tener instalado:
- Git
- Node.js
- npm
- Cuenta en GitHub/GitLab (recomendado)
- Cuenta en Turso
- Cuenta en Render
- Cuenta en Vercel

## 1. Configuración de Base de Datos Turso

```powershell
# Instala la CLI de Turso (si no la tienes)
curl -sSfL https://get.tur.so/install.sh | bash

# Inicia sesión en Turso
turso auth login

# Crea una base de datos
turso db create chat-app-db

# Importa el esquema SQL
turso db shell chat-app-db < schema.sql

# Obtén la URL de la base de datos
$turso_url = (turso db show chat-app-db --url)
Write-Output "URL de Turso: $turso_url"

# Crea un token de autenticación
$turso_token = (turso db tokens create chat-app-db)
Write-Output "Token de Turso: $turso_token"

# Guarda estos valores para usarlos en Render
```

## 2. Preparación del Repositorio

```powershell
# Si aún no has subido tu proyecto a un repositorio Git
git init
git add .
git commit -m "Preparación para despliegue"

# Añade tu repositorio remoto (GitHub, GitLab, etc.)
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main
```

## 3. Configuración de Variables de Entorno

1. Actualiza el archivo `BackEnd/.env.production` con los valores reales:
   ```
   TURSO_URL=libsql://chat-app-db.turso.io
   TURSO_AUTH_TOKEN=tu-token-de-turso
   JWT_SECRET=un-secreto-muy-seguro
   CORS_ORIGIN=https://tu-app-frontend.vercel.app
   ```

2. Actualiza el archivo `frontEnd/.env.production` con los valores reales:
   ```
   VITE_API_URL=https://chat-app-backend.onrender.com/api
   VITE_SOCKET_URL=https://chat-app-backend.onrender.com
   ```

## 4. Despliegue en Render

1. Regístrate/inicia sesión en [Render](https://render.com/)
2. Ve a "Blueprints" en el panel de Render
3. Haz clic en "New Blueprint Instance"
4. Conecta tu repositorio Git
5. Render detectará automáticamente el archivo `render.yaml`
6. Configura las variables de entorno que no están en el yaml:
   - `TURSO_URL`: La URL que obtuviste antes
   - `TURSO_AUTH_TOKEN`: El token que generaste antes

## 5. Despliegue en Vercel

1. Regístrate/inicia sesión en [Vercel](https://vercel.com/)
2. Haz clic en "Import Project"
3. Selecciona "Import Git Repository" y conecta tu repo
4. Configura el proyecto:
   - Framework Preset: Vite
   - Root Directory: frontEnd
   - Build Command: npm run build
   - Output Directory: dist
5. Configura las variables de entorno:
   - `VITE_API_URL`: https://chat-app-backend.onrender.com/api
   - `VITE_SOCKET_URL`: https://chat-app-backend.onrender.com
6. Haz clic en "Deploy"

## 6. Actualiza CORS después del despliegue

Una vez que tengas la URL de Vercel, actualiza la variable CORS_ORIGIN en Render:

1. Ve a tu servicio en Render
2. Haz clic en "Environment"
3. Cambia el valor de `CORS_ORIGIN` a la URL de tu frontend (ej. https://chat-app.vercel.app)
4. Haz clic en "Save Changes"

## 7. Verifica el despliegue

1. Abre tu aplicación en Vercel
2. Crea una cuenta de usuario
3. Intenta enviar mensajes
4. Verifica que el chat en tiempo real funcione

## Solución de problemas

Si encuentras problemas durante el despliegue:

- Verifica los logs de construcción y ejecución en Render y Vercel
- Asegúrate de que las variables de entorno sean correctas
- Verifica que la base de datos Turso sea accesible
- Revisa la configuración de CORS en el backend

## Recursos adicionales

Para más información, consulta la documentación oficial:
- [Documentación de Turso](https://docs.turso.tech/)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
