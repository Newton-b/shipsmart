import { useState, useCallback } from 'react';

interface InteractiveButtonOptions {
  loadingDuration?: number;
  successDuration?: number;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
}

interface InteractiveButtonState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isPressed: boolean;
}

export const useInteractiveButton = (options: InteractiveButtonOptions = {}) => {
  const {
    loadingDuration = 1000,
    successDuration = 2000,
    hapticFeedback = true,
    soundFeedback = false
  } = options;

  const [state, setState] = useState<InteractiveButtonState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    isPressed: false
  });

  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [hapticFeedback]);

  const triggerSoundFeedback = useCallback(() => {
    if (soundFeedback) {
      // Create a subtle click sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }, [soundFeedback]);

  const handlePress = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: true }));
    triggerHapticFeedback();
    triggerSoundFeedback();
    
    setTimeout(() => {
      setState(prev => ({ ...prev, isPressed: false }));
    }, 150);
  }, [triggerHapticFeedback, triggerSoundFeedback]);

  const handleClick = useCallback(async (action: () => Promise<void> | void) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      await new Promise(resolve => setTimeout(resolve, loadingDuration));
      await action();
      
      setState(prev => ({ ...prev, isLoading: false, isSuccess: true }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, isSuccess: false }));
      }, successDuration);
      
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, isError: true }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, isError: false }));
      }, 3000);
    }
  }, [loadingDuration, successDuration]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      isPressed: false
    });
  }, []);

  return {
    ...state,
    handlePress,
    handleClick,
    reset
  };
};
