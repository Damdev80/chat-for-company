// pages/ResetPassword.jsx
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { API_ENDPOINTS, apiRequest } from "../config/api"
import logoThinkchat from "../assets/logo-thinkchat.png"
import "../styles/index.css"

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [userInfo, setUserInfo] = useState(null)

  // Validar token al cargar la página
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Token de recuperación no válido")
        setValidatingToken(false)
        return
      }

      try {
        const response = await apiRequest(`${API_ENDPOINTS.passwordReset.validate}/${token}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTokenValid(true)
            setUserInfo(data.data)
          } else {
            setError(data.message || "Token inválido o expirado")
          }
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Token inválido o expirado")
        }
      } catch {
        setError("Error de conexión. Inténtalo de nuevo.")
      } finally {
        setValidatingToken(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!password || !confirmPassword) {
      setError("Por favor, completa todos los campos")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await apiRequest(API_ENDPOINTS.passwordReset.reset, {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword: password
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSuccess(true)
        } else {
          setError(data.message || "Error al actualizar la contraseña")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Error al actualizar la contraseña")
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de carga mientras se valida el token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#4ADE80] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#A0A0B0]">Validando token...</p>
        </div>
      </div>
    )
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF] flex flex-col">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#3C3C4E] via-[#1E1E2E] to-[#1E1E2E] opacity-30 animate-gradient"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#4ADE80]/5 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="bg-[#2C2C3E]/90 backdrop-blur-xl border border-[#3C3C4E] rounded-2xl p-8 shadow-2xl text-center">
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
                ¡Contraseña Actualizada!
              </h1>
              <p className="text-[#A0A0B0] text-sm mb-6">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#4ADE80] hover:bg-[#22C55E] text-[#1E1E2E] font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                Ir al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de error si el token no es válido
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF] flex flex-col">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#3C3C4E] via-[#1E1E2E] to-[#1E1E2E] opacity-30 animate-gradient"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="bg-[#2C2C3E]/90 backdrop-blur-xl border border-[#3C3C4E] rounded-2xl p-8 shadow-2xl text-center">
              <img
                src={logoThinkchat}
                alt="ThinkChat"
                className="h-16 w-auto mx-auto mb-4"
              />
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/20 rounded-full p-3">
                  <AlertCircle className="h-12 w-12 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#FFFFFF] mb-2">
                Token Inválido
              </h1>
              <p className="text-[#A0A0B0] text-sm mb-2">
                {error || "El enlace de recuperación no es válido o ha expirado."}
              </p>
              <p className="text-[#A0A0B0] text-xs mb-6">
                Por favor, solicita un nuevo enlace de recuperación.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full bg-[#4ADE80] hover:bg-[#22C55E] text-[#1E1E2E] font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  Solicitar Nuevo Enlace
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-transparent border border-[#3C3C4E] text-[#A0A0B0] hover:text-[#FFFFFF] hover:border-[#4ADE80]/50 font-medium py-3 px-4 rounded-xl transition-all duration-300"
                >
                  Volver al Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Formulario principal
  return (
    <div className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF] flex flex-col">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#1E1E2E]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#3C3C4E] via-[#1E1E2E] to-[#1E1E2E] opacity-30 animate-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#4ADE80]/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#2C2C3E]/90 backdrop-blur-xl border border-[#3C3C4E] rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <img
                src={logoThinkchat}
                alt="ThinkChat"
                className="h-16 w-auto mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-[#FFFFFF] mb-2">
                Nueva Contraseña
              </h1>
              {userInfo && (
                <p className="text-[#A0A0B0] text-sm">
                  Hola <strong className="text-[#4ADE80]">{userInfo.username}</strong>, ingresa tu nueva contraseña
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de nueva contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#A0A0B0]">
                  Nueva Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#A0A0B0] group-focus-within:text-[#4ADE80] transition-colors duration-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-[#3C3C4E] rounded-xl bg-[#1E1E2E]/50 text-[#FFFFFF] placeholder-[#A0A0B0] focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A0A0B0] hover:text-[#4ADE80] transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Campo de confirmar contraseña */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#A0A0B0]">
                  Confirmar Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#A0A0B0] group-focus-within:text-[#4ADE80] transition-colors duration-300" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-[#3C3C4E] rounded-xl bg-[#1E1E2E]/50 text-[#FFFFFF] placeholder-[#A0A0B0] focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                    placeholder="Repite la contraseña"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A0A0B0] hover:text-[#4ADE80] transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Información de seguridad */}
              <div className="bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-xl p-3">
                <p className="text-xs text-[#A0A0B0] text-center">
                  Tu nueva contraseña debe tener al menos 6 caracteres y ser diferente a la anterior.
                </p>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4ADE80] hover:bg-[#22C55E] text-[#1E1E2E] font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-[#1E1E2E] border-t-transparent rounded-full animate-spin"></div>
                    <span>Actualizando...</span>
                  </div>
                ) : (
                  "Actualizar Contraseña"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
