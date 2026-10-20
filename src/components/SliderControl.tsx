import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

const CommunitySlider = Slider as unknown as React.ComponentType<any>;
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  colors: ThemeColors;
  onChange: (value: number) => void;
  displayValueTransformer?: (val: number) => string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  colors,
  onChange,
  displayValueTransformer,
}) => {
  const formattedValue = displayValueTransformer
    ? displayValueTransformer(value)
    : `${Number.isInteger(value) ? value : value.toFixed(1)}${unit ? ' ' + unit : ''}`;

  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 100) / 100);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * 100) / 100);
    onChange(next);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{formattedValue}</Text>
        </View>
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity
          onPress={handleDecrement}
          style={[styles.stepBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Decrease ${label}`}
          accessibilityRole="button"
        >
          <Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>–</Text>
        </TouchableOpacity>

        <View style={styles.sliderWrapper}>
          <CommunitySlider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={value}
            onValueChange={onChange}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          style={[styles.stepBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Increase ${label}`}
          accessibilityRole="button"
        >
          <Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: -2,
  },
  sliderWrapper: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
