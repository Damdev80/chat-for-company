# Guía de Contribución a ChatEmpresa

¡Gracias por tu interés en contribuir a ChatEmpresa! Este documento proporciona las directrices y procesos recomendados para contribuir exitosamente a este proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Flujo de Trabajo de Desarrollo](#flujo-de-trabajo-de-desarrollo)
- [Envío de Pull Requests](#envío-de-pull-requests)
- [Convenciones de Código](#convenciones-de-código)
- [Reporte de Bugs](#reporte-de-bugs)
- [Solicitudes de Funcionalidades](#solicitudes-de-funcionalidades)

## Código de Conducta

Este proyecto adopta un Código de Conducta que esperamos que todos los participantes respeten. Por favor, lee el [Código de Conducta](CODE_OF_CONDUCT.md) completo para que entiendas qué acciones se tolerarán y cuáles no.

## Estructura del Proyecto

ChatEmpresa sigue una arquitectura monorepo con dos carpetas principales:

### Frontend (`/frontEnd`)
- React 19.x + Vite 6.x
- Tailwind CSS 4.x para estilos
- Socket.io-client para comunicación en tiempo real
- React Router para navegación

### Backend (`/BackEnd`) 
- Express.js 5.x
- Socket.IO 4.x para comunicación en tiempo real
- Turso/libSQL como base de datos principal
- JWT para autenticación
- Zod para validación de datos

## Flujo de Trabajo de Desarrollo

1. **Configuración del Entorno de Desarrollo**

```bash
# Clonar el repositorio
git clone https://github.com/damdev80/chatempresa.git
cd chatempresa

# Instalar dependencias backend
cd BackEnd
npm install

# Instalar dependencias frontend
cd ../frontEnd
npm install

# Configurar archivos .env (ver ejemplos en .env.example)
```

2. **Crear una Rama para tu Trabajo**

```bash
git checkout -b feature/nombre-caracteristica
# o
git checkout -b fix/nombre-bug
```

3. **Ejecutar Ambos Servicios en Desarrollo**

```bash
# Terminal 1 (Backend)
cd BackEnd
npm run dev

# Terminal 2 (Frontend)
cd frontEnd
npm run dev
```

4. **Probar tus Cambios**
   - Asegúrate de que tu código pase todas las pruebas existentes
   - Añade nuevas pruebas si estás implementando nuevas características

## Envío de Pull Requests

1. **Actualiza tu rama con los últimos cambios de `main`**
```bash
git checkout main
git pull origin main
git checkout tu-rama
git merge main
```

2. **Asegúrate de que todo funciona correctamente**
   - El backend se ejecuta sin errores
   - El frontend se compila y se ejecuta correctamente
   - Todas las pruebas pasan

3. **Haz commit de tus cambios con mensajes descriptivos**
```bash
git add .
git commit -m "feat: añadida funcionalidad X que resuelve Y"
```

4. **Envía tu rama y crea un Pull Request**
```bash
git push origin tu-rama
```
Luego ve a GitHub y crea un Pull Request con una descripción clara de tus cambios.

## Convenciones de Código

### Commits

Seguimos el estándar de [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` para nuevas características
- `fix:` para correcciones de bugs
- `docs:` para cambios en documentación
- `style:` para cambios que no afectan el significado del código
- `refactor:` para cambios de código que no corrigen bugs ni añaden características
- `test:` para añadir o modificar pruebas
- `chore:` para cambios en el proceso de build o herramientas auxiliares

### JavaScript/React

- Usamos ESLint con las reglas estándar de React
- Preferimos funciones de componente con hooks sobre componentes de clase
- Usamos camelCase para variables y funciones
- Usamos PascalCase para componentes React
- Comentamos el código complejo o no obvio

### Estilo CSS

- Usamos Tailwind CSS para estilos
- Para estilos personalizados, seguimos la metodología BEM

## Reporte de Bugs

Si encuentras un bug, por favor crea un issue en GitHub con:
- Un título claro y descriptivo
- Una descripción detallada de cómo reproducir el bug
- Si es posible, capturas de pantalla o videos
- Información de tu entorno (navegador, sistema operativo, etc.)

## Solicitudes de Funcionalidades

Para solicitar nuevas funcionalidades:
- Verifica primero si ya existe un issue similar
- Explica claramente qué funcionalidad te gustaría y por qué sería valiosa
- Si es posible, proporciona ejemplos de cómo debería funcionar

---

¡Gracias por contribuir a ChatEmpresa! Tu ayuda es invaluable para mejorar este proyecto.
