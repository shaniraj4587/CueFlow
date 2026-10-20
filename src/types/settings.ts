export type ThemeMode = 'light' | 'dark' | 'custom';
export type ReadingGuideType = 'none' | 'line' | 'window' | 'highlight';
export type ScreenOrientationType = 'auto' | 'portrait' | 'landscape';
export type TextAlignmentType = 'left' | 'center' | 'right' | 'justify';
export type FontFamilyType = 'sans-serif' | 'monospace' | 'serif';

export interface ReadingSettings {
  speed: number; // 1 (very slow) to 20 (fast)
  fontSize: number; // 18 to 72
  lineHeightMultiplier: number; // 1.2 to 2.5
  letterSpacing: number; // -1 to 5
  sideMargin: number; // 8 to 64
  countdownSeconds: number; // 0, 3, 5, 10
  reverseScroll: boolean;
  blankLinePauseDuration: number; // 0 to 5 seconds
}

export interface LookSettings {
  themeMode: ThemeMode;
  backgroundColor: string;
  textColor: string;
  fontFamily: FontFamilyType;
  textAlign: TextAlignmentType;
  mirrorMode: boolean; // horizontally flips text for beam splitter glass
  readingWidthPercent: number; // 50 to 100
}

export interface StageSettings {
  hideControlsOnPlay: boolean;
  readingGuide: ReadingGuideType;
  readingGuidePosition: number; // 15 to 80 percent from top
  keepScreenAwake: boolean;
  orientation: ScreenOrientationType;
  showProgressBar: boolean;
  showTimer: boolean;
}

export interface VoiceFollowSettings {
  enabled: boolean;
  sensitivity: number; // 1 to 10
  language: string;
  autoResumeTimer: number; // seconds of silence before resuming
}

export interface FloatingSettings {
  width: number;
  height: number;
  opacity: number; // 0.2 to 1.0
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  speed: number;
  mirrorMode: boolean;
}

export interface AppSettings {
  appLanguage?: 'en' | 'hi';
  reading: ReadingSettings;
  look: LookSettings;
  stage: StageSettings;
  voiceFollow: VoiceFollowSettings;
  floating: FloatingSettings;
  lastActiveScriptId?: string;
  hasSeenOnboarding?: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appLanguage: 'en',
  reading: {
    speed: 5,
    fontSize: 34,
    lineHeightMultiplier: 1.6,
    letterSpacing: 0.5,
    sideMargin: 24,
    countdownSeconds: 3,
    reverseScroll: false,
    blankLinePauseDuration: 1.5,
  },
  look: {
    themeMode: 'light',
    backgroundColor: '#FFFFFF',
    textColor: '#202631',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    mirrorMode: false,
    readingWidthPercent: 90,
  },
  stage: {
    hideControlsOnPlay: true,
    readingGuide: 'window',
    readingGuidePosition: 35,
    keepScreenAwake: true,
    orientation: 'auto',
    showProgressBar: true,
    showTimer: true,
  },
  voiceFollow: {
    enabled: false,
    sensitivity: 5,
    language: 'en-US',
    autoResumeTimer: 3,
  },
  floating: {
    width: 340,
    height: 280,
    opacity: 0.88,
    backgroundColor: '#161B22',
    textColor: '#FFFFFF',
    fontSize: 22,
    speed: 5,
    mirrorMode: false,
  },
  hasSeenOnboarding: false,
};
