import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

const CommunitySlider = Slider as unknown as React.ComponentType<any>;
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';

interface PlaybackControlsProps {
  isPlaying: boolean;
  progressPercent: number;
  speed: number;
  colors: ThemeColors;
  labels?: {
    play?: string;
    pause?: string;
    float?: string;
  };
  onTogglePlay: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (percent: number) => void;
  onLaunchFloating?: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  progressPercent,
  speed,
  colors,
  labels,
  onTogglePlay,
  onRestart,
  onSpeedChange,
  onSeek,
  onLaunchFloating,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        elevation.modal,
      ]}
    >
      {/* Progress Slider */}
      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {Math.round(progressPercent)}%
        </Text>
        <CommunitySlider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={progressPercent}
          onValueChange={onSeek}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <TouchableOpacity
          onPress={onRestart}
          style={[styles.smallBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Restart script"
        >
          <Text style={[styles.smallBtnText, { color: colors.textPrimary }]}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Main Controls Row */}
      <View style={styles.controlsRow}>
        {/* Speed Controls: [-] 5x [+] */}
        <View style={styles.speedSection}>
          <TouchableOpacity
            onPress={() => onSpeedChange(Math.max(1, speed - 1))}
            style={[styles.speedBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Decrease speed"
          >
            <Text style={[styles.speedBtnText, { color: colors.textPrimary }]}>–</Text>
          </TouchableOpacity>

          <View style={styles.speedBadge}>
            <Text style={[styles.speedText, { color: colors.primary }]}>{speed}x</Text>
          </View>

          <TouchableOpacity
            onPress={() => onSpeedChange(Math.min(20, speed + 1))}
            style={[styles.speedBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Increase speed"
          >
            <Text style={[styles.speedBtnText, { color: colors.textPrimary }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Big Play/Pause Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onTogglePlay}
          style={[
            styles.playBtn,
            { backgroundColor: isPlaying ? colors.success : colors.primary },
          ]}
          accessibilityLabel={isPlaying ? 'Pause reading' : 'Start reading'}
          accessibilityRole="button"
        >
          <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
          <Text style={styles.playLabel}>
            {isPlaying ? (labels?.pause || 'PAUSE') : (labels?.play || 'PLAY')}
          </Text>
        </TouchableOpacity>

        {/* Floating Window Action (if provided) */}
        {onLaunchFloating && (
          <TouchableOpacity
            onPress={onLaunchFloating}
            style={[styles.floatingActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Launch floating overlay"
          >
            <Text style={[styles.floatingIconText, { color: colors.primary }]}>⧉</Text>
            <Text style={[styles.floatingLabel, { color: colors.textPrimary }]}>
              {labels?.float || 'Float'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.caption,
    fontWeight: '700',
    width: 36,
  },
  slider: {
    flex: 1,
    height: 30,
    marginHorizontal: spacing.xs,
  },
  smallBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speedSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBtnText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2,
  },
  speedBadge: {
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    minWidth: 40,
  },
  speedText: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: borderRadius.round,
    minWidth: 130,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: spacing.xs,
  },
  playLabel: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  floatingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  floatingIconText: {
    fontSize: 15,
    marginRight: 4,
    fontWeight: '700',
  },
  floatingLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
});
