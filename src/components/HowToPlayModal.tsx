import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Sparkles, BookOpen, Layers, Zap, CheckCircle2, Shield, Flame } from 'lucide-react';
import { Settings } from '../types';
import { soundFx } from '../utils/audio';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: Settings;
}

type TabType = 'rules' | 'modes' | 'difficulties' | 'features';

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose, settings }) => {
  const [activeTab, setActiveTab] = useState<TabType>('rules');

  const currentTheme = settings?.theme || 'dark';

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'rules', label: 'Tile Rules', icon: BookOpen },
    { id: 'modes', label: 'Modes', icon: Layers },
    { id: 'difficulties', label: 'Difficulties', icon: Zap },
    { id: 'features', label: 'AI & Tips', icon: Sparkles },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-theme={currentTheme}
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <HelpCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] leading-snug">
                How To Play
              </h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                Rules, Gameplay Modes & Tactics
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playKeyPress();
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] shadow-sm'
                    : 'bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] text-[var(--text-secondary)] border-[var(--subcard-border)]'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {/* TAB 1: TILE RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
                Guess the hidden secret word in 6 tries. Each guess must be a valid word.
                After submitting, the tiles change colors to reveal how close your guess was!
              </p>

              {/* Green Example */}
              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3.5 space-y-2">
                <div className="flex gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-900 font-extrabold text-base flex items-center justify-center shadow-md">
                    W
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    O
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    R
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    D
                  </div>
                </div>
                <p className="text-xs text-emerald-400 font-extrabold">
                  GREEN: <span className="text-[var(--text-primary)] font-semibold">"W" is in the word and in the exact correct position.</span>
                </p>
              </div>

              {/* Yellow Example */}
              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3.5 space-y-2">
                <div className="flex gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    P
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-900 font-extrabold text-base flex items-center justify-center shadow-md">
                    I
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    L
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    E
                  </div>
                </div>
                <p className="text-xs text-amber-400 font-extrabold">
                  YELLOW: <span className="text-[var(--text-primary)] font-semibold">"I" is in the secret word, but in a different position.</span>
                </p>
              </div>

              {/* Gray Example */}
              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-3.5 space-y-2">
                <div className="flex gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    V
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    A
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--tile-unsolved-bg)] border border-[var(--tile-unsolved-border)] text-[var(--text-muted)] font-extrabold text-base flex items-center justify-center">
                    G
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] font-extrabold text-base flex items-center justify-center">
                    U
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-extrabold">
                  GRAY: <span className="text-[var(--text-secondary)] font-semibold">"G" is not in the secret word in any position.</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GAME MODES */}
          {activeTab === 'modes' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-[var(--accent)] flex items-center gap-1.5">
                  <span>🎮 Classic Mode</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  Unlimited random secret puzzles. Pick your difficulty (Easy, Medium, Hard) and practice at your own pace!
                </p>
              </div>

              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-amber-400 flex items-center gap-1.5">
                  <span>🌐 Today's Challenge</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  A fresh, standardized secret puzzle served daily to everyone worldwide! Resets every 24 hours at midnight UTC.
                </p>
              </div>

              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-cyan-400 flex items-center gap-1.5">
                  <span>⚡ Speed Rush</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  Race against a ticking 60-second countdown timer! Quick thinking grants bonus time and extra streak multipliers.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DIFFICULTIES */}
          {activeTab === 'difficulties' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <span>🌱 Easy Difficulty</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  4-letter common everyday words. Perfect for beginners and quick warmups!
                </p>
              </div>

              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-[var(--accent)] flex items-center gap-1.5">
                  <span>🎯 Medium Difficulty</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  5-letter classic Wordle-style words. The balanced standard challenge!
                </p>
              </div>

              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-rose-400 flex items-center gap-1.5">
                  <span>🔥 Hard Difficulty</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  6 to 7-letter challenging vocabulary words. Tests expert word solvers!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AI & PRO TIPS */}
          {activeTab === 'features' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 fill-amber-400/20" />
                  <span>AI Smart Hints</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  Stuck on a guess? Tap the AI Hint button to receive intelligent tactical letter suggestions and subtle clues!
                </p>
              </div>

              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-purple-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Vocabulary Insights</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  After finishing any game, tap "Word Info" to view official definitions, pronunciations, and etymology!
                </p>
              </div>

              <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 space-y-1">
                <div className="text-sm font-extrabold text-cyan-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>Streaks & XP Levels</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  Maintain your daily streak to earn bonus XP, rank up your player level, and unlock exclusive achievement badges!
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

