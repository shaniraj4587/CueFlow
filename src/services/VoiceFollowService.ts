export interface VoiceMatchResult {
  matchedWordIndex: number;
  confidence: number;
  progressRatio: number;
  estimatedWpm?: number;
}

export class VoiceFollowService {
  private static lastMatchTimestamp: number = 0;
  private static lastMatchedIndex: number = 0;
  private static recentWpmSamples: number[] = [];

  /**
   * Clean and normalize a string into lower-case tokens without punctuation.
   * Supports multilingual scripts including Hindi (Devanagari letters and matras).
   */
  static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  /**
   * Reset tracking metrics (e.g. when restarting or changing scripts)
   */
  static resetMetrics() {
    this.lastMatchTimestamp = 0;
    this.lastMatchedIndex = 0;
    this.recentWpmSamples = [];
  }

  /**
   * Find the closest matching position in the script given recognized spoken words.
   * Uses multi-tier search (local window + forward lookahead) to handle natural variations,
   * skips, and pauses without losing position.
   *
   * @param scriptTokens All normalized words in the script
   * @param spokenTokens Spoken words recognized by speech recognition
   * @param currentWordIndex Current estimated word position in script
   * @param windowSize How many words ahead to search locally
   */
  static findSpeechProgress(
    scriptTokens: string[],
    spokenTokens: string[],
    currentWordIndex: number = 0,
    windowSize: number = 35
  ): VoiceMatchResult {
    if (scriptTokens.length === 0 || spokenTokens.length === 0) {
      return {
        matchedWordIndex: currentWordIndex,
        confidence: 0,
        progressRatio: scriptTokens.length > 0 ? currentWordIndex / scriptTokens.length : 0,
      };
    }

    // Use recent spoken tokens (up to the last 6 words)
    const recentSpoken = spokenTokens.slice(-6);
    if (recentSpoken.length === 0) {
      return {
        matchedWordIndex: currentWordIndex,
        confidence: 0,
        progressRatio: currentWordIndex / scriptTokens.length,
      };
    }

    // Tier 1: Local window search around currentWordIndex
    const startIdx1 = Math.max(0, currentWordIndex - 4);
    const endIdx1 = Math.min(scriptTokens.length, currentWordIndex + windowSize);

    let match1 = this.searchInWindow(scriptTokens, recentSpoken, startIdx1, endIdx1);

    // Tier 2: If local confidence is low, search further ahead (lookahead window)
    // to catch speakers who read fast or skipped a small phrase
    let finalMatch = match1;
    if (match1.confidence < 0.4 && currentWordIndex + windowSize < scriptTokens.length) {
      const startIdx2 = currentWordIndex + windowSize;
      const endIdx2 = Math.min(scriptTokens.length, currentWordIndex + windowSize * 3);
      const match2 = this.searchInWindow(scriptTokens, recentSpoken, startIdx2, endIdx2);
      if (match2.confidence >= 0.5) {
        finalMatch = match2;
      }
    }

    // Only advance if confidence meets threshold
    let finalIndex = currentWordIndex;
    if (finalMatch.confidence >= 0.35 && finalMatch.bestIndex >= currentWordIndex) {
      finalIndex = Math.min(scriptTokens.length - 1, finalMatch.bestIndex);
    }

    // Calculate dynamic speaking speed (Words Per Minute)
    const now = Date.now();
    let estimatedWpm: number | undefined = undefined;

    if (finalIndex > this.lastMatchedIndex && this.lastMatchTimestamp > 0) {
      const elapsedSeconds = (now - this.lastMatchTimestamp) / 1000;
      if (elapsedSeconds >= 0.3 && elapsedSeconds <= 5.0) {
        const wordsAdvanced = finalIndex - this.lastMatchedIndex;
        const currentSampleWpm = Math.round((wordsAdvanced / elapsedSeconds) * 60);

        // Filter outliers (60 to 280 WPM)
        if (currentSampleWpm >= 60 && currentSampleWpm <= 280) {
          this.recentWpmSamples.push(currentSampleWpm);
          if (this.recentWpmSamples.length > 5) {
            this.recentWpmSamples.shift();
          }
          const sum = this.recentWpmSamples.reduce((a, b) => a + b, 0);
          estimatedWpm = Math.round(sum / this.recentWpmSamples.length);
        }
      }
    }

    if (finalIndex > this.lastMatchedIndex) {
      this.lastMatchedIndex = finalIndex;
      this.lastMatchTimestamp = now;
    }

    return {
      matchedWordIndex: finalIndex,
      confidence: finalMatch.confidence,
      progressRatio: scriptTokens.length > 0 ? finalIndex / scriptTokens.length : 0,
      estimatedWpm,
    };
  }

  /**
   * Search within a specific window of script tokens for spoken matches
   */
  private static searchInWindow(
    scriptTokens: string[],
    recentSpoken: string[],
    startIndex: number,
    endIndex: number
  ): { bestIndex: number; confidence: number } {
    let bestScore = 0;
    let bestIndex = startIndex;

    for (let i = startIndex; i < endIndex; i++) {
      let score = 0;
      let consecutiveMatches = 0;

      for (let j = 0; j < recentSpoken.length; j++) {
        const scriptIdx = i + j;
        if (scriptIdx < scriptTokens.length) {
          const sToken = scriptTokens[scriptIdx];
          const spToken = recentSpoken[j];

          if (sToken === spToken) {
            score += 3 + consecutiveMatches;
            consecutiveMatches++;
          } else if (
            sToken.length >= 4 &&
            spToken.length >= 4 &&
            this.levenshteinDistance(sToken, spToken) <= 1
          ) {
            score += 2;
            consecutiveMatches = 0;
          } else {
            consecutiveMatches = 0;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i + recentSpoken.length;
      }
    }

    const maxPossibleScore = recentSpoken.length * 3 + (recentSpoken.length * (recentSpoken.length - 1)) / 2;
    const confidence = maxPossibleScore > 0 ? Math.min(1.0, bestScore / maxPossibleScore) : 0;

    return { bestIndex, confidence };
  }

  /**
   * Levenshtein edit distance for fuzzy word matching
   */
  static levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[b.length][a.length];
  }
}
