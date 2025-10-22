import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Send, X } from 'lucide-react';

const AudioRecorder = ({ onAudioReady, onCancel, isOpen }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) {
      resetRecorder();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const resetRecorder = () => {
    setIsRecording(false);
    setIsPaused(false);
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startRecording = async () => {
    try {
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        // Calculate actual duration from blob
        const tempAudio = new Audio(url);
        tempAudio.addEventListener('loadedmetadata', () => {
          const actualDuration = tempAudio.duration;
          ('🎵 [RECORDER] Actual audio duration:', actualDuration);
          setRecordingTime(actualDuration || recordingTime); // Use actual duration if available
        });
        tempAudio.load();
        
        // Stop all tracks to free the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('🎵 [RECORDER] Error starting recording:', error);
      alert('Error al acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onAudioReady(audioBlob, recordingTime);
      resetRecorder();
    }
  };

  const handleCancel = () => {
    resetRecorder();
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium flex items-center space-x-2">
          <Mic size={16} className="text-[#4ADE80]" />
          <span>Mensaje de Voz</span>
        </h4>
        <button
          onClick={handleCancel}
          className="text-[#A0A0B0] hover:text-white hover:bg-[#3C3C4E] rounded-lg p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Recording Controls */}
      {!audioBlob && (
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Mic size={20} />
              <span>Comenzar Grabación</span>
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
              </div>
              
              <div className="flex space-x-2">
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="p-2 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors"
                    title="Pausar"
                  >
                    <Pause size={20} />
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
                    title="Continuar"
                  >
                    <Play size={20} />
                  </button>
                )}
                
                <button
                  onClick={stopRecording}
                  className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                  title="Detener"
                >
                  <Square size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio Preview */}
      {audioBlob && audioUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4 bg-[#1E1E2E] rounded-lg p-4">
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              className="p-2 bg-[#4ADE80] hover:bg-[#4ADE80]/80 text-black rounded-lg transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <div className="flex-1 text-center">
              <div className="text-white text-sm">Duración: {formatTime(recordingTime)}</div>
              <div className="text-[#A0A0B0] text-xs">Haz clic en reproducir para escuchar</div>
            </div>
            
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={resetRecorder}
              className="px-4 py-2 text-[#A0A0B0] border border-[#3C3C4E] rounded-lg hover:bg-[#3C3C4E] hover:text-white transition-colors"
            >
              Grabar de Nuevo
            </button>
            <button
              onClick={handleSend}
              className="flex items-center space-x-2 px-4 py-2 bg-[#4ADE80] hover:bg-[#4ADE80]/80 text-black rounded-lg transition-colors font-medium"
            >
              <Send size={16} />
              <span>Enviar Audio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
