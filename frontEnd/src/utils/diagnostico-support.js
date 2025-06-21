// Script de diagnóstico para verificar conectividad con el backend
// Ejecutar en la consola del navegador en producción

async function diagnosticarConectividad() {
  console.log('🔍 DIAGNÓSTICO DE CONECTIVIDAD - CHAT DE APOYO')
  console.log('=' .repeat(50))
  
  // 1. Verificar variables de entorno
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
  
  console.log('📊 Variables de entorno:')
  console.log('   VITE_API_URL:', API_URL)
  console.log('   VITE_SOCKET_URL:', SOCKET_URL)
  console.log('')
  
  // 2. Verificar conectividad básica
  console.log('🌐 Probando conectividad básica...')
  try {
    const healthResponse = await fetch(`${API_URL.replace('/api', '')}/health`)
    console.log('✅ Backend accesible:', healthResponse.status)
  } catch (error) {
    console.error('❌ Backend no accesible:', error.message)
  }
  
  // 3. Verificar endpoint de support
  console.log('🤖 Probando endpoint de support...')
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('❌ No hay token de autenticación')
      return
    }
    
    const supportResponse = await fetch(`${API_URL}/support/active`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('📡 Respuesta del endpoint support:', supportResponse.status)
    if (supportResponse.ok) {
      const data = await supportResponse.json()
      console.log('✅ Datos recibidos:', data)
    } else {
      const errorData = await supportResponse.text()
      console.error('❌ Error del servidor:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Error en endpoint support:', error.message)
    console.error('   Tipo:', error.name)
    console.error('   Stack:', error.stack)
  }
  
  console.log('')
  console.log('🔧 SOLUCIONES POSIBLES:')
  console.log('1. Verificar que el backend esté desplegado y funcionando')
  console.log('2. Comprobar que las URLs en vercel.json sean correctas')
  console.log('3. Verificar que el token de autenticación sea válido')
  console.log('4. Revisar logs del backend para errores internos')
}

// Ejecutar diagnóstico
diagnosticarConectividad()
