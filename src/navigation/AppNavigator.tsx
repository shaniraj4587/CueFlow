import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { EditorScreen } from '../screens/EditorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TeleprompterScreen } from '../screens/TeleprompterScreen';
import { useSettings } from '../hooks/useSettings';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { settings, colors } = useSettings();

  const isDark = settings.look.themeMode === 'dark';

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="Teleprompter"
          component={TeleprompterScreen}
          options={{
            orientation:
              settings.stage.orientation === 'portrait'
                ? 'portrait'
                : settings.stage.orientation === 'landscape'
                ? 'landscape'
                : 'default',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
