import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

export const LeaderboardEntrySchema = z.object({
  id: z.string(),
  nickname: z
    .string()
    .min(1, 'Nickname required')
    .max(20, 'Nickname max 20 characters')
    .refine((val) => !/<[^>]*>?/gm.test(val), {
      message: 'Nickname cannot contain HTML or script tags',
    }),
  avatar: z.string().max(10).default('🧠'),
  score: z.number().min(0).max(1000000, 'Score exceeds maximum allowed bound').default(0),
  gamesWon: z.number().min(0).max(100000).default(0),
  streak: z.number().min(0).max(10000).default(0),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium'),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'wordmaster.db');
export const db = new Database(DB_FILE);

// Enable WAL mode for concurrent write safety and optimal performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🧠',
    score INTEGER NOT NULL DEFAULT 0,
    gamesWon INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    timestamp TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_nickname_lower ON leaderboard(LOWER(nickname));

  CREATE TABLE IF NOT EXISTS games (
    gameId TEXT PRIMARY KEY,
    targetWord TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    mode TEXT NOT NULL,
    maxAttempts INTEGER NOT NULL,
    wordLength INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    lastAccessedAt INTEGER NOT NULL,
    guesses TEXT NOT NULL,
    isGameOver INTEGER NOT NULL DEFAULT 0,
    isWin INTEGER NOT NULL DEFAULT 0,
    hintsUsedCount INTEGER NOT NULL DEFAULT 0,
    revealedPositions TEXT NOT NULL,
    eliminatedKeys TEXT NOT NULL
  );
`);

const INITIAL_SEEDS: LeaderboardEntry[] = [
  { id: "1", nickname: "WordWizard", avatar: "🧠", score: 2450, gamesWon: 28, streak: 12, difficulty: "hard", timestamp: new Date().toISOString() },
  { id: "2", nickname: "LexiconPro", avatar: "⚡", score: 1980, gamesWon: 22, streak: 8, difficulty: "medium", timestamp: new Date().toISOString() },
  { id: "3", nickname: "SpellBound", avatar: "🚀", score: 1620, gamesWon: 19, streak: 5, difficulty: "hard", timestamp: new Date().toISOString() },
  { id: "4", nickname: "AlphaSolver", avatar: "👑", score: 1400, gamesWon: 15, streak: 4, difficulty: "medium", timestamp: new Date().toISOString() },
  { id: "5", nickname: "PuzzleMaster", avatar: "🎯", score: 1250, gamesWon: 12, streak: 3, difficulty: "easy", timestamp: new Date().toISOString() },
];

// Seed initial leaderboard if empty
function seedLeaderboard() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM leaderboard').get() as { count: number };
  if (countRow.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO leaderboard (id, nickname, avatar, score, gamesWon, streak, difficulty, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const seed of INITIAL_SEEDS) {
      insertStmt.run(seed.id, seed.nickname, seed.avatar, seed.score, seed.gamesWon, seed.streak, seed.difficulty, seed.timestamp);
    }
  }
}

seedLeaderboard();

export function getLeaderboard(limit = 10): LeaderboardEntry[] {
  const stmt = db.prepare(`
    SELECT id, nickname, avatar, score, gamesWon, streak, difficulty, timestamp
    FROM leaderboard
    ORDER BY score DESC
    LIMIT ?
  `);
  return stmt.all(limit) as LeaderboardEntry[];
}

export function saveLeaderboardScore(input: any): { success: boolean; entry?: LeaderboardEntry; error?: string } {
  const result = LeaderboardEntrySchema.partial({ id: true, timestamp: true }).safeParse(input);
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errorMsg };
  }

  const data = result.data;
  if (!data.nickname || data.nickname.trim().length === 0) {
    return { success: false, error: 'Nickname required and must contain valid text' };
  }

  // Look up existing entry by case-insensitive nickname
  const findStmt = db.prepare('SELECT * FROM leaderboard WHERE LOWER(nickname) = LOWER(?)');
  const existing = findStmt.get(data.nickname) as LeaderboardEntry | undefined;

  const entry: LeaderboardEntry = {
    id: existing ? existing.id : `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    nickname: data.nickname.trim(),
    avatar: data.avatar || '🧠',
    score: data.score || 0,
    gamesWon: data.gamesWon || 0,
    streak: data.streak || 0,
    difficulty: data.difficulty || 'medium',
    timestamp: new Date().toISOString(),
  };

  if (existing) {
    if (entry.score >= existing.score) {
      const updateStmt = db.prepare(`
        UPDATE leaderboard
        SET nickname = ?, avatar = ?, score = ?, gamesWon = ?, streak = ?, difficulty = ?, timestamp = ?
        WHERE id = ?
      `);
      updateStmt.run(entry.nickname, entry.avatar, entry.score, entry.gamesWon, entry.streak, entry.difficulty, entry.timestamp, entry.id);
    } else {
      return { success: true, entry: existing };
    }
  } else {
    const insertStmt = db.prepare(`
      INSERT INTO leaderboard (id, nickname, avatar, score, gamesWon, streak, difficulty, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(entry.id, entry.nickname, entry.avatar, entry.score, entry.gamesWon, entry.streak, entry.difficulty, entry.timestamp);
  }

  return { success: true, entry };
}
