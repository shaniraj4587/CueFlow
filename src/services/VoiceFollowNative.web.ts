import { DeviceEventEmitter, EmitterSubscription } from 'react-native';

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
  private static recognition: any = null;
  private static audioContext: AudioContext | null = null;
  private static audioStream: MediaStream | null = null;
  private static analyserNode: AnalyserNode | null = null;
  private static meterInterval: any = null;
  private static isListening: boolean = false;

  static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  static async checkAvailability(): Promise<boolean> {
    return this.isAvailable();
  }

  static async isOnDeviceAvailable(): Promise<boolean> {
    return false; // Web speech generally runs through browser speech engine
  }

  static async start(language: string = 'en-US', continuous: boolean = true): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[VoiceFollowNative.web] SpeechRecognition not supported in this environment');
      return false;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language || 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          DeviceEventEmitter.emit('onSpeechResults', { transcript: finalTranscript.trim() });
        } else if (interimTranscript) {
          DeviceEventEmitter.emit('onSpeechPartialResults', { partialTranscript: interimTranscript.trim() });
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return; // Ignore harmless silence timeouts
        console.warn('[VoiceFollowNative.web] SpeechRecognition error:', event.error);
        DeviceEventEmitter.emit('onSpeechError', { code: -1, message: event.error });
      };

      recognition.onend = () => {
        // If continuous and still supposed to be listening, restart automatically
        if (this.isListening) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      this.recognition = recognition;
      this.isListening = true;

      // Start audio RMS dB meter for visual mic wave indicator
      this.startAudioMeter();

      return true;
    } catch (err) {
      console.error('[VoiceFollowNative.web] start error:', err);
      throw err;
    }
  }

  private static async startAudioMeter() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      source.connect(this.analyserNode);

      const bufferLength = this.analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      this.meterInterval = setInterval(() => {
        if (!this.analyserNode || !this.isListening) return;
        this.analyserNode.getByteTimeDomainData(dataArray);

        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const norm = (dataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);
        const dB = rms > 0 ? Math.max(0, Math.min(10, Math.round(rms * 20))) : 0;
        DeviceEventEmitter.emit('onSpeechRmsChanged', { value: dB });
      }, 100);
    } catch (err) {
      // Audio meter is non-critical
    }
  }

  static async stop(): Promise<boolean> {
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }

    if (this.meterInterval) {
      clearInterval(this.meterInterval);
      this.meterInterval = null;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    return true;
  }

  static async destroy(): Promise<boolean> {
    return this.stop();
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
