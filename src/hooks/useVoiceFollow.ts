import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceFollowNative } from '../services/VoiceFollowNative';
import { VoiceFollowService } from '../services/VoiceFollowService';
import { PermissionService } from '../services/PermissionService';
import { VoiceFollowSettings } from '../types/settings';

export type VoiceStatus = 'disabled' | 'requesting_permission' | 'listening' | 'following' | 'error';

interface UseVoiceFollowProps {
  content: string;
  settings: VoiceFollowSettings;
  onScrollToRatio?: (ratio: number, wpm?: number) => void;
}

export function useVoiceFollow({
  content,
  settings,
  onScrollToRatio,
}: UseVoiceFollowProps) {
  const [status, setStatus] = useState<VoiceStatus>(settings.enabled ? 'listening' : 'disabled');
  const [rmsLevel, setRmsLevel] = useState<number>(0);
  const [recognizedWords, setRecognizedWords] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOnDevice, setIsOnDevice] = useState<boolean>(false);

  const scriptTokensRef = useRef<string[]>([]);
  const currentWordIndexRef = useRef<number>(0);
  const isEnabledRef = useRef<boolean>(settings.enabled);

  useEffect(() => {
    isEnabledRef.current = settings.enabled;
  }, [settings.enabled]);

  // Tokenize script when content changes
  useEffect(() => {
    scriptTokensRef.current = VoiceFollowService.tokenize(content);
    currentWordIndexRef.current = 0;
  }, [content]);

  // Check if on-device recognition is supported
  useEffect(() => {
    VoiceFollowNative.isOnDeviceAvailable().then(setIsOnDevice);
  }, []);

  const handleSpeechPartial = useCallback(
    (transcript: string) => {
      setRecognizedWords(transcript);
      const spokenTokens = VoiceFollowService.tokenize(transcript);
      if (spokenTokens.length === 0) return;

      const windowSize = Math.max(10, Math.min(50, settings.sensitivity * 5));
      const match = VoiceFollowService.findSpeechProgress(
        scriptTokensRef.current,
        spokenTokens,
        currentWordIndexRef.current,
        windowSize
      );

      if (match.confidence > 0.3) {
        currentWordIndexRef.current = match.matchedWordIndex;
        setConfidence(match.confidence);
        setStatus('following');
        onScrollToRatio?.(match.progressRatio, match.estimatedWpm);
      }
    },
    [settings.sensitivity, onScrollToRatio]
  );

  const startVoiceFollow = useCallback(async () => {
    setErrorMessage(null);
    setStatus('requesting_permission');

    const hasPermission = await PermissionService.checkMicrophonePermission();
    if (!hasPermission) {
      const granted = await PermissionService.requestMicrophonePermission();
      if (!granted) {
        setStatus('error');
        setErrorMessage('Microphone permission was denied. Voice follow requires microphone access.');
        return;
      }
    }

    try {
      setStatus('listening');
      await VoiceFollowNative.start(settings.language, true);
    } catch (err: any) {
      console.warn('[useVoiceFollow] start failed:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Could not start speech recognition.');
    }
  }, [settings.language]);

  const stopVoiceFollow = useCallback(async () => {
    try {
      await VoiceFollowNative.stop();
      setStatus('disabled');
      setRmsLevel(0);
      setRecognizedWords('');
    } catch (err) {
      console.warn('[useVoiceFollow] stop failed:', err);
    }
  }, []);

  // Listen to native events
  useEffect(() => {
    const partialSub = VoiceFollowNative.onPartialResults(e => {
      if (isEnabledRef.current && e?.partialTranscript) {
        handleSpeechPartial(e.partialTranscript);
      }
    });

    const resultSub = VoiceFollowNative.onResults(e => {
      if (isEnabledRef.current && e?.transcript) {
        handleSpeechPartial(e.transcript);
      }
    });

    const rmsSub = VoiceFollowNative.onRmsChanged(e => {
      if (e?.value !== undefined) {
        // RMS dB ranges typically from -2 to 10
        const normalized = Math.max(0, Math.min(1, (e.value + 2) / 12));
        setRmsLevel(normalized);
      }
    });

    const errorSub = VoiceFollowNative.onError(e => {
      console.warn('[useVoiceFollow] speech error:', e);
      if (e?.code !== 7) { // 7 = no match, normal between utterances
        setErrorMessage(e?.message || 'Speech recognition error');
      }
    });

    return () => {
      partialSub.remove();
      resultSub.remove();
      rmsSub.remove();
      errorSub.remove();
      VoiceFollowNative.destroy();
    };
  }, [handleSpeechPartial]);

  // Sync with enabled setting
  useEffect(() => {
    if (settings.enabled) {
      startVoiceFollow();
    } else {
      stopVoiceFollow();
    }
  }, [settings.enabled, startVoiceFollow, stopVoiceFollow]);

  return {
    status,
    rmsLevel,
    recognizedWords,
    confidence,
    errorMessage,
    isOnDevice,
    startVoiceFollow,
    stopVoiceFollow,
  };
}
