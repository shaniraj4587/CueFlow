import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { SettingsStorage } from '../services/SettingsStorage';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

interface OnboardingScreenProps {
  onDismiss: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onDismiss }) => {
  const { colors } = useSettings();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to CueFlow</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          A professional, privacy-first teleprompter built for presentations, speeches, and video recording.
        </Text>

        <View style={styles.cardContainer}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardIcon, { color: colors.primary }]}>🔒</Text>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>100% Local & Private</Text>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                Your scripts never leave your device. We have no servers, no ads, no trackers, and no user accounts.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardIcon, { color: colors.primary }]}>🎤</Text>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Voice Follow Mode</Text>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                Microphone access is requested only if you turn on Voice Follow. It matches your spoken pace without recording or storing audio.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardIcon, { color: colors.primary }]}>⧉</Text>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Floating Teleprompter</Text>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                Draw over other apps to read your script while recording with your phone's camera app or attending a video conference.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardIcon, { color: colors.primary }]}>🚫</Text>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>No Camera Access Needed</Text>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                This app does not access your camera. Use your dedicated camera hardware or camera app alongside it!
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={onDismiss}
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={styles.startBtnText}>Get Started ▶</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  headerLogo: {
    width: 130,
    height: 130,
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  headerIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 34,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  cardContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  cardIcon: {
    fontSize: 22,
    marginRight: spacing.md,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    marginBottom: 2,
  },
  cardBody: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 17,
  },
  startBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  startBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
