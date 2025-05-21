# Cheatsheet de Despliegue - Turso + Render + Vercel

## Credenciales y URLs

| Servicio | Información Necesaria |
|----------|----------------------|
| **Turso** | URL: `libsql://your-db.turso.io` <br> Auth Token: `tu-token-generado` |
| **Render** | URL del backend: `https://chat-app-backend.onrender.com` |
| **Vercel** | URL del frontend: `https://chat-app-frontend.vercel.app` |

## Comandos Clave de Turso

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Autenticarse
turso auth login

# Crear DB
turso db create chat-app-db

# Obtener URL
turso db show chat-app-db --url

# Generar token
turso db tokens create chat-app-db

# Importar esquema
turso db shell chat-app-db < schema.sql
```

## Variables de Entorno Críticas

### Backend (Render)
- `NODE_ENV=production`
- `PORT=10000`
- `JWT_SECRET=tu-secreto-seguro`
- `CORS_ORIGIN=https://chat-app-frontend.vercel.app`
- `TURSO_URL=libsql://your-db.turso.io`
- `TURSO_AUTH_TOKEN=tu-token-generado`

### Frontend (Vercel)
- `VITE_API_URL=https://chat-app-backend.onrender.com/api`
- `VITE_SOCKET_URL=https://chat-app-backend.onrender.com`

## Orden de Despliegue

1. **Base de datos** (Turso)
2. **Backend** (Render)
3. **Frontend** (Vercel)
4. **Actualizar CORS** en Render con URL final de Vercel

## Verificación Post-Despliegue

- [ ] Crear cuenta de usuario
- [ ] Enviar mensajes
- [ ] Verificar funcionalidades de administrador
- [ ] Comprobar chat en tiempo real

## Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| Error de conexión DB | Verifica TURSO_URL y TURSO_AUTH_TOKEN |
| Error CORS | Actualiza CORS_ORIGIN con URL exacta de frontend |
| Socket.IO no conecta | Verifica VITE_SOCKET_URL y puerto correcto |
| Error 404 en frontend | Verifica rutas en vercel.json |
| Error en API | Verifica logs en Render y rutas API |

## Recursos de Monitoreo

- Logs de Render: Panel de servicio > Logs
- Métricas de Turso: Dashboard de Turso
- Analíticas de Vercel: Panel de proyecto > Analytics
