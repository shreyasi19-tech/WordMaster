import { Difficulty } from '../types';

// Calculate score for victory
export function calculateScore(
  difficulty: Difficulty,
  attemptsUsed: number,
  maxAttempts: number,
  timeInSeconds: number,
  currentStreak: number,
  hintsUsed: number
): number {
  const difficultyMultipliers: Record<Difficulty, number> = {
    easy: 1.0,
    medium: 1.25,
    hard: 1.5,
    expert: 2.0,
  };

  const mult = difficultyMultipliers[difficulty] || 1.0;
  const attemptBonus = (maxAttempts - attemptsUsed + 1) * 200;
  const speedBonus = Math.max(0, 300 - timeInSeconds * 2);
  const streakBonus = Math.min(500, currentStreak * 50);
  const hintPenalty = hintsUsed * 100;

  const rawScore = (attemptBonus + speedBonus + streakBonus - hintPenalty) * mult;
  return Math.max(100, Math.round(rawScore));
}

// Create encoded challenge URL token
export function encodeChallengeWord(word: string, difficulty: Difficulty): string {
  try {
    const payload = JSON.stringify({ w: word.toUpperCase(), d: difficulty, t: Date.now() });
    return btoa(payload);
  } catch (e) {
    return '';
  }
}

// Decode challenge URL token
export function decodeChallengeToken(token: string): { word: string; difficulty: Difficulty } | null {
  try {
    const decoded = atob(token);
    const parsed = JSON.parse(decoded);
    if (parsed.w && typeof parsed.w === 'string') {
      return { word: parsed.w, difficulty: parsed.d || 'medium' };
    }
  } catch (e) {}
  return null;
}
