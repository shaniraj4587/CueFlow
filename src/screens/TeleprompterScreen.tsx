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
  Alert,
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
import { PermissionService } from '../services/PermissionService';
import { ScriptStorage } from '../services/ScriptStorage';
import { SettingsStorage } from '../services/SettingsStorage';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Teleprompter'>;

export const TeleprompterScreen: React.FC<Props> = ({ route, navigation }) => {
  const { scriptId } = route.params;
  const { getScriptById } = useScripts();
  const { settings, colors, t, updateReading } = useSettings();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;

  const script = getScriptById(scriptId);

  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-hide controls after playback begins
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && settings.stage.hideControlsOnPlay) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
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

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      updateSpeed(newSpeed);
      updateReading({ speed: newSpeed });
    },
    [updateSpeed, updateReading]
  );

  const handleLaunchFloating = async () => {
    if (!script) return;
    pause();

    const hasPermission = await PermissionService.checkOverlayPermission();
    if (!hasPermission) {
      Alert.alert(
        'Floating Overlay Permission',
        'Android requires the "Display over other apps" permission so the floating teleprompter can appear over your video and camera applications.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => PermissionService.requestOverlayPermission() },
        ]
      );
      return;
    }

    const launched = await NativeOverlayService.launch(
      script.id,
      script.title,
      script.content,
      {
        ...settings.floating,
        speed: speed,
      },
      script.scrollPosition || 0
    );

    if (launched) {
      navigation.goBack();
    }
  };

  const textAlignment = settings.look.textAlign;
  const isDark = settings.look.themeMode === 'dark';
  const pageBgColor = isDark ? '#0A0E14' : '#FFFFFF';
  const pageTextColor = isDark ? '#F4F7FC' : '#141820';

  // Responsive reading column on tablets and landscape
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
                <Text style={[styles.backIconText, { color: colors.textPrimary }]}>‹</Text>
              </TouchableOpacity>

              <Text style={[styles.scriptTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {script?.title || 'CueFlow'}
              </Text>

              <TouchableOpacity
                onPress={handleLaunchFloating}
                style={[styles.floatBtn, { backgroundColor: colors.primary }]}
                accessibilityLabel="Switch to floating teleprompter overlay"
              >
                <Text style={styles.floatBtnText}>⧉ {t.float}</Text>
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

            {/* Reading Column: Constrained and centered on tablets */}
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
                  maxWidth: isTablet || isLandscape ? 720 : '100%',
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
                  float: t.float,
                }}
                onTogglePlay={togglePlayPause}
                onRestart={restart}
                onSpeedChange={handleSpeedChange}
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
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconText: {
    fontSize: 26,
    fontWeight: '300',
    marginTop: -2,
  },
  scriptTitle: {
    ...typography.h3,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  floatBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
  },
  floatBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 12,
  },
  countdownContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scriptText: {
    ...typography.body,
  },
  micIndicatorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9,
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
