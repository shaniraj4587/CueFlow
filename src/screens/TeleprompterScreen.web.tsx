import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useScripts } from '../hooks/useScripts';
import { useSettings } from '../hooks/useSettings';
import { useTeleprompter } from '../hooks/useTeleprompter';
import { useVoiceFollow } from '../hooks/useVoiceFollow';
import { PlaybackControls } from '../components/PlaybackControls';
import { ReadingGuideOverlay } from '../components/ReadingGuideOverlay';
import { MicIndicator } from '../components/MicIndicator';
import { KeepAwakeService } from '../services/KeepAwakeService';
import { NativeOverlayService } from '../services/NativeOverlayService';
import { ScriptStorage } from '../services/ScriptStorage';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Teleprompter'>;

export const TeleprompterScreen: React.FC<Props> = ({ route, navigation }) => {
  const { scriptId } = route.params;
  const { getScriptById } = useScripts();
  const { settings, colors, t } = useSettings();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;

  const script = getScriptById(scriptId);

  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Keep screen awake while in teleprompter
  useEffect(() => {
    if (settings.stage.keepScreenAwake) {
      KeepAwakeService.activate();
    }
    return () => {
      KeepAwakeService.deactivate();
    };
  }, [settings.stage.keepScreenAwake]);

  const handlePositionChange = useCallback(
    (pos: number) => {
      ScriptStorage.updateScrollPosition(scriptId, Math.round(pos));
    },
    [scriptId]
  );

  const {
    scrollViewRef,
    isPlaying,
    countdown,
    scrollProgress,
    speed,
    play,
    pause,
    togglePlayPause,
    restart,
    seekToPercent,
    updateSpeed,
    onVoiceTargetPosition,
    onScroll,
    onContentSizeChange,
    onLayout,
  } = useTeleprompter({
    initialPosition: script?.scrollPosition || 0,
    readingSettings: settings.reading,
    content: script?.content || '',
    voiceFollowEnabled: settings.voiceFollow.enabled,
    onPositionChange: handlePositionChange,
  });

  // Voice follow speech tracking
  const { status: voiceStatus, rmsLevel, recognizedWords, isOnDevice } = useVoiceFollow({
    content: script?.content || '',
    settings: settings.voiceFollow,
    onScrollToRatio: (ratio, wpm) => {
      onVoiceTargetPosition(ratio, wpm);
    },
  });

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && settings.stage.hideControlsOnPlay) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  }, [isPlaying, settings.stage.hideControlsOnPlay]);

  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying, resetControlsTimeout]);

  const toggleControls = () => {
    setShowControls(prev => !prev);
    if (!showControls && isPlaying) {
      resetControlsTimeout();
    }
  };

  const handleLaunchFloating = async () => {
    if (!script) return;
    pause();

    await NativeOverlayService.launch(
      script.id,
      script.title,
      script.content,
      {
        ...settings.floating,
        speed: speed,
      },
      script.scrollPosition || 0
    );
  };

  // Keyboard navigation on Windows: Space, Arrow keys, Esc, F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        updateSpeed(Math.min(20, speed + 1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        updateSpeed(Math.max(1, speed - 1));
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleLaunchFloating();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        navigation.goBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, updateSpeed, speed, script, navigation]);

  const textAlignment = settings.look.textAlign;
  const isDark = settings.look.themeMode === 'dark';
  const pageBgColor = isDark ? '#0A0E14' : '#FFFFFF';
  const pageTextColor = isDark ? '#F4F7FC' : '#141820';

  const maxReadingWidth = isTablet || isLandscape
    ? Math.min(width * (settings.look.readingWidthPercent / 100), 860)
    : '100%';

  const topBreathingHeight = isLandscape ? Math.max(60, Math.round(height * 0.16)) : 180;
  const bottomBreathingHeight = isLandscape ? Math.max(120, Math.round(height * 0.28)) : 350;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBgColor }]}>
      <StatusBar hidden={!showControls} barStyle={isDark ? 'light-content' : 'dark-content'} />

      <TouchableWithoutFeedback onPress={toggleControls}>
        <View style={styles.fullscreenContainer}>
          {/* Top Bar (Hideable) */}
          {showControls && (
            <View
              style={[
                styles.topBar,
                {
                  backgroundColor: isDark ? 'rgba(16,22,32,0.92)' : 'rgba(255,255,255,0.92)',
                  maxWidth: isTablet ? 940 : '100%',
                  alignSelf: 'center',
                  width: '100%',
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.backBtn, { backgroundColor: colors.surface }]}
                accessibilityLabel="Exit teleprompter"
              >
                <Text style={[styles.backIconText, { color: colors.textPrimary }]}>‹ Back</Text>
              </TouchableOpacity>

              <Text style={[styles.scriptTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {script?.title || 'CueFlow'}
              </Text>

              <TouchableOpacity
                onPress={handleLaunchFloating}
                style={[styles.floatBtn, { backgroundColor: '#0284C7' }]}
                accessibilityLabel="Switch to floating teleprompter overlay"
              >
                <Text style={styles.floatBtnText}>⧉ Float Window</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reading Guide Overlay */}
          <ReadingGuideOverlay
            guideType={settings.stage.readingGuide}
            positionPercent={settings.stage.readingGuidePosition}
            colors={colors}
          />

          {/* Countdown Display */}
          {countdown > 0 && (
            <View style={styles.countdownContainer} pointerEvents="none">
              <Text style={[styles.countdownText, { color: colors.primary }]}>{countdown}</Text>
            </View>
          )}

          {/* Script Text Scroll Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: settings.reading.sideMargin,
              },
            ]}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={onContentSizeChange}
            onLayout={onLayout}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Breathing Space */}
            <View style={{ height: topBreathingHeight }} />

            {/* Reading Column */}
            <View
              style={{
                maxWidth: maxReadingWidth,
                alignSelf: 'center',
                width: '100%',
              }}
            >
              <Text
                style={[
                  styles.scriptText,
                  {
                    color: pageTextColor,
                    fontSize: settings.reading.fontSize,
                    lineHeight: settings.reading.fontSize * settings.reading.lineHeightMultiplier,
                    letterSpacing: settings.reading.letterSpacing,
                    textAlign: textAlignment,
                    fontFamily: settings.look.fontFamily === 'monospace' ? 'monospace' : undefined,
                    transform: settings.look.mirrorMode ? [{ scaleX: -1 }] : undefined,
                  },
                ]}
                selectable={false}
              >
                {script?.content || ''}
              </Text>
            </View>

            {/* Bottom Breathing Space */}
            <View style={{ height: bottomBreathingHeight }} />
          </ScrollView>

          {/* Voice Follow Mic Indicator */}
          {settings.voiceFollow.enabled && (
            <View
              style={[
                styles.micIndicatorContainer,
                {
                  bottom: showControls ? (isLandscape ? 100 : 130) : 40,
                  maxWidth: isTablet ? 600 : '100%',
                  alignSelf: 'center',
                  width: '100%',
                },
              ]}
            >
              <MicIndicator
                status={voiceStatus}
                rmsLevel={rmsLevel}
                colors={colors}
                recognizedText={recognizedWords}
                isOnDevice={isOnDevice}
              />
            </View>
          )}

          {/* Bottom Playback Controls Bar (Hideable) */}
          {showControls && (
            <View
              style={[
                styles.bottomControlsContainer,
                {
                  maxWidth: isTablet || isLandscape ? 740 : '100%',
                  alignSelf: 'center',
                  width: '100%',
                },
              ]}
            >
              <PlaybackControls
                isPlaying={isPlaying}
                progressPercent={scrollProgress}
                speed={speed}
                colors={colors}
                labels={{
                  play: t.play,
                  pause: t.pause,
                  float: 'Float',
                }}
                onTogglePlay={togglePlayPause}
                onRestart={restart}
                onSpeedChange={updateSpeed}
                onSeek={seekToPercent}
                onLaunchFloating={handleLaunchFloating}
              />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fullscreenContainer: {
    flex: 1,
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  backIconText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scriptTitle: {
    ...typography.h3,
    fontSize: 15,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  floatBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  floatBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scriptText: {
    fontWeight: '500',
  },
  countdownContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  countdownText: {
    fontSize: 110,
    fontWeight: '900',
    opacity: 0.85,
  },
  micIndicatorContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 20,
  },
});
