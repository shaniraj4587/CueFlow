import { VoiceFollowService } from '../src/services/VoiceFollowService';

describe('VoiceFollowService', () => {
  it('tokenizes and normalizes text properly', () => {
    const raw = 'Hello, Ladies & Gentlemen! Welcome to PMPTR teleprompter.';
    const tokens = VoiceFollowService.tokenize(raw);

    expect(tokens).toEqual([
      'hello',
      'ladies',
      'gentlemen',
      'welcome',
      'to',
      'pmptr',
      'teleprompter',
    ]);
  });

  it('computes correct Levenshtein distance', () => {
    expect(VoiceFollowService.levenshteinDistance('speaking', 'speaking')).toBe(0);
    expect(VoiceFollowService.levenshteinDistance('speaking', 'speak')).toBe(3);
    expect(VoiceFollowService.levenshteinDistance('speech', 'spech')).toBe(1);
    expect(VoiceFollowService.levenshteinDistance('', 'test')).toBe(4);
  });

  it('finds speech progress and advances index when matching spoken words', () => {
    const script = 'welcome to the presentation today we will discuss mobile teleprompter systems';
    const scriptTokens = VoiceFollowService.tokenize(script);

    const spokenTokens = VoiceFollowService.tokenize('today we will discuss');
    const match = VoiceFollowService.findSpeechProgress(scriptTokens, spokenTokens, 0, 20);

    expect(match.confidence).toBeGreaterThan(0.5);
    expect(match.matchedWordIndex).toBeGreaterThan(4);
    expect(match.progressRatio).toBeGreaterThan(0);
  });

  it('handles empty spoken input gracefully', () => {
    const scriptTokens = ['hello', 'world'];
    const match = VoiceFollowService.findSpeechProgress(scriptTokens, [], 0);

    expect(match.matchedWordIndex).toBe(0);
    expect(match.confidence).toBe(0);
    expect(match.progressRatio).toBe(0);
  });

  it('resets tracking and supports WPM calculation', () => {
    VoiceFollowService.resetMetrics();
    const script = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen';
    const scriptTokens = VoiceFollowService.tokenize(script);

    // Initial match
    const match1 = VoiceFollowService.findSpeechProgress(scriptTokens, ['one', 'two', 'three'], 0);
    expect(match1.matchedWordIndex).toBeGreaterThanOrEqual(2);

    // Second match to test progress
    const match2 = VoiceFollowService.findSpeechProgress(scriptTokens, ['six', 'seven', 'eight'], 2);
    expect(match2.matchedWordIndex).toBeGreaterThanOrEqual(5);
  });

  it('correctly tokenizes and tracks Hindi (Devanagari) script', () => {
    const hindiScript = 'नमस्ते भाइयों और बहनों आज की प्रस्तुति में आप सभी का स्वागत है';
    const tokens = VoiceFollowService.tokenize(hindiScript);

    expect(tokens).toContain('नमस्ते');
    expect(tokens).toContain('प्रस्तुति');
    expect(tokens).toContain('स्वागत');

    const spokenHindi = VoiceFollowService.tokenize('आज की प्रस्तुति में');
    const match = VoiceFollowService.findSpeechProgress(tokens, spokenHindi, 0, 20);

    expect(match.confidence).toBeGreaterThan(0.5);
    expect(match.matchedWordIndex).toBeGreaterThanOrEqual(4);
  });
});
