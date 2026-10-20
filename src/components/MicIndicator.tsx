import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VoiceStatus } from '../hooks/useVoiceFollow';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';

interface MicIndicatorProps {
  status: VoiceStatus;
  rmsLevel: number;
  colors: ThemeColors;
  recognizedText?: string;
  isOnDevice?: boolean;
}

export const MicIndicator: React.FC<MicIndicatorProps> = ({
  status,
  rmsLevel,
  colors,
  recognizedText,
  isOnDevice,
}) => {
  if (status === 'disabled') return null;

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening for speech...';
      case 'following':
        return 'Following your voice';
      case 'requesting_permission':
        return 'Requesting mic permission...';
      case 'error':
        return 'Microphone offline';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'following':
        return colors.success;
      case 'listening':
        return colors.primary;
      case 'error':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  // Meter bar heights derived from RMS level
  const bar1 = Math.max(4, Math.round(18 * (0.4 + rmsLevel * 0.6)));
  const bar2 = Math.max(6, Math.round(24 * (0.5 + rmsLevel * 0.8)));
  const bar3 = Math.max(4, Math.round(18 * (0.3 + rmsLevel * 0.7)));

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.leftRow}>
          <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: colors.textPrimary }]}>
            {getStatusText()}
          </Text>
        </View>

        {isOnDevice && (
          <View style={[styles.onDeviceBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.onDeviceText, { color: colors.textSecondary }]}>On-device</Text>
          </View>
        )}

        <View style={styles.barsContainer}>
          <View style={[styles.bar, { height: bar1, backgroundColor: getStatusColor() }]} />
          <View style={[styles.bar, { height: bar2, backgroundColor: getStatusColor() }]} />
          <View style={[styles.bar, { height: bar3, backgroundColor: getStatusColor() }]} />
        </View>
      </View>

      {recognizedText ? (
        <Text style={[styles.recognizedText, { color: colors.textSecondary }]} numberOfLines={1}>
          "{recognizedText}"
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  onDeviceBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  onDeviceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    width: 24,
    justifyContent: 'space-between',
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  recognizedText: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
