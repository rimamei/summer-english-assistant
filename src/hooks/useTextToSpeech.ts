import { useEffect, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  text: string;
  accent?: 'british' | 'american';
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTextToSpeechReturn {
  speak: () => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export const useTextToSpeech = ({
  text,
  accent = 'american',
  rate = 0.9,
  pitch = 1,
  volume = 1,
}: UseTextToSpeechOptions): UseTextToSpeechReturn => {
  const isSpeakingRef = useRef(false);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices on mount
  useEffect(() => {
    if (isSupported) {
      window.speechSynthesis.getVoices();
    }
  }, [isSupported]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const speak = useCallback(() => {
    if (!text || !isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Select voice based on accent
    const voiceLang = accent === 'british' ? 'en-GB' : 'en-US';
    const selectedVoice =
      voices.find(voice => voice.lang.startsWith(voiceLang)) ||
      voices.find(voice => voice.lang.startsWith('en'));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set speech parameters
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Track speaking state
    utterance.onstart = () => {
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  }, [text, accent, rate, pitch, volume, isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking: isSpeakingRef.current,
    isSupported,
  };
};
