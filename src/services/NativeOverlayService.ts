import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { FloatingSettings } from '../types/settings';

const { FloatingTeleprompterModule } = NativeModules;

export interface OverlayPositionEvent {
  scrollPosition: number;
  totalHeight: number;
}

export class NativeOverlayService {
  /**
   * Check if native overlay module is available
   */
  static isAvailable(): boolean {
    return !!FloatingTeleprompterModule;
  }

  /**
   * Launch the Android floating window over other apps
   */
  static async launch(
    scriptId: string,
    scriptTitle: string,
    scriptContent: string,
    settings: FloatingSettings,
    initialScrollPosition: number = 0
  ): Promise<boolean> {
    if (!FloatingTeleprompterModule || !FloatingTeleprompterModule.showOverlay) {
      console.warn('[NativeOverlayService] FloatingTeleprompterModule not available');
      return false;
    }

    try {
      return await FloatingTeleprompterModule.showOverlay({
        scriptId,
        title: scriptTitle,
        content: scriptContent,
        speed: settings.speed,
        fontSize: settings.fontSize,
        opacity: settings.opacity,
        backgroundColor: settings.backgroundColor,
        textColor: settings.textColor,
        mirrorMode: settings.mirrorMode,
        scrollPosition: initialScrollPosition,
        width: settings.width,
        height: settings.height,
      });
    } catch (err) {
      console.error('[NativeOverlayService] launch error:', err);
      return false;
    }
  }

  /**
   * Close the active floating overlay
   */
  static async close(): Promise<void> {
    if (FloatingTeleprompterModule && FloatingTeleprompterModule.hideOverlay) {
      try {
        await FloatingTeleprompterModule.hideOverlay();
      } catch (err) {
        console.warn('[NativeOverlayService] close error:', err);
      }
    }
  }

  /**
   * Check if overlay is currently visible
   */
  static async isRunning(): Promise<boolean> {
    if (FloatingTeleprompterModule && FloatingTeleprompterModule.isOverlayRunning) {
      try {
        return await FloatingTeleprompterModule.isOverlayRunning();
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  /**
   * Listen for scroll position updates sent from floating overlay back to app
   */
  static addScrollListener(callback: (event: OverlayPositionEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onFloatingOverlayScroll', callback);
  }

  /**
   * Listen for when floating overlay is closed
   */
  static addCloseListener(callback: () => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onFloatingOverlayClosed', callback);
  }
}
