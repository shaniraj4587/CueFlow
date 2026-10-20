import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Script, calculateScriptStats } from '../types/script';
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';

interface ScriptCardProps {
  script: Script;
  colors: ThemeColors;
  labels?: {
    prompt?: string;
    edit?: string;
    copy?: string;
    words?: string;
  };
  onPress: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  colors,
  labels,
  onPress,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const stats = calculateScriptStats(script.content);

  const formattedDate = new Date(script.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        elevation.card,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open script ${script.title}`}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {script.title || 'Untitled Script'}
        </Text>
      </View>

      <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
        {script.content.trim() ? script.content.trim() : 'Empty script...'}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.pillContainer}>
          <View style={[styles.pill, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pillText, { color: colors.textSecondary }]}>
              {stats.wordCount} {labels?.words || 'words'}
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pillText, { color: colors.textSecondary }]}>
              ~{stats.estimatedDurationText}
            </Text>
          </View>
        </View>

        <Text style={[styles.dateText, { color: colors.textMuted }]}>{formattedDate}</Text>
      </View>

      <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={onPress}
          style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.primaryActionLabel}>{labels?.prompt || 'Prompt ▶'}</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            onPress={onEdit}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Edit script"
          >
            <Text style={[styles.iconBtnText, { color: colors.textPrimary }]}>
              ✎ {labels?.edit || 'Edit'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDuplicate}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Duplicate script"
          >
            <Text style={[styles.iconBtnText, { color: colors.textPrimary }]}>
              ⧉ {labels?.copy || 'Copy'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Delete script"
          >
            <Text style={[styles.iconBtnText, { color: colors.error }]}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    fontSize: 16,
    flex: 1,
  },
  preview: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  pillText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    ...typography.caption,
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  primaryActionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  primaryActionLabel: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 13,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginLeft: spacing.xs,
  },
  iconBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
});
