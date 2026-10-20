import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ReadingGuideType } from '../types/settings';
import { ThemeColors } from '../theme/colors';

interface ReadingGuideOverlayProps {
  guideType: ReadingGuideType;
  positionPercent: number; // e.g. 35
  colors: ThemeColors;
}

export const ReadingGuideOverlay: React.FC<ReadingGuideOverlayProps> = ({
  guideType,
  positionPercent,
  colors,
}) => {
  if (guideType === 'none') return null;

  const topPercent = `${Math.max(15, Math.min(85, positionPercent))}%`;

  return (
    <View style={styles.container} pointerEvents="none">
      {guideType === 'line' && (
        <View
          style={[
            styles.singleLine,
            {
              top: topPercent as any,
              backgroundColor: colors.primary,
            },
          ]}
        />
      )}

      {guideType === 'window' && (
        <View
          style={[
            styles.windowBox,
            {
              top: topPercent as any,
              borderColor: colors.primary,
            },
          ]}
        >
          <View style={[styles.arrowLeft, { borderRightColor: colors.primary }]} />
          <View style={[styles.arrowRight, { borderLeftColor: colors.primary }]} />
        </View>
      )}

      {guideType === 'highlight' && (
        <View
          style={[
            styles.highlightZone,
            {
              top: topPercent as any,
              backgroundColor: colors.primary,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  singleLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.65,
  },
  windowBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 70,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    opacity: 0.75,
    justifyContent: 'center',
  },
  arrowLeft: {
    position: 'absolute',
    left: 8,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  arrowRight: {
    position: 'absolute',
    right: 8,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  highlightZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    opacity: 0.12,
  },
});
