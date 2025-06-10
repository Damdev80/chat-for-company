import React, { useState } from "react";
import { Check, X, RotateCcw, Download, FileText, Image, Video, Music, Archive } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";

const MessageBubble = ({ message, onRetry, onDelete, userRole }) => {
  const { content, isMine, sender_name, time, isOptimistic, error, attachments } = message;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Agregar delay para mostrar la animación
    setTimeout(() => {
      onDelete(message.id);
    }, 300);
  };

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <Image size={16} className="text-blue-400" />;
    if (mimetype.startsWith('video/')) return <Video size={16} className="text-red-400" />;
    if (mimetype.startsWith('audio/')) return <Music size={16} className="text-green-400" />;
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) return <Archive size={16} className="text-yellow-400" />;
    return <FileText size={16} className="text-gray-400" />;
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Función para manejar la descarga de archivos
  const handleDownload = (file) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseURL = API_URL.replace('/api', '');
    const downloadUrl = `${baseURL}${file.url}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        )}        {/* Contenido del mensaje */}
        <div className="message-content text-base leading-relaxed break-words overflow-wrap-anywhere">
          {content && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
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
            </ReactMarkdown>
          )}
        </div>

        {/* Archivos adjuntos */}
        {attachments && attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-[#1A1A1F]/60 border border-[#3C4043]/40 rounded-lg hover:bg-[#1A1A1F]/80 transition-colors">
                <div className="flex-shrink-0">
                  {getFileIcon(file.mimetype)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#E8E8E8] truncate font-medium">
                    {file.originalName}
                  </div>
                  <div className="text-xs text-[#B8B8B8]">
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-shrink-0 p-1.5 text-[#A8E6A3] hover:text-[#98E093] hover:bg-[#A8E6A3]/20 rounded-lg transition-all duration-200"
                  title="Descargar archivo"
                >
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

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
