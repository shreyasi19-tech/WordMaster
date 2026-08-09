import { describe, it, expect } from 'vitest';
import { evaluateGuess, createGame, submitGuess, getHintData } from './gameEngine';
import { saveLeaderboardScore, getLeaderboard } from './db';

describe('evaluateGuess logic', () => {
  it('identifies exact matches (all green)', () => {
    const result = evaluateGuess('REACT', 'REACT');
    expect(result).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('identifies all absent letters (all gray)', () => {
    const result = evaluateGuess('MOUST', 'BRAIN');
    expect(result).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
  });

  it('handles partial matches (yellow)', () => {
    const result = evaluateGuess('TRAIN', 'BRAIN');
    expect(result).toEqual(['absent', 'correct', 'correct', 'correct', 'correct']);
  });

  it('handles duplicate letters correctly when target has fewer instances than guess', () => {
    const result = evaluateGuess('ERASE', 'SPEED');
    expect(result[0]).toBe('present');
    expect(result[4]).toBe('present');
  });

  it('handles duplicate letters when guess has more duplicates than target', () => {
    const result = evaluateGuess('APPLE', 'CRANE');
    expect(result[0]).toBe('present');
    expect(result[4]).toBe('correct');
  });

  it('handles exact match priority over present match for duplicates', () => {
    const result = evaluateGuess('EAGLE', 'SLATE');
    expect(result[4]).toBe('correct');
    expect(result[0]).toBe('absent');
  });
});

describe('createGame session creation', () => {
  it('sets correct wordLength and maxAttempts per difficulty and mode', () => {
    const easyGame = createGame('easy', 'normal');
    expect(easyGame.wordLength).toBe(4);
    expect(easyGame.maxAttempts).toBe(6);

    const mediumGame = createGame('medium', 'normal');
    expect(mediumGame.wordLength).toBe(5);
    expect(mediumGame.maxAttempts).toBe(6);

    const hardGame = createGame('hard', 'normal');
    expect(hardGame.wordLength).toBe(6);
    expect(hardGame.maxAttempts).toBe(6);

    const suddenDeathGame = createGame('medium', 'sudden_death');
    expect(suddenDeathGame.maxAttempts).toBe(4);
  });

  it('produces the same gameId and target word for daily mode on repeated calls on the same date', () => {
    const daily1 = createGame('medium', 'daily');
    const daily2 = createGame('medium', 'daily');
    expect(daily1.gameId).toBe(daily2.gameId);
    expect(daily1.targetWord).toBe(daily2.targetWord);
    expect(daily1.gameId).toMatch(/^daily-\d{4}-\d{2}-\d{2}$/);
  });
});

describe('submitGuess mechanics', () => {
  it('rejects wrong-length guesses', () => {
    const game = createGame('medium', 'normal', 'PLANT');
    const result = submitGuess(game.gameId, 'CHAT');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exact');
  });

  it('rejects invalid non-alphabetical word inputs', () => {
    const game = createGame('medium', 'normal', 'PLANT');
    const result = submitGuess(game.gameId, '12345');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Not in valid dictionary list');
  });

  it('correctly flags isGameOver after maxAttempts', () => {
    const game = createGame('medium', 'sudden_death', 'PLANT'); // 4 max attempts
    const wrongGuess = 'CRANE'; // valid 5-letter word

    submitGuess(game.gameId, wrongGuess); // 1
    submitGuess(game.gameId, wrongGuess); // 2
    submitGuess(game.gameId, wrongGuess); // 3
    const finalResult = submitGuess(game.gameId, wrongGuess); // 4

    expect(finalResult.valid).toBe(true);
    expect(finalResult.isGameOver).toBe(true);
    expect(finalResult.isWin).toBe(false);
    expect(finalResult.targetWord).toBe('PLANT');
  });

  it('does not allow guesses after game is already over', () => {
    const game = createGame('medium', 'normal', 'PLANT');
    const winningResult = submitGuess(game.gameId, 'PLANT');
    expect(winningResult.isWin).toBe(true);
    expect(winningResult.isGameOver).toBe(true);

    const postOverGuess = submitGuess(game.gameId, 'PLANT');
    expect(postOverGuess.valid).toBe(false);
    expect(postOverGuess.error).toBe('Game is already over');
  });
});

describe('getHintData mechanics', () => {
  it('revealTile does not reveal the same index twice', () => {
    const game = createGame('medium', 'normal', 'PLANT');
    const revealedIndices: number[] = [];

    for (let i = 0; i < 5; i++) {
      const hint = getHintData(game.gameId, 'revealTile');
      expect(hint.success).toBe(true);
      expect(revealedIndices).not.toContain(hint.data.index);
      revealedIndices.push(hint.data.index);
    }

    // 6th attempt should fail because all tiles are revealed
    const overflowHint = getHintData(game.gameId, 'revealTile');
    expect(overflowHint.success).toBe(false);
    expect(overflowHint.error).toBe('All tiles already revealed');
  });

  it('eliminateKeys never includes a letter actually in the target word', () => {
    const game = createGame('medium', 'normal', 'PLANT');
    const hint = getHintData(game.gameId, 'eliminateKeys');
    expect(hint.success).toBe(true);

    const targetLetters = new Set('PLANT'.split(''));
    const eliminated: string[] = hint.data.eliminatedKeys;

    eliminated.forEach((letter) => {
      expect(targetLetters.has(letter)).toBe(false);
    });
  });
});

describe('saveLeaderboardScore (db.ts)', () => {
  it('rejects a nickname containing HTML/script tags', () => {
    const result = saveLeaderboardScore({
      nickname: '<script>alert("hack")</script>',
      score: 1000,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('enforces max score bounds', () => {
    const result = saveLeaderboardScore({
      nickname: 'CheaterUser',
      score: 99999999, // Exceeds max 1000000
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Score exceeds maximum allowed bound');
  });

  it('saves valid leaderboard entries and maintains top scores', () => {
    const result = saveLeaderboardScore({
      nickname: 'TestPlayer1',
      score: 5000,
      gamesWon: 10,
      streak: 5,
    });
    expect(result.success).toBe(true);
    expect(result.entry?.nickname).toBe('TestPlayer1');

    const topList = getLeaderboard(10);
    expect(topList.some((e) => e.nickname === 'TestPlayer1')).toBe(true);
  });
});
