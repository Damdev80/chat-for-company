import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initiateGroupCall, joinCall, leaveCall, getCallParticipants, endCall, forceCleanupAllCalls } from '../utils/api';
import { connectSocket } from '../utils/socket';
import CallAlert from '../components/CallAlert';
import IncomingCallModal from '../components/IncomingCallModal';

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
  
  // Estados para la alerta de llamada activa
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [activeCallInfo, setActiveCallInfo] = useState(null);
  const [pendingGroupId, setPendingGroupId] = useState(null);
    // Referencias para WebRTC
  const peerConnections = useRef(new Map());
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);

  // Estados para notificaciones de llamadas entrantes
  const [incomingCallNotification, setIncomingCallNotification] = useState(null);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);

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
        
        // Obtener acceso a cámara y micrófono según el tipo de llamada
        const callType = response.data.call_type || 'audio';
        await getMediaAccess(callType === 'video', true);
        
        console.log('📞 Llamada grupal iniciada:', response.data);
        return true;
      }else if (response.hasActiveCall) {
        // Hay una llamada activa, mostrar alerta
        setActiveCallInfo(response.activeCall);
        setPendingGroupId(groupId);
        setShowCallAlert(true);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al iniciar llamada:', error);
      setCallError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  // Finalizar una llamada (solo admin)
  const endActiveCall = async () => {
    try {
      if (activeCallInfo) {
        const token = localStorage.getItem('token');
        await endCall(activeCallInfo.id, token);
        
        // Cerrar alerta y limpiar estado
        setShowCallAlert(false);
        setActiveCallInfo(null);
        
        // Intentar iniciar nueva llamada
        if (pendingGroupId) {
          setTimeout(() => {
            startGroupCall(pendingGroupId);
          }, 500);
        }
        
        console.log('📞 Llamada finalizada por admin');
      }    } catch (error) {
      console.error('❌ Error al finalizar llamada:', error);
      
      // Si la llamada ya ha finalizado o no existe, consideramos éxito
      if (error.message.includes('ya ha finalizado') || 
          error.message.includes('already ended') ||
          error.message.includes('no encontrada') ||
          error.message.includes('not found')) {
        console.log('📞 La llamada ya estaba finalizada o no existe, continuando...');
        
        // Cerrar alerta y limpiar estado como si fuera exitoso
        setShowCallAlert(false);
        setActiveCallInfo(null);
        
        // Intentar iniciar nueva llamada
        if (pendingGroupId) {
          setTimeout(() => {
            startGroupCall(pendingGroupId);
          }, 500);
        }
      } else {
        setCallError('Error al finalizar la llamada');
      }
    }
  };

  // Unirse a la llamada existente
  const handleJoinExistingCall = async () => {
    try {
      if (activeCallInfo) {
        setShowCallAlert(false);
        const success = await joinGroupCall(activeCallInfo.id);
        if (success) {
          setActiveCallInfo(null);
          setPendingGroupId(null);
        }
      }
    } catch (error) {
      console.error('❌ Error al unirse a llamada existente:', error);
      setCallError('Error al unirse a la llamada');
    }
  };

  // Cancelar la alerta
  const handleCancelAlert = () => {
    setShowCallAlert(false);
    setActiveCallInfo(null);
    setPendingGroupId(null);
    setCallError('Operación cancelada');
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
        
        // Obtener acceso a cámara y micrófono según el tipo de llamada
        const callType = response.data.call_type || 'audio';
        await getMediaAccess(callType === 'video', true);
        
        console.log('📞 Se unió a la llamada:', response.data);
        return true;
      }} catch (error) {
      console.error('❌ Error al unirse a la llamada:', error);
      
      // Si la llamada ya no es grupal o no existe, limpiar estado
      if (error.message.includes('no es una llamada grupal') || 
          error.message.includes('not found') ||
          error.message.includes('no encontrada')) {
        console.log('📞 Limpiando estado - llamada ya no válida');
        setShowCallAlert(false);
        setActiveCallInfo(null);
        setShowIncomingCallModal(false);
        setIncomingCallNotification(null);
      } else {
        setCallError(error.message);
      }
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
  // Función para limpiar estado cuando hay inconsistencias
  const forceCleanupCall = async () => {
    try {
      console.log('🧹 Forzando limpieza de estado de llamada...');
      
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'admin') {
        // Si es admin, usar la API para limpiar la base de datos
        await forceCleanupAllCalls(token);
        console.log('🧹 Limpieza de base de datos completada');
      }
      
      // Limpiar estado local
      setShowCallAlert(false);
      setActiveCallInfo(null);
      setCallError(null);
      setShowIncomingCallModal(false);
      setIncomingCallNotification(null);
      
      // Intentar iniciar nueva llamada si había una pendiente
      if (pendingGroupId) {
        setTimeout(() => {
          startGroupCall(pendingGroupId);
        }, 1000); // Esperar un poco más para que la limpieza tome efecto
      }
      
    } catch (error) {
      console.error('❌ Error en limpieza forzada:', error);
      
      // Si falla la API, al menos limpiar estado local
      setShowCallAlert(false);
      setActiveCallInfo(null);
      setCallError(null);
      setShowIncomingCallModal(false);
      setIncomingCallNotification(null);
      
      if (pendingGroupId) {
        setTimeout(() => {
          startGroupCall(pendingGroupId);
        }, 1000);
      }
    }
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
  // Manejar llamada entrante - Aceptar
  const handleAcceptIncomingCall = async () => {
    try {
      if (incomingCallNotification) {
        setShowIncomingCallModal(false);
        const success = await joinGroupCall(incomingCallNotification.callId);
        if (success) {
          setIncomingCallNotification(null);
        }
      }
    } catch (error) {
      console.error('❌ Error al aceptar llamada:', error);
      setCallError('Error al unirse a la llamada');
    }
  };

  // Manejar llamada entrante - Rechazar
  const handleDeclineIncomingCall = () => {
    console.log('📞 Llamada rechazada');
    setShowIncomingCallModal(false);
    setIncomingCallNotification(null);
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
    showCallAlert,
    activeCallInfo,
    // Estados de llamadas entrantes
    incomingCallNotification,
    showIncomingCallModal,

    // Funciones
    startGroupCall,
    joinGroupCall,
    leaveGroupCall,    getMediaAccess,
    toggleMicrophone,
    toggleCamera,
    refreshParticipants,
    cleanupCall,
    endActiveCall,
    forceCleanupCall,
    handleJoinExistingCall,
    handleCancelAlert,
    handleAcceptIncomingCall,
    handleDeclineIncomingCall
  };
  
  return (
    <CallContext.Provider value={value}>
      {children}
      
      {/* Modal de llamada activa */}
      {showCallAlert && activeCallInfo && (
        <CallAlert
          isOpen={showCallAlert}
          activeCall={activeCallInfo}
          userRole={localStorage.getItem('userRole') || ''}
          onJoinCall={handleJoinExistingCall}
          onEndCall={endActiveCall}
          onCancel={handleCancelAlert}
          onForceCleanup={forceCleanupCall}
        />
      )}
      
      {/* Modal de llamada entrante */}
      {showIncomingCallModal && incomingCallNotification && (
        <IncomingCallModal
          isOpen={showIncomingCallModal}
          callData={incomingCallNotification}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}
    </CallContext.Provider>
  );
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
