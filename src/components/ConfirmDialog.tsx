import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  colors: ThemeColors;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  colors,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlayBg }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialog,
                { backgroundColor: colors.card, borderColor: colors.border },
                elevation.modal,
              ]}
            >
              <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={[styles.btn, styles.cancelBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.btnText, { color: colors.textPrimary }]}>{cancelLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={[
                    styles.btn,
                    styles.confirmBtn,
                    { backgroundColor: isDestructive ? colors.error : colors.primary },
                  ]}
                >
                  <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{confirmLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  confirmBtn: {},
  btnText: {
    ...typography.button,
    fontSize: 14,
  },
});
