import React from "react";
import { ImageIcon, Mic, Paperclip } from "lucide-react";

const AttachmentOptions = ({ onClose, onNotification }) => {
  const handleAttachment = (type) => {
    // Placeholder - aquí se implementaría la lógica de adjuntos
    if (onNotification) {
      onNotification("Info", `Funcionalidad de ${type} próximamente`);
    } else {
      alert(`Funcionalidad de ${type} próximamente`);
    }
    onClose();
  };

  return (
    <div className="bg-gradient-to-br from-[#2C2C34] to-[#252529] border border-[#3C4043] rounded-xl p-3 w-52 animate-in slide-in-from-bottom-2 duration-200">
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
          onClick={() => handleAttachment("archivo")}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#E8E8E8] hover:bg-[#3C4043] rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-[#7DD3C0]/20 rounded-lg group-hover:bg-[#7DD3C0]/30 transition-colors">
            <Paperclip size={16} className="text-[#7DD3C0]" />
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
