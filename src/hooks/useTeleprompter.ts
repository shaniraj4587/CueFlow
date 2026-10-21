import { useState, useRef, useCallback, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { TeleprompterEngine } from '../services/TeleprompterEngine';
import { ReadingSettings } from '../types/settings';

interface UseTeleprompterProps {
  initialPosition?: number;
  readingSettings: ReadingSettings;
  content: string;
  voiceFollowEnabled?: boolean;
  onPositionChange?: (pos: number) => void;
  onFinished?: () => void;
}

export function useTeleprompter({
  initialPosition = 0,
  readingSettings,
  content,
  voiceFollowEnabled = false,
  onPositionChange,
  onFinished,
}: UseTeleprompterProps) {
  const scrollViewRef = useRef<ScrollView | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(readingSettings.speed);

  // Measure dimensions
  const contentHeightRef = useRef<number>(0);
  const containerHeightRef = useRef<number>(0);
  const currentPosRef = useRef<number>(initialPosition);
  const scrollProgressPercentRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const speedRef = useRef<number>(readingSettings.speed);
  const animFrameIdRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedForBlankLineRef = useRef<boolean>(false);

  // Voice Follow Dynamic Tracking State
  const isVoiceModeRef = useRef<boolean>(voiceFollowEnabled);
  const voiceTargetPosRef = useRef<number>(initialPosition);
  const voiceVelocityRef = useRef<number>(0);
  const lastVoiceSpokenTimeRef = useRef<number>(0);
  const speakingWpmRef = useRef<number>(140);

  useEffect(() => {
    isVoiceModeRef.current = voiceFollowEnabled;
  }, [voiceFollowEnabled]);

  // Keep speed updated
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const maxScrollY = Math.max(0, contentHeightRef.current - containerHeightRef.current);

  const stopAnimation = useCallback(() => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (pauseTimeoutRef.current !== null) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  }, []);

  const runScrollLoop = useCallback(() => {
    if (!isPlayingRef.current || isPausedForBlankLineRef.current) return;

    const maxScroll = Math.max(0, contentHeightRef.current - containerHeightRef.current);
    if (maxScroll <= 0) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    // ── Voice Follow Dynamic Scrolling Mode ──
    if (isVoiceModeRef.current) {
      const now = Date.now();
      const silenceMs = now - lastVoiceSpokenTimeRef.current;

      // Active speech within 1.8 seconds
      if (lastVoiceSpokenTimeRef.current > 0 && silenceMs <= 1800) {
        // Dynamic velocity based on measured speaking speed (WPM)
        // Standard speech: 130-170 WPM. Convert WPM into speed multiplier
        const wpmRatio = Math.max(0.65, Math.min(2.2, speakingWpmRef.current / 135));
        const dynamicSpeed = Math.max(1, Math.min(18, speedRef.current * wpmRatio));
        const targetPixelsPerFrame = TeleprompterEngine.speedToPixelsPerFrame(dynamicSpeed);

        // Smoothly accelerate / decelerate velocity toward target speed
        voiceVelocityRef.current += (targetPixelsPerFrame - voiceVelocityRef.current) * 0.12;

        // Proportional guidance toward current spoken target word (gentle, no jarring jumps)
        const distanceToTarget = voiceTargetPosRef.current - currentPosRef.current;
        const catchUpNudge = Math.max(-1.8, Math.min(2.5, distanceToTarget * 0.035));

        const delta = Math.max(0, voiceVelocityRef.current + catchUpNudge);
        const nextPos = Math.min(maxScroll, currentPosRef.current + delta);

        currentPosRef.current = nextPos;
        scrollViewRef.current?.scrollTo({ y: nextPos, animated: false });

        const pct = TeleprompterEngine.calculateProgress(nextPos, maxScroll);
        scrollProgressPercentRef.current = pct;
        setScrollProgress(pct);
        onPositionChange?.(nextPos);
      } else {
        // Paused speaking / silence: smoothly glide to a gentle stop
        if (voiceVelocityRef.current > 0.05) {
          voiceVelocityRef.current *= 0.86;
          const nextPos = Math.min(maxScroll, currentPosRef.current + voiceVelocityRef.current);
          currentPosRef.current = nextPos;
          scrollViewRef.current?.scrollTo({ y: nextPos, animated: false });

          const pct = TeleprompterEngine.calculateProgress(nextPos, maxScroll);
          scrollProgressPercentRef.current = pct;
          setScrollProgress(pct);
          onPositionChange?.(nextPos);
        }
      }

      // Reached bottom
      if (currentPosRef.current >= maxScroll && maxScroll > 0) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        stopAnimation();
        onFinished?.();
        return;
      }

      animFrameIdRef.current = requestAnimationFrame(runScrollLoop);
      return;
    }

    // ── Standard Constant-Speed Auto-Scroll Mode ──
    const delta = TeleprompterEngine.speedToPixelsPerFrame(speedRef.current);
    const nextPos = readingSettings.reverseScroll
      ? Math.max(0, currentPosRef.current - delta)
      : Math.min(maxScroll, currentPosRef.current + delta);

    currentPosRef.current = nextPos;
    scrollViewRef.current?.scrollTo({ y: nextPos, animated: false });

    const pct = TeleprompterEngine.calculateProgress(nextPos, maxScroll);
    scrollProgressPercentRef.current = pct;
    setScrollProgress(pct);
    onPositionChange?.(nextPos);

    if (
      (!readingSettings.reverseScroll && nextPos >= maxScroll) ||
      (readingSettings.reverseScroll && nextPos <= 0)
    ) {
      // Reached the end
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopAnimation();
      onFinished?.();
      return;
    }

    animFrameIdRef.current = requestAnimationFrame(runScrollLoop);
  }, [onPositionChange, onFinished, readingSettings.reverseScroll, stopAnimation]);

  const startScrolling = useCallback(() => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    stopAnimation();
    animFrameIdRef.current = requestAnimationFrame(runScrollLoop);
  }, [runScrollLoop, stopAnimation]);

  const play = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    if (readingSettings.countdownSeconds > 0 && currentPosRef.current === 0) {
      setCountdown(readingSettings.countdownSeconds);
      let count = readingSettings.countdownSeconds;
      countdownTimerRef.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setCountdown(0);
          startScrolling();
        } else {
          setCountdown(count);
        }
      }, 1000);
    } else {
      setCountdown(0);
      startScrolling();
    }
  }, [readingSettings.countdownSeconds, startScrolling]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    voiceVelocityRef.current = 0;
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setCountdown(0);
    }
    stopAnimation();
  }, [stopAnimation]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const restart = useCallback(() => {
    pause();
    currentPosRef.current = 0;
    scrollProgressPercentRef.current = 0;
    voiceTargetPosRef.current = 0;
    voiceVelocityRef.current = 0;
    lastVoiceSpokenTimeRef.current = 0;
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setScrollProgress(0);
    onPositionChange?.(0);
  }, [pause, onPositionChange]);

  const seekTo = useCallback(
    (position: number) => {
      const maxScroll = Math.max(0, contentHeightRef.current - containerHeightRef.current);
      const clamped = Math.max(0, Math.min(maxScroll, position));
      currentPosRef.current = clamped;
      voiceTargetPosRef.current = clamped;
      scrollViewRef.current?.scrollTo({ y: clamped, animated: false });
      const pct = TeleprompterEngine.calculateProgress(clamped, maxScroll);
      scrollProgressPercentRef.current = pct;
      setScrollProgress(pct);
      onPositionChange?.(clamped);
    },
    [onPositionChange]
  );

  const seekToPercent = useCallback(
    (pct: number) => {
      const maxScroll = Math.max(0, contentHeightRef.current - containerHeightRef.current);
      const targetPos = (pct / 100) * maxScroll;
      seekTo(targetPos);
    },
    [seekTo]
  );

  const updateSpeed = useCallback((newSpeed: number) => {
    const clamped = Math.max(1, Math.min(20, newSpeed));
    setSpeed(clamped);
  }, []);

  /**
   * Handle Voice Follow speech progress update:
   * Smoothly aligns scroll target with speech and matches speaking speed (WPM)
   */
  const onVoiceTargetPosition = useCallback(
    (targetRatio: number, estimatedWpm?: number) => {
      const maxScroll = Math.max(0, contentHeightRef.current - containerHeightRef.current);
      const targetY = targetRatio * maxScroll;

      voiceTargetPosRef.current = targetY;
      lastVoiceSpokenTimeRef.current = Date.now();

      if (estimatedWpm && estimatedWpm >= 60 && estimatedWpm <= 280) {
        speakingWpmRef.current = estimatedWpm;
      }

      // Automatically engage scrolling loop if not already running
      if (!isPlayingRef.current) {
        setIsPlaying(true);
        isPlayingRef.current = true;
        stopAnimation();
        animFrameIdRef.current = requestAnimationFrame(runScrollLoop);
      }
    },
    [runScrollLoop, stopAnimation]
  );

  const onScroll = useCallback(
    (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      // While auto-scrolling, only let manual user swipes (> 30px offset) update position
      // to avoid native sub-pixel rounding echo from resetting the precision scroll accumulator
      if (!isPlayingRef.current || Math.abs(currentPosRef.current - y) > 30) {
        currentPosRef.current = y;
      }
      const maxScroll = Math.max(0, contentHeightRef.current - containerHeightRef.current);
      const pct = TeleprompterEngine.calculateProgress(y, maxScroll);
      scrollProgressPercentRef.current = pct;
      setScrollProgress(pct);
      onPositionChange?.(y);
    },
    [onPositionChange]
  );

  /**
   * Handle layout and content size changes (e.g. tablet screen rotation!)
   * Preserves proportional reading progress so the user stays on the exact same sentence.
   */
  const handleDimensionsUpdate = useCallback((newContentHeight: number, newContainerHeight: number) => {
    const prevMax = Math.max(0, contentHeightRef.current - containerHeightRef.current);
    contentHeightRef.current = newContentHeight;
    containerHeightRef.current = newContainerHeight;
    const newMax = Math.max(0, newContentHeight - newContainerHeight);

    // If screen was rotated or dimensions meaningfully changed
    if (newMax > 0 && prevMax > 0 && Math.abs(newMax - prevMax) > 15) {
      const targetPercent = scrollProgressPercentRef.current || 0;
      const preservedPos = Math.max(0, Math.min(newMax, (targetPercent / 100) * newMax));
      currentPosRef.current = preservedPos;
      voiceTargetPosRef.current = preservedPos;
      scrollViewRef.current?.scrollTo({ y: preservedPos, animated: false });
    } else if (newMax > 0 && currentPosRef.current > newMax) {
      // Re-clamp if current position exceeds new maximum
      currentPosRef.current = newMax;
      scrollViewRef.current?.scrollTo({ y: newMax, animated: false });
    }
  }, []);

  const onContentSizeChange = useCallback(
    (_: number, height: number) => {
      handleDimensionsUpdate(height, containerHeightRef.current);
    },
    [handleDimensionsUpdate]
  );

  const onLayout = useCallback(
    (event: any) => {
      const height = event.nativeEvent.layout.height;
      handleDimensionsUpdate(contentHeightRef.current, height);
    },
    [handleDimensionsUpdate]
  );

  useEffect(() => {
    return () => {
      stopAnimation();
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [stopAnimation]);

  return {
    scrollViewRef,
    isPlaying,
    countdown,
    scrollProgress,
    speed,
    currentPosRef,
    maxScrollY,
    play,
    pause,
    togglePlayPause,
    restart,
    seekTo,
    seekToPercent,
    updateSpeed,
    onVoiceTargetPosition,
    onScroll,
    onContentSizeChange,
    onLayout,
  };
}
