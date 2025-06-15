import React from 'react';
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react';

const IncomingCallModal = ({ 
  isOpen, 
  callData, 
  onAccept, 
  onDecline 
}) => {
  if (!isOpen || !callData) return null;

  const isVideoCall = callData.callType === 'video';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#1E1E22] border border-[#3C4043] rounded-2xl max-w-md w-full mx-auto shadow-2xl animate-pulse">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-[#A8E6A3] rounded-full mx-auto mb-4 flex items-center justify-center">
            {isVideoCall ? (
              <Video className="w-10 h-10 text-[#1E1E22]" />
            ) : (
              <Phone className="w-10 h-10 text-[#1E1E22]" />
            )}
          </div>
          
          <h2 className="text-xl font-bold text-[#E8E8E8] mb-2">
            Llamada entrante
          </h2>
          
          <p className="text-[#B8B8B8] mb-2">
            {callData.callerName} te está llamando
          </p>
          
          <p className="text-sm text-[#A8E6A3]">
            Llamada {isVideoCall ? 'de video' : 'de audio'} grupal
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[#3C4043] flex gap-4">
          {/* Decline Button */}
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-3 py-4 px-6 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
          >
            <PhoneOff className="w-5 h-5" />
            Rechazar
          </button>

          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-3 py-4 px-6 bg-[#A8E6A3] hover:bg-[#98D693] text-[#1E1E22] font-medium rounded-xl transition-all duration-200"
          >
            {isVideoCall ? (
              <Video className="w-5 h-5" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
