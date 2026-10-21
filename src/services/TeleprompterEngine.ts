export interface LineInfo {
  index: number;
  text: string;
  isBlank: boolean;
}

export class TeleprompterEngine {
  /**
   * Convert user-facing speed (1 to 20) to pixels per frame (at 60fps)
   * Calibrated curve ensures clear, legible scrolling at 1X and 2X:
   * Speed 1: ~18 px/sec (0.30 px/frame) - comfortable slow reading (~130 WPM)
   * Speed 2: ~27 px/sec (0.45 px/frame) - relaxed natural speed (~190 WPM)
   * Speed 3: ~38 px/sec (0.63 px/frame) - standard speaking speed (~260 WPM)
   * Speed 5: ~61 px/sec (1.02 px/frame)
   * Speed 10: ~130 px/sec (2.17 px/frame)
   * Speed 20: ~303 px/sec (5.06 px/frame)
   */
  static speedToPixelsPerFrame(speed: number): number {
    const clamped = Math.max(1, Math.min(20, speed));
    const pxPerSec = 18 + (clamped - 1) * 8 + Math.pow(clamped - 1, 1.6) * 1.2;
    return pxPerSec / 60;
  }

  /**
   * Convert words per minute estimate based on speed and font size
   */
  static estimateWpm(speed: number, fontSize: number): number {
    const clamped = Math.max(1, Math.min(20, speed));
    const pxPerSec = 18 + (clamped - 1) * 8 + Math.pow(clamped - 1, 1.6) * 1.2;
    const estimatedLineHeight = Math.max(20, fontSize * 1.6);
    const linesPerMinute = (pxPerSec * 60) / estimatedLineHeight;
    const avgWordsPerLine = 7;
    return Math.round(linesPerMinute * avgWordsPerLine);
  }

  /**
   * Parse content lines to detect blank lines (which represent intentional pauses)
   */
  static parseLines(content: string): LineInfo[] {
    const rawLines = content.split(/\r?\n/);
    return rawLines.map((line, index) => ({
      index,
      text: line,
      isBlank: line.trim().length === 0,
    }));
  }

  /**
   * Calculate progress percentage [0, 100]
   */
  static calculateProgress(currentY: number, maxScrollY: number): number {
    if (maxScrollY <= 0) return 0;
    const pct = (currentY / maxScrollY) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  /**
   * Format seconds into MM:SS
   */
  static formatDuration(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
