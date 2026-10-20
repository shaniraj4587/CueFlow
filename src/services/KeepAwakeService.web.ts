export class KeepAwakeService {
  private static wakeLockSentinel: any = null;

  static async activate(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.keepAwake) {
        await (window as any).electronAPI.keepAwake(true);
      }
      if ('wakeLock' in navigator && !this.wakeLockSentinel) {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.warn('[KeepAwakeService.web] activate error:', err);
    }
  }

  static async deactivate(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.keepAwake) {
        await (window as any).electronAPI.keepAwake(false);
      }
      if (this.wakeLockSentinel) {
        await this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
      }
    } catch (err) {
      console.warn('[KeepAwakeService.web] deactivate error:', err);
    }
  }
}
