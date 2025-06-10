import React, { useRef } from "react";
import { ImageIcon, Mic, Paperclip, Video } from "lucide-react";
import { uploadFiles } from "../../utils/api";

const AttachmentOptions = ({ onClose, onNotification, onFileSelect }) => {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileUpload = async (files, type) => {
    if (!files || files.length === 0) return;

    try {
      // Mostrar notificación de carga
      if (onNotification) {
        onNotification("Info", "Subiendo archivos...");
      }

      const token = localStorage.getItem('token');
      const uploadResult = await uploadFiles(files, token);

      // Pasar los archivos subidos al componente padre
      if (onFileSelect && uploadResult.files) {
        onFileSelect(uploadResult.files);
      }

      if (onNotification) {
        onNotification("Success", `${files.length} archivo(s) subido(s) exitosamente`);
      }

    } catch (error) {
      console.error('Error al subir archivos:', error);
      if (onNotification) {
        onNotification("Error", error.message || "Error al subir archivos");
      }
    }

    onClose();
  };

  const handleAttachment = (type) => {
    switch (type) {
      case "imagen":
        imageInputRef.current?.click();
        break;
      case "video":
        videoInputRef.current?.click();
        break;
      case "archivo":
        fileInputRef.current?.click();
        break;
      case "audio":
        // Placeholder para grabación de audio
        if (onNotification) {
          onNotification("Info", "Funcionalidad de grabación de audio próximamente");
        }
        onClose();
        break;
      default:
        onClose();
    }
  };
  return (
    <div className="bg-gradient-to-br from-[#2C2C34] to-[#252529] border border-[#3C4043] rounded-xl p-3 w-52 animate-in slide-in-from-bottom-2 duration-200">
      {/* Inputs ocultos para archivos */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, 'imagen')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, 'video')}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, 'archivo')}
      />

      <div className="space-y-1">
        <button
          onClick={() => handleAttachment("imagen")}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#E8E8E8] hover:bg-[#3C4043] rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-[#A8E6A3]/20 rounded-lg group-hover:bg-[#A8E6A3]/30 transition-colors">
            <ImageIcon size={16} className="text-[#A8E6A3]" />
          </div>
          <span className="font-medium">Imagen</span>
        </button>
        
        <button
          onClick={() => handleAttachment("video")}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#E8E8E8] hover:bg-[#3C4043] rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-[#7DD3C0]/20 rounded-lg group-hover:bg-[#7DD3C0]/30 transition-colors">
            <Video size={16} className="text-[#7DD3C0]" />
          </div>
          <span className="font-medium">Video</span>
        </button>
        
        <button
          onClick={() => handleAttachment("archivo")}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#E8E8E8] hover:bg-[#3C4043] rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-blue-400/20 rounded-lg group-hover:bg-blue-400/30 transition-colors">
            <Paperclip size={16} className="text-blue-400" />
          </div>
          <span className="font-medium">Archivo</span>
        </button>
        
        <button
          onClick={() => handleAttachment("audio")}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#E8E8E8] hover:bg-[#3C4043] rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-red-400/20 rounded-lg group-hover:bg-red-400/30 transition-colors">
            <Mic size={16} className="text-red-400" />
          </div>
          <span className="font-medium">Audio</span>
        </button>
      </div>
    </div>
  );
};

export default AttachmentOptions;
