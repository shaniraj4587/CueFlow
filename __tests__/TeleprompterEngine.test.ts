import { TeleprompterEngine } from '../src/services/TeleprompterEngine';

describe('TeleprompterEngine', () => {
  it('converts speed levels to smooth positive pixel increments', () => {
    const speed1 = TeleprompterEngine.speedToPixelsPerFrame(1);
    const speed5 = TeleprompterEngine.speedToPixelsPerFrame(5);
    const speed10 = TeleprompterEngine.speedToPixelsPerFrame(10);
    const speed20 = TeleprompterEngine.speedToPixelsPerFrame(20);

    expect(speed1).toBeGreaterThan(0);
    expect(speed5).toBeGreaterThan(speed1);
    expect(speed10).toBeGreaterThan(speed5);
    expect(speed20).toBeGreaterThan(speed10);
  });

  it('clamps speed inputs safely between 1 and 20', () => {
    const minClamped = TeleprompterEngine.speedToPixelsPerFrame(-5);
    const speed1 = TeleprompterEngine.speedToPixelsPerFrame(1);
    expect(minClamped).toBe(speed1);

    const maxClamped = TeleprompterEngine.speedToPixelsPerFrame(999);
    const speed20 = TeleprompterEngine.speedToPixelsPerFrame(20);
    expect(maxClamped).toBe(speed20);
  });

  it('parses content lines and identifies blank lines representing intentional pauses', () => {
    const content = 'First speaking line.\n\nSecond speaking line.\n   \nThird speaking line.';
    const lines = TeleprompterEngine.parseLines(content);

    expect(lines.length).toBe(5);
    expect(lines[0].isBlank).toBe(false);
    expect(lines[1].isBlank).toBe(true);
    expect(lines[2].isBlank).toBe(false);
    expect(lines[3].isBlank).toBe(true);
    expect(lines[4].isBlank).toBe(false);
  });

  it('calculates progress percentage accurately', () => {
    expect(TeleprompterEngine.calculateProgress(0, 1000)).toBe(0);
    expect(TeleprompterEngine.calculateProgress(500, 1000)).toBe(50);
    expect(TeleprompterEngine.calculateProgress(1000, 1000)).toBe(100);
    expect(TeleprompterEngine.calculateProgress(1500, 1000)).toBe(100);
    expect(TeleprompterEngine.calculateProgress(0, 0)).toBe(0);
  });

  it('formats duration in MM:SS', () => {
    expect(TeleprompterEngine.formatDuration(0)).toBe('00:00');
    expect(TeleprompterEngine.formatDuration(65)).toBe('01:05');
    expect(TeleprompterEngine.formatDuration(360)).toBe('06:00');
  });
});
