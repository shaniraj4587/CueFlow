import { NativeModules } from 'react-native';

const { KeepAwakeModule } = NativeModules;

export class KeepAwakeService {
  static async activate(): Promise<void> {
    if (KeepAwakeModule && KeepAwakeModule.activate) {
      try {
        await KeepAwakeModule.activate();
      } catch (err) {
        console.warn('[KeepAwakeService] activate error:', err);
      }
    }
  }

  static async deactivate(): Promise<void> {
    if (KeepAwakeModule && KeepAwakeModule.deactivate) {
      try {
        await KeepAwakeModule.deactivate();
      } catch (err) {
        console.warn('[KeepAwakeService] deactivate error:', err);
      }
    }
  }
}
