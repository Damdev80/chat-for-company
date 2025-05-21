# Pasos de despliegue para Turso + Render + Vercel

# Script listo para copiar y ejecutar en PowerShell
# Creado: 21-mayo-2025

<#
.SYNOPSIS
Script para desplegar la aplicación de chat en Turso, Render y Vercel.

.DESCRIPTION
Este script te guía a través del proceso de despliegue de la aplicación,
desde la creación de la base de datos hasta la configuración de los servicios.
#>

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE DE CHAT APP CON TURSO + RENDER + VERCEL" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar requisitos previos
Write-Host "PASO 1: Verificando requisitos previos..." -ForegroundColor Yellow
$requisitos = @("git", "npm", "node")
$faltantes = @()

foreach ($req in $requisitos) {
    try {
        $null = Get-Command $req -ErrorAction Stop
        Write-Host "✅ $req está instalado" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ $req no está instalado" -ForegroundColor Red
        $faltantes += $req
    }
}

if ($faltantes.Count -gt 0) {
    Write-Host "`nPor favor, instala las siguientes herramientas antes de continuar:" -ForegroundColor Red
    foreach ($tool in $faltantes) {
        Write-Host "  - $tool" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "PASO 2: Configuración de Turso" -ForegroundColor Yellow
Write-Host "Para configurar Turso, sigue estos pasos:"
Write-Host "1. Instala la CLI de Turso con el siguiente comando:"
Write-Host "   iwr https://get.tur.so/install.ps1 -useb | iex" -ForegroundColor Green
Write-Host ""
Write-Host "2. Inicia sesión en Turso:"
Write-Host "   turso auth login" -ForegroundColor Green
Write-Host ""
Write-Host "3. Crea una nueva base de datos:"
Write-Host "   turso db create chat-app-db" -ForegroundColor Green
Write-Host ""
Write-Host "4. Importa el esquema SQL:"
Write-Host "   turso db shell chat-app-db < schema.sql" -ForegroundColor Green
Write-Host ""
Write-Host "5. Obtén la URL y el token de autenticación:"
Write-Host "   turso db show chat-app-db --url" -ForegroundColor Green
Write-Host "   turso db tokens create chat-app-db" -ForegroundColor Green

$continuar = Read-Host "`n¿Has completado la configuración de Turso? (s/n)"
if ($continuar -ne "s") {
    Write-Host "Completa la configuración de Turso antes de continuar." -ForegroundColor Red
    exit
}

# Actualizar archivos de configuración
Write-Host ""
Write-Host "PASO 3: Configuración de archivos .env" -ForegroundColor Yellow

$tursoUrl = Read-Host "Ingresa la URL de tu base de datos Turso (ej: libsql://chat-app-db-user.turso.io)"
$tursoToken = Read-Host "Ingresa el token de autenticación de Turso"

# Actualizar .env.production del backend
Write-Host "Actualizando Backend/.env.production con los datos de Turso..." -ForegroundColor Green
$backendEnv = Get-Content -Path ".\BackEnd\.env.production" -Raw
$backendEnv = $backendEnv -replace "TURSO_URL=\$\{TURSO_URL\}", "TURSO_URL=$tursoUrl"
$backendEnv = $backendEnv -replace "TURSO_AUTH_TOKEN=\$\{TURSO_AUTH_TOKEN\}", "TURSO_AUTH_TOKEN=$tursoToken"
$backendEnv | Set-Content -Path ".\BackEnd\.env.production" -Encoding utf8

Write-Host ""
Write-Host "PASO 4: Preparación para despliegue en Render y Vercel" -ForegroundColor Yellow
Write-Host "Antes de continuar, necesitas:"
Write-Host "1. Una cuenta en Render: https://render.com/"
Write-Host "2. Una cuenta en Vercel: https://vercel.com/"
Write-Host "3. Tu código subido a un repositorio Git (GitHub, GitLab, etc.)"
Write-Host ""
$tieneGit = Read-Host "¿Tienes tu código en un repositorio Git? (s/n)"

if ($tieneGit -ne "s") {
    Write-Host "Configurando repositorio Git..." -ForegroundColor Green
    
    # Comprobar si ya hay un repositorio Git inicializado
    if (-not (Test-Path ".git")) {
        git init
        Write-Host "Repositorio Git inicializado." -ForegroundColor Green
    } else {
        Write-Host "El repositorio Git ya existe." -ForegroundColor Green
    }
    
    git add .
    git commit -m "Preparación para despliegue en Turso, Render y Vercel"
    
    $repoUrl = Read-Host "Ingresa la URL de tu repositorio remoto (dejar en blanco para omitir)"
    if ($repoUrl) {
        git remote add origin $repoUrl
        git push -u origin master
        Write-Host "Código subido al repositorio remoto." -ForegroundColor Green
    } else {
        Write-Host "Por favor, sube manualmente tu código a un repositorio Git antes de continuar con el despliegue." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "PASO 5: Instrucciones para despliegue en Render" -ForegroundColor Yellow
Write-Host "Para desplegar el backend en Render:"
Write-Host "1. Accede a tu cuenta de Render: https://dashboard.render.com/"
Write-Host "2. Ve a 'Blueprints' y haz clic en 'New Blueprint Instance'"
Write-Host "3. Conecta tu repositorio Git"
Write-Host "4. Render detectará automáticamente el archivo render.yaml"
Write-Host "5. Configura las variables de entorno:"
Write-Host "   - TURSO_URL: $tursoUrl"
Write-Host "   - TURSO_AUTH_TOKEN: $tursoToken"
Write-Host "   - JWT_SECRET: [genera un valor aleatorio seguro]"
Write-Host "   - CORS_ORIGIN: [URL de tu frontend en Vercel, la actualizarás después]"

Write-Host ""
Write-Host "PASO 6: Instrucciones para despliegue en Vercel" -ForegroundColor Yellow
Write-Host "Para desplegar el frontend en Vercel:"
Write-Host "1. Accede a tu cuenta de Vercel: https://vercel.com/dashboard"
Write-Host "2. Haz clic en 'Add New' > 'Project'"
Write-Host "3. Importa tu repositorio Git"
Write-Host "4. Configura el proyecto:"
Write-Host "   - Framework preset: Vite"
Write-Host "   - Root Directory: frontEnd"
Write-Host "   - Build Command: npm run build"
Write-Host "   - Output Directory: dist"
Write-Host "5. En variables de entorno, configura:"
Write-Host "   - VITE_API_URL: https://[tu-backend].onrender.com/api"
Write-Host "   - VITE_SOCKET_URL: https://[tu-backend].onrender.com"
Write-Host "6. Haz clic en 'Deploy'"

Write-Host ""
Write-Host "PASO 7: Actualización de CORS después del despliegue" -ForegroundColor Yellow
Write-Host "Una vez que tengas la URL de Vercel, actualiza la variable CORS_ORIGIN en Render:"
Write-Host "1. Ve a tu servicio en Render"
Write-Host "2. Ve a 'Environment' > 'Environment Variables'"
Write-Host "3. Actualiza CORS_ORIGIN con la URL de tu frontend en Vercel"
Write-Host "4. Haz clic en 'Save Changes'"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "¡FELICIDADES! Has completado la configuración para el despliegue" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Sigue las instrucciones para desplegar en Render y Vercel"
Write-Host "2. Prueba tu aplicación para verificar que todo funciona correctamente"
Write-Host "3. Consulta DEPLOYMENT-CHEATSHEET.md para referencia rápida"
Write-Host "4. Consulta DEPLOY-TURSO-RENDER-VERCEL.md para instrucciones detalladas"
Write-Host ""
Write-Host "¿Necesitas más ayuda? Consulta la documentación oficial:" -ForegroundColor Yellow
Write-Host "- Turso: https://docs.turso.tech/"
Write-Host "- Render: https://render.com/docs"
Write-Host "- Vercel: https://vercel.com/docs"
