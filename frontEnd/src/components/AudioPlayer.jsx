import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';

const AudioPlayer = ({ audioUrl, duration, fileName, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration && isFinite(duration) ? duration : 0);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;    const handleLoadedMetadata = () => {
      console.log('🎵 Audio metadata loaded:', {
        duration: audio.duration,
        src: audio.src
      });
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };    const handleCanPlay = () => {
      console.log('🎵 Audio can play, duration:', audio.duration);
      if (audio.duration && isFinite(audio.duration) && audioDuration === 0) {
        setAudioDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleDurationChange = () => {
      console.log('🎵 Duration changed:', audio.duration);
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const handleError = (e) => {
      console.error('🎵 Audio error:', e);
      console.error('🎵 Audio src:', audio.src);
      console.error('🎵 Audio error code:', audio.error?.code);
      console.error('🎵 Audio error message:', audio.error?.message);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log('🎵 Audio load started for:', audio.src);
      setIsLoading(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    // Force load if not already loading
    if (audio.readyState === 0) {
      audio.load();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [audioUrl, audioDuration]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * audioDuration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (audioDuration > 0 && isFinite(audioDuration)) ? (currentTime / audioDuration) * 100 : 0;

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName || 'audio-message.webm';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };  return (
    <div className={`bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg p-3 max-w-sm ${className}`}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
        controls={false}
      />
      
      {/* Debug info - temporal */}
      {import.meta.env.DEV && (
        <div className="text-xs text-gray-500 mb-2">
          Duration: {audioDuration}s | Loading: {isLoading ? 'Yes' : 'No'}
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 bg-[#4ADE80] hover:bg-[#4ADE80]/80 disabled:bg-[#4ADE80]/50 text-black rounded-full flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>

        {/* Progress and Time */}
        <div className="flex-1 space-y-1">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-2 bg-[#3C3C4E] rounded-full cursor-pointer relative overflow-hidden"
          >
            <div
              className="h-full bg-[#4ADE80] transition-all duration-150 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between items-center text-xs text-[#A0A0B0]">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center space-x-2">
              <Volume2 size={12} />
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadAudio}
          className="flex-shrink-0 p-2 text-[#A0A0B0] hover:text-[#4ADE80] hover:bg-[#4ADE80]/10 rounded-lg transition-colors"
          title="Descargar audio"
        >
          <Download size={14} />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
