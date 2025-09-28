import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext, 
  ReactNode, 
  useMemo 
} from 'react';

interface TimerContextType {
  countdown: number;
  isTimerActive: boolean;
  isAlarmPlaying: boolean;
  isAudioUnlocked: boolean;
  isAlarmEnabled: boolean;
  toggleAlarmPreference: () => void;
  startCriticalTimer: (duration: number) => void;
  stopCriticalTimer: () => void;
  stopAlarm: () => void;
  unlockAudio: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [countdown, setCountdown] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false); // Tracks user permission
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
  const alarmAudio = useMemo(() => new Audio(`/alarm.mp3?t=${new Date().getTime()}`), []);

  // Effect #1: Handles the countdown logic
  useEffect(() => {
    if (isTimerActive && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setIsTimerActive(false);
    }
  }, [isTimerActive, countdown]);

  // Effect #2: Handles the alarm trigger logic
  useEffect(() => {
    if (isTimerActive && countdown === 120 && !isAlarmPlaying) {
      setIsAlarmPlaying(true);
    }
  }, [isTimerActive, countdown, isAlarmPlaying]);
  
  // Effect #3: Handles the audio playback
  useEffect(() => {
    alarmAudio.loop = true;
    if (isAlarmPlaying && isAudioUnlocked && isAlarmEnabled) {
      alarmAudio.play().catch((error: any) => console.error("Audio play failed:", error));
    } else {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
  }, [isAlarmPlaying, isAudioUnlocked, isAlarmEnabled, alarmAudio]);

  const stopCriticalTimer = () => {
    setIsTimerActive(false);
    setIsAlarmPlaying(false);
    setCountdown(0); // Reset countdown
  };

  const unlockAudio = () => {
    // This function is called by the user click.
    // It plays and immediately pauses the audio to satisfy browser policy.
    alarmAudio.play().catch(() => {});
    alarmAudio.pause();
    setIsAudioUnlocked(true);
    console.log("Audio has been enabled by user interaction.");
  };

  const toggleAlarmPreference = () => { // NEW: Function to change the setting
    setIsAlarmEnabled(prev => !prev);
  };

  const startCriticalTimer = (duration: number) => {
    if (!isTimerActive && !isAlarmPlaying) {
        setCountdown(duration);
        setIsTimerActive(true);
    }
  };

  const stopAlarm = () => {
    setIsAlarmPlaying(false);
  };

  const value = { countdown, isTimerActive, isAlarmPlaying, isAudioUnlocked, startCriticalTimer, stopAlarm, unlockAudio, toggleAlarmPreference, isAlarmEnabled, stopCriticalTimer };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};