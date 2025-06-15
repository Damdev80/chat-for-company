import React from 'react';
import { AlertTriangle, Phone, PhoneOff, Users } from 'lucide-react';

const CallAlert = ({ 
  isOpen, 
  activeCall, 
  userRole,
  onJoinCall, 
  onEndCall,
  onCancel,
  onForceCleanup 
}) => {
  if (!isOpen) return null;

  const isAdmin = userRole === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2C2C34] border border-[#3C4043] rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-[#3C4043]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#E8E8E8]">
                Llamada Activa
              </h3>
              <p className="text-sm text-[#B8B8B8]">
                Ya hay una llamada en curso
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Call Info */}
            <div className="bg-[#1E1E22] border border-[#3C4043] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-4 h-4 text-[#A8E6A3]" />
                <span className="text-sm font-medium text-[#E8E8E8]">
                  Llamada iniciada por: {activeCall?.caller_name || 'Usuario'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#A8E6A3]" />
                <span className="text-sm text-[#B8B8B8]">
                  {activeCall?.participant_count || 0} participante(s) conectado(s)
                </span>
              </div>
            </div>

            {/* Message */}
            <p className="text-[#B8B8B8] text-sm">
              Hay una llamada grupal activa en este grupo. ¿Qué deseas hacer?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[#3C4043] space-y-3">
          {/* Join Call Button */}
          <button
            onClick={onJoinCall}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#A8E6A3] hover:bg-[#98D693] text-[#1E1E22] font-medium rounded-lg transition-all duration-200"
          >
            <Phone className="w-4 h-4" />
            Unirse a la llamada
          </button>          {/* End Call Button (Admin only) */}
          {isAdmin && (
            <>
              <button
                onClick={onEndCall}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200"
              >
                <PhoneOff className="w-4 h-4" />
                Finalizar llamada (Admin)
              </button>
              
              {/* Force Cleanup Button (if onForceCleanup is provided) */}
              {onForceCleanup && (
                <button
                  onClick={onForceCleanup}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200"
                  title="Usar si la llamada parece estar bloqueada"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Forzar limpieza (Admin)
                </button>
              )}
            </>
          )}

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-full py-3 px-4 text-[#B8B8B8] hover:text-[#E8E8E8] font-medium rounded-lg border border-[#3C4043] hover:bg-[#3C4043] transition-all duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallAlert;
