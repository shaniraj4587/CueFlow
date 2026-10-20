import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsStorage } from './src/services/SettingsStorage';
import { ScriptStorage } from './src/services/ScriptStorage';

export default function App(): React.JSX.Element {
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    async function initApp() {
      await ScriptStorage.initialize();
      const settings = await SettingsStorage.getSettings();
      if (!settings.hasSeenOnboarding) {
        setShowOnboarding(true);
      }
      setHasCheckedOnboarding(true);
    }
    initApp();
  }, []);

  const handleDismissOnboarding = async () => {
    await SettingsStorage.markOnboardingSeen();
    setShowOnboarding(false);
  };

  if (!hasCheckedOnboarding) {
    return <></>;
  }

  return (
    <SafeAreaProvider>
      {showOnboarding ? (
        <OnboardingScreen onDismiss={handleDismissOnboarding} />
      ) : (
        <AppNavigator />
      )}
    </SafeAreaProvider>
  );
}
