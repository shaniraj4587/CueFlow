import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  colors: ThemeColors;
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  secondaryActionLabel,
  colors,
  onAction,
  onSecondaryAction,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
        <Text style={[styles.icon, { color: colors.primary }]}>☰</Text>
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}

      {secondaryActionLabel && onSecondaryAction && (
        <TouchableOpacity
          onPress={onSecondaryAction}
          style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
        >
          <Text style={[styles.secondaryText, { color: colors.textPrimary }]}>{secondaryActionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginVertical: spacing.xl,
    borderWidth: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
  secondaryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  secondaryText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
});
