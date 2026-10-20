import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  colors: ThemeColors;
  onBack?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'danger';
  };
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  colors,
  onBack,
  rightAction,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.leftRow}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={[styles.backIconText, { color: colors.textPrimary }]}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={[
            styles.actionButton,
            rightAction.variant === 'primary' && { backgroundColor: colors.primary },
            rightAction.variant === 'secondary' && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
            rightAction.variant === 'danger' && { backgroundColor: colors.error },
            !rightAction.variant && { backgroundColor: colors.primary },
          ]}
          accessibilityLabel={rightAction.label}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.actionLabel,
              rightAction.variant === 'secondary'
                ? { color: colors.textPrimary }
                : { color: '#FFFFFF' },
            ]}
          >
            {rightAction.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backIconText: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
    marginTop: -2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 1,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...typography.button,
    fontSize: 14,
  },
});
