import { useState } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { registerUser } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import "../../styles/index.css"

function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !email || !password || !confirmPassword) {
      setError("Por favor, completa todos los campos")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    setError("")
    setLoading(true)
    try {
      await registerUser({ username, email, password })
      navigate("/login")
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
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3C3C4E] via-transparent to-transparent opacity-10"></div>
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
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 py-8">
        <div className="w-full max-w-md animate-fadeIn animation-delay-100">
          <div className="bg-[#2D2D3A] bg-opacity-70 backdrop-blur-sm rounded-xl shadow-xl border border-[#3C3C4E] p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Crear Cuenta</h1>
              <p className="text-[#A0A0B0]">Únete a ChatEmpresa y mejora la comunicación de tu equipo</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-[#A0A0B0]">
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E1E2E] border border-[#3C3C4E] text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                  placeholder="Tu usuario"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#A0A0B0]">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E1E2E] border border-[#3C3C4E] text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#A0A0B0]">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E1E2E] border border-[#3C3C4E] text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#A0A0B0]">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E1E2E] border border-[#3C3C4E] text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all duration-300"
                  placeholder="Repite tu contraseña"
                />
              </div>
              {error && (
                <div className="bg-red-700 bg-opacity-10 border border-red-700 text-white px-4 py-3 rounded-lg animate-scaleIn">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4ADE80] hover:bg-opacity-90 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#4ADE80]/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#A0A0B0]">
                ¿Ya tienes una cuenta?{" "}
                <a href="/login" className="text-[#4ADE80] hover:text-opacity-80 transition-colors duration-300">
                  Inicia sesión
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

export default Register
