import React, { useState } from "react";
import { Check, X, RotateCcw, Download, FileText, Image, Video, Music, Archive, Play, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";
import MediaViewer from "./MediaViewer";
import AudioPlayer from "../AudioPlayer";

const MessageBubble = ({ message, onRetry, onDelete, userRole }) => {
  const { content, isMine, sender_name, time, isOptimistic, error, attachments } = message;
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

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

  // Función para abrir el visor de medios
  const handleMediaView = (file) => {
    setSelectedMedia(file);
  };

  // Función para cerrar el visor de medios
  const closeMediaViewer = () => {
    setSelectedMedia(null);
  };

  // Función para renderizar preview de imagen
  const renderImagePreview = (file) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseURL = API_URL.replace('/api', '');
    const imageUrl = `${baseURL}${file.url}`;

    return (
      <div 
        className="relative group cursor-pointer overflow-hidden rounded-lg"
        onClick={() => handleMediaView(file)}
      >
        <img
          src={imageUrl}
          alt={file.originalName}
          className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-black/50 rounded-full">
            <Eye size={20} className="text-white" />
          </div>
        </div>
      </div>
    );
  };

  // Función para renderizar preview de video
  const renderVideoPreview = (file) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseURL = API_URL.replace('/api', '');
    const videoUrl = `${baseURL}${file.url}`;

    return (
      <div 
        className="relative group cursor-pointer overflow-hidden rounded-lg bg-black"
        onClick={() => handleMediaView(file)}
      >
        <video
          src={videoUrl}
          className="w-full h-32 object-cover"
          muted
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <div className="p-3 bg-black/60 rounded-full group-hover:scale-110 transition-transform duration-300">
            <Play size={24} className="text-white ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          <Video size={12} className="inline mr-1" />
          Video
        </div>
      </div>
    );
  };  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 ${
        isMine ? "flex-row-reverse" : "flex-row"
      } mb-2 sm:mb-4 group animate-messageIn ${isDeleting ? 'animate-messageOut' : ''} min-w-0 px-1 w-full max-w-full overflow-hidden message-bubble-container viewport-constrained`}
    >{/* Avatar */}
      {!isMine && (
        <div
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: getAvatarColor(sender_name) }}
        >
          {getInitials(sender_name)}
        </div>
      )}      {/* Mensaje */}
      <div
        className={`max-w-[calc(100vw-6rem)] sm:max-w-[85%] md:max-w-md relative transition-all duration-300 break-all min-w-0 overflow-hidden message-bubble force-word-break ${
          isMine
            ? error
              ? "backdrop-blur-md bg-red-900/20 border border-red-500/50 text-red-300"
              : isOptimistic
              ? "backdrop-blur-md bg-blue-900/20 border border-blue-500/50 text-blue-300"
              : "backdrop-blur-md bg-gradient-to-br from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/40 text-[#E8E8E8]"
            : "backdrop-blur-md bg-gradient-to-br from-[#2C2C34]/80 to-[#252529]/80 border border-[#3C4043]/60 text-[#E8E8E8]"
        } px-2 sm:px-3 py-2 rounded-lg animate-messageIn`}
        style={{ wordBreak: 'break-all', overflowWrap: 'break-word', maxWidth: window.innerWidth < 430 ? 'calc(100vw - 6rem)' : undefined }}
      >
        {/* Nombre del remitente (solo si no es mío) */}
        {!isMine && (
          <div className="text-xs font-semibold text-[#A8E6A3] mb-1 sm:mb-2 border-b border-[#3C4043]/50 pb-1 truncate">
            {sender_name}
          </div>
        )}        {/* Contenido del mensaje */}
        <div className="message-content text-sm sm:text-base leading-relaxed break-all overflow-wrap-anywhere word-break-break-all hyphens-auto min-w-0 max-w-full force-word-break"
             style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
          {content && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 break-all overflow-wrap-anywhere max-w-full force-word-break" style={{ wordBreak: 'break-all' }}>{children}</p>,
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="bg-[#1A1A1F]/60 border border-[#3C4043]/40 px-2 py-1 rounded-lg text-xs text-[#A8E6A3] font-mono break-all force-word-break" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-[#1A1A1F]/80 border border-[#3C4043]/60 text-[#E8E8E8] p-3 rounded-xl mt-2 overflow-x-hidden backdrop-blur-sm max-w-full" style={{ overflowX: 'hidden' }}>
                      <code className="font-mono text-sm break-all whitespace-pre-wrap force-word-break" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{children}</code>
                    </pre>
                  ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 space-y-1 text-[#E8E8E8] break-all force-word-break" style={{ wordBreak: 'break-all' }}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2 space-y-1 text-[#E8E8E8] break-all force-word-break" style={{ wordBreak: 'break-all' }}>{children}</ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#A8E6A3]/60 pl-4 py-2 my-2 bg-[#1A1A1F]/40 rounded-r-lg backdrop-blur-sm break-all overflow-hidden force-word-break" style={{ wordBreak: 'break-all' }}>
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-[#A8E6A3] break-all force-word-break" style={{ wordBreak: 'break-all' }}>{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-[#7DD3C0] break-all force-word-break" style={{ wordBreak: 'break-all' }}>{children}</em>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>{/* Archivos adjuntos */}
        {attachments && attachments.length > 0 && (
          <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 min-w-0">
            {attachments.map((file, index) => {
              const isImage = file.mimetype.startsWith('image/');
              const isVideo = file.mimetype.startsWith('video/');
              const isAudio = file.mimetype.startsWith('audio/');

              // Renderizar multimedia con preview
              if (isImage) {
                return (
                  <div key={index} className="space-y-1 sm:space-y-2 min-w-0">
                    {renderImagePreview(file)}
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-[#B8B8B8] min-w-0">
                      <Image size={10} className="text-blue-400 flex-shrink-0 sm:w-3 sm:h-3" />
                      <span className="truncate flex-1 min-w-0">{file.originalName}</span>
                      <span className="flex-shrink-0">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                );
              }

              if (isVideo) {
                return (
                  <div key={index} className="space-y-1 sm:space-y-2 min-w-0">
                    {renderVideoPreview(file)}
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-[#B8B8B8] min-w-0">
                      <Video size={10} className="text-red-400 flex-shrink-0 sm:w-3 sm:h-3" />
                      <span className="truncate flex-1 min-w-0">{file.originalName}</span>
                      <span className="flex-shrink-0">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                );
              }              if (isAudio) {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const baseURL = API_URL.replace('/api', '');
                const audioUrl = `${baseURL}${file.url}`;
                
                console.log('🎵 Construyendo URL de audio:', {
                  file,
                  API_URL,
                  baseURL,
                  audioUrl
                });
                
                return (
                  <div key={index} className="space-y-1 sm:space-y-2 min-w-0">
                    <AudioPlayer 
                      audioUrl={audioUrl}
                      fileName={file.originalName}
                      className="max-w-full"
                    />
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-[#B8B8B8] min-w-0">
                      <Music size={10} className="text-green-400 flex-shrink-0 sm:w-3 sm:h-3" />
                      <span className="truncate flex-1 min-w-0">{file.originalName}</span>
                      <span className="flex-shrink-0">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                );
              }

              // Renderizar otros tipos de archivo normalmente
              return (
                <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 bg-[#1A1A1F]/60 border border-[#3C4043]/40 rounded-lg hover:bg-[#1A1A1F]/80 transition-colors min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.mimetype)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-[#E8E8E8] truncate font-medium">
                      {file.originalName}
                    </div>
                    <div className="text-xs text-[#B8B8B8]">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="flex-shrink-0 p-1 sm:p-1.5 text-[#A8E6A3] hover:text-[#98E093] hover:bg-[#A8E6A3]/20 rounded-lg transition-all duration-200"
                    title="Descargar archivo"
                  >
                    <Download size={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}        {/* Tiempo y estado */}
        <div className="flex items-center justify-between mt-2 sm:mt-3 pt-1 sm:pt-2 border-t border-[#3C4043]/30">
          <span className={`text-xs font-medium ${
            isMine ? "text-[#A8E6A3]/70" : "text-[#B8B8B8]"
          }`}>
            {time}
          </span>
          
          {/* Estados del mensaje */}
          {isMine && (
            <div className="flex items-center gap-1 sm:gap-2">
              {error && (
                <button
                  onClick={() => onRetry(message)}
                  className="text-red-400 hover:text-red-300 p-1 sm:p-1.5 rounded-lg hover:bg-red-900/20 transition-all duration-200"
                  title="Reintentar envío"
                >
                  <RotateCcw size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              )}
              {isOptimistic && !error && (
                <div className="text-blue-400 flex items-center gap-1" title="Enviando...">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs hidden sm:inline">Enviando...</span>
                </div>
              )}
              {!isOptimistic && !error && (
                <Check size={12} className="text-[#A8E6A3] sm:w-3.5 sm:h-3.5" />
              )}
              
              {/* Botón de eliminar (solo admins o el remitente) */}
              {(userRole === 'admin' || isMine) && (
                <button
                  onClick={handleDelete}
                  className="text-[#B8B8B8] hover:text-red-400 p-1 sm:p-1.5 rounded-lg hover:bg-red-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Eliminar mensaje"
                >
                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <MediaViewer
          file={selectedMedia}
          onClose={closeMediaViewer}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default MessageBubble;
