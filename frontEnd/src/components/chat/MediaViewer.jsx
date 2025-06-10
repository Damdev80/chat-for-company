import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RotateCw, ZoomIn, ZoomOut, Download } from 'lucide-react';

const MediaViewer = ({ file, onClose, onDownload }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseURL = API_URL.replace('/api', '');
  const mediaUrl = `${baseURL}${file.url}`;

  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  const isAudio = file.mimetype.startsWith('audio/');

  useEffect(() => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      const updateTime = () => setCurrentTime(mediaElement.currentTime);
      const updateDuration = () => setDuration(mediaElement.duration);
      
      mediaElement.addEventListener('timeupdate', updateTime);
      mediaElement.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        mediaElement.removeEventListener('timeupdate', updateTime);
        mediaElement.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, []);

  const togglePlay = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      mediaElement.volume = newVolume;
    }
  };

  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      mediaElement.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const zoomIn = () => setImageScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setImageScale(prev => Math.max(prev - 0.25, 0.25));
  const rotateImage = () => setImageRotation(prev => (prev + 90) % 360);
  const resetImage = () => {
    setImageScale(1);
    setImageRotation(0);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header con controles */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="text-white">
          <h3 className="text-lg font-semibold truncate max-w-md">{file.originalName}</h3>
          <p className="text-sm text-gray-300">{file.mimetype} • {formatFileSize(file.size)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload(file)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Descargar"
          >
            <Download size={20} className="text-white" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="w-full h-full flex items-center justify-center">
        {isImage && (
          <div className="relative max-w-full max-h-full">
            <img
              src={mediaUrl}
              alt={file.originalName}
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-300"
              style={{
                transform: `scale(${imageScale}) rotate(${imageRotation}deg)`
              }}
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
            
            {/* Controles de imagen */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg p-2">
              <button
                onClick={zoomOut}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="Alejar"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={resetImage}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="Restablecer"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={zoomIn}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="Acercar"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={rotateImage}
                className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                title="Rotar"
              >
                <RotateCw size={16} />
              </button>
            </div>
          </div>
        )}

        {isVideo && (
          <div className="relative max-w-full max-h-full">
            <video
              ref={videoRef}
              src={mediaUrl}
              className="max-w-full max-h-[80vh] object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
            />
            
            {/* Controles de video */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleTimeChange}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <span className="text-white text-sm min-w-max">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                
                <div className="w-20">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {isAudio && (
          <div className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-md w-full">
            <audio
              ref={audioRef}
              src={mediaUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 size={40} className="text-white" />
              </div>
              <h3 className="text-white text-lg font-semibold truncate">{file.originalName}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleTimeChange}
                  className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-white text-sm mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={togglePlay}
                  className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Función helper para formatear tamaño de archivo
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default MediaViewer;
