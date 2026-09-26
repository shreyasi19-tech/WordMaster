import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";

import { logger } from "./server/logger";
import {
  createGame,
  getGame,
  submitGuess,
  getHintData,
  isValidWord,
  getActiveGamesCount,
} from "./server/gameEngine";
import { getLeaderboard, saveLeaderboardScore } from "./server/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));

// Rate Limiters
// NOTE ON RATE LIMIT KEYING IN PRODUCTION:
// Rate limiters currently use express-rate-limit default IP-based identification (`req.ip`).
// In a high-traffic production environment behind a shared reverse proxy/load balancer or NAT,
// you should trust proxy headers (`app.set('trust proxy', 1)`) and configure a custom `keyGenerator`
// combining `req.ip` (or `X-Forwarded-For`) with a lightweight session/device identifier token
// (e.g., `req.headers['x-device-token'] || req.ip`) to prevent multi-user throttling collisions.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: "AI request rate limit reached. Please wait a minute." },
});

const gameLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Game action rate limit reached." },
});

app.use("/api/", generalLimiter);

// Initialize Gemini AI client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Startup Environment Check & Logging
function checkEnvironment() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  if (hasKey) {
    logger.info("GEMINI_API_KEY is configured. Server-side AI hints and definition services are ACTIVE.");
  } else {
    logger.warn("GEMINI_API_KEY is missing. Server will use offline intelligent fallback heuristics for AI features.");
  }
}

// Health & Readiness Probes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/ready", (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ready",
    geminiAvailable: hasGemini,
    activeGamesCount: getActiveGamesCount(),
    timestamp: new Date().toISOString(),
  });
});

// --- GAME SERVER ENDPOINTS ---

// 1. Create New Game (Server-side word selection)
const NewGameSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  mode: z.enum(["normal", "timed", "sudden_death", "daily"]).default("normal"),
  customWord: z.string().optional(),
});

app.post("/api/game/new", gameLimiter, (req, res) => {
  const parseResult = NewGameSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  const { difficulty, mode, customWord } = parseResult.data;
  const game = createGame(difficulty, mode, customWord);

  logger.info(`New game created [id: ${game.gameId}, mode: ${mode}, diff: ${difficulty}, len: ${game.wordLength}]`);

  // Target word is kept STRICTLY server-side! Never sent to client!
  res.json({
    gameId: game.gameId,
    wordLength: game.wordLength,
    maxAttempts: game.maxAttempts,
    difficulty: game.difficulty,
    mode: game.mode,
  });
});

// 2. Submit Guess
const GuessSchema = z.object({
  guess: z.string().min(3).max(12),
});

app.post("/api/game/:id/guess", gameLimiter, (req, res) => {
  const { id } = req.params;
  const parseResult = GuessSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ valid: false, error: "Guess must be a valid string of 3-12 characters" });
  }

  const { guess } = parseResult.data;
  const result = submitGuess(id, guess);

  if (!result.valid) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// 3. Execute Server-side Game Hint
const GameHintSchema = z.object({
  hintType: z.enum(["vowels", "firstLetter", "revealTile", "eliminateKeys"]),
});

app.post("/api/game/:id/hint", gameLimiter, (req, res) => {
  const { id } = req.params;
  const parseResult = GameHintSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid hint type" });
  }

  const { hintType } = parseResult.data;
  const hintResult = getHintData(id, hintType);
  if (!hintResult.success) {
    return res.status(400).json({ error: hintResult.error });
  }

  res.json(hintResult.data);
});

// 4. Secure AI Hint endpoint (lookup target word by gameId on server)
const AiHintSchema = z.object({
  gameId: z.string().min(1),
  guesses: z.array(z.string()).optional(),
  remainingAttempts: z.number().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional(),
});

app.post("/api/ai-hint", aiLimiter, async (req, res) => {
  try {
    const parseResult = AiHintSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "gameId is required" });
    }

    const { gameId, guesses, remainingAttempts, difficulty } = parseResult.data;
    const game = getGame(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game session not found or expired" });
    }

    const targetWord = game.targetWord; // Target word is retrieved from server store!

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        hint: `Tactical hint: The secret word starts with '${targetWord[0].toUpperCase()}' and contains ${
          (targetWord.match(/[aeiou]/gi) || []).length
        } vowel(s).`,
        isOfflineFallback: true,
      });
    }

    const prompt = `You are WordMaster's AI Assistant giving a helpful, clever tactical hint for a Wordle-like game.
Secret Target Word: "${targetWord}" (${targetWord.length} letters, Difficulty: ${difficulty || game.difficulty}).
Player's Previous Guesses: ${JSON.stringify(guesses || game.guesses)}.
Remaining Attempts: ${remainingAttempts ?? (game.maxAttempts - game.guesses.length)}.

CRITICAL RULE: DO NOT reveal the secret target word directly!
Instead:
1. Analyze eliminated letters or correct letter patterns from previous guesses.
2. Give a subtle linguistic hint (e.g. vowel frequency, common prefix/suffix, letter placement strategy, or thematic clue).
3. Keep it brief (max 2-3 sentences), encouraging, and fun!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const hintText = response.text || "Try testing high-frequency vowels (A, E, I, O, U) to narrow down letter positions!";
    res.json({ hint: hintText, isOfflineFallback: false });
  } catch (err: any) {
    logger.error("AI Hint Error", { error: err.message });
    res.json({
      hint: "AI hint currently unavailable. Tip: Focus on placing common consonants like T, N, S, R in un-tested positions!",
      isOfflineFallback: true,
    });
  }
});

// 5. Vocabulary & Definition Mode endpoint
// Tries a real dictionary source first (dictionaryapi.dev, backed by Wiktionary),
// then enriches with AI (fun fact / extra synonyms) if available, then falls
// back to a generic message only if the word truly isn't in the dictionary
// and AI is unavailable.
const DefinitionSchema = z.object({
  word: z.string().min(2).max(15),
});

interface RealDictionaryResult {
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  synonyms: string[];
}

// Free, keyless dictionary API. No API key required, no billing risk.
async function fetchRealDictionaryDefinition(
  word: string
): Promise<RealDictionaryResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word.toLowerCase()
      )}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!resp.ok) return null; // e.g. 404 = word not found in this dictionary
    const data = await resp.json();
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry) return null;

    const phonetic: string | undefined =
      entry.phonetic ||
      entry.phonetics?.find((p: any) => p.text)?.text ||
      undefined;

    const firstMeaning = entry.meanings?.[0];
    const firstDef = firstMeaning?.definitions?.[0];
    if (!firstDef?.definition) return null;

    const synonyms: string[] = Array.from(
      new Set<string>(
        ((entry.meanings || [])
          .flatMap((m: any) => m.synonyms || [])
          .concat(firstDef.synonyms || [])) as string[]
      )
    ).slice(0, 5);

    return {
      phonetic,
      partOfSpeech: firstMeaning?.partOfSpeech,
      definition: firstDef.definition,
      example: firstDef.example,
      synonyms,
    };
  } catch (err: any) {
    logger.warn("Dictionary API lookup failed, will fall back", {
      word,
      error: err.message,
    });
    return null;
  }
}

app.post("/api/word-definition", aiLimiter, async (req, res) => {
  const parseResult = DefinitionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Word string is required" });
  }

  const { word } = parseResult.data;
  const cleanWord = word.trim().toUpperCase();

  // Tier 1: real dictionary lookup
  const realEntry = await fetchRealDictionaryDefinition(cleanWord);

  if (realEntry) {
    let funFact: string | undefined;
    const ai = getGeminiClient();

    // Optionally enrich with a short AI-generated fun fact — the definition
    // itself is already real, this is just flavor text and never overrides
    // the dictionary's actual meaning.
    if (ai) {
      try {
        const factResponse = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Give one short, interesting fun fact (max 20 words) about the etymology or usage of the English word "${cleanWord}". Respond with only the fact, no preamble.`,
        });
        funFact = (factResponse.text || "").trim() || undefined;
      } catch {
        // Non-critical — proceed without a fun fact.
      }
    }

    return res.json({
      word: cleanWord,
      phonetic: realEntry.phonetic || `/${cleanWord.toLowerCase()}/`,
      partOfSpeech: realEntry.partOfSpeech || "noun",
      definition: realEntry.definition,
      example:
        realEntry.example || `She used the word "${cleanWord}" correctly in a sentence.`,
      synonyms: realEntry.synonyms.length ? realEntry.synonyms : undefined,
      funFact,
      isOfflineFallback: false,
      source: "dictionary",
    });
  }

  // Tier 2: word not found in the real dictionary (can happen for plurals,
  // proper nouns, or less common puzzle words) — ask AI to generate one.
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Return a JSON object for the English word "${cleanWord}".
Respond ONLY with raw JSON matching this format:
{
  "word": "${cleanWord}",
  "phonetic": "/.../",
  "partOfSpeech": "noun/verb/adjective etc",
  "definition": "Clear concise definition",
  "example": "Sample sentence using the word",
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "funFact": "An interesting etymology or usage fact about the word"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const jsonStr = (response.text || "").trim();
      const data = JSON.parse(jsonStr);
      return res.json({ ...data, isOfflineFallback: false, source: "ai" });
    } catch (err: any) {
      logger.error("AI Word Definition Error", { error: err.message });
      // fall through to Tier 3
    }
  }

  // Tier 3: no dictionary match, no AI available — last resort only.
  res.json({
    word: cleanWord,
    phonetic: `/${cleanWord.toLowerCase()}/`,
    partOfSpeech: "noun",
    definition: "A valid word in this puzzle's word list. A full definition could not be found right now.",
    example: `The word "${cleanWord}" was solved!`,
    isOfflineFallback: true,
    source: "fallback",
  });
});

// 6. Leaderboard Endpoints
app.get("/api/leaderboard", (req, res) => {
  const leaderboard = getLeaderboard(10);
  res.json({ leaderboard });
});

app.post("/api/score", gameLimiter, (req, res) => {
  const result = saveLeaderboardScore(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  logger.info(`Score submitted for player ${result.entry?.nickname} [score: ${result.entry?.score}]`);
  res.json({ success: true, entry: result.entry });
});

// 7. Validate Word Endpoint
app.post("/api/validate-word", (req, res) => {
  const { word } = req.body;
  if (!word || typeof word !== "string") {
    return res.status(400).json({ valid: false, error: "Word string is required" });
  }

  const clean = word.trim().toUpperCase();
  const valid = isValidWord(clean);
  res.json({ valid, word: clean });
});

async function startServer() {
  checkEnvironment();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`WordMaster production server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
