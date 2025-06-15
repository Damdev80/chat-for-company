import React, { useEffect, useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useCall } from '../context/CallContext';

const CallModal = () => {
  const {
    currentCall,
    isInCall,
    participants,
    localStream,
    localVideoRef,
    leaveGroupCall,
    toggleMicrophone,
    toggleCamera,
    refreshParticipants,
    callError
  } = useCall();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Timer para duración de llamada
  useEffect(() => {
    let interval;
    if (isInCall && currentCall) {
      interval = setInterval(() => {
        const startTime = new Date(currentCall.started_at);
        const now = new Date();
        const duration = Math.floor((now - startTime) / 1000);
        setCallDuration(duration);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInCall, currentCall]);

  // Actualizar participantes periódicamente
  useEffect(() => {
    let interval;
    if (isInCall) {
      refreshParticipants();
      interval = setInterval(refreshParticipants, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInCall, refreshParticipants]);

  // Formatear duración
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Manejar toggle de micrófono
  const handleToggleMic = () => {
    const enabled = toggleMicrophone();
    setIsMuted(!enabled);
  };

  // Manejar toggle de cámara
  const handleToggleCamera = () => {
    const enabled = toggleCamera();
    setIsVideoOff(!enabled);
  };

  // Manejar salir de llamada
  const handleLeaveCall = async () => {
    await leaveGroupCall();
  };

  // No mostrar modal si no hay llamada activa
  if (!isInCall || !currentCall) {
    return null;
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-4 right-4 w-80' : 'inset-0'} z-50 transition-all duration-300`}>
      {/* Overlay para modal completo */}
      {!isMinimized && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      )}
      
      {/* Modal de llamada */}
      <div className={`
        ${isMinimized 
          ? 'bg-[#1E1E2E] border border-[#3C3C4E] rounded-xl shadow-2xl' 
          : 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1E1E2E] border border-[#3C3C4E] rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[80vh]'
        }
        overflow-hidden transition-all duration-300
      `}>
        
        {/* Header de la llamada */}
        <div className="bg-gradient-to-r from-[#2A2A3E] to-[#3C3C4E] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-white font-medium">
                {isMinimized ? 'En llamada' : 'Llamada Grupal'}
              </h3>
              <p className="text-[#A0A0B0] text-sm">
                {formatDuration(callDuration)} • {participants.length} participantes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-[#A0A0B0] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={isMinimized ? "Expandir" : "Minimizar"}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Contenido principal (solo si no está minimizado) */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col h-full">
            
            {/* Error si existe */}
            {callError && (
              <div className="bg-red-500/20 border border-red-500/40 p-3 mx-4 mt-4 rounded-lg">
                <p className="text-red-300 text-sm">{callError}</p>
              </div>
            )}

            {/* Área de video */}
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Video local */}
              <div className="relative bg-[#2A2A3E] rounded-xl overflow-hidden aspect-video">
                {localStream && !isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#4ADE80] rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-[#1A1A1F] font-semibold text-lg">
                          {localStorage.getItem('username')?.charAt(0)?.toUpperCase() || 'T'}
                        </span>
                      </div>
                      <p className="text-white text-sm">Tú</p>
                      {isVideoOff && <p className="text-[#A0A0B0] text-xs">Cámara desactivada</p>}
                    </div>
                  </div>
                )}
                
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                  Tú
                </div>
              </div>

              {/* Videos remotos (placeholder por ahora) */}
              <div className="relative bg-[#2A2A3E] rounded-xl overflow-hidden aspect-video">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Users size={32} className="text-[#A0A0B0] mx-auto mb-2" />
                    <p className="text-[#A0A0B0] text-sm">Esperando participantes...</p>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Participantes */}
            <div className="px-4 pb-2">
              <div className="bg-[#2A2A3E] rounded-xl p-3">
                <h4 className="text-white text-sm font-medium mb-2 flex items-center space-x-2">
                  <Users size={16} />
                  <span>Participantes ({participants.length})</span>
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.user_id} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-[#4ADE80] rounded-full flex items-center justify-center">
                        <span className="text-[#1A1A1F] text-xs font-semibold">
                          {participant.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-[#A0A0B0] text-sm">{participant.username}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        participant.status === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controles de llamada */}
        <div className="bg-[#2A2A3E] p-4">
          <div className="flex items-center justify-center space-x-4">
            
            {/* Toggle micrófono */}
            <button
              onClick={handleToggleMic}
              className={`p-3 rounded-full transition-all duration-200 ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#3C3C4E] hover:bg-[#4C4C5E] text-white'
              }`}
              title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Toggle cámara */}
            <button
              onClick={handleToggleCamera}
              className={`p-3 rounded-full transition-all duration-200 ${
                isVideoOff
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#3C3C4E] hover:bg-[#4C4C5E] text-white'
              }`}
              title={isVideoOff ? "Activar cámara" : "Desactivar cámara"}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            {/* Colgar llamada */}
            <button
              onClick={handleLeaveCall}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 hover:scale-105"
              title="Colgar llamada"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
