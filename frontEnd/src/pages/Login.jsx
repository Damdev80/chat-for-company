import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { loginUser } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import "../../styles/index.css"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
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
    <div className="min-h-screen bg-[#1E1E2E] text-white flex flex-col">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#1E1E2E]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#3C3C4E] to-[#1E1E2E] opacity-20 animate-gradient"></div>
      </div>

      {/* Botón de volver */}
      <div className="relative z-10 p-6">
        <a
          href="/"
          className="inline-flex items-center text-[#A0A0B0] hover:text-[#4ADE80] transition-colors duration-300 animate-fadeIn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </a>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md animate-fadeIn animation-delay-100">
          <div className="bg-[#2D2D3A] bg-opacity-70 backdrop-blur-sm rounded-xl shadow-xl border border-[#3C3C4E] p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Iniciar Sesión</h1>
              <p className="text-[#A0A0B0]">Accede a tu cuenta de ChatEmpresa</p>
            </div>

            {error && (
              <div className="bg-red-700 bg-opacity-10 border border-red-700 text-white px-4 py-3 rounded-lg mb-6 animate-scaleIn">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-[#A0A0B0]">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E1E2E] border border-[#3C3C4E] text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                  placeholder="Tu usuario"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-[#A0A0B0]">
                    Contraseña
                  </label>
                  <a href="#" className="text-sm text-[#4ADE80] hover:text-opacity-80 transition-colors duration-300">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E1E2E] border border-[#3C3C4E] text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#3C3C4E] bg-[#1E1E2E] text-[#4ADE80] focus:ring-[#4ADE80] focus:ring-offset-[#1E1E2E]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#A0A0B0]">
                  Recordarme
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4ADE80] hover:bg-opacity-90 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#4ADE80]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
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

            <div className="mt-8 text-center">
              <p className="text-[#A0A0B0]">
                ¿No tienes una cuenta?{" "}
                <a href="/register" className="text-[#4ADE80] hover:text-opacity-80 transition-colors duration-300">
                  Regístrate
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center animate-fadeIn animation-delay-300">
            <p className="text-[#A0A0B0] text-sm">
              © {new Date().getFullYear()} ChatEmpresa. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
