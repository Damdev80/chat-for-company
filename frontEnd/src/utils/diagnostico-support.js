// Script de diagnóstico ESPECÍFICO PARA PRODUCCIÓN
// Ejecutar en la consola del navegador en https://tu-app.vercel.app

async function diagnosticarProduccion() {
  console.log('🔍 DIAGNÓSTICO DE PRODUCCIÓN - CHAT IA')
  console.log('=' .repeat(60))
  
  // URLs de producción
  const PROD_API_URL = 'https://chat-for-company.onrender.com/api'
  const PROD_BACKEND = 'https://chat-for-company.onrender.com'
  
  console.log('🌐 URLs de producción:')
  console.log('   Backend:', PROD_BACKEND)
  console.log('   API:', PROD_API_URL)
  console.log('')
  
  // 1. Verificar si el backend está vivo
  console.log('💓 Verificando si el backend está vivo...')
  try {
    const startTime = Date.now()
    const healthResponse = await fetch(`${PROD_BACKEND}/health`)
    const responseTime = Date.now() - startTime
    
    if (healthResponse.ok) {
      console.log('✅ Backend responde:', healthResponse.status, `(${responseTime}ms)`)
    } else {
      console.error('❌ Backend con problemas:', healthResponse.status)
    }
  } catch (error) {
    console.error('❌ Backend no accesible:', error.message)
    console.error('🚨 PROBLEMA CRÍTICO: El backend en Render está caído')
    return
  }
  
  // 2. Verificar configuración de IA
  console.log('🤖 Verificando configuración de IA en producción...')
  try {
    const token = localStorage.getItem('token')
    const diagnosticoResponse = await fetch(`${PROD_API_URL}/support/diagnostico`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    
    if (diagnosticoResponse.ok) {
      const diagnosticoData = await diagnosticoResponse.json()
      console.log('🔍 Diagnóstico del servidor en producción:')
      console.log('')
      console.log('   � DeepSeek API:')
      console.log('      ├─ API Key presente:', diagnosticoData.data.deepseek.hasApiKey ? '✅ SÍ' : '❌ NO')
      console.log('      ├─ Longitud API Key:', diagnosticoData.data.deepseek.apiKeyLength || 'N/A')
      console.log('      ├─ Modo demo activo:', diagnosticoData.data.deepseek.isDemoMode ? '🎭 SÍ' : '⚡ NO')
      console.log('      └─ Primeros chars:', diagnosticoData.data.deepseek.firstChars || 'N/A')
      console.log('')
      console.log('   🖥️ Servidor:')
      console.log('      ├─ Ambiente:', diagnosticoData.data.environment)
      console.log('      ├─ Uptime:', Math.round(diagnosticoData.data.server.uptime), 'segundos')
      console.log('      └─ Memoria:', Math.round(diagnosticoData.data.server.memory.used / 1024 / 1024), 'MB usados')
      
      // Diagnóstico automático
      if (!diagnosticoData.data.deepseek.hasApiKey) {
        console.log('')
        console.log('🚨 PROBLEMA ENCONTRADO:')
        console.log('   La API key de DeepSeek NO está configurada en Render')
        console.log('   El sistema está funcionando en modo demo')
        console.log('')
        console.log('✅ SOLUCIÓN:')
        console.log('   1. Ve a render.com → tu servicio → Environment')
        console.log('   2. Agrega: DEEPSEEK_API_KEY = sk-ee83d3c6a94c4f77a6978d177c4c450d')
        console.log('   3. Redespliega el servicio')
      } else if (diagnosticoData.data.deepseek.isDemoMode) {
        console.log('')
        console.log('🚨 PROBLEMA ENCONTRADO:')
        console.log('   La API key está presente pero es inválida o hay errores')
        console.log('')
        console.log('✅ SOLUCIÓN:')
        console.log('   1. Verificar que la API key sea correcta')
        console.log('   2. Comprobar que DeepSeek esté funcionando')
        console.log('   3. Revisar logs del servidor para errores específicos')
      } else {
        console.log('')
        console.log('✅ CONFIGURACIÓN CORRECTA:')
        console.log('   DeepSeek está configurado y debería funcionar')
        console.log('   Si aún hay problemas, revisar logs del servidor')
      }
      
    } else {
      console.error('❌ Error obteniendo diagnóstico:', diagnosticoResponse.status)
      console.error('   Puede que el endpoint no esté disponible aún')
    }
  } catch (error) {
    console.error('❌ Error en diagnóstico IA:', error.message)
    console.error('   Esto indica problemas de conectividad o configuración')
  }
  
  // 3. Probar el endpoint de chat actualmente
  console.log('')
  console.log('� Probando chat de apoyo actual...')
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('❌ No hay token de autenticación en localStorage')
      console.log('   Necesitas hacer login primero')
      return
    }
    
    // Probar obtener chat activo
    const supportResponse = await fetch(`${PROD_API_URL}/support/active`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (supportResponse.ok) {
      const data = await supportResponse.json()
      console.log('✅ Chat de apoyo accesible')
      console.log('   Chat ID:', data.data?.chat?.id || 'N/A')
      console.log('   Mensajes:', data.data?.messages?.length || 0)
      
      // Probar envío de mensaje de prueba
      if (data.data?.chat?.id) {
        console.log('')
        console.log('📤 Enviando mensaje de prueba...')
        
        const testResponse = await fetch(`${PROD_API_URL}/support/${data.data.chat.id}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: 'Test de diagnóstico - ¿estás usando DeepSeek o modo demo?' })
        })
        
        if (testResponse.ok) {
          const testData = await testResponse.json()
          const response = testData.data?.assistantMessage?.content || ''
          
          if (response.includes('ALEXANDRA') && response.includes('especializada en gestión')) {
            console.log('🎭 CONFIRMADO: Está en modo DEMO')
            console.log('   Respuesta típica de demo detectada')
          } else {
            console.log('⚡ POSIBLE: Está usando DeepSeek')
            console.log('   Respuesta:', response.substring(0, 100) + '...')
          }
        } else {
          console.error('❌ Error enviando mensaje de prueba:', testResponse.status)
        }
      }
      
    } else {
      console.error('❌ Error accediendo al chat:', supportResponse.status)
      const errorText = await supportResponse.text()
      console.error('   Detalle:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de chat:', error.message)
  }
  
  console.log('')
  console.log('🎯 RESUMEN EJECUTIVO:')
  console.log('   1. Si ves "API Key presente: ❌ NO" → Configurar en Render')
  console.log('   2. Si ves "Modo demo activo: 🎭 SÍ" → Hay problema con la API')
  console.log('   3. Si todo está ✅ pero sigue en demo → Revisar logs de Render')
  console.log('   4. Cualquier error de fetch → Backend caído o CORS')
}

// Función para ejecutar fácilmente
window.diagnosticarProduccion = diagnosticarProduccion

console.log('🔧 Diagnóstico cargado. Ejecuta: diagnosticarProduccion()')
console.log('📋 O simplemente copia y pega toda esta función en la consola')
