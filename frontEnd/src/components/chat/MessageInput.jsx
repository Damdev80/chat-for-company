import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, X } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import AttachmentOptions from "./AttachmentOptions";
import { uploadFiles } from "../../utils/api";

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onTyping,
  onNotification
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUploading) return; // No enviar mientras se suben archivos
    
    // Pasar archivos adjuntos al enviar mensaje
    onSendMessage(e, selectedFiles.length > 0 ? selectedFiles : null);
    setSelectedFiles([]); // Limpiar archivos después de enviar
    setShowEmojis(false);
    setShowAttachOptions(false);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    onTyping();
  };

  // Manejar pegado de archivos con Ctrl+V
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      await handleFileUpload(files);
    }
  };

  // Manejar selección de archivos desde AttachmentOptions
  const handleFileSelect = (files) => {
    setSelectedFiles(prev => [...prev, ...files]);
    setShowAttachOptions(false);
  };

  // Subir archivos
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (onNotification) {
        onNotification("Info", "Subiendo archivos...");
      }

      const token = localStorage.getItem('token');
      const uploadResult = await uploadFiles(files, token);

      if (uploadResult.files) {
        setSelectedFiles(prev => [...prev, ...uploadResult.files]);
        if (onNotification) {
          onNotification("Success", `${files.length} archivo(s) subido(s) exitosamente`);
        }
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
      if (onNotification) {
        onNotification("Error", error.message || "Error al subir archivos");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Remover archivo seleccionado
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Establecer referencia del input y añadir event listener para paste
  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('paste', handlePaste);
      return () => {
        inputElement.removeEventListener('paste', handlePaste);
      };
    }
  }, []);  return (
    <div className="border-t border-[#3C4043]/50 p-3 sm:p-4 bg-gradient-to-r from-[#2C2C34]/95 to-[#252529]/95 backdrop-blur-md relative message-input-container no-horizontal-overflow">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A8E6A3]/30 to-transparent"></div>
      
      {/* Archivos seleccionados - Mejorado para móvil */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 sm:mb-3 p-2 bg-[#2C2C34]/60 rounded-lg border border-[#3C4043]/40">
          <div className="text-xs text-[#A8E6A3] mb-2 font-medium">
            Archivos adjuntos ({selectedFiles.length})
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2 max-h-16 sm:max-h-20 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-1 sm:gap-2 bg-[#3C4043]/60 rounded-lg px-1.5 sm:px-2 py-1 text-xs">
                <span className="text-[#E8E8E8] truncate max-w-20 sm:max-w-24">{file.originalName}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Remover archivo"
                >
                  <X size={10} className="sm:w-3 sm:h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Emoji Picker - Posicionado mejor para móvil */}
      {showEmojis && (
        <div className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 right-2 sm:right-auto z-50 animate-in slide-in-from-bottom-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      {/* Attachment Options - Posicionado mejor para móvil */}
      {showAttachOptions && (
        <div className="absolute bottom-16 sm:bottom-20 left-12 sm:left-16 z-50 animate-in slide-in-from-bottom-2">
          <AttachmentOptions 
            onClose={() => setShowAttachOptions(false)} 
            onNotification={onNotification}
            onFileSelect={handleFileSelect}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
        {/* Botón de adjuntos - Adaptado para móvil */}        <button
          type="button"
          onClick={() => {
            setShowAttachOptions(!showAttachOptions);
            setShowEmojis(false);
          }}          className={`p-2 sm:p-3 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043]/60 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-[#A8E6A3]/30 hover:scale-105 flex-shrink-0 ${
            showAttachOptions ? 'bg-[#3C4043]/60 text-[#A8E6A3] border-[#A8E6A3]/30' : ''
          }`}
          title="Adjuntar archivo"
        >
          <Paperclip size={16} className="sm:w-5 sm:h-5" />
        </button>        {/* Input de mensaje - Mejorado para móvil */}
        <div className="flex-1 relative">          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={isUploading ? "Subiendo archivos..." : "Escribe un mensaje..."}
            disabled={isUploading}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#1A1A1F]/80 to-[#1A1A1F]/60 backdrop-blur-md border border-[#2C2C34]/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/50 focus:border-[#A8E6A3]/30 text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200 hover:border-[#3C4043]/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            maxLength={1000}
          />
          {/* Character counter */}
          {newMessage.length > 800 && (
            <div className="absolute -top-5 sm:-top-6 right-0 text-xs text-[#B8B8B8] bg-[#2C2C34]/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-[#3C4043]/40">
              {newMessage.length}/1000
            </div>
          )}
        </div>        {/* Botón de emojis - Adaptado para móvil */}
        <button
          type="button"
          onClick={() => {
            setShowEmojis(!showEmojis);
            setShowAttachOptions(false);
          }}          className={`p-2 sm:p-3 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043]/60 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-[#A8E6A3]/30 hover:scale-105 flex-shrink-0 ${
            showEmojis ? 'bg-[#3C4043]/60 text-[#A8E6A3] border-[#A8E6A3]/30' : ''
          }`}
          title="Agregar emoji"
        >
          <Smile size={16} className="sm:w-5 sm:h-5" />
        </button>        {/* Botón de enviar - Adaptado para móvil */}
        <button
          type="submit"
          disabled={(!newMessage.trim() && selectedFiles.length === 0) || isUploading}
          className="p-2 sm:p-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] disabled:bg-[#3C4043]/60 disabled:text-[#666] disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 border border-transparent hover:border-white/20 backdrop-blur-sm flex-shrink-0"
          title="Enviar mensaje"
        >
          <Send size={16} className="sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
