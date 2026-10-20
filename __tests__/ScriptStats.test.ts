import { calculateScriptStats } from '../src/types/script';

describe('Script Stats Calculation', () => {
  it('handles empty scripts correctly', () => {
    const stats = calculateScriptStats('');
    expect(stats.wordCount).toBe(0);
    expect(stats.charCount).toBe(0);
    expect(stats.estimatedDurationSeconds).toBe(0);
    expect(stats.estimatedDurationText).toBe('0m 0s');
  });

  it('handles whitespace-only scripts correctly', () => {
    const stats = calculateScriptStats('   \n\n\t  ');
    expect(stats.wordCount).toBe(0);
    expect(stats.charCount).toBe(0);
    expect(stats.estimatedDurationSeconds).toBe(0);
  });

  it('calculates correct word count for normal sentences', () => {
    const text = 'Ladies and gentlemen, welcome to today presentation.';
    const stats = calculateScriptStats(text);
    expect(stats.wordCount).toBe(7);
    expect(stats.charCount).toBe(text.length);
  });

  it('preserves blank lines while calculating word count', () => {
    const text = 'First line.\n\n\nSecond line.\n\nThird line.';
    const stats = calculateScriptStats(text);
    expect(stats.wordCount).toBe(6);
  });

  it('calculates estimated reading duration accurately at 130 WPM', () => {
    // 260 words should be exactly 2 minutes (120 seconds)
    const words = Array(260).fill('word').join(' ');
    const stats = calculateScriptStats(words, 130);
    expect(stats.wordCount).toBe(260);
    expect(stats.estimatedDurationSeconds).toBe(120);
    expect(stats.estimatedDurationText).toBe('2m 0s');
  });
});
