# Script para solucionar el problema de registro de usuarios

Write-Host "🚀 Iniciando implementación de solución para el registro de usuarios..." -ForegroundColor Green

Write-Host "📂 Haciendo commit de los cambios en Git..." -ForegroundColor Cyan
git add .
git commit -m "Fix: Solución para el problema de registro de usuarios con restricción de llave foránea"

Write-Host "⬆️ Subiendo cambios al repositorio remoto..." -ForegroundColor Cyan
git push

Write-Host "✅ Cambios subidos correctamente." -ForegroundColor Green
Write-Host "⏳ Espera a que Render y Vercel desplieguen los cambios automáticamente (5-10 minutos)." -ForegroundColor Yellow

Write-Host "📝 Recuerda actualizar la variable CORS_ORIGIN en el panel de Render si tu URL es diferente." -ForegroundColor Yellow
Write-Host "  - Ve a tu dashboard de Render" 
Write-Host "  - Accede a tu servicio 'chat-for-company'" 
Write-Host "  - Ve a la pestana 'Environment'" 
Write-Host "  - Asegurate de que CORS_ORIGIN = https://chat-for-company.vercel.app" 

Write-Host "🧪 Después del despliegue, prueba el registro de usuarios nuevamente." -ForegroundColor Green

Write-Host "📊 Si continúas teniendo problemas:" -ForegroundColor Yellow
Write-Host "  1. Revisa los logs en Render"
Write-Host "  2. Revisa la consola del navegador (F12 > Console)"
Write-Host "  3. Consulta REGISTRO_USUARIOS_SOLUCION.md para más detalles"

Write-Host "🎉 ¡Buena suerte!" -ForegroundColor Green
