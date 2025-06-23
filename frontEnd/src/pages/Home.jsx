import { useEffect, useState, useRef } from "react"
import { ChevronRight, MessageSquare, Shield, Zap, Star, Check } from "lucide-react"
import logoThinkchat from "../assets/logo-thinkchat.png"

export function Home() {
  // Estado para controlar efectos interactivos
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Efecto de seguimiento del mouse para sombras circulares dinámicas
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Hook para detectar cuando un elemento entra en el viewport
  function useInView(options = {}) {
    const [isInView, setIsInView] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
      const currentRef = ref.current
      if (!currentRef) return

      const observer = new IntersectionObserver(([entry]) => {
        setIsInView(entry.isIntersecting)
      }, options)

      observer.observe(currentRef)

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef)
        }
      }
    }, [options])

    return [ref, isInView]
  }

  // Referencias para las secciones
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 })
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.1 })
  const [pricingRef, pricingInView] = useInView({ threshold: 0.1 })
  const [ctaRef, ctaInView] = useInView({ threshold: 0.1 })
  return (
    <main className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF] overflow-x-hidden">
      {/* Fondo dinámico con sombras neón pastel */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(138, 43, 226, 0.1) 0%, 
              rgba(255, 182, 193, 0.05) 25%, 
              rgba(173, 216, 230, 0.05) 50%, 
              rgba(152, 251, 152, 0.03) 75%, 
              transparent 100%
            )
          `
        }}
      />
      
      {/* Orbes flotantes de colores pastel */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-xl animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-40 h-40 bg-gradient-to-r from-green-300/15 to-yellow-300/15 rounded-full blur-xl animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/6 right-1/3 w-20 h-20 bg-gradient-to-r from-indigo-300/25 to-pink-300/25 rounded-full blur-xl animate-pulse-slow animation-delay-3000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#3C3C4E] to-[#1E1E2E] opacity-20 animate-gradient"></div>
        </div>        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo icono arriba */}
          <div className="flex justify-center mb-8 animate-fadeIn">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center">
              <img 
                src={logoThinkchat} 
                alt="Thinkchat" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
            {/* Logo ThinkChat! más pequeño */}
          <div className="flex justify-center mb-8 animate-fadeIn animation-delay-100">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-[#4ADE80]">Think</span>
              <span className="text-white">Chat!</span>
            </h1>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 animate-fadeIn animation-delay-200">
            Comunicación Empresarial{" "}
            <span className="text-[#4ADE80]">
              Segura y Privada
            </span>
          </h2><p className="text-[#A0A0B0] text-xl mb-8 max-w-2xl mx-auto animate-fadeIn animation-delay-300">
            Mantén a tu equipo conectado con nuestra plataforma de chat empresarial diseñada para máxima seguridad y
            productividad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn animation-delay-400"><a 
              className="group bg-[#4ADE80] hover:bg-opacity-90 text-black font-semibold py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 relative overflow-hidden"
              href="/login"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-200/0 via-green-200/50 to-green-200/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-300/50 to-emerald-300/50 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Comenzar Ahora</span>
              <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 relative" />
            </a>
            <button className="group bg-[#94A3B8] bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-8 rounded-lg border border-[#3C3C4E] transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-300/30 to-purple-300/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Solicitar Demo</span>
            </button>
          </div>        </div>
        
      </section>      {/* Features Section */}
      <section ref={featuresRef} className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#3C3C4E] via-transparent to-transparent opacity-10"></div>
          {/* Partículas flotantes específicas para esta sección */}
          <div className="absolute top-1/4 left-1/6 w-16 h-16 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-lg animate-float"></div>
          <div className="absolute bottom-1/4 right-1/6 w-12 h-12 bg-gradient-to-r from-blue-300/15 to-cyan-300/15 rounded-full blur-lg animate-float animation-delay-1000"></div>        </div>
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <h2
            className={`text-3xl font-bold text-center mb-12 transition-all duration-700 ${
              featuresInView ? "opacity-100" : "opacity-0 transform translate-y-10"
            }`}
          >
            Características Principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-[#4ADE80]" />}
              title="Seguridad Avanzada"
              description="Cifrado de extremo a extremo y cumplimiento con normativas de protección de datos empresariales."
              isVisible={featuresInView}
              delay={0}
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-[#4ADE80]" />}
              title="Comunicación Eficiente"
              description="Canales organizados, mensajes directos y comunicación grupal para optimizar la colaboración."
              isVisible={featuresInView}
              delay={200}
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-[#4ADE80]" />}
              title="Integración Completa"
              description="Conecta con tus herramientas empresariales favoritas para un flujo de trabajo sin interrupciones."
              isVisible={featuresInView}
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#3C3C4E] to-[#1E1E2E] opacity-10 animate-gradient"></div>
          {/* Orbes de testimonios */}
          <div className="absolute top-1/3 left-1/5 w-20 h-20 bg-gradient-to-r from-yellow-300/15 to-orange-300/15 rounded-full blur-lg animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/5 w-24 h-24 bg-gradient-to-r from-pink-300/15 to-red-300/15 rounded-full blur-lg animate-pulse-slow animation-delay-2000"></div>        </div>
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <h2
            className={`text-3xl font-bold text-center mb-12 transition-all duration-700 ${
              testimonialsInView ? "opacity-100" : "opacity-0 transform translate-y-10"
            }`}
          >
            Lo Que Dicen Nuestros Clientes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <TestimonialCard
              quote="Desde que implementamos esta solución de chat, nuestra comunicación interna ha mejorado un 80% y nuestros datos están más seguros que nunca."
              author="María González"
              position="Directora de IT, TechCorp"
              rating={5}
              isVisible={testimonialsInView}
              delay={0}
            />
            <TestimonialCard
              quote="La facilidad de uso combinada con las funciones de seguridad avanzadas hacen de este chat la solución perfecta para nuestra empresa."
              author="Carlos Rodríguez"
              position="CEO, Innovatech"
              rating={5}
              isVisible={testimonialsInView}
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#3C3C4E] via-transparent to-transparent opacity-5"></div>
          {/* Efectos de pricing */}
          <div className="absolute top-1/5 left-1/3 w-28 h-28 bg-gradient-to-r from-indigo-300/10 to-purple-300/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-1/5 right-1/3 w-32 h-32 bg-gradient-to-r from-green-300/10 to-emerald-300/10 rounded-full blur-xl animate-float animation-delay-1000"></div>        </div>
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <h2
            className={`text-3xl font-bold text-center mb-4 transition-all duration-700 ${
              pricingInView ? "opacity-100" : "opacity-0 transform translate-y-10"
            }`}
          >
            Planes Diseñados Para Tu Empresa
          </h2>
          <p
            className={`text-[#A0A0B0] text-center mb-12 max-w-2xl mx-auto transition-all duration-700 delay-100 ${
              pricingInView ? "opacity-100" : "opacity-0 transform translate-y-10"
            }`}
          >
            Elige el plan que mejor se adapte a las necesidades de comunicación de tu equipo
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              title="Básico"
              price="9.99"
              features={[
              "Hasta 10 usuarios", 
              "Canales ilimitados", 
              "Cifrado básico", 
              "Soporte por email"
            ]}
              buttonText="Comenzar Gratis"
              buttonColor="bg-[#94A3B8]"
              popular={false}
              isVisible={pricingInView}
              delay={0}
            />
            <PricingCard
              title="Profesional"
              price="19.99"
              features={[
                "Hasta 50 usuarios",
                "Canales ilimitados",
                "Cifrado avanzado",
                "Integraciones básicas",
                "Soporte prioritario",
              ]}
              buttonText="Comenzar Ahora"
              buttonColor="bg-[#4ADE80]"
              popular={true}
              isVisible={pricingInView}
              delay={200}
            />
            <PricingCard
              title="Empresarial"
              price="39.99"
              features={[
                "Usuarios ilimitados",
                "Todas las características",
                "Cifrado máximo nivel",
                "Integraciones avanzadas",
                "Soporte 24/7",
                "Implementación personalizada",
              ]}
              buttonText="Contactar Ventas"
              buttonColor="bg-[#94A3B8]"
              popular={false}
              isVisible={pricingInView}
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="min-h-screen flex items-center relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#3C3C4E] to-[#1E1E2E] opacity-80 animate-gradient"></div>
          {/* Efectos especiales para CTA */}
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-purple-300/15 to-pink-300/15 rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-36 h-36 bg-gradient-to-r from-blue-300/15 to-cyan-300/15 rounded-full blur-2xl animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-green-300/10 to-yellow-300/10 rounded-full blur-2xl animate-pulse-slow animation-delay-2000"></div>        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <h2
            className={`text-3xl font-bold mb-6 transition-all duration-700 ${
              ctaInView ? "opacity-100" : "opacity-0 transform translate-y-10"
            }`}
          >
            ¿Listo para transformar la comunicación de tu empresa?
          </h2>
          <p
            className={`text-[#A0A0B0] text-xl mb-8 transition-all duration-700 delay-100 ${
              ctaInView ? "opacity-100" : "opacity-0 transform translate-y-10"
            }`}
          >
            Únete a miles de empresas que ya confían en nuestra plataforma de chat privado
          </p>
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-200 ${
              ctaInView ? "opacity-100" : "opacity-0 transform translate-y-10"
            }`}
          >
            <button className="group bg-[#4ADE80] hover:bg-opacity-90 text-black font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-200/0 via-green-200/50 to-green-200/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-300/50 to-emerald-300/50 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Comenzar Prueba Gratuita</span>
            </button>
            <button className="group bg-transparent hover:bg-[#3C3C4E] text-white font-semibold py-3 px-8 rounded-lg border border-[#3C3C4E] transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300/30 to-purple-300/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Programar Demostración</span>
            </button>
          </div>
        </div>
      </section>      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#3C3C4E] relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">          <div className="animate-fadeInLeft animation-delay-100">            <div className="flex items-center gap-3 mb-4">
              <img src="/src/assets/logo-app.png" alt="Thinkchat" className="h-16 w-16" />
              <h3 className="text-xl font-bold text-[#FFFFFF] hover:text-[#4ADE80] transition-colors duration-300">
                Thinkchat
              </h3>
            </div>
            <p className="text-[#A0A0B0] hover:text-[#B0B0C0] transition-colors duration-300">
              Soluciones de comunicación segura para empresas de todos los tamaños.
            </p>
          </div>
          
          <div className="animate-fadeInLeft animation-delay-200">
            <h4 className="font-semibold mb-4 text-[#FFFFFF] hover:text-[#4ADE80] transition-colors duration-300">Producto</h4>
            <ul className="space-y-2 text-[#A0A0B0]">
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Seguridad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Integraciones
                </a>
              </li>
            </ul>
          </div>
          
          <div className="animate-fadeInLeft animation-delay-300">
            <h4 className="font-semibold mb-4 text-[#FFFFFF] hover:text-[#4ADE80] transition-colors duration-300">Empresa</h4>
            <ul className="space-y-2 text-[#A0A0B0]">
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Clientes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
          
          <div className="animate-fadeInLeft animation-delay-400">
            <h4 className="font-semibold mb-4 text-[#FFFFFF] hover:text-[#4ADE80] transition-colors duration-300">Legal</h4>
            <ul className="space-y-2 text-[#A0A0B0]">
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Términos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ADE80] transition-colors duration-300">
                  GDPR
                </a>
              </li>
            </ul>
          </div>
        </div>
          <div className="mt-12 text-center text-[#A0A0B0] animate-fadeIn animation-delay-500">
          <p className="hover:text-[#B0B0C0] transition-colors duration-300">
            © {new Date().getFullYear()} Thinkchat. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}

// Componentes limpios con sombras circulares sutiles
function FeatureCard({ icon, title, description, isVisible, delay }) {
  return (
    <div
      className={`group p-6 rounded-xl border border-[#3C3C4E] bg-[#1E1E2E] bg-opacity-80 transition-all duration-700 hover:bg-opacity-90 hover:scale-[1.02] hover:border-[#4ADE80]/30 relative cursor-pointer ${
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-20"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Sombra circular sutil solo en hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#4ADE80]/10 via-[#4ADE80]/5 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 text-[#FFFFFF] group-hover:text-[#4ADE80] transition-colors duration-300">{title}</h3>
        <p className="text-[#A0A0B0] group-hover:text-[#B0B0C0] transition-colors duration-300">{description}</p>
      </div>
    </div>
  )
}

function TestimonialCard({ quote, author, position, rating, isVisible, delay }) {
  return (
    <div
      className={`group p-6 rounded-xl border border-[#3C3C4E] bg-[#1E1E2E] bg-opacity-80 transition-all duration-700 hover:scale-[1.02] hover:border-[#4ADE80]/30 relative cursor-pointer ${
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-20"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Sombra circular sutil */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#A0A0B0]/5 via-[#A0A0B0]/10 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star 
              key={i} 
              className="h-5 w-5 text-[#4ADE80] fill-[#4ADE80]" 
            />
          ))}
        </div>
        <p className="text-lg mb-6 italic text-[#FFFFFF] group-hover:text-[#F0F0F0] transition-colors duration-300">"{quote}"</p>
        <div>
          <p className="font-semibold text-[#FFFFFF] group-hover:text-[#4ADE80] transition-colors duration-300">{author}</p>
          <p className="text-[#A0A0B0] text-sm group-hover:text-[#B0B0C0] transition-colors duration-300">{position}</p>
        </div>
      </div>
    </div>
  )
}

function PricingCard({ title, price, features, buttonText, buttonColor, popular, isVisible, delay }) {
  return (
    <div
      className={`group p-6 rounded-xl border ${
        popular ? "border-[#4ADE80]" : "border-[#3C3C4E]"
      } bg-[#1E1E2E] bg-opacity-80 relative transition-all duration-700 hover:scale-[1.02] cursor-pointer ${
        popular ? "z-10" : ""
      } ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-20"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Sombra circular sutil */}
      <div className={`absolute -inset-1 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        popular 
          ? "bg-gradient-to-r from-[#4ADE80]/15 via-[#4ADE80]/10 to-transparent" 
          : "bg-gradient-to-r from-[#A0A0B0]/10 via-[#A0A0B0]/5 to-transparent"
      }`}></div>
      
      {/* Badge para plan popular */}
      {popular && (
        <div className="absolute top-0 right-0 bg-[#4ADE80] text-[#1E1E2E] px-4 py-1 text-sm font-semibold rounded-bl-lg rounded-tr-lg">
          Popular
        </div>
      )}
      
      <div className="relative z-10">
        <h3 className="text-xl font-semibold mb-2 text-[#FFFFFF] group-hover:text-[#4ADE80] transition-colors duration-300">{title}</h3>
        <div className="mb-6">
          <span className="text-3xl font-bold text-[#FFFFFF] group-hover:text-[#F0F0F0] transition-colors duration-300">${price}</span>
          <span className="text-[#A0A0B0] group-hover:text-[#B0B0C0] transition-colors duration-300">/mes por usuario</span>
        </div>
        <ul className="mb-8 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-[#4ADE80] mr-2 shrink-0 mt-0.5" />
              <span className="text-[#FFFFFF] group-hover:text-[#F0F0F0] transition-colors duration-300">{feature}</span>
            </li>
          ))}
        </ul>
        <button
          className={`w-full ${buttonColor} hover:bg-opacity-90 text-[#1E1E2E] font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden`}
        >
          <span className="relative">{buttonText}</span>
        </button>
      </div>
    </div>
  )
}

export default Home

