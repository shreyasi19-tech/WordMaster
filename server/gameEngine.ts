import { ALL_VALID_WORDS_SET, WORDS_4, WORDS_5, WORDS_6, WORDS_EXPERT } from './words';
import { db } from './db';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameMode = 'normal' | 'timed' | 'sudden_death' | 'daily';
export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export interface ActiveGame {
  gameId: string;
  targetWord: string;
  difficulty: Difficulty;
  mode: GameMode;
  maxAttempts: number;
  wordLength: number;
  createdAt: number;
  lastAccessedAt: number;
  guesses: string[];
  isGameOver: boolean;
  isWin: boolean;
  hintsUsedCount: number;
  revealedPositions: number[];
  eliminatedKeys: string[];
}

// Select target word list for difficulty
export function getWordListForDifficulty(difficulty: Difficulty): string[] {
  switch (difficulty) {
    case 'easy':
      return WORDS_4;
    case 'medium':
      return WORDS_5;
    case 'hard':
      return WORDS_6;
    case 'expert':
      return WORDS_EXPERT;
    default:
      return WORDS_5;
  }
}

// Select random target word for difficulty
export function getRandomTargetWord(difficulty: Difficulty): string {
  const list = getWordListForDifficulty(difficulty);
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex].toUpperCase();
}

// Generate deterministic daily word based on YYYY-MM-DD
export function getDailyWord(): { word: string; dateStr: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % WORDS_5.length;
  return { word: WORDS_5[index].toUpperCase(), dateStr };
}

// Validate word in dictionary
export function isValidWord(word: string): boolean {
  const upper = word.trim().toUpperCase();
  if (ALL_VALID_WORDS_SET.has(upper)) return true;
  return /^[A-Z]{3,12}$/.test(upper);
}

// Evaluate guess statuses with exact Wordle duplicate handling
export function evaluateGuess(guess: string, target: string): LetterStatus[] {
  const upperGuess = guess.toUpperCase();
  const upperTarget = target.toUpperCase();
  const len = upperTarget.length;
  const result: LetterStatus[] = new Array(len).fill('absent');
  const targetChars = upperTarget.split('');
  const guessChars = upperGuess.split('');

  const targetLetterCounts: Record<string, number> = {};
  targetChars.forEach((ch) => {
    targetLetterCounts[ch] = (targetLetterCounts[ch] || 0) + 1;
  });

  // Pass 1: Green (Exact match)
  for (let i = 0; i < len; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'correct';
      targetLetterCounts[guessChars[i]] -= 1;
    }
  }

  // Pass 2: Yellow (Present elsewhere)
  for (let i = 0; i < len; i++) {
    if (result[i] !== 'correct') {
      const ch = guessChars[i];
      if (targetLetterCounts[ch] && targetLetterCounts[ch] > 0) {
        result[i] = 'present';
        targetLetterCounts[ch] -= 1;
      } else {
        result[i] = 'absent';
      }
    }
  }

  return result;
}

// Helper: Save game state to SQLite DB
export function saveGameToDb(game: ActiveGame) {
  const stmt = db.prepare(`
    INSERT INTO games (
      gameId, targetWord, difficulty, mode, maxAttempts, wordLength,
      createdAt, lastAccessedAt, guesses, isGameOver, isWin,
      hintsUsedCount, revealedPositions, eliminatedKeys
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(gameId) DO UPDATE SET
      targetWord = excluded.targetWord,
      difficulty = excluded.difficulty,
      mode = excluded.mode,
      maxAttempts = excluded.maxAttempts,
      wordLength = excluded.wordLength,
      createdAt = excluded.createdAt,
      lastAccessedAt = excluded.lastAccessedAt,
      guesses = excluded.guesses,
      isGameOver = excluded.isGameOver,
      isWin = excluded.isWin,
      hintsUsedCount = excluded.hintsUsedCount,
      revealedPositions = excluded.revealedPositions,
      eliminatedKeys = excluded.eliminatedKeys
  `);

  stmt.run(
    game.gameId,
    game.targetWord,
    game.difficulty,
    game.mode,
    game.maxAttempts,
    game.wordLength,
    game.createdAt,
    game.lastAccessedAt,
    JSON.stringify(game.guesses),
    game.isGameOver ? 1 : 0,
    game.isWin ? 1 : 0,
    game.hintsUsedCount,
    JSON.stringify(game.revealedPositions),
    JSON.stringify(game.eliminatedKeys)
  );
}

// Helper: Convert SQLite row to ActiveGame object
function rowToGame(row: any): ActiveGame {
  return {
    gameId: row.gameId,
    targetWord: row.targetWord,
    difficulty: row.difficulty as Difficulty,
    mode: row.mode as GameMode,
    maxAttempts: row.maxAttempts,
    wordLength: row.wordLength,
    createdAt: row.createdAt,
    lastAccessedAt: row.lastAccessedAt,
    guesses: JSON.parse(row.guesses || '[]'),
    isGameOver: Boolean(row.isGameOver),
    isWin: Boolean(row.isWin),
    hintsUsedCount: row.hintsUsedCount,
    revealedPositions: JSON.parse(row.revealedPositions || '[]'),
    eliminatedKeys: JSON.parse(row.eliminatedKeys || '[]'),
  };
}

// Create a new game session
export function createGame(
  difficulty: Difficulty = 'medium',
  mode: GameMode = 'normal',
  customWord?: string
): ActiveGame {
  let targetWord = '';
  let gameId = '';

  if (mode === 'daily') {
    const daily = getDailyWord();
    targetWord = daily.word;
    gameId = `daily-${daily.dateStr}`;

    const existingGame = getGame(gameId);
    if (existingGame) {
      return existingGame;
    }
  } else if (customWord && isValidWord(customWord)) {
    targetWord = customWord.toUpperCase();
    gameId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  } else {
    targetWord = getRandomTargetWord(difficulty);
    gameId = `g-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const maxAttempts = mode === 'sudden_death' ? 4 : 6;
  const now = Date.now();

  const game: ActiveGame = {
    gameId,
    targetWord,
    difficulty,
    mode,
    maxAttempts,
    wordLength: targetWord.length,
    createdAt: now,
    lastAccessedAt: now,
    guesses: [],
    isGameOver: false,
    isWin: false,
    hintsUsedCount: 0,
    revealedPositions: [],
    eliminatedKeys: [],
  };

  saveGameToDb(game);
  return game;
}

// Retrieve active game by ID from SQLite DB
export function getGame(gameId: string): ActiveGame | undefined {
  const stmt = db.prepare('SELECT * FROM games WHERE gameId = ?');
  const row = stmt.get(gameId);
  if (!row) return undefined;

  const game = rowToGame(row);
  game.lastAccessedAt = Date.now();
  db.prepare('UPDATE games SET lastAccessedAt = ? WHERE gameId = ?').run(game.lastAccessedAt, game.gameId);
  return game;
}

// Submit a guess for a game
export function submitGuess(
  gameId: string,
  rawGuess: string
): {
  valid: boolean;
  error?: string;
  statuses?: LetterStatus[];
  isWin?: boolean;
  isGameOver?: boolean;
  attemptsUsed?: number;
  remainingAttempts?: number;
  targetWord?: string;
} {
  const game = getGame(gameId);
  if (!game) {
    return { valid: false, error: 'Game session not found or expired' };
  }

  if (game.isGameOver) {
    return {
      valid: false,
      error: 'Game is already over',
      isGameOver: true,
      isWin: game.isWin,
      targetWord: game.targetWord,
    };
  }

  const guess = rawGuess.trim().toUpperCase();

  if (guess.length !== game.wordLength) {
    return { valid: false, error: `Guess must be exactly ${game.wordLength} letters` };
  }

  if (!isValidWord(guess)) {
    return { valid: false, error: 'Not in valid dictionary list' };
  }

  const statuses = evaluateGuess(guess, game.targetWord);
  game.guesses.push(guess);

  const isWin = guess === game.targetWord;
  const isGameOver = isWin || game.guesses.length >= game.maxAttempts;

  game.isWin = isWin;
  game.isGameOver = isGameOver;

  saveGameToDb(game);

  return {
    valid: true,
    statuses,
    isWin,
    isGameOver,
    attemptsUsed: game.guesses.length,
    remainingAttempts: game.maxAttempts - game.guesses.length,
    targetWord: isGameOver ? game.targetWord : undefined,
  };
}

// Execute hint server-side without revealing the secret word
export function getHintData(
  gameId: string,
  hintType: 'vowels' | 'firstLetter' | 'revealTile' | 'eliminateKeys'
): { success: boolean; data?: any; error?: string } {
  const game = getGame(gameId);
  if (!game) {
    return { success: false, error: 'Game session not found' };
  }

  game.hintsUsedCount += 1;

  if (hintType === 'vowels') {
    const vowelCount = (game.targetWord.match(/[AEIOU]/gi) || []).length;
    saveGameToDb(game);
    return { success: true, data: { vowelCount } };
  }

  if (hintType === 'firstLetter') {
    saveGameToDb(game);
    return { success: true, data: { firstLetter: game.targetWord[0] } };
  }

  if (hintType === 'revealTile') {
    const unrevealed: number[] = [];
    for (let i = 0; i < game.wordLength; i++) {
      if (!game.revealedPositions.includes(i)) {
        unrevealed.push(i);
      }
    }
    if (unrevealed.length === 0) {
      return { success: false, error: 'All tiles already revealed' };
    }
    const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    game.revealedPositions.push(randomIndex);
    saveGameToDb(game);
    return {
      success: true,
      data: { index: randomIndex, char: game.targetWord[randomIndex] },
    };
  }

  if (hintType === 'eliminateKeys') {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const targetSet = new Set(game.targetWord.toUpperCase().split(''));
    const wrongKeys = alphabet.filter(
      (c) => !targetSet.has(c) && !game.eliminatedKeys.includes(c)
    );
    const countToEliminate = Math.max(3, Math.floor(wrongKeys.length / 2));
    const shuffled = [...wrongKeys].sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, countToEliminate);
    game.eliminatedKeys.push(...toEliminate);
    saveGameToDb(game);
    return { success: true, data: { eliminatedKeys: toEliminate } };
  }

  return { success: false, error: 'Unknown hint type' };
}

// Periodic cleanup for stale games (>24 hours) in SQLite
export function cleanStaleGames() {
  const now = Date.now();
  const maxAgeMs = 24 * 60 * 60 * 1000;
  const threshold = now - maxAgeMs;
  db.prepare('DELETE FROM games WHERE lastAccessedAt < ?').run(threshold);
}

export function getActiveGamesCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM games').get() as { count: number };
  return row ? row.count : 0;
}

// Schedule hourly cleanup
setInterval(cleanStaleGames, 60 * 60 * 1000);
