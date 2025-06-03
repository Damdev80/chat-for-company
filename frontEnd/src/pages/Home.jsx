import { useEffect, useState, useRef } from "react"
import { ChevronRight, MessageSquare, Shield, Zap, Star, Check } from "lucide-react"


export function Home() {
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
    <main className="min-h-screen bg-[#1E1E2E] text-[#FFFFFF]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#3C3C4E] to-[#1E1E2E] opacity-20 animate-gradient"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fadeIn">
            Comunicación Empresarial <span className="text-[#4ADE80] animate-pulse-slow">Segura y Privada</span>
          </h1>
          <p className="text-[#A0A0B0] text-xl mb-8 max-w-2xl mx-auto animate-fadeIn animation-delay-200">
            Mantén a tu equipo conectado con nuestra plataforma de chat empresarial diseñada para máxima seguridad y
            productividad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn animation-delay-300">
            <a className="bg-[#4ADE80] hover:bg-opacity-90 text-black font-semibold py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#4ADE80]/20" href="/login">
              Comenzar Ahora{" "}
              <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <button className="bg-[#94A3B8] bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-8 rounded-lg border border-[#3C3C4E] transition-all duration-300 hover:scale-105 hover:border-[#4ADE80]">
              Solicitar Demo
            </button>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <ChevronRight className="h-8 w-8 text-[#4ADE80] transform rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1E1E2E]"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#3C3C4E] via-transparent to-transparent opacity-10"></div>
        </div>
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
        </div>
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
        </div>
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
        </div>
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
            <button className="bg-[#4ADE80] hover:bg-opacity-90 text-black font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#4ADE80]/20">
              Comenzar Prueba Gratuita
            </button>
            <button className="bg-transparent hover:bg-[#3C3C4E] text-white font-semibold py-3 px-8 rounded-lg border border-[#3C3C4E] transition-all duration-300 hover:scale-105 hover:border-[#4ADE80]">
              Programar Demostración
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#3C3C4E]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="animate-fadeInLeft animation-delay-100">
            <h3 className="text-xl font-bold mb-4">ChatEmpresa</h3>
            <p className="text-[#A0A0B0]">Soluciones de comunicación segura para empresas de todos los tamaños.</p>
          </div>
          <div className="animate-fadeInLeft animation-delay-200">
            <h4 className="font-semibold mb-4">Producto</h4>
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
            <h4 className="font-semibold mb-4">Empresa</h4>
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
            <h4 className="font-semibold mb-4">Legal</h4>
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
          <p>© {new Date().getFullYear()} ChatEmpresa. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  )
}

// Componentes con animaciones
function FeatureCard({ icon, title, description, isVisible, delay }) {
  return (
    <div
      className={`p-6 rounded-xl border border-[#3C3C4E] bg-[#1E1E2E] bg-opacity-50 transition-all duration-700 hover:bg-opacity-70 hover:scale-105 hover:shadow-lg hover:shadow-[#4ADE80]/10 ${
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-20"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mb-4 transform transition-transform duration-500 hover:scale-110 hover:text-[#4ADE80]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-[#A0A0B0]">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, position, rating, isVisible, delay }) {
  return (
    <div
      className={`p-6 rounded-xl border border-[#3C3C4E] bg-[#1E1E2E] bg-opacity-50 transition-all duration-700 hover:scale-105 hover:border-[#4ADE80]/30 ${
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-20"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-[#4ADE80] fill-[#4ADE80] transition-all duration-300 hover:scale-125" />
        ))}
      </div>
      <p className="text-lg mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-[#A0A0B0] text-sm">{position}</p>
      </div>
    </div>
  )
}

function PricingCard({ title, price, features, buttonText, buttonColor, popular, isVisible, delay }) {
  return (
    <div
      className={`p-6 rounded-xl border ${
        popular ? "border-[#4ADE80]" : "border-[#3C3C4E]"
      } bg-[#1E1E2E] bg-opacity-50 relative transition-all duration-700 hover:scale-105 hover:shadow-xl hover:shadow-[#4ADE80]/10 ${
        popular ? "z-10" : ""
      } ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-20"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-[#4ADE80] text-black px-4 py-1 text-sm font-semibold rounded-bl-lg rounded-tr-lg animate-pulse-slow">
          Popular
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-[#A0A0B0]">/mes por usuario</span>
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start group">
            <Check className="h-5 w-5 text-[#4ADE80] mr-2 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-125" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`w-full ${buttonColor} hover:bg-opacity-90 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
          popular ? "hover:shadow-[#4ADE80]/20" : "hover:shadow-[#94A3B8]/20"
        }`}
      >
        {buttonText}
      </button>
    </div>
  )
}

export default Home

