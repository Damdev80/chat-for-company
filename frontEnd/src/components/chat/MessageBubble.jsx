import React, { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";

const MessageBubble = ({ message, onRetry, onDelete, userRole }) => {
  const { content, isMine, sender_name, time, isOptimistic, error } = message;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Agregar delay para mostrar la animación
    setTimeout(() => {
      onDelete(message.id);
    }, 300);
  };

  return (    <div
      className={`flex items-start gap-3 ${
        isMine ? "flex-row-reverse" : "flex-row"
      } mb-4 group animate-messageIn ${isDeleting ? 'animate-messageOut' : ''}`}
    >{/* Avatar */}
      {!isMine && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: getAvatarColor(sender_name) }}
        >
          {getInitials(sender_name)}
        </div>
      )}      {/* Mensaje */}
      <div        className={`max-w-[85%] sm:max-w-md relative transition-all duration-300 break-words ${
          isMine
            ? error
              ? "backdrop-blur-md bg-red-900/20 border border-red-500/50 text-red-300"
              : isOptimistic
              ? "backdrop-blur-md bg-blue-900/20 border border-blue-500/50 text-blue-300"
              : "backdrop-blur-md bg-gradient-to-br from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/40 text-[#E8E8E8]"
            : "backdrop-blur-md bg-gradient-to-br from-[#2C2C34]/80 to-[#252529]/80 border border-[#3C4043]/60 text-[#E8E8E8]"
        } px-3 py-2 rounded-lg animate-messageIn overflow-hidden`}
      >
        {/* Nombre del remitente (solo si no es mío) */}
        {!isMine && (
          <div className="text-xs font-semibold text-[#A8E6A3] mb-2 border-b border-[#3C4043]/50 pb-1">
            {sender_name}
          </div>
        )}

        {/* Contenido del mensaje */}        <div className="message-content text-base leading-relaxed break-words overflow-wrap-anywhere">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{              p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-[#1A1A1F]/60 border border-[#3C4043]/40 px-2 py-1 rounded-lg text-xs text-[#A8E6A3] font-mono">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-[#1A1A1F]/80 border border-[#3C4043]/60 text-[#E8E8E8] p-3 rounded-xl mt-2 overflow-x-auto backdrop-blur-sm">
                    <code className="font-mono text-sm">{children}</code>
                  </pre>
                ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-2 space-y-1 text-[#E8E8E8]">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-2 space-y-1 text-[#E8E8E8]">{children}</ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#A8E6A3]/60 pl-4 py-2 my-2 bg-[#1A1A1F]/40 rounded-r-lg backdrop-blur-sm">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-[#A8E6A3]">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-[#7DD3C0]">{children}</em>
              ),
            }}
          >
            {content}
          </ReactMarkdown>        </div>

        {/* Tiempo y estado */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#3C4043]/30">
          <span className={`text-xs font-medium ${
            isMine ? "text-[#A8E6A3]/70" : "text-[#B8B8B8]"
          }`}>
            {time}
          </span>
          
          {/* Estados del mensaje */}
          {isMine && (
            <div className="flex items-center gap-2">
              {error && (
                <button
                  onClick={() => onRetry(message)}
                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-900/20 transition-all duration-200"
                  title="Reintentar envío"
                >
                  <RotateCcw size={14} />
                </button>
              )}
              {isOptimistic && !error && (
                <div className="text-blue-400 flex items-center gap-1" title="Enviando...">
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Enviando...</span>
                </div>
              )}
              {!isOptimistic && !error && (
                <div className="flex items-center gap-1 text-[#A8E6A3]" title="Enviado">
                  <Check size={14} />
                  <span className="text-xs">Enviado</span>
                </div>
              )}
            </div>
          )}
        </div>        {/* Botón de eliminar (solo admin) */}
        {userRole === "admin" && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 backdrop-blur-sm border border-red-400/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 hover:scale-110 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 button-press"
            title="Eliminar mensaje"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
