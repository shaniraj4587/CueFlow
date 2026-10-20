import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  ReadingSettings,
  LookSettings,
  StageSettings,
  VoiceFollowSettings,
  FloatingSettings,
} from '../types/settings';
import { SettingsStorage } from '../services/SettingsStorage';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';
import { translations, SupportedLanguage, TranslationSchema } from '../i18n/translations';

// Module-level state & pub/sub listeners for synchronized updates across all screens
let globalSettings: AppSettings = DEFAULT_APP_SETTINGS;
let hasLoadedGlobal = false;
type SettingsListener = (settings: AppSettings) => void;
const listeners = new Set<SettingsListener>();

function notifySettingsListeners(newSettings: AppSettings) {
  globalSettings = newSettings;
  listeners.forEach(listener => listener(newSettings));
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(globalSettings);
  const [isLoaded, setIsLoaded] = useState<boolean>(hasLoadedGlobal);

  const loadSettings = useCallback(async () => {
    try {
      const data = await SettingsStorage.getSettings();
      hasLoadedGlobal = true;
      notifySettingsListeners(data);
    } catch (err) {
      console.error('[useSettings] load error:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Subscribe to updates from any other screen
    const listener: SettingsListener = (newSettings) => {
      setSettings(newSettings);
      setIsLoaded(true);
    };
    listeners.add(listener);

    // Initial load if not loaded yet
    if (!hasLoadedGlobal) {
      loadSettings();
    }

    return () => {
      listeners.delete(listener);
    };
  }, [loadSettings]);

  const updateReading = useCallback(async (updates: Partial<ReadingSettings>) => {
    const updated = await SettingsStorage.updateReadingSettings(updates);
    notifySettingsListeners(updated);
  }, []);

  const updateLook = useCallback(async (updates: Partial<LookSettings>) => {
    const updated = await SettingsStorage.updateLookSettings(updates);
    notifySettingsListeners(updated);
  }, []);

  const updateStage = useCallback(async (updates: Partial<StageSettings>) => {
    const updated = await SettingsStorage.updateStageSettings(updates);
    notifySettingsListeners(updated);
  }, []);

  const updateVoiceFollow = useCallback(async (updates: Partial<VoiceFollowSettings>) => {
    const updated = await SettingsStorage.updateVoiceFollowSettings(updates);
    notifySettingsListeners(updated);
  }, []);

  const updateFloating = useCallback(async (updates: Partial<FloatingSettings>) => {
    const updated = await SettingsStorage.updateFloatingSettings(updates);
    notifySettingsListeners(updated);
  }, []);

  const updateAppLanguage = useCallback(async (lang: SupportedLanguage) => {
    const updated = await SettingsStorage.updateAppLanguage(lang);
    notifySettingsListeners(updated);
  }, []);

  const resetSettings = useCallback(async () => {
    const defaults = await SettingsStorage.resetToDefaults();
    notifySettingsListeners(defaults);
  }, []);

  const t: TranslationSchema = useMemo(() => {
    const lang = settings.appLanguage || 'en';
    return translations[lang] || translations.en;
  }, [settings.appLanguage]);

  const colors: ThemeColors = useMemo(() => {
    if (settings.look.themeMode === 'dark') {
      return darkColors;
    }
    if (settings.look.themeMode === 'custom') {
      return {
        ...lightColors,
        background: settings.look.backgroundColor,
        card: settings.look.backgroundColor,
        textPrimary: settings.look.textColor,
      };
    }
    return lightColors;
  }, [settings.look]);

  return {
    settings,
    isLoaded,
    colors,
    updateReading,
    updateLook,
    updateStage,
    updateVoiceFollow,
    updateFloating,
    updateAppLanguage,
    resetSettings,
    t,
  };
}
