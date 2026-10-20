import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ScriptStorage } from './src/services/ScriptStorage';
import { SettingsStorage } from './src/services/SettingsStorage';

export default function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    async function initApp() {
      try {
        await ScriptStorage.initialize();
        await SettingsStorage.getSettings();
      } catch (e) {
        console.error('[App.web] initialization error:', e);
      } finally {
        setIsReady(true);
      }
    }
    initApp();
  }, []);

  if (!isReady) {
    return <></>;
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
