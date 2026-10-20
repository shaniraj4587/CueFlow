import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Script, calculateScriptStats } from '../types/script';
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';
import { NativeOverlayService } from '../services/NativeOverlayService';
import { SettingsStorage } from '../services/SettingsStorage';

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
  onFloat?: () => void;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  colors,
  labels,
  onPress,
  onEdit,
  onDuplicate,
  onDelete,
  onFloat,
}) => {
  const stats = calculateScriptStats(script.content);

  const formattedDate = new Date(script.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleLaunchOverlay = async () => {
    if (onFloat) {
      onFloat();
      return;
    }
    const settings = await SettingsStorage.getSettings();
    await NativeOverlayService.launch(
      script.id,
      script.title,
      script.content,
      settings.floating,
      script.scrollPosition || 0
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        elevation.card,
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.titleClickable}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {script.title || 'Untitled Script'}
        </Text>
      </TouchableOpacity>

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
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={onPress}
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Start Prompting"
          >
            <Text style={styles.primaryActionLabel}>{labels?.prompt || 'Prompt ▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLaunchOverlay}
            style={[styles.floatActionBtn, { backgroundColor: '#0284C7' }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Launch Floating Overlay"
          >
            <Text style={styles.floatActionLabel}>⧉ Float Window</Text>
          </TouchableOpacity>
        </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  titleClickable: {
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
  },
  preview: {
    ...typography.body2,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  pillText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '500',
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
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  primaryActionLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  floatActionBtn: {
    paddingHorizontal: spacing.sm + 6,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  floatActionLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as any,
  iconBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
