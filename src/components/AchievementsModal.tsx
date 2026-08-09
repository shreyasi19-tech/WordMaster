import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Lock, CheckCircle2, Sparkles, Zap, ShieldAlert, Award } from 'lucide-react';
import { Achievement, Settings } from '../types';
import { LOCALES } from '../data/words';
import { soundFx } from '../utils/audio';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  settings: Settings;
}

type FilterTab = 'all' | 'unlocked' | 'locked' | 'gameplay' | 'streak' | 'special';

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const t = LOCALES[settings.language] || LOCALES.en;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const unlockPercentage = Math.round((unlockedCount / totalCount) * 100);

  const totalEarnedXp = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.xpReward || 50), 0);

  const totalPossibleXp = achievements.reduce(
    (sum, a) => sum + (a.xpReward || 50),
    0
  );

  const filteredAchievements = achievements.filter((ach) => {
    if (activeTab === 'unlocked') return ach.unlocked;
    if (activeTab === 'locked') return !ach.unlocked;
    if (activeTab === 'gameplay') return ach.category === 'gameplay';
    if (activeTab === 'streak') return ach.category === 'streak';
    if (activeTab === 'special') return ach.category === 'special';
    return true;
  });

  const filterTabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'unlocked', label: 'Unlocked', count: unlockedCount },
    { id: 'locked', label: 'Locked', count: totalCount - unlockedCount },
    { id: 'gameplay', label: 'Gameplay' },
    { id: 'streak', label: 'Streak' },
    { id: 'special', label: 'Special' },
  ];

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
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] leading-snug">
                {t.achievements}
              </h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                {unlockedCount} of {totalCount} Badges Unlocked ({unlockPercentage}%)
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

        {/* Overview Stats Card */}
        <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-2xl p-4 mb-4 shrink-0 flex flex-col gap-3 theme-smooth-transition">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span>Total XP Earned</span>
            </div>
            <span className="font-extrabold text-amber-400">
              {totalEarnedXp} / {totalPossibleXp} XP
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full bg-[var(--input-bg)] rounded-full h-2.5 overflow-hidden border border-[var(--input-border)] p-0.5">
            <div
              style={{ width: `${unlockPercentage}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none shrink-0">
          {filterTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playKeyPress();
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] shadow-sm'
                    : 'bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] text-[var(--text-secondary)] border-[var(--subcard-border)]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected
                        ? 'bg-[var(--accent-text)]/20 text-[var(--accent-text)]'
                        : 'bg-[var(--input-bg)] text-[var(--text-muted)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Badges List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-10 px-4 text-[var(--text-secondary)]">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--text-muted)]" />
              <p className="text-sm font-semibold">No achievements found in this category.</p>
            </div>
          ) : (
            filteredAchievements.map((ach) => {
              const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

              return (
                <div
                  key={ach.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 theme-smooth-transition ${
                    ach.unlocked
                      ? 'bg-[var(--subcard-bg)] border-[var(--accent)]/50 shadow-md'
                      : 'bg-[var(--subcard-bg)]/50 border-[var(--subcard-border)] opacity-75'
                  }`}
                >
                  {/* Badge Icon */}
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm border transition-all ${
                      ach.unlocked
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 border-amber-200 text-slate-900 shadow-amber-500/20 shadow-lg scale-105'
                        : 'bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 opacity-60" />}
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                        <span>{ach.title}</span>
                        {ach.unlocked && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {ach.xpReward && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            +{ach.xpReward} XP
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                          {ach.progress}/{ach.maxProgress}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {ach.description}
                    </p>

                    {/* Progress Bar & Unlocked Tag */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            ach.unlocked
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                              : 'bg-[var(--accent)]/60'
                          }`}
                        />
                      </div>
                      {ach.unlocked ? (
                        <span className="text-[10px] font-bold text-emerald-400 shrink-0 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--text-muted)] shrink-0">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

