export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type GameMode = 'normal' | 'timed' | 'sudden_death' | 'daily';

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export interface LetterState {
  char: string;
  status: LetterStatus;
}

export type Theme =
  | 'purple'
  | 'dark'
  | 'light'
  | 'cyberpunk'
  | 'neon'
  | 'ocean'
  | 'forest'
  | 'arcade';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja';

export interface UserProfile {
  nickname: string;
  avatar: string; // emoji or icon name
  favoriteTheme: Theme;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  currentStreak: number;
  longestStreak: number;
  fastestWinSeconds: number | null;
  bestScore: number;
  guessDistribution: Record<number, number>; // attempts count 1..6 -> count
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category?: 'gameplay' | 'streak' | 'special';
  xpReward?: number;
}

export interface GameHistoryItem {
  id: string;
  date: string;
  word: string;
  difficulty: Difficulty;
  attempts: number;
  maxAttempts: number;
  timeSeconds: number;
  result: 'win' | 'loss';
  score: number;
  mode: GameMode;
}

export interface HintState {
  firstLetterRevealed: boolean;
  vowelCountRevealed: boolean;
  eliminatedKeys: string[]; // 50% elimination of wrong keys
  revealedPositions: number[]; // index of letters revealed
  aiHintText: string | null;
  hintsUsedCount: number;
}

export interface DefinitionData {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  synonyms?: string[];
  funFact?: string;
  isOfflineFallback?: boolean;
  source?: 'dictionary' | 'ai' | 'fallback';
}

export interface Settings {
  theme: Theme;
  language: Language;
  soundEnabled: boolean;
  bgMusicEnabled: boolean;
  volume: number; // 0 to 100
  animationsEnabled: boolean;
  colorblindMode: boolean;
  highContrast: boolean;
  largeText: boolean;
  defaultDifficulty: Difficulty;
  dailyReminder: boolean;
}
