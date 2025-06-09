import React from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

const DeleteChatModal = ({ isOpen, onClose, onConfirm, chatName, isDeleting, isGlobalChat = false }) => {
  if (!isOpen) return null;

  const isGlobal = isGlobalChat || chatName === "Chat Global";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#2C2C34] to-[#252529] border border-red-500/30 rounded-2xl p-6 max-w-md w-full mx-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={20} />
            </div>            <h2 className="text-xl font-bold text-[#E8E8E8]">
              {isGlobal ? "Limpiar Chat Global" : "Limpiar Grupo"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#B8B8B8] hover:text-[#E8E8E8] rounded-xl hover:bg-[#3C4043] transition-all duration-200 button-press"
            disabled={isDeleting}
          >
            <X size={20} />
          </button>
        </div>        {/* Content */}
        <div className="mb-6">          <p className="text-[#E8E8E8] mb-3">
            {isGlobal 
              ? `¿Estás seguro de que quieres limpiar todo el contenido del ${chatName}?`
              : `¿Estás seguro de que quieres limpiar todos los mensajes del grupo "${chatName}"?`
            }
          </p>
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm text-red-300">
                <p className="font-semibold mb-1">Esta acción no se puede deshacer:</p>                <ul className="space-y-1 text-red-400">
                  <li>• Se eliminarán todos los mensajes</li>
                  <li>• Se perderá el historial del chat</li>
                  {!isGlobal && <li>• El grupo seguirá existiendo pero sin mensajes</li>}
                  {isGlobal && <li>• El chat quedará completamente limpio</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#3C4043] hover:bg-[#4C5055] text-[#E8E8E8] rounded-xl transition-all duration-200 font-medium button-press"
            disabled={isDeleting}
          >
            Cancelar
          </button>          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-xl transition-all duration-200 font-medium button-press flex items-center justify-center gap-2"
          >            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Limpiando...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                {isGlobal ? "Limpiar Chat" : "Limpiar Grupo"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;
