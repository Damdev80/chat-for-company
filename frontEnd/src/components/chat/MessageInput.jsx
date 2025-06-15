import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, X, Mic } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import AttachmentOptions from "./AttachmentOptions";
import AudioRecorder from "../AudioRecorder";
import { uploadFiles, uploadAudioMessage } from "../../utils/api";

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
  
  // Estados para audio
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  
  const inputRef = useRef(null);

  // Cerrar otros modales cuando se abre uno
  useEffect(() => {
    if (showEmojis) {
      setShowAttachOptions(false);
      setShowAudioRecorder(false);
    }
    if (showAttachOptions) {
      setShowEmojis(false);
      setShowAudioRecorder(false);
    }
    if (showAudioRecorder) {
      setShowEmojis(false);
      setShowAttachOptions(false);
    }
  }, [showEmojis, showAttachOptions, showAudioRecorder]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUploading) return;
    
    onSendMessage(e, selectedFiles.length > 0 ? selectedFiles : null);
    setSelectedFiles([]);
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

  const handleFileSelect = (files) => {
    setSelectedFiles(prev => [...prev, ...files]);
    setShowAttachOptions(false);
  };

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

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Funciones para manejar audio
  const handleAudioButtonClick = () => {
    setShowAudioRecorder(!showAudioRecorder);
  };

  const handleAudioCancel = () => {
    setShowAudioRecorder(false);
    setIsRecordingAudio(false);
  };  const handleAudioReady = async (audioBlob, duration = 0) => {
    try {
      setIsUploading(true);
      if (onNotification) {
        onNotification("Info", "Enviando mensaje de audio...");
      }

      const token = localStorage.getItem('token');
      const groupId = "global"; // O el ID del grupo actual
      
      // Crear un mensaje optimista para el audio
      const tempId = Date.now().toString();
      const optimisticMessage = {
        id: tempId,
        content: '',
        isMine: true,
        sender_name: localStorage.getItem('username') || 'Tu',
        group_id: groupId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOptimistic: true,
        attachments: [{
          type: 'audio',
          originalName: `audio-${Date.now()}.webm`,
          size: audioBlob.size,
          duration: duration,
          url: URL.createObjectURL(audioBlob) // URL temporal para el optimistic
        }]
      };

      console.log('🎵 Mensaje optimista de audio:', optimisticMessage);      console.log('🎵 Añadiendo mensaje optimista al chat');
      
      // Añadir el mensaje optimista inmediatamente al chat
      if (typeof onSendMessage === 'function') {
        // Simular evento para onSendMessage
        const fakeEvent = { 
          preventDefault: () => {},
          target: { value: '' }
        };
        onSendMessage(fakeEvent, optimisticMessage.content, optimisticMessage);
      }
        // Pequeño delay antes de enviar al servidor para que el mensaje optimista se vea
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await uploadAudioMessage(audioBlob, groupId, token, duration, tempId);
      
      if (result.success) {
        console.log('🎵 Audio enviado exitosamente:', result);
        if (onNotification) {
          onNotification("Success", "Mensaje de audio enviado");
        }
        setShowAudioRecorder(false);
        setIsRecordingAudio(false);
      }
    } catch (error) {
      console.error('❌ Error al enviar audio:', error);
      if (onNotification) {
        onNotification("Error", error.message || "Error al enviar mensaje de audio");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative p-3 sm:p-4 bg-gradient-to-r from-[#1A1A1F] via-[#252529] to-[#1A1A1F] border-t border-[#3C4043]">
      {/* Preview de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 p-3 bg-[#2D2D3A] rounded-lg border border-[#3C3C4E]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-medium">
              Archivos seleccionados ({selectedFiles.length})
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-[#1E1E2E] rounded border border-[#3C3C4E]">
                <span className="text-sm text-[#A0A0B0] truncate">{file.filename}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
        {/* Input de mensaje */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onPaste={handlePaste}
            placeholder="Escribe un mensaje..."
            className="w-full bg-[#2D2D3A] border border-[#3C4043] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all scrollbar-thin scrollbar-thumb-[#3C4043] scrollbar-track-[#252529] min-h-[44px] max-h-32"
            rows="1"
            style={{
              height: 'auto',
              minHeight: '44px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
        </div>

        {/* Botón de archivos adjuntos */}
        <button
          type="button"
          onClick={() => {
            setShowAttachOptions(!showAttachOptions);
            setShowEmojis(false);
            setShowAudioRecorder(false);
          }}
          className={`relative p-2 sm:p-3 rounded-xl backdrop-blur-sm transition-all duration-300 border flex-shrink-0 group overflow-hidden ${
            showAttachOptions 
              ? 'bg-gradient-to-r from-[#A8E6A3]/25 to-[#7DD3C0]/25 text-[#A8E6A3] border-[#A8E6A3]/40 shadow-lg shadow-[#A8E6A3]/15 scale-105' 
              : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]/60 border-transparent hover:border-[#A8E6A3]/30'
          } hover:scale-105 active:scale-95`}
          title="Adjuntar archivos"
        >
          <Paperclip size={16} className="sm:w-5 sm:h-5 transition-all duration-300 group-hover:scale-110" />
        </button>

        {/* Botón de emojis */}
        <button
          type="button"
          onClick={() => {
            setShowEmojis(!showEmojis);
            setShowAttachOptions(false);
            setShowAudioRecorder(false);
          }}
          className={`relative p-2 sm:p-3 rounded-xl backdrop-blur-sm transition-all duration-300 border flex-shrink-0 group overflow-hidden ${
            showEmojis 
              ? 'bg-gradient-to-r from-[#A8E6A3]/25 to-[#7DD3C0]/25 text-[#A8E6A3] border-[#A8E6A3]/40 shadow-lg shadow-[#A8E6A3]/15 scale-105' 
              : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]/60 border-transparent hover:border-[#A8E6A3]/30'
          } hover:scale-105 active:scale-95`}
          title="Seleccionar emoji"
        >
          <Smile size={16} className="sm:w-5 sm:h-5 transition-all duration-300 group-hover:scale-110" />
        </button>

        {/* Botón de audio - NUEVA FUNCIONALIDAD */}
        <button
          type="button"
          onClick={handleAudioButtonClick}
          className={`relative p-2 sm:p-3 rounded-xl backdrop-blur-sm transition-all duration-300 border flex-shrink-0 group overflow-hidden ${
            showAudioRecorder || isRecordingAudio
              ? 'bg-gradient-to-r from-red-500/25 to-red-600/25 text-red-400 border-red-400/40 shadow-lg shadow-red-500/15 scale-105' 
              : 'text-[#B8B8B8] hover:text-[#4ADE80] hover:bg-[#3C4043]/60 border-transparent hover:border-[#4ADE80]/30'
          } hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isRecordingAudio ? "Grabando audio..." : "Grabar mensaje de voz"}
        >
          {/* Efecto de brillo cuando está grabando */}
          {(showAudioRecorder || isRecordingAudio) && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-pulse"></div>
          )}
          
          <Mic size={16} className={`sm:w-5 sm:h-5 transition-all duration-300 ${
            showAudioRecorder || isRecordingAudio ? 'scale-110 text-red-400' : 'group-hover:scale-110'
          }`} />
          
          {/* Indicador de grabación */}
          {isRecordingAudio && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/40"></div>
          )}
        </button>

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={(!newMessage.trim() && selectedFiles.length === 0) || isUploading}
          className="p-2 sm:p-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] disabled:bg-[#3C4043]/60 disabled:text-[#666] disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 border border-transparent hover:border-white/20 backdrop-blur-sm flex-shrink-0"
          title="Enviar mensaje"
        >
          <Send size={16} className="sm:w-5 sm:h-5" />
        </button>
      </form>

      {/* Picker de emojis */}
      {showEmojis && (
        <div className="absolute bottom-16 sm:bottom-20 right-4 z-50">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      {/* Opciones de archivos adjuntos */}
      {showAttachOptions && (
        <div className="absolute bottom-16 sm:bottom-20 right-4 z-50">
          <AttachmentOptions onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* Audio Recorder - NUEVA FUNCIONALIDAD */}
      {showAudioRecorder && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-80 max-w-[90vw]">
          <AudioRecorder 
            onCancel={handleAudioCancel}
            onAudioReady={handleAudioReady}
            isOpen={showAudioRecorder}
          />
        </div>
      )}

      {/* Mensaje de estado cuando está grabando */}
      {isRecordingAudio && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          <span className="text-sm font-medium">Grabando...</span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
