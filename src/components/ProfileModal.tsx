import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Trophy, Flame, Star, Award, Check, Sparkles, Shield, Zap } from 'lucide-react';
import { Settings, UserProfile } from '../types';
import { LOCALES } from '../data/words';
import { soundFx } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: Partial<UserProfile>) => void;
  settings: Settings;
}

const AVATARS = [
  '🧠', '🚀', '👑', '⚡', '💎', '🐉', 
  '🎯', '🔮', '👾', '🔥', '🦊', '🦉', 
  '🦁', '🥷', '🦄', '🧙‍♂️', '👻', '👽', '🌟', '🏆'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  settings,
}) => {
  const [nickname, setNickname] = useState(profile.nickname || 'Player');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '🧠');
  const [isSaved, setIsSaved] = useState(false);

  const t = LOCALES[settings.language] || LOCALES.en;

  const level = Math.floor(profile.totalScore / 500) + 1;
  const currentXp = profile.totalScore % 500;
  const xpPct = Math.min(100, Math.round((currentXp / 500) * 100));

  const getRankTitle = (lvl: number) => {
    if (lvl >= 10) return 'Grandmaster Lexicon';
    if (lvl >= 8) return 'Lexicon Scholar';
    if (lvl >= 5) return 'Wordmaster Expert';
    if (lvl >= 3) return 'Letter Crafter';
    if (lvl >= 2) return 'Vocab Apprentice';
    return 'Novice Word Solver';
  };

  const winPercentage =
    profile.gamesPlayed > 0
      ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
      : 0;

  const handleSave = () => {
    soundFx.playKeyPress();
    onUpdateProfile({
      nickname: nickname.trim() || 'WordMaster',
      avatar: selectedAvatar,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

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
            className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl text-[var(--text-primary)] max-h-[88vh] flex flex-col overflow-hidden theme-smooth-transition layered-shadow"
          >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--card-border)] mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <User className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] leading-snug">
                {t.profile}
              </h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                Player Preferences & Ranks
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

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {/* Level & XP Card */}
          <div className="p-4 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)] flex items-center gap-4 shadow-md theme-smooth-transition">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] border-2 border-[var(--accent-text)]/30 flex items-center justify-center text-3xl shadow-lg shrink-0">
              {selectedAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent)]">
                  Level {level}
                </span>
                <span className="text-xs font-black text-amber-400 flex items-center gap-0.5">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  {profile.totalScore} XP
                </span>
              </div>
              <div className="text-sm font-extrabold text-[var(--text-primary)] truncate mt-0.5">
                {getRankTitle(level)}
              </div>
              <div className="mt-2 w-full bg-[var(--input-bg)] rounded-full h-2 overflow-hidden border border-[var(--input-border)]">
                <div
                  style={{ width: `${xpPct}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                />
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-bold mt-1">
                {currentXp}/500 XP to Level {level + 1}
              </div>
            </div>
          </div>

          {/* Quick Stats Snapshot */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-xl p-2.5">
              <div className="text-sm font-extrabold text-emerald-400">{profile.gamesWon}</div>
              <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Wins</div>
            </div>
            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-xl p-2.5">
              <div className="text-sm font-extrabold text-[var(--accent)]">{winPercentage}%</div>
              <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Win Rate</div>
            </div>
            <div className="bg-[var(--subcard-bg)] border border-[var(--subcard-border)] rounded-xl p-2.5">
              <div className="text-sm font-extrabold text-amber-400">{profile.longestStreak}</div>
              <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Max Streak</div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Player Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={16}
                placeholder="Enter nickname..."
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--accent)] transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Select Avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      soundFx.playKeyPress();
                      setSelectedAvatar(av);
                    }}
                    className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer border ${
                      selectedAvatar === av
                        ? 'bg-[var(--accent)] border-[var(--accent)] scale-105 shadow-md'
                        : 'bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] border-[var(--subcard-border)]'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Save Button */}
        <div className="pt-3 border-t border-[var(--card-border)] mt-2 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-[var(--accent)] hover:opacity-90 active:scale-[0.99] text-[var(--accent-text)] font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-[var(--accent)]"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <span>Save Profile Changes</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

