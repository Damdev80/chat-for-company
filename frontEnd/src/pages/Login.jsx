import { useState } from "react"
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import { loginUser } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import logoThinkchat from "../assets/logo-thinkchat.png"
import "../../styles/index.css"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación básica
    if (!username || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    setError("")
    setLoading(true)

    // Conexión con el backend
    try {
      const data = await loginUser({ username, password })
      localStorage.setItem("token", data.token)
      localStorage.setItem("username", data.user.username) // Guardar el username desde data.user
      localStorage.setItem("userRole", data.user.role) // Guardar el rol desde data.user
      // Redirige al chat
      navigate("/chat")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF] flex flex-col">
      {/* Fondo con gradiente mejorado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#1E1E2E]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#3C3C4E] via-[#1E1E2E] to-[#1E1E2E] opacity-30 animate-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#4ADE80]/5 via-transparent to-transparent"></div>
      </div>

      {/* Botón de volver mejorado */}
      <div className="relative z-10 p-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#A0A0B0] hover:text-[#4ADE80] transition-all duration-300 animate-fadeIn group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Volver al inicio
        </a>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md animate-fadeIn animation-delay-100">
          {/* Formulario principal */}
          <div className="bg-gradient-to-br from-[#2D2D3A]/80 to-[#252530]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-[#3C3C4E]/50 p-8 hover:border-[#4ADE80]/30 transition-all duration-500">            {/* Header del formulario */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#4ADE80] to-[#22C55E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4ADE80]/20 p-4">
                <img 
                  src={logoThinkchat} 
                  alt="Thinkchat" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#FFFFFF] to-[#A0A0B0] bg-clip-text text-transparent">
                Iniciar Sesión
              </h1>
              <p className="text-[#A0A0B0]">Bienvenido de vuelta a Thinkchat</p>
            </div>

            {/* Error message mejorado */}
            {error && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6 animate-scaleIn backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de usuario */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-[#A0A0B0] mb-2">
                  Usuario
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#A0A0B0] group-focus-within:text-[#4ADE80] transition-colors duration-300" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1E1E2E]/70 border border-[#3C3C4E] text-[#FFFFFF] placeholder-[#A0A0B0] focus:outline-none focus:ring-2 focus:ring-[#4ADE80]/50 focus:border-[#4ADE80] transition-all duration-300 backdrop-blur-sm"
                    placeholder="Ingresa tu usuario"
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-[#A0A0B0]">
                    Contraseña
                  </label>
                  <a href="#" className="text-sm text-[#4ADE80] hover:text-[#22C55E] transition-colors duration-300">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#A0A0B0] group-focus-within:text-[#4ADE80] transition-colors duration-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#1E1E2E]/70 border border-[#3C3C4E] text-[#FFFFFF] placeholder-[#A0A0B0] focus:outline-none focus:ring-2 focus:ring-[#4ADE80]/50 focus:border-[#4ADE80] transition-all duration-300 backdrop-blur-sm"
                    placeholder="Ingresa tu contraseña"
                  />                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A0A0B0] hover:text-[#4ADE80] transition-colors duration-300"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Botón de submit mejorado */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#22C55E] hover:to-[#16A34A] text-black font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#4ADE80]/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:from-[#4ADE80] disabled:to-[#22C55E] transform active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>

            {/* Footer del formulario */}
            <div className="mt-8 text-center">
              <p className="text-[#A0A0B0]">
                ¿No tienes una cuenta?{" "}
                <a 
                  href="/register" 
                  className="text-[#4ADE80] hover:text-[#22C55E] transition-colors duration-300 font-medium"
                >
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>

          {/* Copyright mejorado */}          <div className="mt-8 text-center animate-fadeIn animation-delay-300">
            <p className="text-[#A0A0B0] text-sm">
              © {new Date().getFullYear()} Thinkchat. Comunicación segura y privada.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
