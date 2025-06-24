// pages/ForgotPassword.jsx
import { useState } from "react"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { API_ENDPOINTS, apiRequest } from "../config/api"
import logoThinkchat from "../assets/logo-thinkchat.png"
import "../../styles/index.css"

function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setError("Por favor, ingresa tu email")
      return
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un email válido")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await apiRequest(API_ENDPOINTS.passwordReset.request, {
        method: 'POST',
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSuccess(true)
        } else {
          setError(data.message || "Error al enviar el email de recuperación")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Error al enviar el email de recuperación")
      }    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF] flex flex-col">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#3C3C4E] via-[#1E1E2E] to-[#1E1E2E] opacity-30 animate-gradient"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#4ADE80]/5 via-transparent to-transparent"></div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            {/* Card de éxito */}
            <div className="bg-[#2C2C3E]/90 backdrop-blur-xl border border-[#3C3C4E] rounded-2xl p-8 shadow-2xl">
              {/* Header con logo */}
              <div className="text-center mb-8">
                <img
                  src={logoThinkchat}
                  alt="ThinkChat"
                  className="h-16 w-auto mx-auto mb-4"
                />
                <div className="flex justify-center mb-4">
                  <div className="bg-[#4ADE80]/20 rounded-full p-3">
                    <CheckCircle className="h-12 w-12 text-[#4ADE80]" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-[#FFFFFF] mb-2">
                  ¡Email Enviado!
                </h1>
                <p className="text-[#A0A0B0] text-sm">
                  Te hemos enviado las instrucciones para recuperar tu contraseña
                </p>
              </div>

              {/* Información */}
              <div className="bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-[#A0A0B0] text-center">
                  <strong className="text-[#4ADE80]">Revisa tu bandeja de entrada</strong><br />
                  Si no recibes el email en unos minutos, revisa tu carpeta de spam.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#4ADE80] hover:bg-[#22C55E] text-[#1E1E2E] font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  Volver al Login
                </button>
                
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                    setError("")
                  }}
                  className="w-full bg-transparent border border-[#3C3C4E] text-[#A0A0B0] hover:text-[#FFFFFF] hover:border-[#4ADE80]/50 font-medium py-3 px-4 rounded-xl transition-all duration-300"
                >
                  Enviar otro email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF] flex flex-col">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#1E1E2E]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#3C3C4E] via-[#1E1E2E] to-[#1E1E2E] opacity-30 animate-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#4ADE80]/5 via-transparent to-transparent"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Card principal */}
          <div className="bg-[#2C2C3E]/90 backdrop-blur-xl border border-[#3C3C4E] rounded-2xl p-8 shadow-2xl">
            {/* Header con logo */}
            <div className="text-center mb-8">
              <img
                src={logoThinkchat}
                alt="ThinkChat"
                className="h-16 w-auto mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-[#FFFFFF] mb-2">
                Recuperar Contraseña
              </h1>
              <p className="text-[#A0A0B0] text-sm">
                Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#A0A0B0]">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#A0A0B0] group-focus-within:text-[#4ADE80] transition-colors duration-300" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[#3C3C4E] rounded-xl bg-[#1E1E2E]/50 text-[#FFFFFF] placeholder-[#A0A0B0] focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4ADE80] hover:bg-[#22C55E] text-[#1E1E2E] font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-[#1E1E2E] border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  "Enviar Instrucciones"
                )}
              </button>
            </form>

            {/* Enlace para volver */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center space-x-2 text-[#4ADE80] hover:text-[#22C55E] transition-colors duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
