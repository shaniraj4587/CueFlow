export interface PermissionStatus {
  granted: boolean;
  canAskAgain?: boolean;
}

export class PermissionService {
  /**
   * Check if microphone permission is granted on Windows/Web
   */
  static async checkMicrophonePermission(): Promise<boolean> {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return result.state === 'granted';
      }
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Request microphone permission with custom rationale
   */
  static async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
      return true;
    } catch (err) {
      console.warn('[PermissionService.web] microphone permission error:', err);
      return false;
    }
  }

  /**
   * Floating overlay on Windows desktop apps does not require special OS permissions
   */
  static async checkOverlayPermission(): Promise<boolean> {
    return true;
  }

  /**
   * Request floating overlay permission
   */
  static async requestOverlayPermission(): Promise<void> {
    // No-op on Windows
    return;
  }
}
