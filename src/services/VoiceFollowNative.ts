import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';

const { VoiceFollowModule } = NativeModules;

export interface SpeechPartialResultEvent {
  partialTranscript: string;
}

export interface SpeechResultEvent {
  transcript: string;
}

export interface SpeechRmsEvent {
  value: number; // dB
}

export interface SpeechErrorEvent {
  code: number;
  message: string;
}

export class VoiceFollowNative {
  static isAvailable(): boolean {
    return !!VoiceFollowModule;
  }

  static async checkAvailability(): Promise<boolean> {
    if (!VoiceFollowModule || !VoiceFollowModule.isAvailable) return false;
    try {
      return await VoiceFollowModule.isAvailable();
    } catch {
      return false;
    }
  }

  static async isOnDeviceAvailable(): Promise<boolean> {
    if (!VoiceFollowModule || !VoiceFollowModule.isOnDeviceAvailable) return false;
    try {
      return await VoiceFollowModule.isOnDeviceAvailable();
    } catch {
      return false;
    }
  }

  static async start(language: string = 'en-US', continuous: boolean = true): Promise<boolean> {
    if (!VoiceFollowModule || !VoiceFollowModule.startListening) {
      console.warn('[VoiceFollowNative] VoiceFollowModule not available');
      return false;
    }
    try {
      return await VoiceFollowModule.startListening({ language, continuous });
    } catch (err) {
      console.error('[VoiceFollowNative] start error:', err);
      throw err;
    }
  }

  static async stop(): Promise<boolean> {
    if (!VoiceFollowModule || !VoiceFollowModule.stopListening) return false;
    try {
      return await VoiceFollowModule.stopListening();
    } catch {
      return false;
    }
  }

  static async destroy(): Promise<boolean> {
    if (!VoiceFollowModule || !VoiceFollowModule.destroy) return false;
    try {
      return await VoiceFollowModule.destroy();
    } catch {
      return false;
    }
  }

  static onPartialResults(callback: (event: SpeechPartialResultEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onSpeechPartialResults', callback);
  }

  static onResults(callback: (event: SpeechResultEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onSpeechResults', callback);
  }

  static onRmsChanged(callback: (event: SpeechRmsEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onSpeechRmsChanged', callback);
  }

  static onError(callback: (event: SpeechErrorEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onSpeechError', callback);
  }
}
