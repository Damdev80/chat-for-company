import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Users, X } from 'lucide-react';

const GroupCallModal = ({ 
  call, 
  isVisible, 
  onClose, 
  onJoin, 
  onLeave, 
  isParticipant = false 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(call?.call_type === 'video');
  const [participants, setParticipants] = useState(call?.participants || []);

  useEffect(() => {
    if (call?.participants) {
      setParticipants(call.participants);
    }
  }, [call]);

  const handleJoinCall = () => {
    if (onJoin) {
      onJoin(call.id);
    }
  };

  const handleLeaveCall = () => {
    if (onLeave) {
      onLeave(call.id);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Aquí se implementaría la lógica de WebRTC para mutear/desmutear
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Aquí se implementaría la lógica de WebRTC para habilitar/deshabilitar video
  };

  if (!isVisible || !call) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {call.call_type === 'video' ? (
              <Video className="text-blue-400" size={20} />
            ) : (
              <Phone className="text-green-400" size={20} />
            )}
            <h3 className="text-white font-semibold">
              {call.call_type === 'video' ? 'Videollamada' : 'Llamada'} Grupal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            call.status === 'active' 
              ? 'bg-green-600/20 text-green-400' 
              : 'bg-yellow-600/20 text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              call.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
            {call.status === 'active' ? 'En llamada' : 'Timbrando...'}
          </div>
        </div>

        {/* Participants */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-gray-400 text-sm">
              Participantes ({participants.length})
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {participants.map((participant, index) => (
              <div
                key={participant.user_id || index}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  {participant.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="text-white">
                  {participant.userName || 'Usuario'}
                </span>
                <span className="text-gray-400 text-xs">
                  ({participant.status || 'conectado'})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        {isParticipant ? (
          <div className="space-y-4">
            {/* Call Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors ${
                  isMuted 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
              >
                {isMuted ? (
                  <MicOff className="text-white" size={20} />
                ) : (
                  <Mic className="text-white" size={20} />
                )}
              </button>

              {call.call_type === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    !isVideoEnabled 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  title={isVideoEnabled ? 'Desactivar video' : 'Activar video'}
                >
                  {isVideoEnabled ? (
                    <Video className="text-white" size={20} />
                  ) : (
                    <VideoOff className="text-white" size={20} />
                  )}
                </button>
              )}

              <button
                onClick={handleLeaveCall}
                className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                title="Abandonar llamada"
              >
                <PhoneOff className="text-white" size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleJoinCall}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Unirse a la llamada
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupCallModal;
