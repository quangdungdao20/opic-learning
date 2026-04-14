import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

const AudioPlayer = ({ src, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    const prevValue = isPlaying;
    setIsPlaying(!prevValue);
    if (!prevValue) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    const prevValue = isMuted;
    setIsMuted(!prevValue);
    audioRef.current.muted = !prevValue;
  };

  const restart = () => {
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      togglePlayPause();
    }
  };

  const changeProgress = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${returnedMinutes}:${returnedSeconds}`;
  };

  // Set the base URL handling for deployment (GitHub pages root vs subdirectory)
  const audioUrl = src.startsWith('/') ? import.meta.env.BASE_URL + src.substring(1) : src;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center gap-4 text-slate-800">
        <button 
          onClick={togglePlayPause}
          className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full hover:bg-blue-600 transition-transform active:scale-95 shadow-sm"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 truncate mb-1">{title}</h4>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-10 text-right">{calculateTime(currentTime)}</span>
            
            <div 
              className="flex-1 h-2 bg-slate-100 rounded-full cursor-pointer relative"
              onClick={changeProgress}
              ref={progressBarRef}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            
            <span className="text-xs text-slate-500 w-10">{duration && !isNaN(duration) ? calculateTime(duration) : '00:00'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400">
          <button onClick={restart} className="p-2 hover:bg-slate-100 rounded-full transition-colors hover:text-slate-700">
            <RotateCcw size={18} />
          </button>
          <button onClick={toggleMute} className="p-2 hover:bg-slate-100 rounded-full transition-colors hover:text-slate-700">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
