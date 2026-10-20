import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  ReadingSettings,
  LookSettings,
  StageSettings,
  VoiceFollowSettings,
  FloatingSettings,
} from '../types/settings';

const SETTINGS_STORAGE_KEY = '@pmptr_settings_v1';

export class SettingsStorage {
  private static cachedSettings: AppSettings | null = null;

  static async getSettings(): Promise<AppSettings> {
    if (this.cachedSettings) {
      return this.cachedSettings;
    }

    try {
      const data = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) {
        this.cachedSettings = { ...DEFAULT_APP_SETTINGS };
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
        return this.cachedSettings;
      }

      const parsed = JSON.parse(data);
      // Merge with default settings to protect against schema changes
      const result: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        ...parsed,
        reading: { ...DEFAULT_APP_SETTINGS.reading, ...(parsed.reading || {}) },
        look: { ...DEFAULT_APP_SETTINGS.look, ...(parsed.look || {}) },
        stage: { ...DEFAULT_APP_SETTINGS.stage, ...(parsed.stage || {}) },
        voiceFollow: { ...DEFAULT_APP_SETTINGS.voiceFollow, ...(parsed.voiceFollow || {}) },
        floating: { ...DEFAULT_APP_SETTINGS.floating, ...(parsed.floating || {}) },
      };
      this.cachedSettings = result;
      return result;
    } catch (err) {
      console.error('[SettingsStorage] getSettings error:', err);
      const fallback: AppSettings = { ...DEFAULT_APP_SETTINGS };
      this.cachedSettings = fallback;
      return fallback;
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    this.cachedSettings = settings;
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }

  static async updateReadingSettings(updates: Partial<ReadingSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      reading: { ...current.reading, ...updates },
    };
    await this.saveSettings(updated);
    return updated;
  }

  static async updateLookSettings(updates: Partial<LookSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      look: { ...current.look, ...updates },
    };
    await this.saveSettings(updated);
    return updated;
  }

  static async updateStageSettings(updates: Partial<StageSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      stage: { ...current.stage, ...updates },
    };
    await this.saveSettings(updated);
    return updated;
  }

  static async updateAppLanguage(lang: 'en' | 'hi'): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      appLanguage: lang,
    };
    await this.saveSettings(updated);
    return updated;
  }

  static async updateVoiceFollowSettings(updates: Partial<VoiceFollowSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      voiceFollow: { ...current.voiceFollow, ...updates },
    };
    await this.saveSettings(updated);
    return updated;
  }

  static async updateFloatingSettings(updates: Partial<FloatingSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      floating: { ...current.floating, ...updates },
    };
    await this.saveSettings(updated);
    return updated;
  }

  static async setLastActiveScriptId(id: string): Promise<void> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      lastActiveScriptId: id,
    };
    await this.saveSettings(updated);
  }

  static async markOnboardingSeen(): Promise<void> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      hasSeenOnboarding: true,
    };
    await this.saveSettings(updated);
  }

  static async resetToDefaults(): Promise<AppSettings> {
    this.cachedSettings = { ...DEFAULT_APP_SETTINGS };
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
    return this.cachedSettings;
  }
}
