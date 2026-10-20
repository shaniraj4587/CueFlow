import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useSettings } from '../hooks/useSettings';
import { SliderControl } from '../components/SliderControl';
import { HeaderBar } from '../components/HeaderBar';
import { NativeOverlayService } from '../services/NativeOverlayService';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { SAMPLE_SCRIPT_CONTENT } from '../services/ScriptStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;
type SettingsTab = 'reading' | 'look' | 'stage' | 'voice' | 'privacy';

export const SettingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialTab = (route.params?.activeTab as SettingsTab) || 'reading';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [testOverlayStatus, setTestOverlayStatus] = useState<string | null>(null);

  const {
    settings,
    colors,
    updateReading,
    updateLook,
    updateStage,
    updateVoiceFollow,
    updateFloating,
    updateAppLanguage,
    resetSettings,
    t,
  } = useSettings();

  const handleLaunchFloatingTest = async () => {
    setTestOverlayStatus('Launching overlay...');
    const launched = await NativeOverlayService.launch(
      'sample-test',
      'Floating Teleprompter Preview',
      SAMPLE_SCRIPT_CONTENT,
      settings.floating,
      0
    );

    if (launched) {
      setTestOverlayStatus('Overlay launched! Check your screen.');
      setTimeout(() => setTestOverlayStatus(null), 3500);
    } else {
      setTestOverlayStatus('Could not launch overlay.');
      setTimeout(() => setTestOverlayStatus(null), 3000);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <HeaderBar
        title={t.settings}
        colors={colors}
        onBack={() => navigation.goBack()}
        rightAction={{
          label: t.reset,
          variant: 'secondary',
          onPress: resetSettings,
        }}
      />

      {/* Tabs Bar */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {(
            [
              { id: 'reading', label: t.tabReading },
              { id: 'look', label: t.tabLook },
              { id: 'stage', label: t.tabStage },
              { id: 'voice', label: t.tabVoice },
              { id: 'privacy', label: t.tabPrivacy },
            ] as const
          ).map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tabItem,
                activeTab === tab.id && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 3,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id
                    ? { color: colors.primary, fontWeight: '700' }
                    : { color: colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Language Selector */}
        <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: spacing.md }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t.appLanguage}</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              onPress={() => updateAppLanguage('en')}
              style={[
                styles.groupBtn,
                { borderColor: colors.border },
                (settings.appLanguage || 'en') === 'en' && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.groupBtnText,
                  (settings.appLanguage || 'en') === 'en'
                    ? { color: '#FFFFFF', fontWeight: '700' }
                    : { color: colors.textPrimary },
                ]}
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateAppLanguage('hi')}
              style={[
                styles.groupBtn,
                { borderColor: colors.border },
                settings.appLanguage === 'hi' && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.groupBtnText,
                  settings.appLanguage === 'hi'
                    ? { color: '#FFFFFF', fontWeight: '700' }
                    : { color: colors.textPrimary },
                ]}
              >
                हिंदी (Hindi)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* READING TAB */}
        {activeTab === 'reading' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t.scrollingAndPacing}</Text>

            <SliderControl
              label={t.scrollingSpeed}
              value={settings.reading.speed}
              min={1}
              max={20}
              step={1}
              unit="x"
              colors={colors}
              onChange={val => updateReading({ speed: val })}
            />

            <SliderControl
              label={t.countdownBeforePlayback}
              value={settings.reading.countdownSeconds}
              min={0}
              max={10}
              step={1}
              unit="sec"
              colors={colors}
              onChange={val => updateReading({ countdownSeconds: val })}
            />

            <SliderControl
              label={t.blankLinePauseDuration}
              value={settings.reading.blankLinePauseDuration}
              min={0}
              max={5}
              step={0.5}
              unit="sec"
              colors={colors}
              onChange={val => updateReading({ blankLinePauseDuration: val })}
            />

            <View style={[styles.switchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>{t.reverseScrolling}</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>{t.reverseScrollingSub}</Text>
              </View>
              <Switch
                value={settings.reading.reverseScroll}
                onValueChange={val => updateReading({ reverseScroll: val })}
                thumbColor={settings.reading.reverseScroll ? colors.primary : '#f4f3f4'}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
              />
            </View>

            <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginTop: spacing.lg }]}>
              {t.typographyAndMargins}
            </Text>

            <SliderControl
              label={t.textSize}
              value={settings.reading.fontSize}
              min={18}
              max={72}
              step={2}
              unit="pt"
              colors={colors}
              onChange={val => updateReading({ fontSize: val })}
            />

            <SliderControl
              label={t.lineHeight}
              value={settings.reading.lineHeightMultiplier}
              min={1.2}
              max={2.5}
              step={0.1}
              unit="x"
              colors={colors}
              onChange={val => updateReading({ lineHeightMultiplier: val })}
            />

            <SliderControl
              label={t.letterSpacing}
              value={settings.reading.letterSpacing}
              min={-1}
              max={5}
              step={0.5}
              unit="px"
              colors={colors}
              onChange={val => updateReading({ letterSpacing: val })}
            />

            <SliderControl
              label={t.sideMargins}
              value={settings.reading.sideMargin}
              min={8}
              max={64}
              step={4}
              unit="px"
              colors={colors}
              onChange={val => updateReading({ sideMargin: val })}
            />
          </View>
        )}

        {/* LOOK TAB */}
        {activeTab === 'look' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t.themeAndColor}</Text>

            <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t.themeMode}</Text>
              <View style={styles.buttonGroup}>
                {(['light', 'dark'] as const).map(mode => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => updateLook({ themeMode: mode })}
                    style={[
                      styles.groupBtn,
                      { borderColor: colors.border },
                      settings.look.themeMode === mode && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.groupBtnText,
                        settings.look.themeMode === mode
                          ? { color: '#FFFFFF', fontWeight: '700' }
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {mode === 'light' ? t.lightTheme : t.darkTheme}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.switchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>{t.mirrorMode}</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                  {t.mirrorModeSub}
                </Text>
              </View>
              <Switch
                value={settings.look.mirrorMode}
                onValueChange={val => updateLook({ mirrorMode: val })}
                thumbColor={settings.look.mirrorMode ? colors.primary : '#f4f3f4'}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
              />
            </View>

            <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginTop: spacing.lg }]}>
              {t.fontAndAlignment}
            </Text>

            <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t.fontStyle}</Text>
              <View style={styles.buttonGroup}>
                {(['sans-serif', 'monospace', 'serif'] as const).map(font => (
                  <TouchableOpacity
                    key={font}
                    onPress={() => updateLook({ fontFamily: font })}
                    style={[
                      styles.groupBtn,
                      { borderColor: colors.border },
                      settings.look.fontFamily === font && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.groupBtnText,
                        settings.look.fontFamily === font
                          ? { color: '#FFFFFF', fontWeight: '700' }
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {font === 'sans-serif' ? t.fontModern : font === 'monospace' ? t.fontMono : t.fontSerif}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t.textAlignment}</Text>
              <View style={styles.buttonGroup}>
                {(['center', 'left', 'right'] as const).map(align => (
                  <TouchableOpacity
                    key={align}
                    onPress={() => updateLook({ textAlign: align })}
                    style={[
                      styles.groupBtn,
                      { borderColor: colors.border },
                      settings.look.textAlign === align && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.groupBtnText,
                        settings.look.textAlign === align
                          ? { color: '#FFFFFF', fontWeight: '700' }
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {align === 'left' ? t.alignLeft : align === 'center' ? t.alignCenter : t.alignRight}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <SliderControl
              label={t.readingWidth}
              value={settings.look.readingWidthPercent}
              min={50}
              max={100}
              step={5}
              unit="%"
              colors={colors}
              onChange={val => updateLook({ readingWidthPercent: val })}
            />
          </View>
        )}

        {/* STAGE TAB */}
        {activeTab === 'stage' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t.fullscreenEnvironment}</Text>

            <View style={[styles.switchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>{t.keepScreenAwake}</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                  {t.keepScreenAwakeSub}
                </Text>
              </View>
              <Switch
                value={settings.stage.keepScreenAwake}
                onValueChange={val => updateStage({ keepScreenAwake: val })}
                thumbColor={settings.stage.keepScreenAwake ? colors.primary : '#f4f3f4'}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
              />
            </View>

            <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t.readingGuideStyle}</Text>
              <View style={styles.buttonGroup}>
                {(['window', 'line', 'highlight', 'none'] as const).map(guide => (
                  <TouchableOpacity
                    key={guide}
                    onPress={() => updateStage({ readingGuide: guide })}
                    style={[
                      styles.groupBtn,
                      { borderColor: colors.border },
                      settings.stage.readingGuide === guide && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.groupBtnText,
                        settings.stage.readingGuide === guide
                          ? { color: '#FFFFFF', fontWeight: '700' }
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {guide === 'window' ? t.guideWindow : guide === 'line' ? t.guideLine : guide === 'highlight' ? t.guideHighlight : t.guideNone}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <SliderControl
              label={t.readingGuidePosition}
              value={settings.stage.readingGuidePosition}
              min={15}
              max={80}
              step={5}
              unit="% from top"
              colors={colors}
              onChange={val => updateStage({ readingGuidePosition: val })}
            />

            <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginTop: spacing.lg }]}>
              {t.floatingOverlay}
            </Text>

            <SliderControl
              label="Floating Background Opacity (0% = Fully Invisible)"
              value={Math.round(settings.floating.opacity * 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
              colors={colors}
              onChange={val => updateFloating({ opacity: val / 100 })}
            />

            <SliderControl
              label={t.floatingWidth}
              value={settings.floating.width}
              min={240}
              max={800}
              step={10}
              unit="px"
              colors={colors}
              onChange={val => updateFloating({ width: val })}
            />

            <SliderControl
              label={t.floatingHeight}
              value={settings.floating.height}
              min={180}
              max={700}
              step={10}
              unit="px"
              colors={colors}
              onChange={val => updateFloating({ height: val })}
            />

            <SliderControl
              label={t.floatingTextSize}
              value={settings.floating.fontSize}
              min={14}
              max={48}
              step={2}
              unit="pt"
              colors={colors}
              onChange={val => updateFloating({ fontSize: val })}
            />

            <TouchableOpacity
              onPress={handleLaunchFloatingTest}
              style={[styles.floatingTestBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.floatingTestBtnText}>
                {testOverlayStatus || t.launchFloatingTest}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* VOICE FOLLOW TAB */}
        {activeTab === 'voice' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t.speechPacing}</Text>

            <View style={[styles.switchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>{t.enableVoiceFollow}</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                  {t.enableVoiceFollowSub}
                </Text>
              </View>
              <Switch
                value={settings.voiceFollow.enabled}
                onValueChange={val => updateVoiceFollow({ enabled: val })}
                thumbColor={settings.voiceFollow.enabled ? colors.primary : '#f4f3f4'}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
              />
            </View>

            <SliderControl
              label={t.voiceSensitivity}
              value={settings.voiceFollow.sensitivity}
              min={1}
              max={10}
              step={1}
              colors={colors}
              onChange={val => updateVoiceFollow({ sensitivity: val })}
            />

            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>{t.privacyMicPolicy}</Text>
              <Text style={[styles.infoBody, { color: colors.textSecondary }]}>
                {t.privacyMicDesc}
              </Text>
            </View>
          </View>
        )}

        {/* PRIVACY & ABOUT TAB */}
        {activeTab === 'privacy' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t.appInformation}</Text>

            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>{t.appName}</Text>
              <Text style={[styles.infoVersion, { color: colors.textSecondary }]}>{t.appVersion}</Text>
              <Text style={[styles.infoBody, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                {t.appDesc}
              </Text>
            </View>

            <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginTop: spacing.lg }]}>
              {t.ourCorePromises}
            </Text>

            <View style={[styles.promiseItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.promiseIcon, { color: colors.primary }]}>✔</Text>
              <View style={styles.promiseContent}>
                <Text style={[styles.promiseTitle, { color: colors.textPrimary }]}>{t.freeAndAdFree}</Text>
                <Text style={[styles.promiseBody, { color: colors.textSecondary }]}>
                  {t.freeAndAdFreeSub}
                </Text>
              </View>
            </View>

            <View style={[styles.promiseItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.promiseIcon, { color: colors.primary }]}>✔</Text>
              <View style={styles.promiseContent}>
                <Text style={[styles.promiseTitle, { color: colors.textPrimary }]}>{t.localStorage}</Text>
                <Text style={[styles.promiseBody, { color: colors.textSecondary }]}>
                  {t.localStorageSub}
                </Text>
              </View>
            </View>

            <View style={[styles.promiseItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.promiseIcon, { color: colors.primary }]}>✔</Text>
              <View style={styles.promiseContent}>
                <Text style={[styles.promiseTitle, { color: colors.textPrimary }]}>{t.noCameraPerm}</Text>
                <Text style={[styles.promiseBody, { color: colors.textSecondary }]}>
                  {t.noCameraPermSub}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: spacing.md,
  },
  tabItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 13,
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxWidth: 880,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeading: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchTitle: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  switchSub: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  themeCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  groupBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  groupBtnText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  floatingTestBtn: {
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  floatingTestBtnText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  infoCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  infoTitle: {
    ...typography.h3,
    fontSize: 16,
  },
  infoVersion: {
    ...typography.caption,
    marginTop: 2,
  },
  infoBody: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  promiseIcon: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  promiseContent: {
    flex: 1,
  },
  promiseTitle: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  promiseBody: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
