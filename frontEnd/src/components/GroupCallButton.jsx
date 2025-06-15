import React, { useState } from 'react';
import { Phone, Video, PhoneOff, Users } from 'lucide-react';

const GroupCallButton = ({ 
  groupId, 
  onCallInitiated, 
  isCallActive = false, 
  onEndCall,
  className = '' 
}) => {      const [isInitiating, setIsInitiating] = useState(false);
  const [currentCallType, setCurrentCallType] = useState(null);

  const handleInitiateCall = async (type) => {
    if (isCallActive) return;
    
    setIsInitiating(true);
    setCurrentCallType(type);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/calls/group/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          group_id: groupId,
          call_type: type,
          participants: [] // Se pueden agregar participantes específicos aquí
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar llamada');
      }

      const data = await response.json();
      console.log('📞 Llamada grupal iniciada:', data);
      
      if (onCallInitiated) {
        onCallInitiated(data.call);
      }
      
    } catch (error) {
      console.error('❌ Error al iniciar llamada:', error);
      alert(error.message);    } finally {
      setIsInitiating(false);
      setCurrentCallType(null);
    }
  };

  const handleEndCall = () => {
    if (onEndCall) {
      onEndCall();
    }
  };

  if (isCallActive) {
    return (
      <button
        onClick={handleEndCall}
        className={`flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${className}`}
        title="Finalizar llamada"
      >
        <PhoneOff size={16} />
        <span>Finalizar</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botón de llamada de audio */}
      <button
        onClick={() => handleInitiateCall('audio')}
        disabled={isInitiating}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
        title="Iniciar llamada de audio grupal"
      >
        <Phone size={16} />
        <Users size={14} />        {isInitiating && currentCallType === 'audio' ? (
          <span>Iniciando...</span>
        ) : (
          <span>Audio</span>
        )}
      </button>

      {/* Botón de videollamada */}
      <button
        onClick={() => handleInitiateCall('video')}
        disabled={isInitiating}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        title="Iniciar videollamada grupal"
      >
        <Video size={16} />
        <Users size={14} />        {isInitiating && currentCallType === 'video' ? (
          <span>Iniciando...</span>
        ) : (
          <span>Video</span>
        )}
      </button>
    </div>
  );
};

export default GroupCallButton;
