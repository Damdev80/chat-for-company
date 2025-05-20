# Chat App - Deployment Guide

Este proyecto es una aplicación de chat en tiempo real con roles de usuario y administrador. A continuación, se detallan los pasos para desplegar la aplicación usando Render.

## Estructura del proyecto

- **Frontend**: Aplicación React + Vite para la interfaz de usuario
- **Backend**: API REST con Node.js, Express y Socket.IO
- **Base de datos**: MySQL

## Pre-requisitos para el despliegue

1. Cuenta en [Render](https://render.com/)
2. Repositorio de código subido a GitHub, GitLab o BitBucket

## Pasos para el despliegue

### 1. Preparación del proyecto

Asegúrate de que todas las variables de entorno estén definidas en los siguientes archivos:

- `BackEnd/.env.production`
- `frontEnd/.env.production`

### 2. Despliegue usando render.yaml

El archivo `render.yaml` en la raíz del proyecto contiene la configuración necesaria para desplegar:
- El frontend
- El backend
- La base de datos MySQL

Para implementar usando este archivo:
1. Conéctate a tu cuenta de Render
2. Ve a "Blueprints" en el Dashboard
3. Selecciona "New Blueprint Instance"
4. Conecta tu repositorio
5. Render detectará automáticamente el archivo render.yaml y configurará los servicios

### 3. Despliegue manual en Render

Si prefieres desplegar manualmente:

#### Backend
1. En Render, crea un nuevo "Web Service"
2. Conecta tu repositorio
3. Configura:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run prod`
   - **Variables de entorno**: Configura todas las variables definidas en `.env.production`

#### Frontend
1. En Render, crea otro "Web Service"
2. Conecta el mismo repositorio
3. Configura:
   - **Environment**: Node
   - **Build Command**: `cd frontEnd && npm install && npm run build`
   - **Start Command**: `cd frontEnd && npm run preview -- --host 0.0.0.0 --port 3001`
   - **Variables de entorno**: Define `VITE_API_URL` y `VITE_SOCKET_URL` apuntando a tu backend

#### Base de datos
1. En Render, crea un nuevo servicio de "Database"
2. Selecciona MySQL
3. Anota las credenciales proporcionadas para configurar el backend

## Verificación post-despliegue

Después de completar el despliegue:

1. Verifica que la base de datos esté accesible desde el backend
2. Comprueba que el frontend pueda comunicarse con el backend
3. Prueba la funcionalidad de chat en tiempo real

## Resolución de problemas comunes

- **Error de conexión a la base de datos**: Verifica las variables de entorno y los permisos de acceso
- **Problemas de CORS**: Asegúrate de que la variable `CORS_ORIGIN` en el backend apunte correctamente al dominio del frontend
- **Socket.IO no conecta**: Verifica la configuración de Socket.IO y asegúrate de que `VITE_SOCKET_URL` apunte al backend

## Mantenimiento

Para actualizar la aplicación, simplemente realiza push a la rama principal de tu repositorio, y Render se encargará automáticamente de la implementación de los cambios.
