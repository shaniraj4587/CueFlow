import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { FloatingSettings } from '../types/settings';

export interface OverlayPositionEvent {
  scrollPosition: number;
  totalHeight: number;
}

export class NativeOverlayService {
  private static running: boolean = false;

  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).electronAPI?.launchOverlay;
  }

  static async launch(
    scriptId: string,
    scriptTitle: string,
    scriptContent: string,
    settings: FloatingSettings,
    initialScrollPosition: number = 0
  ): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.launchOverlay) {
      try {
        const success = await (window as any).electronAPI.launchOverlay({
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
        if (success) {
          this.running = true;
        }
        return success;
      } catch (err) {
        console.error('[NativeOverlayService.web] launch error:', err);
        return false;
      }
    }
    return false;
  }

  static async close(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.closeOverlay) {
      try {
        await (window as any).electronAPI.closeOverlay();
      } catch (err) {
        console.warn('[NativeOverlayService.web] close error:', err);
      }
    }
    this.running = false;
    DeviceEventEmitter.emit('onFloatingOverlayClosed');
  }

  static async isRunning(): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.isOverlayRunning) {
      try {
        return await (window as any).electronAPI.isOverlayRunning();
      } catch {
        return false;
      }
    }
    return this.running;
  }

  static addScrollListener(callback: (event: OverlayPositionEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onFloatingOverlayScroll', callback);
  }

  static addCloseListener(callback: () => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onFloatingOverlayClosed', callback);
  }
}
