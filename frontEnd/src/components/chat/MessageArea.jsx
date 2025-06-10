import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

const MessageArea = ({ 
  messages, 
  onRetryMessage, 
  onDeleteMessage, 
  userRole, 
  currentUser,
  isTyping 
}) => {
  const messagesEndRef = useRef(null);
  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Debug específico para móvil cuando cambian los mensajes
    if (typeof window !== 'undefined' && window.innerWidth < 430 && messages.length > 0) {
      console.log('📱 [MOBILE MESSAGE UPDATE]', {
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]?.content?.substring(0, 40),
        groups: [...new Set(messages.map(m => m.group_id))],
        timestamp: new Date().toISOString()
      });
    }
  }, [messages]);return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-1 relative min-w-0 message-area no-horizontal-overflow">
      
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-[#B8B8B8] backdrop-blur-sm px-2">
          <div className="bg-gradient-to-br from-[#2C2C34]/60 to-[#252529]/60 backdrop-blur-md border border-[#3C4043]/40 rounded-2xl p-4 sm:p-8 max-w-full">
            <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 text-center">💬</div>
            <p className="text-lg sm:text-xl font-semibold text-[#A8E6A3] mb-1 sm:mb-2 text-center">No hay mensajes aún</p>
            <p className="text-xs sm:text-sm text-[#B8B8B8] text-center max-w-sm">¡Envía el primer mensaje para comenzar la conversación!</p>
          </div>
        </div>
      ) : (        <div className="space-y-2 sm:space-y-4 py-2 sm:py-4 min-w-0 message-list no-horizontal-overflow">
          {/* Debug info DESACTIVADO TEMPORALMENTE */}
          {/* {typeof window !== 'undefined' && window.innerWidth < 430 && messages.length > 0 && (
            <div className="text-xs text-yellow-400 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30 mb-3">
              <div className="font-semibold mb-1">📱 Debug Mobile:</div>
              <div>• Mensajes mostrados: <span className="text-yellow-200 font-bold">{messages.length}</span></div>
              <div>• Último mensaje: <span className="text-yellow-200">{messages[messages.length - 1]?.content?.substring(0, 30)}...</span></div>
              <div>• Grupo ID: <span className="text-yellow-200">{messages[0]?.group_id || 'N/A'}</span></div>
            </div>
          )} */}
          
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`transform transition-all duration-300 min-w-0 ${
                index === messages.length - 1 ? 'animate-in slide-in-from-bottom-2' : ''
              }`}
            >
              <MessageBubble
                message={message}
                onRetry={onRetryMessage}
                onDelete={onDeleteMessage}
                userRole={userRole}
                currentUser={currentUser}
              />
            </div>
          ))}
            {/* Indicador de escritura mejorado para móvil */}
          {isTyping && (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-4 mx-1 sm:mx-4 backdrop-blur-md bg-gradient-to-br from-[#2C2C34]/80 to-[#252529]/80 border border-[#3C4043]/60 rounded-xl sm:rounded-2xl animate-in slide-in-from-bottom-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/40 flex items-center justify-center flex-shrink-0">
                <div className="flex gap-0.5 sm:gap-1">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#A8E6A3] rounded-full animate-bounce"></div>                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#A8E6A3] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#A8E6A3] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-[#B8B8B8] font-medium truncate">Alguien está escribiendo...</span>
            </div>
          )}
        </div>
      )}
      
      {/* Elemento invisible para scroll automático */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageArea;
