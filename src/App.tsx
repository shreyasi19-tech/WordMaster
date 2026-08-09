import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Achievement,
  Difficulty,
  GameHistoryItem,
  GameMode,
  HintState,
  LetterState,
  LetterStatus,
  Settings,
  UserProfile,
} from './types';
import { LOCALES } from './data/words';
import {
  calculateScore,
  decodeChallengeToken,
} from './utils/gameLogic';
import {
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  loadAchievements,
  loadHistory,
  loadProfile,
  loadSettings,
  saveAchievements,
  saveHistory,
  saveProfile,
  saveSettings,
} from './utils/storage';
import { checkAchievements } from './utils/achievements';
import { soundFx } from './utils/audio';
import { LogOut } from 'lucide-react';

import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { HintPanel } from './components/HintPanel';
import { WinLoseModal } from './components/WinLoseModal';
import { StatsModal } from './components/StatsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { WordMasterSplash } from './components/WordMasterSplash';
import { Toast } from './components/Toast';

export default function App() {
  // Persistent Stores
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [history, setHistory] = useState<GameHistoryItem[]>(loadHistory);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);

  // App Screen
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('wm_splash_shown');
  });

  // Game Engine State (Managed Server-Side for integrity)
  const [gameId, setGameId] = useState<string | null>(null);
  const [targetWord, setTargetWord] = useState<string>(''); // Revealed only on game finish
  const [wordLength, setWordLength] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [maxAttempts, setMaxAttempts] = useState<number>(6);
  const [guesses, setGuesses] = useState<LetterState[][]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [keyStatuses, setKeyStatuses] = useState<Record<string, LetterStatus>>({});
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Hint State
  const [hintState, setHintState] = useState<HintState>({
    firstLetterRevealed: false,
    vowelCountRevealed: false,
    eliminatedKeys: [],
    revealedPositions: [],
    aiHintText: null,
    hintsUsedCount: 0,
  });

  // UI animation flags
  const [isShakingRow, setIsShakingRow] = useState<boolean>(false);
  const [isWinningRow, setIsWinningRow] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isWinLoseOpen, setIsWinLoseOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  // Sync sound setting on load
  useEffect(() => {
    soundFx.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Apply theme data attribute on root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Check URL challenge params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challengeToken = params.get('challenge');
    if (challengeToken) {
      const decoded = decodeChallengeToken(challengeToken);
      if (decoded) {
        startNewGame(profile.nickname, profile.avatar, decoded.difficulty, 'normal', decoded.word);
        showToast(`Challenge Game Started: ${decoded.word.length} letters!`);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Timer interval effect
  useEffect(() => {
    if (screen === 'game' && gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);

        if (gameMode === 'timed' || gameMode === 'sudden_death') {
          setTimeRemaining((prev) => {
            if (prev === null) return null;
            if (prev <= 1) {
              handleTimeUp();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, gameState, gameMode]);

  // Handle timer expiry
  const handleTimeUp = () => {
    if (gameState !== 'playing') return;
    soundFx.playError();
    setGameState('lost');
    showToast(LOCALES[settings.language]?.timeUp || 'Time is up!');
    handleGameEnd('loss', targetWord);
  };

  // Start New Game (Server-side Session Creation)
  const startNewGame = async (
    nickname: string,
    avatar: string,
    diff: Difficulty,
    mode: GameMode,
    customWord?: string
  ) => {
    // Save updated profile nickname/avatar
    const updatedProfile = { ...profile, nickname, avatar };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    try {
      const response = await fetch('/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: diff,
          mode,
          customWord,
        }),
      });

      const data = await response.json();

      if (data.gameId) {
        setGameId(data.gameId);
        setWordLength(data.wordLength);
        setMaxAttempts(data.maxAttempts);
        setDifficulty(data.difficulty);
        setGameMode(data.mode);
        setTargetWord(''); // Target word remains hidden server-side
        setGuesses([]);
        setCurrentAttempt(0);
        setCurrentInput('');
        setKeyStatuses({});
        setGameState('playing');
        setTimeElapsed(0);
        setIsShakingRow(false);
        setIsWinningRow(false);

        if (mode === 'timed') setTimeRemaining(60);
        else if (mode === 'sudden_death') setTimeRemaining(30);
        else setTimeRemaining(null);

        setHintState({
          firstLetterRevealed: false,
          vowelCountRevealed: false,
          eliminatedKeys: [],
          revealedPositions: [],
          aiHintText: null,
          hintsUsedCount: 0,
        });

        setScreen('game');
        setIsWinLoseOpen(false);
      }
    } catch (err) {
      console.error('Failed to start new game session:', err);
      showToast('Could not start game session. Retrying...');
    }
  };

  // Input Handlers
  const handleKeyPress = useCallback(
    (char: string) => {
      if (gameState !== 'playing') return;
      if (currentInput.length < wordLength) {
        setCurrentInput((prev) => prev + char);
      }
    },
    [currentInput, wordLength, gameState]
  );

  const handleDelete = useCallback(() => {
    if (gameState !== 'playing') return;
    if (currentInput.length > 0) {
      setCurrentInput((prev) => prev.slice(0, -1));
    }
  }, [currentInput, gameState]);

  const handleEnter = useCallback(async () => {
    if (gameState !== 'playing' || !gameId) return;

    if (currentInput.length < wordLength) {
      soundFx.playError();
      setIsShakingRow(true);
      setTimeout(() => setIsShakingRow(false), 500);
      showToast(LOCALES[settings.language]?.notEnoughLetters || 'Not enough letters!');
      return;
    }

    try {
      const response = await fetch(`/api/game/${gameId}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: currentInput }),
      });

      const data = await response.json();

      if (!data.valid) {
        soundFx.playError();
        setIsShakingRow(true);
        setTimeout(() => setIsShakingRow(false), 500);
        showToast(data.error || LOCALES[settings.language]?.invalidWord || 'Not in word list!');
        return;
      }

      // Received server-evaluated letter statuses
      const letterStatuses: LetterStatus[] = data.statuses;
      const newRow: LetterState[] = currentInput.split('').map((char, idx) => ({
        char,
        status: letterStatuses[idx],
      }));

      // Update keyboard statuses
      const nextKeyStatuses = { ...keyStatuses };
      newRow.forEach((l) => {
        const prev = nextKeyStatuses[l.char];
        if (prev === 'correct') return;
        const statusVal: string = l.status;
        if (statusVal === 'correct') nextKeyStatuses[l.char] = 'correct';
        else if (statusVal === 'present')
          nextKeyStatuses[l.char] = 'present';
        else if (!prev) nextKeyStatuses[l.char] = 'absent';
      });
      setKeyStatuses(nextKeyStatuses);

      const nextGuesses = [...guesses, newRow];
      setGuesses(nextGuesses);

      // Trigger per-tile sounds
      newRow.forEach((l, idx) => {
        setTimeout(() => {
          soundFx.playTileReveal(idx, l.status);
        }, idx * 100);
      });

      if (data.isWin) {
        setIsWinningRow(true);
        setGameState('won');
        const solvedWord = data.targetWord || currentInput;
        setTargetWord(solvedWord);
        setTimeout(() => {
          handleGameEnd('win', solvedWord, nextGuesses.length);
        }, wordLength * 100 + 400);
      } else if (data.isGameOver) {
        setGameState('lost');
        const solvedWord = data.targetWord || currentInput;
        setTargetWord(solvedWord);
        setTimeout(() => {
          handleGameEnd('loss', solvedWord, nextGuesses.length);
        }, wordLength * 100 + 400);
      } else {
        setCurrentAttempt((prev) => prev + 1);
        setCurrentInput('');
      }
    } catch (err) {
      console.error('Submit guess error:', err);
      soundFx.playError();
      showToast('Connection error. Please try again.');
    }
  }, [
    currentInput,
    wordLength,
    gameId,
    guesses,
    gameState,
    keyStatuses,
    settings.language,
  ]);

  // Handle Game Completion & Update LocalStorage Stats
  const handleGameEnd = (
    result: 'win' | 'loss',
    word: string,
    attemptsCount: number = guesses.length
  ) => {
    const isWin = result === 'win';
    const finalScore = isWin
      ? calculateScore(
          difficulty,
          attemptsCount,
          maxAttempts,
          timeElapsed,
          profile.currentStreak + 1,
          hintState.hintsUsedCount
        )
      : 0;

    // Update Profile
    const newStreak = isWin ? profile.currentStreak + 1 : 0;
    const newLongestStreak = Math.max(profile.longestStreak, newStreak);
    const newGamesPlayed = profile.gamesPlayed + 1;
    const newGamesWon = profile.gamesWon + (isWin ? 1 : 0);
    const newGamesLost = profile.gamesLost + (isWin ? 0 : 1);
    const newBestScore = Math.max(profile.bestScore, finalScore);
    const newFastestWin =
      isWin && (profile.fastestWinSeconds === null || timeElapsed < profile.fastestWinSeconds)
        ? timeElapsed
        : profile.fastestWinSeconds;

    const newDistribution = { ...profile.guessDistribution };
    if (isWin && attemptsCount >= 1 && attemptsCount <= 6) {
      newDistribution[attemptsCount] = (newDistribution[attemptsCount] || 0) + 1;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      totalScore: profile.totalScore + finalScore,
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon,
      gamesLost: newGamesLost,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      fastestWinSeconds: newFastestWin,
      bestScore: newBestScore,
      guessDistribution: newDistribution,
    };

    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    // Sync score to backend (Validated & sanitized server-side)
    if (result === 'win') {
      fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: updatedProfile.nickname,
          avatar: updatedProfile.avatar,
          score: updatedProfile.totalScore,
          gamesWon: updatedProfile.gamesWon,
          streak: updatedProfile.currentStreak,
          difficulty,
        }),
      }).catch((e) => console.warn('Score sync error:', e));
    }

    // Append to History
    const historyItem: GameHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      word,
      difficulty,
      attempts: attemptsCount,
      maxAttempts,
      timeSeconds: timeElapsed,
      result,
      score: finalScore,
      mode: gameMode,
    };

    const updatedHistory = [historyItem, ...history];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);

    // Evaluate Achievements
    const { updatedAchievements, newlyUnlocked } = checkAchievements(
      achievements,
      updatedProfile,
      historyItem
    );
    setAchievements(updatedAchievements);
    saveAchievements(updatedAchievements);

    if (newlyUnlocked.length > 0) {
      showToast(`🏆 Achievement Unlocked: ${newlyUnlocked[0].title}!`);
    }

    setIsWinLoseOpen(true);
  };

  // Hint Execution
  const handleUseHint = (
    type: 'vowels' | 'firstLetter' | 'revealTile' | 'aiHint' | 'eliminateKeys',
    data?: any
  ) => {
    if (type === 'vowels') {
      setHintState((prev) => ({
        ...prev,
        vowelCountRevealed: true,
        hintsUsedCount: prev.hintsUsedCount + 1,
      }));
      showToast(`Target word contains ${data} vowel(s)!`);
    } else if (type === 'firstLetter') {
      setHintState((prev) => ({
        ...prev,
        firstLetterRevealed: true,
        hintsUsedCount: prev.hintsUsedCount + 1,
      }));
      showToast(`First letter is '${data}'!`);
    } else if (type === 'revealTile') {
      const { index, char } = data;
      setHintState((prev) => ({
        ...prev,
        revealedPositions: [...prev.revealedPositions, index],
        hintsUsedCount: prev.hintsUsedCount + 1,
      }));
      showToast(`Letter #${index + 1} is '${char}'!`);
    } else if (type === 'eliminateKeys') {
      const keys: string[] = data || [];
      setHintState((prev) => ({
        ...prev,
        eliminatedKeys: [...(prev.eliminatedKeys || []), ...keys],
        hintsUsedCount: prev.hintsUsedCount + 1,
      }));
      showToast(`Eliminated ${keys.length} wrong letters from keyboard!`);
    } else if (type === 'aiHint') {
      setHintState((prev) => ({
        ...prev,
        aiHintText: data,
        hintsUsedCount: prev.hintsUsedCount + 1,
      }));
    }
  };

  // Settings update handler
  const handleUpdateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  // Profile update handler
  const handleUpdateProfile = (newProfile: Partial<UserProfile>) => {
    const updated = { ...profile, ...newProfile };
    setProfile(updated);
    saveProfile(updated);
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
    showToast('Game history cleared!');
  };

  // Reset all user data
  const handleResetAllData = () => {
    setProfile(DEFAULT_PROFILE);
    saveProfile(DEFAULT_PROFILE);
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setHistory([]);
    saveHistory([]);
    setAchievements(loadAchievements());
    setIsSettingsOpen(false);
    showToast('All data successfully reset.');
  };

  return (
    <div
      data-theme={settings.theme}
      className="relative min-h-screen w-full flex flex-col justify-between font-sans transition-colors duration-300 overflow-x-hidden theme-smooth-transition"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* Background Glowing Ambient Orbs for Immersive UI */}
      <div className="orb w-[450px] h-[450px] bg-indigo-900/30 -top-20 -left-20 fixed" />
      <div className="orb w-[450px] h-[450px] bg-purple-900/20 -bottom-20 -right-20 fixed" />

      <Toast message={toastMessage} />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-2 sm:p-4">
        <Header
          profile={profile}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onResetGame={() => startNewGame(profile.nickname, profile.avatar, difficulty, gameMode)}
          onQuitGame={() => setScreen('home')}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          isInGame={screen === 'game'}
        />

        {screen === 'home' ? (
          <HomeScreen
            profile={profile}
            settings={settings}
            onStartGame={(nick, av, diff, mode) => startNewGame(nick, av, diff, mode)}
            onOpenDaily={() => startNewGame(profile.nickname, profile.avatar, 'medium', 'daily')}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateSettings={handleUpdateSettings}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-between">
            {/* Mode & Timer & Quit Bar */}
            <div className="w-full max-w-lg flex items-center justify-between text-xs font-bold text-slate-300 mb-2 px-1">
              <div className="flex items-center gap-2.5">
                <span className="uppercase tracking-wider px-2.5 py-1 rounded-xl bg-[#051c27] border border-[#0d3b52] text-[#00d29d] font-bold">
                  Mode: {gameMode} ({difficulty})
                </span>
                {timeRemaining !== null && (
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 animate-pulse">
                    ⏱️ {timeRemaining}s
                  </span>
                )}
              </div>

              {/* QUIT GAME BUTTON TOP RIGHT ABOVE BOARD */}
              <button
                onClick={() => {
                  soundFx.playKeyPress();
                  setScreen('home');
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                title="Quit current game and return to home page"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>Quit Game</span>
              </button>
            </div>

            {/* Board */}
            <Board
              wordLength={wordLength}
              maxAttempts={maxAttempts}
              guesses={guesses}
              currentAttempt={currentAttempt}
              currentInput={currentInput}
              isShakingRow={isShakingRow}
              isWinningRow={isWinningRow}
              settings={settings}
            />

            {/* Hint Panel */}
            <HintPanel
              gameId={gameId}
              wordLength={wordLength}
              guesses={guesses.map((g) => g.map((l) => l.char).join(''))}
              remainingAttempts={maxAttempts - currentAttempt}
              difficulty={difficulty}
              hintState={hintState}
              onUseHint={handleUseHint}
              settings={settings}
              disabled={gameState !== 'playing'}
            />

            {/* Virtual Keyboard */}
            <Keyboard
              keyStatuses={keyStatuses}
              eliminatedKeys={hintState.eliminatedKeys}
              onKeyPress={handleKeyPress}
              onEnter={handleEnter}
              onDelete={handleDelete}
              settings={settings}
              disabled={gameState !== 'playing'}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-2 text-[11px] text-purple-200/50 font-medium">
        WordMaster © {new Date().getFullYear()} • Powered by Gemini AI
      </footer>

      {/* Modals */}
      <WinLoseModal
        isOpen={isWinLoseOpen}
        result={gameState === 'won' ? 'win' : 'loss'}
        targetWord={targetWord}
        guesses={guesses}
        attemptsUsed={guesses.length}
        maxAttempts={maxAttempts}
        timeSeconds={timeElapsed}
        score={
          history[0]?.score ||
          calculateScore(difficulty, guesses.length, maxAttempts, timeElapsed, profile.currentStreak, hintState.hintsUsedCount)
        }
        profile={profile}
        difficulty={difficulty}
        mode={gameMode}
        settings={settings}
        onPlayAgain={() => startNewGame(profile.nickname, profile.avatar, difficulty, gameMode)}
        onQuitGame={() => {
          setIsWinLoseOpen(false);
          setScreen('home');
        }}
        onClose={() => setIsWinLoseOpen(false)}
        onToast={showToast}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
        settings={settings}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
        settings={settings}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetAllData={handleResetAllData}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        settings={settings}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        settings={settings}
      />

      {showSplash && (
        <WordMasterSplash
          onComplete={() => {
            sessionStorage.setItem('wm_splash_shown', 'true');
            setShowSplash(false);
          }}
        />
      )}
    </div>
  );
}
