export interface LineInfo {
  index: number;
  text: string;
  isBlank: boolean;
}

export class TeleprompterEngine {
  /**
   * Convert user-facing speed (1 to 20) to pixels per frame (at 60fps)
   * Speed 1: ~15 px/sec (0.25 px/frame)
   * Speed 5: ~45 px/sec (0.75 px/frame)
   * Speed 10: ~90 px/sec (1.5 px/frame)
   * Speed 20: ~240 px/sec (4.0 px/frame)
   */
  static speedToPixelsPerFrame(speed: number): number {
    const clamped = Math.max(1, Math.min(20, speed));
    // Non-linear mapping provides fine control at low speeds and sufficient range at high speeds
    const pxPerSec = 10 + Math.pow(clamped, 1.8) * 1.0;
    return pxPerSec / 60;
  }

  /**
   * Convert words per minute estimate based on speed and font size
   */
  static estimateWpm(speed: number, fontSize: number): number {
    // Average line is ~40-60 characters, ~8-12 words
    // Higher speed scrolls more lines per minute
    const pxPerSec = 10 + Math.pow(speed, 1.8) * 1.0;
    const estimatedLineHeight = fontSize * 1.6;
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
