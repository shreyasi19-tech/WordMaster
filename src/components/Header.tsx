import React from 'react';
import {
  BarChart3,
  Trophy,
  History,
  Settings as SettingsIcon,
  User,
  Volume2,
  VolumeX,
  Flame,
  HelpCircle,
  RotateCcw,
  LogOut,
  Home
} from 'lucide-react';
import { Language, Settings, Theme, UserProfile } from '../types';
import { LOCALES } from '../data/words';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  profile: UserProfile;
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onResetGame: () => void;
  onQuitGame?: () => void;
  onOpenHowToPlay: () => void;
  isInGame: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  settings,
  onUpdateSettings,
  onOpenStats,
  onOpenAchievements,
  onOpenHistory,
  onOpenSettings,
  onOpenProfile,
  onResetGame,
  onQuitGame,
  onOpenHowToPlay,
  isInGame,
}) => {
  const t = LOCALES[settings.language] || LOCALES.en;

  const toggleSound = () => {
    const nextSound = !settings.soundEnabled;
    soundFx.setEnabled(nextSound);
    onUpdateSettings({ soundEnabled: nextSound });
    if (nextSound) soundFx.playKeyPress();
  };

  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between glass border border-white/10 mb-4 shadow-2xl transition-all duration-300">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenProfile}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_15px_rgba(129,140,248,0.4)] border border-white/20 transform hover:scale-105 transition-transform">
          W
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter glow-text uppercase italic text-white">
              {t.appTitle}
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-600/50 rounded-full text-[9px] font-bold uppercase tracking-widest border border-indigo-400/30 text-indigo-200 hidden md:inline-block">
              Pro Edition
            </span>
          </div>
          <p className="text-[10px] text-indigo-300/80 font-semibold tracking-widest uppercase hidden sm:block">
            {profile.nickname} • Level {Math.floor(profile.totalScore / 500) + 1}
          </p>
        </div>
      </div>

      {/* Center Stats Badges */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-inner"
          title="Current Win Streak"
        >
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{profile.currentStreak}</span>
        </div>

        {isInGame && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFx.playKeyPress();
                onResetGame();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all border border-white/10 shadow-sm flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="New Game / Reset"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Restart</span>
            </button>
            {onQuitGame && (
              <button
                onClick={() => {
                  soundFx.playKeyPress();
                  onQuitGame();
                }}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 transition-all shadow-sm flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Quit Game and return to Main Menu"
              >
                <Home className="w-4 h-4 text-rose-300" />
                <span className="hidden sm:inline">Quit Game</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all border border-white/10 shadow-sm hover:scale-105 active:scale-95"
          title={settings.soundEnabled ? "Mute Audio" : "Enable Audio"}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-300" />
          )}
        </button>

        <button
          onClick={() => {
            soundFx.playKeyPress();
            onOpenStats();
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all border border-white/10 shadow-sm hover:scale-105 active:scale-95"
          title={t.stats}
        >
          <BarChart3 className="w-4 h-4 text-cyan-300" />
        </button>

        <button
          onClick={() => {
            soundFx.playKeyPress();
            onOpenAchievements();
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all border border-white/10 shadow-sm hover:scale-105 active:scale-95"
          title={t.achievements}
        >
          <Trophy className="w-4 h-4 text-amber-300" />
        </button>

        <button
          onClick={() => {
            soundFx.playKeyPress();
            onOpenHistory();
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all border border-white/10 shadow-sm hover:scale-105 active:scale-95 hidden sm:block"
          title={t.history}
        >
          <History className="w-4 h-4 text-purple-300" />
        </button>

        <button
          onClick={() => {
            soundFx.playKeyPress();
            onOpenProfile();
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all border border-white/10 shadow-sm hover:scale-105 active:scale-95"
          title={t.profile}
        >
          <User className="w-4 h-4 text-indigo-300" />
        </button>

        <button
          onClick={() => {
            soundFx.playKeyPress();
            onOpenSettings();
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all border border-white/10 shadow-sm hover:scale-105 active:scale-95"
          title={t.settings}
        >
          <SettingsIcon className="w-4 h-4 text-slate-200" />
        </button>

        <button
          onClick={() => {
            soundFx.playKeyPress();
            onOpenHowToPlay();
          }}
          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all border border-white/10 shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          title="How to Play"
        >
          <HelpCircle className="w-4 h-4 text-purple-200" />
          <span className="hidden sm:inline text-xs">How to play?</span>
        </button>
      </div>
    </header>
  );
};
