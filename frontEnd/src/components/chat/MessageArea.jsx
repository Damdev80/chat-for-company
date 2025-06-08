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
  }, [messages]);  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1 relative">
      
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-[#B8B8B8] backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#2C2C34]/60 to-[#252529]/60 backdrop-blur-md border border-[#3C4043]/40 rounded-2xl p-8">
            <div className="text-6xl mb-4 text-center">💬</div>
            <p className="text-xl font-semibold text-[#A8E6A3] mb-2 text-center">No hay mensajes aún</p>
            <p className="text-sm text-[#B8B8B8] text-center max-w-sm">¡Envía el primer mensaje para comenzar la conversación!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`transform transition-all duration-300 ${
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
            {/* Indicador de escritura mejorado */}
          {isTyping && (
            <div className="flex items-center gap-3 p-4 mx-4 backdrop-blur-md bg-gradient-to-br from-[#2C2C34]/80 to-[#252529]/80 border border-[#3C4043]/60 rounded-2xl animate-in slide-in-from-bottom-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/40 flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#A8E6A3] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#A8E6A3] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1.5 h-1.5 bg-[#A8E6A3] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
              <span className="text-sm text-[#B8B8B8] font-medium">Alguien está escribiendo...</span>
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
