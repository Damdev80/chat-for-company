// src/components/support/SupportChat.jsx - Componente de chat de apoyo con IA
import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  RotateCcw, 
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'

const SupportChat = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [chatLoading, setChatLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Cargar o crear chat activo
  useEffect(() => {
    if (isOpen && currentUser) {
      loadActiveChat()
    }
  }, [isOpen, currentUser])

  // Auto scroll al final de los mensajes
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100)
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const loadActiveChat = async () => {
    try {
      console.log('🔄 Cargando chat activo...')
      setChatLoading(true)
      const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/support/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      console.log('📥 Respuesta loadActiveChat:', data)

      if (response.ok) {
        console.log('✅ Chat cargado:', data.data)
        setChatId(data.data.chat.id)
        setMessages(data.data.messages || [])
      } else {
        console.error('❌ Error cargando chat:', data)
      }
    } catch (error) {
      console.error('Error cargando chat:', error)
    } finally {
      setChatLoading(false)
    }
  }
  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || loading) return

    // Si no hay chatId, intentar cargar el chat primero
    if (!chatId) {
      console.log('🔄 No hay chatId, intentando cargar chat...')
      await loadActiveChat()
      
      // Si aún no hay chatId después de cargar, mostrar error
      if (!chatId) {
        console.error('❌ Error: No se pudo establecer conexión con el chat')
        alert('Error: No se pudo establecer conexión con el chat. Por favor, cierra y abre el chat de nuevo.')
        return
      }
    }

    const messageText = newMessage.trim()
    console.log('📤 Enviando mensaje:', messageText, 'ChatId:', chatId)
    setNewMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`http://localhost:3000/api/support/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      })

      const data = await response.json()
      console.log('📥 Respuesta del servidor:', data)

      if (response.ok) {
        // Agregar tanto el mensaje del usuario como la respuesta de la IA
        setMessages(prev => [
          ...prev,
          data.data.userMessage,
          data.data.assistantMessage
        ])
      } else {
        console.error('❌ Error en respuesta:', data)
        alert(`Error: ${data.message || 'Error desconocido'}`)
        setNewMessage(messageText) // Restaurar mensaje
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      alert('Error de conexión. Por favor, intenta de nuevo.')
      // Reestablecer el mensaje en caso de error
      setNewMessage(messageText)
    } finally {
      setLoading(false)
    }
  }

  const resetChat = async () => {
    if (!confirm('¿Estás seguro de que quieres iniciar un nuevo chat? Se perderá la conversación actual.')) {
      return
    }

    try {
      setLoading(true)
      
      // Primero cerrar el chat actual
      if (chatId) {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:3000/api/support/${chatId}/close`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      }
      
      // Limpiar estado local
      setChatId(null)
      setMessages([])
      
      // Cargar un nuevo chat (esto llamará automáticamente a loadActiveChat)
      await loadActiveChat()
      
    } catch (error) {
      console.error('Error reiniciando chat:', error)
      alert('Error al reiniciar el chat. Por favor, intenta cerrar y abrir el chat de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#252529] rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-[#3C4043] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3C4043] bg-[#1A1A1F] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A8E6A3] to-[#90D68C] rounded-full flex items-center justify-center">
              <Bot size={20} className="text-[#1A1A1F]" />
            </div>
            <div>
              <h3 className="font-bold text-[#A8E6A3]">Asistente de Apoyo</h3>
              <p className="text-sm text-[#B8B8B8]">Con tecnología de IA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043] rounded-lg transition-colors"
              title="Nuevo chat"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#B8B8B8] hover:text-white hover:bg-[#3C4043] rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-[#B8B8B8]">
                <Loader2 size={20} className="animate-spin" />
                <span>Cargando chat...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A8E6A3] to-[#90D68C] rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={24} className="text-[#1A1A1F]" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                ¡Hola! Soy tu asistente de apoyo
              </h4>
              <p className="text-[#B8B8B8] max-w-md">
                Estoy aquí para ayudarte con cualquier pregunta sobre Thinkchat, 
                tus objetivos, ideas o eventos. ¿En qué puedo ayudarte hoy?
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-[#A8E6A3] text-[#1A1A1F]' 
                    : 'bg-gradient-to-br from-[#3C4043] to-[#2C2C34] text-[#A8E6A3]'
                }`}>
                  {message.role === 'user' ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>

                {/* Message */}
                <div className={`flex flex-col max-w-[85%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#A8E6A3] text-[#1A1A1F]'
                      : 'bg-[#3C4043] text-white border border-[#4C4C53]'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-[#666] mt-1">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3C4043] to-[#2C2C34] text-[#A8E6A3] flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-[#3C4043] rounded-2xl px-4 py-3 border border-[#4C4C53]">
                <div className="flex items-center gap-2 text-[#B8B8B8]">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Procesando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#3C4043] bg-[#1A1A1F] rounded-b-2xl">
          <form onSubmit={sendMessage} className="flex gap-3">            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                chatLoading ? "Conectando..." : 
                !chatId ? "Configurando chat..." : 
                "Escribe tu pregunta..."
              }
              className="flex-1 bg-[#2C2C34] border border-[#3C4043] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#A8E6A3] focus:outline-none"
              disabled={loading || chatLoading}
              maxLength={2000}
            />            <button
              type="submit"
              disabled={!newMessage.trim() || loading || chatLoading}
              className="bg-[#A8E6A3] text-[#1A1A1F] p-3 rounded-xl hover:bg-[#90D68C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                chatLoading ? "Conectando..." : 
                !newMessage.trim() ? "Escribe un mensaje" : 
                "Enviar mensaje"
              }
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
          
          {/* Character count */}
          <div className="flex justify-between items-center mt-2 text-xs text-[#666]">
            <span>Asistente con IA • Información actualizada</span>
            <span>{newMessage.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportChat
