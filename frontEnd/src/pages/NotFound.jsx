import { ArrowLeft } from "lucide-react"
import "../../styles/index.css"

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#1E1E2E] text-white flex flex-col">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#1E1E2E]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#3C3C4E] to-[#1E1E2E] opacity-80 animate-gradient"></div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-lg text-center">
          <div className="animate-fadeIn">
            <h1 className="text-9xl font-bold text-[#4ADE80] animate-pulse-slow">404</h1>
            <h2 className="text-3xl font-bold mt-4 mb-6">Página no encontrada</h2>
            <p className="text-[#A0A0B0] text-lg mb-8 max-w-md mx-auto">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn animation-delay-200">
            <a
              href="/"
              className="bg-[#4ADE80] hover:bg-opacity-90 text-black font-semibold py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#4ADE80]/20"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al inicio
            </a>
            <a
              href="/login"
              className="bg-[#94A3B8] bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-8 rounded-lg border border-[#3C3C4E] transition-all duration-300 hover:scale-105 hover:border-[#4ADE80]"
            >
              Iniciar sesión
            </a>
          </div>

          {/* Elementos decorativos */}
              <div className="mt-24 text-center animate-fadeIn animation-delay-300">
            <p className="text-[#A0A0B0] text-sm">
              © {new Date().getFullYear()} Thinkchat. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
