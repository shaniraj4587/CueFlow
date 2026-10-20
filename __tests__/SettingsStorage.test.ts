import { SettingsStorage } from '../src/services/SettingsStorage';
import { DEFAULT_APP_SETTINGS } from '../src/types/settings';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('SettingsStorage Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('loads default settings on initial launch', async () => {
    const settings = await SettingsStorage.getSettings();
    expect(settings.reading.speed).toBe(DEFAULT_APP_SETTINGS.reading.speed);
    expect(settings.look.themeMode).toBe('light');
    expect(settings.stage.keepScreenAwake).toBe(true);
  });

  it('persists reading settings updates', async () => {
    await SettingsStorage.updateReadingSettings({
      speed: 12,
      fontSize: 48,
      lineHeightMultiplier: 2.0,
      sideMargin: 36,
    });

    const refreshed = await SettingsStorage.getSettings();
    expect(refreshed.reading.speed).toBe(12);
    expect(refreshed.reading.fontSize).toBe(48);
    expect(refreshed.reading.lineHeightMultiplier).toBe(2.0);
    expect(refreshed.reading.sideMargin).toBe(36);
  });

  it('persists look settings and mirror mode updates', async () => {
    await SettingsStorage.updateLookSettings({
      themeMode: 'dark',
      mirrorMode: true,
      fontFamily: 'monospace',
    });

    const refreshed = await SettingsStorage.getSettings();
    expect(refreshed.look.themeMode).toBe('dark');
    expect(refreshed.look.mirrorMode).toBe(true);
    expect(refreshed.look.fontFamily).toBe('monospace');
  });

  it('persists stage and floating overlay settings', async () => {
    await SettingsStorage.updateStageSettings({
      readingGuide: 'line',
      readingGuidePosition: 50,
      keepScreenAwake: false,
    });

    await SettingsStorage.updateFloatingSettings({
      opacity: 0.6,
      fontSize: 26,
    });

    const refreshed = await SettingsStorage.getSettings();
    expect(refreshed.stage.readingGuide).toBe('line');
    expect(refreshed.stage.readingGuidePosition).toBe(50);
    expect(refreshed.stage.keepScreenAwake).toBe(false);
    expect(refreshed.floating.opacity).toBe(0.6);
    expect(refreshed.floating.fontSize).toBe(26);
  });

  it('resets settings to default values', async () => {
    await SettingsStorage.updateReadingSettings({ speed: 20 });
    const reset = await SettingsStorage.resetToDefaults();
    expect(reset.reading.speed).toBe(DEFAULT_APP_SETTINGS.reading.speed);
  });
});
