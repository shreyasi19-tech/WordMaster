import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BarChart3, Flame, Trophy, Award, Zap, Clock, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { Settings, UserProfile } from '../types';
import { LOCALES } from '../data/words';
import { soundFx } from '../utils/audio';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  settings: Settings;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  profile,
  settings,
}) => {
  const t = LOCALES[settings.language] || LOCALES.en;

  const winPercentage =
    profile.gamesPlayed > 0
      ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
      : 0;

  // Calculate Average Guess attempts
  const totalGuessesWon = Object.entries(profile.guessDistribution || {}).reduce(
    (acc, [attempts, count]) => acc + Number(attempts) * (count as number),
    0
  );
  const avgGuess =
    profile.gamesWon > 0 ? (totalGuessesWon / profile.gamesWon).toFixed(1) : '—';

  // Find max guess count for relative bar scaling
  const distValues: number[] = Object.values(
    profile.guessDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  );
  const maxGuessCount = Math.max(1, ...distValues);

  // Find most frequent guess count
  let mostFrequentGuess = 0;
  let maxCount = 0;
  Object.entries(profile.guessDistribution || {}).forEach(([attempt, count]) => {
    if ((count as number) > maxCount) {
      maxCount = count as number;
      mostFrequentGuess = Number(attempt);
    }
  });

  // Calculate Level and XP
  const level = Math.floor(profile.totalScore / 500) + 1;

  // SVG Circular progress math
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (winPercentage / 100) * circumference;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-theme={settings.theme}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/75 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl text-[var(--text-primary)] max-h-[88vh] flex flex-col overflow-hidden theme-smooth-transition layered-shadow"
          >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--card-border)] mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <BarChart3 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] leading-snug">
                {t.stats}
              </h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                Performance & Game Insights
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyPress();
              onClose();
            }}
            className="p-2 rounded-full bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--subcard-border)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {/* Win Rate Ring + Quick Stats Banner */}
          <div className="flex items-center gap-4 bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 theme-smooth-transition">
            <div className="relative w-22 h-22 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 84 84">
                <circle
                  cx="42"
                  cy="42"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-[var(--input-border)] fill-none"
                />
                <circle
                  cx="42"
                  cy="42"
                  r={radius}
                  stroke="var(--accent)"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="fill-none transition-all duration-1000 shadow-sm"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-base font-extrabold text-[var(--text-primary)]">
                  {winPercentage}%
                </span>
                <span className="text-[9px] uppercase font-extrabold text-[var(--accent)] tracking-wider">
                  Win Rate
                </span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2.5 text-center">
              <div className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-2.5">
                <div className="text-base font-extrabold text-cyan-400">{avgGuess}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-0.5">
                  Avg Guesses
                </div>
              </div>
              <div className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-2.5">
                <div className="text-base font-extrabold text-amber-400">{profile.totalScore}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-0.5">
                  Total XP
                </div>
              </div>
              <div className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-2.5 col-span-2 flex items-center justify-between px-3">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Player Rank</span>
                <span className="text-xs font-extrabold text-[var(--accent)]">Level {level} Master</span>
              </div>
            </div>
          </div>

          {/* 4 Core Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3 theme-smooth-transition">
              <div className="text-xl font-extrabold text-[var(--text-primary)]">{profile.gamesPlayed}</div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mt-0.5">
                Played
              </div>
            </div>
            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3 theme-smooth-transition">
              <div className="text-xl font-extrabold text-emerald-400">{profile.gamesWon}</div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mt-0.5">
                Won
              </div>
            </div>
            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3 theme-smooth-transition">
              <div className="text-xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>{profile.currentStreak}</span>
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mt-0.5">
                Streak
              </div>
            </div>
            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3 theme-smooth-transition">
              <div className="text-xl font-extrabold text-purple-400">{profile.longestStreak}</div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mt-0.5">
                Best Streak
              </div>
            </div>
          </div>

          {/* High Scores & Speed Records */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3.5 flex items-center gap-3 theme-smooth-transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                  Best Game Score
                </div>
                <div className="text-base font-extrabold text-amber-400">
                  {profile.bestScore > 0 ? `${profile.bestScore} pts` : '—'}
                </div>
              </div>
            </div>

            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3.5 flex items-center gap-3 theme-smooth-transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                  Fastest Win
                </div>
                <div className="text-base font-extrabold text-cyan-400">
                  {profile.fastestWinSeconds ? `${profile.fastestWinSeconds}s` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Guess Distribution Chart */}
          <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 theme-smooth-transition space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                <span>Guess Distribution</span>
              </h3>
              {mostFrequentGuess > 0 && maxCount > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                  Best spot: {mostFrequentGuess} {mostFrequentGuess === 1 ? 'try' : 'tries'}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((attemptNum) => {
                const count = profile.guessDistribution[attemptNum] || 0;
                const percent = Math.round((count / maxGuessCount) * 100);
                const isTopSpot = attemptNum === mostFrequentGuess && count > 0;

                return (
                  <div key={attemptNum} className="flex items-center gap-2.5 text-xs">
                    <span className="w-3 text-right font-extrabold text-[var(--text-secondary)]">
                      {attemptNum}
                    </span>
                    <div className="flex-1 bg-[var(--input-bg)] rounded-full h-6 overflow-hidden p-0.5 border border-[var(--input-border)] flex items-center">
                      <div
                        style={{ width: `${Math.max(10, percent)}%` }}
                        className={`h-full rounded-full flex items-center justify-end px-2.5 text-[10px] font-extrabold transition-all duration-700 ${
                          isTopSpot
                            ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-md'
                            : count > 0
                            ? 'bg-[var(--tile-unsolved-bg)] border border-[var(--tile-unsolved-border)] text-[var(--text-primary)]'
                            : 'bg-transparent text-[var(--text-muted)]'
                        }`}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

