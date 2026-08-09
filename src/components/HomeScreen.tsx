import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  User,
  Globe,
  BarChart2,
  Trophy,
  Sliders,
  Moon,
  Sun,
  Zap,
  Waves,
  Trees,
  Gamepad2,
  Compass,
  Sparkles,
} from 'lucide-react';
import { Difficulty, GameMode, Settings, UserProfile } from '../types';
import { soundFx } from '../utils/audio';

interface HomeScreenProps {
  profile: UserProfile;
  settings: Settings;
  onStartGame: (
    nickname: string,
    avatar: string,
    difficulty: Difficulty,
    mode: GameMode
  ) => void;
  onOpenDaily: () => void;
  onOpenStats?: () => void;
  onOpenAchievements?: () => void;
  onOpenSettings?: () => void;
  onUpdateSettings?: (newSettings: Partial<Settings>) => void;
}

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark', emoji: '🌙', icon: Moon },
  { id: 'light', label: 'Light', emoji: '☀️', icon: Sun },
  { id: 'neon', label: 'Neon', emoji: '💜', icon: Zap },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', icon: Waves },
  { id: 'forest', label: 'Forest', emoji: '🌲', icon: Trees },
  { id: 'arcade', label: 'Retro Arcade', emoji: '🕹️', icon: Gamepad2 },
  { id: 'cyberpunk', label: 'Galaxy', emoji: '🌌', icon: Compass },
] as const;

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  settings,
  onStartGame,
  onOpenDaily,
  onOpenStats,
  onOpenAchievements,
  onOpenSettings,
  onUpdateSettings,
}) => {
  const [nickname, setNickname] = useState(profile.nickname || 'Player');
  const [difficulty, setDifficulty] = useState<Difficulty>(
    settings.defaultDifficulty || 'medium'
  );
  const [timeLeft, setTimeLeft] = useState<string>('0h 47m');

  // Daily Countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${mins}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    soundFx.playKeyPress();
    onStartGame(nickname.trim() || 'Player', profile.avatar || '🧠', difficulty, 'normal');
  };

  const getWordLenText = () => {
    switch (difficulty) {
      case 'easy':
        return 'four letters';
      case 'medium':
        return 'five letters';
      case 'hard':
        return 'six letters';
      case 'expert':
        return 'four to eight letters';
      default:
        return 'five letters';
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in bg-noise">
      {/* Background Mesh Gradient Orbs */}
      <div className="orb w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-[var(--accent-glow)] top-10 -left-20 animate-drift-one opacity-60" />
      <div className="orb w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] bg-purple-600/20 bottom-10 -right-20 animate-drift-two opacity-50" />

      {/* Scattered Background Floating Letters */}
      <div className="absolute top-[18%] left-[4%] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--faint-tile-bg)] border border-[var(--faint-tile-border)] text-[var(--faint-tile-text)] font-display font-black text-2xl flex items-center justify-center pointer-events-none select-none -rotate-12 shadow-lg theme-smooth-transition">
        W
      </div>
      <div className="absolute bottom-[20%] left-[8%] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--faint-tile-bg)] border border-[var(--faint-tile-border)] text-[var(--faint-tile-text)] font-display font-black text-2xl flex items-center justify-center pointer-events-none select-none rotate-6 shadow-lg theme-smooth-transition">
        O
      </div>
      <div className="absolute top-[22%] right-[6%] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--faint-tile-bg)] border border-[var(--faint-tile-border)] text-[var(--faint-tile-text)] font-display font-black text-2xl flex items-center justify-center pointer-events-none select-none rotate-12 shadow-lg theme-smooth-transition">
        R
      </div>
      <div className="absolute bottom-[30%] right-[5%] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--faint-tile-bg)] border border-[var(--faint-tile-border)] text-[var(--faint-tile-text)] font-display font-black text-2xl flex items-center justify-center pointer-events-none select-none -rotate-12 shadow-lg theme-smooth-transition">
        D
      </div>
      <div className="absolute bottom-[14%] right-[22%] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--faint-tile-bg)] border border-[var(--faint-tile-border)] text-[var(--faint-tile-text)] font-display font-black text-2xl flex items-center justify-center pointer-events-none select-none rotate-3 shadow-lg theme-smooth-transition">
        S
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-[650px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[28px] p-5 sm:p-8 shadow-2xl space-y-6 theme-smooth-transition layered-shadow">
        {/* LOGO HEADER: WORDMASTER */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2.5">
            {[
              { char: 'W', highlight: true },
              { char: 'O', highlight: true },
              { char: 'R', highlight: true },
              { char: 'D', highlight: true },
              { char: 'M', highlight: false },
              { char: 'A', highlight: false },
              { char: 'S', highlight: false },
              { char: 'T', highlight: false },
              { char: 'E', highlight: false },
              { char: 'R', highlight: false },
            ].map((tile, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotateX: 90 }}
                animate={{ scale: 1, rotateX: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9.5 md:h-9.5 rounded-lg font-display font-black text-sm sm:text-base md:text-lg flex items-center justify-center select-none transition-all theme-smooth-transition ${
                  tile.highlight
                    ? 'bg-[var(--tile-solved-bg)] border border-[var(--tile-solved-border)] text-[var(--tile-solved-text)] shadow-md shadow-[var(--accent-glow)]'
                    : 'bg-[var(--tile-unsolved-bg)] border border-[var(--tile-unsolved-border)] text-[var(--tile-unsolved-text)]'
                }`}
              >
                {tile.char}
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
            <span>🎯</span>
            <span>Guess the hidden word in {getWordLenText()}</span>
          </div>
        </div>

        {/* 1. PLAYER INPUT SECTION */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>PLAYER</span>
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your name..."
            maxLength={18}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent)] transition-all theme-smooth-transition shadow-inner"
          />
        </div>

        {/* 2. DIFFICULTY SECTION */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block">
            DIFFICULTY
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'easy', title: 'Easy', desc: 'Everyday words · 6 tries' },
              { id: 'medium', title: 'Medium', desc: 'Mixed vocabulary · 6 tries' },
              { id: 'hard', title: 'Hard', desc: 'Rare words · 5 tries' },
            ].map((opt) => {
              const isSelected = difficulty === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundFx.playKeyPress();
                    setDifficulty(opt.id as Difficulty);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all theme-smooth-transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--subcard-bg)] border-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)]'
                      : 'bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] border-[var(--subcard-border)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent)]'
                          : 'border-[var(--text-muted)] bg-transparent'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-text)]" />}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {opt.title}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-medium leading-tight">
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. THEME SECTION */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block">
            THEME
          </label>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map((th) => {
              const isSelected = settings.theme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    soundFx.playKeyPress();
                    if (onUpdateSettings) {
                      onUpdateSettings({ theme: th.id as any });
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all theme-smooth-transition cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] border border-[var(--accent)] text-[var(--accent-text)] font-extrabold shadow-md shadow-[var(--accent-glow)]'
                      : 'bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] border border-[var(--subcard-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{th.emoji}</span>
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. PRIMARY CTA BUTTON */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-[var(--accent)] hover:opacity-90 active:scale-[0.99] text-[var(--accent-text)] font-display font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)] transition-all cursor-pointer border border-[var(--accent)]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Game</span>
        </button>

        {/* 5. TODAY'S CHALLENGE BANNER */}
        <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 theme-smooth-transition">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                Today's Challenge
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Everyone gets the same word · hard difficulty · resets in {timeLeft}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenDaily}
            className="bg-[var(--subcard-hover)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] border border-[var(--accent)]/40 text-[var(--accent)] font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0"
          >
            Play now
          </button>
        </div>

        {/* 6. FOOTER ROW */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyPress();
              if (onOpenStats) onOpenStats();
            }}
            className="bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] border border-[var(--subcard-border)] text-[var(--text-primary)] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all theme-smooth-transition cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Statistics</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyPress();
              if (onOpenAchievements) onOpenAchievements();
            }}
            className="bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] border border-[var(--subcard-border)] text-[var(--text-primary)] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all theme-smooth-transition cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Achievements</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyPress();
              if (onOpenSettings) onOpenSettings();
            }}
            className="bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] border border-[var(--subcard-border)] text-[var(--text-primary)] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all theme-smooth-transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* 7. BOTTOM TEXT */}
        <div className="text-center text-xs text-[var(--text-muted)] font-medium tracking-wide theme-smooth-transition">
          Level 1 · 0 XP · {profile.gamesWon}/{profile.gamesPlayed} wins · best streak {profile.longestStreak}
        </div>
      </div>
    </div>
  );
};

