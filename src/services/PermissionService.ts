import { PermissionsAndroid, Platform, Linking, NativeModules } from 'react-native';

const { FloatingTeleprompterModule } = NativeModules;

export interface PermissionStatus {
  granted: boolean;
  canAskAgain?: boolean;
}

export class PermissionService {
  /**
   * Check if RECORD_AUDIO permission is granted
   */
  static async checkMicrophonePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    } catch (err) {
      console.warn('[PermissionService] checkMicrophonePermission error:', err);
      return false;
    }
  }

  /**
   * Request RECORD_AUDIO permission with custom rationale
   */
  static async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission Needed',
          message:
            'The Voice Follow feature listens to your spoken words to scroll the teleprompter script automatically as you speak. No audio is recorded, stored, or sent to any server.',
          buttonPositive: 'Allow',
          buttonNegative: 'Not Now',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[PermissionService] requestMicrophonePermission error:', err);
      return false;
    }
  }

  /**
   * Check if floating overlay (SYSTEM_ALERT_WINDOW) permission is granted
   */
  static async checkOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      if (FloatingTeleprompterModule && FloatingTeleprompterModule.canDrawOverlays) {
        return await FloatingTeleprompterModule.canDrawOverlays();
      }
      return false;
    } catch (err) {
      console.warn('[PermissionService] checkOverlayPermission error:', err);
      return false;
    }
  }

  /**
   * Request floating overlay permission by opening Android Settings
   */
  static async requestOverlayPermission(): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      if (FloatingTeleprompterModule && FloatingTeleprompterModule.requestOverlayPermission) {
        await FloatingTeleprompterModule.requestOverlayPermission();
      } else {
        await Linking.openSettings();
      }
    } catch (err) {
      console.warn('[PermissionService] requestOverlayPermission error:', err);
      await Linking.openSettings();
    }
  }
}
