import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initiateGroupCall, joinCall, leaveCall, getCallParticipants, endCall } from '../utils/api';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const [currentCall, setCurrentCall] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [callError, setCallError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
    // Referencias para WebRTC
  const peerConnections = useRef(new Map());
  const localVideoRef = useRef(null);

  // Configuración de WebRTC (será usada más adelante para WebRTC)
  // eslint-disable-next-line no-unused-vars
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Limpiar recursos al desmontar
  useEffect(() => {
    const currentPeerConnections = peerConnections.current;
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      currentPeerConnections.forEach(pc => pc.close());
    };
  }, [localStream]);  // Iniciar una nueva llamada grupal
  const startGroupCall = async (groupId) => {
    try {
      setIsConnecting(true);
      setCallError(null);

      const token = localStorage.getItem('token');
      const response = await initiateGroupCall(groupId, 'audio', [], token);
      
      if (response.success) {
        setCurrentCall(response.data);
        setIsInCall(true);
        
        // Obtener acceso a cámara y micrófono
        await getMediaAccess();
        
        console.log('📞 Llamada grupal iniciada:', response.data);
        return true;
      } else if (response.hasActiveCall) {
        // Hay una llamada activa, preguntar al usuario qué hacer
        const userChoice = window.confirm(
          `Ya hay una llamada activa en este grupo. ¿Deseas unirte a la llamada existente?`
        );
        
        if (userChoice) {
          // Unirse a la llamada existente
          return await joinGroupCall(response.activeCall.id);
        } else {
          // El usuario no quiere unirse
          setCallError('Llamada cancelada por el usuario');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Error al iniciar llamada:', error);
      setCallError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Unirse a una llamada existente
  const joinGroupCall = async (callId) => {
    try {
      setIsConnecting(true);
      setCallError(null);

      const token = localStorage.getItem('token');
      const response = await joinCall(callId, token);
      
      if (response.success) {
        setCurrentCall(response.data);
        setIsInCall(true);
        
        // Obtener acceso a cámara y micrófono
        await getMediaAccess();
        
        console.log('📞 Se unió a la llamada:', response.data);
        return true;
      }
    } catch (error) {
      console.error('❌ Error al unirse a la llamada:', error);
      setCallError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Salir de la llamada
  const leaveGroupCall = async () => {
    try {
      if (currentCall) {
        const token = localStorage.getItem('token');
        await leaveCall(currentCall.id, token);
      }
      
      // Limpiar recursos locales
      cleanupCall();
      
      console.log('📞 Salió de la llamada');
    } catch (error) {
      console.error('❌ Error al salir de la llamada:', error);
      // Limpiar de todas formas
      cleanupCall();
    }
  };

  // Obtener acceso a media (cámara y micrófono)
  const getMediaAccess = async (videoEnabled = true, audioEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('❌ Error al acceder a media:', error);
      setCallError('No se pudo acceder a la cámara o micrófono');
      throw error;
    }
  };

  // Alternar micrófono
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  };

  // Alternar cámara
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  };

  // Limpiar recursos de la llamada
  const cleanupCall = () => {
    // Detener stream local
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Cerrar conexiones peer
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    // Limpiar streams remotos
    remoteStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    setRemoteStreams(new Map());

    // Reset estado
    setCurrentCall(null);
    setIsInCall(false);
    setParticipants([]);
    setCallError(null);
    setIsConnecting(false);
  };

  // Obtener participantes de la llamada
  const refreshParticipants = async () => {
    if (currentCall) {
      try {
        const token = localStorage.getItem('token');
        const response = await getCallParticipants(currentCall.id, token);
        
        if (response.success) {
          setParticipants(response.data);
        }
      } catch (error) {
        console.error('❌ Error al obtener participantes:', error);
      }
    }
  };

  const value = {
    // Estado
    currentCall,
    isInCall,
    participants,
    localStream,
    remoteStreams,
    callError,
    isConnecting,
    localVideoRef,

    // Funciones
    startGroupCall,
    joinGroupCall,
    leaveGroupCall,
    getMediaAccess,
    toggleMicrophone,
    toggleCamera,
    refreshParticipants,
    cleanupCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>  );
};

// Hook personalizado para usar el contexto
export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext debe ser usado dentro de un CallProvider');
  }
  return context;
};

export default CallContext;
