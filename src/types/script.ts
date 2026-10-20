export interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt?: number;
  scrollPosition?: number;
  customSpeed?: number;
}

export interface ScriptStats {
  wordCount: number;
  charCount: number;
  estimatedDurationSeconds: number;
  estimatedDurationText: string;
}

export function calculateScriptStats(content: string, wordsPerMinute: number = 130): ScriptStats {
  const trimmed = content.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      charCount: 0,
      estimatedDurationSeconds: 0,
      estimatedDurationText: '0m 0s',
    };
  }

  // Count words separated by whitespace
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = content.length;

  const totalMinutes = wordCount / wordsPerMinute;
  const estimatedDurationSeconds = Math.round(totalMinutes * 60);

  const minutes = Math.floor(estimatedDurationSeconds / 60);
  const seconds = estimatedDurationSeconds % 60;
  const estimatedDurationText = `${minutes}m ${seconds}s`;

  return {
    wordCount,
    charCount,
    estimatedDurationSeconds,
    estimatedDurationText,
  };
}
