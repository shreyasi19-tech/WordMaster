import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings as SettingsIcon,
  Palette,
  Globe,
  Volume2,
  Music,
  Eye,
  Type,
  RotateCcw,
  Sparkles,
  Sliders,
  VolumeX,
  Zap,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Difficulty, Language, Settings, Theme } from '../types';
import { LOCALES } from '../data/words';
import { soundFx } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  onResetAllData: () => void;
}

type SettingsTab = 'appearance' | 'audio' | 'gameplay' | 'accessibility';

const THEMES: { id: Theme; name: string; bgClass: string; accentColor: string; description: string }[] = [
  { id: 'dark', name: 'Midnight Dark', bgClass: 'from-slate-900 to-black', accentColor: '#00d29d', description: 'Sleek dark theme with emerald tiles' },
  { id: 'light', name: 'Clean Light', bgClass: 'from-sky-100 to-indigo-100', accentColor: '#4f46e5', description: 'Bright & high-contrast clean aesthetic' },
  { id: 'purple', name: 'Purple Sunset', bgClass: 'from-purple-900 to-indigo-950', accentColor: '#818cf8', description: 'Rich twilight violet with indigo glow' },
  { id: 'neon', name: 'Neon Cyber', bgClass: 'from-emerald-950 to-purple-950', accentColor: '#d946ef', description: 'Vibrant neon purple with glowing accents' },
  { id: 'ocean', name: 'Ocean Depth', bgClass: 'from-blue-950 to-teal-950', accentColor: '#06b6d4', description: 'Deep sea blue with cyan highlights' },
  { id: 'forest', name: 'Enchanted Forest', bgClass: 'from-emerald-950 to-green-950', accentColor: '#10b981', description: 'Calming emerald and lush forest green' },
  { id: 'arcade', name: 'Retro Arcade', bgClass: 'from-amber-950 to-rose-950', accentColor: '#f59e0b', description: 'Nostalgic 80s arcade gold & amber' },
  { id: 'cyberpunk', name: 'Galaxy Magenta', bgClass: 'from-fuchsia-950 to-cyan-950', accentColor: '#ec4899', description: 'Futuristic galaxy pink & deep cosmos' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const t = LOCALES[settings.language] || LOCALES.en;

  const triggerFeedback = (msg: string) => {
    soundFx.playKeyPress();
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 2000);
  };

  const handleConfirmReset = () => {
    soundFx.playKeyPress();
    onResetAllData();
    setShowResetConfirm(false);
    triggerFeedback('All progress reset successfully');
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'appearance', label: 'Theme & Language', icon: Palette },
    { id: 'audio', label: 'Sound & Volume', icon: Volume2 },
    { id: 'gameplay', label: 'Gameplay Defaults', icon: Sliders },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <SettingsIcon className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] leading-snug">
                {t.settings}
              </h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                Preferences, Audio & Visual Adjustments
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

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3.5 scrollbar-none shrink-0">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
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

        {/* Toast Feedback Notification */}
        {saveSuccessMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-2.5 mb-3 shrink-0 flex items-center gap-2 text-emerald-400 text-xs font-extrabold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Scrollable Settings Panel Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin">
          {/* TAB 1: THEME & LANGUAGE */}
          {activeTab === 'appearance' && (
            <div className="space-y-5 animate-fade-in">
              {/* Theme Selector */}
              <div>
                <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-2.5">
                  <Palette className="w-4 h-4 text-[var(--accent)]" />
                  <span>UI Color Themes</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEMES.map((th) => {
                    const isSelected = settings.theme === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ theme: th.id });
                          triggerFeedback(`Theme changed to ${th.name}`);
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--subcard-bg)] border-[var(--accent)] ring-2 ring-[var(--accent)]/40 shadow-md'
                            : 'bg-[var(--subcard-bg)] border-[var(--subcard-border)] hover:bg-[var(--subcard-hover)]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[var(--text-primary)]">
                              {th.name}
                            </span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent)] text-[var(--accent-text)] text-[9px] font-black uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--text-secondary)] font-medium">
                            {th.description}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full bg-gradient-to-r ${th.bgClass} border-2 border-[var(--card-border)] shrink-0 mt-0.5`}
                          style={{ borderColor: th.accentColor }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Selector */}
              <div className="pt-2 border-t border-[var(--card-border)]">
                <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-2.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>App Language</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'en', label: 'English', flag: '🇺🇸' },
                      { id: 'es', label: 'Español', flag: '🇪🇸' },
                      { id: 'fr', label: 'Français', flag: '🇫🇷' },
                      { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
                      { id: 'ja', label: '日本語', flag: '🇯🇵' },
                    ] as const
                  ).map((lang) => {
                    const isSelected = settings.language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ language: lang.id });
                          triggerFeedback(`Language set to ${lang.label}`);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] shadow-sm'
                            : 'bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] text-[var(--text-secondary)] border-[var(--subcard-border)]'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOUND & VOLUME */}
          {activeTab === 'audio' && (
            <div className="space-y-3 animate-fade-in">
              {/* Sound FX Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[var(--text-primary)]">
                      Sound Effects
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-semibold">
                      Keypress clicks, flip chimes & victory SFX
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    soundFx.setEnabled(enabled);
                    onUpdateSettings({ soundEnabled: enabled });
                    if (enabled) soundFx.playKeyPress();
                    triggerFeedback(enabled ? 'Sound FX enabled' : 'Sound FX muted');
                  }}
                  className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>

              {/* Background Music Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[var(--text-primary)]">
                      Ambient Background Music
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-semibold">
                      Subtle synthesized chord pad ambiance
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.bgMusicEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    soundFx.setBgMusicEnabled(enabled);
                    onUpdateSettings({ bgMusicEnabled: enabled });
                    triggerFeedback(enabled ? 'Background music enabled' : 'Music paused');
                  }}
                  className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>

              {/* Master Volume Slider */}
              <div className="p-4 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)] space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold">
                  <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[var(--accent)]" />
                    Master Volume
                  </span>
                  <span className="text-[var(--accent)] font-mono">{settings.volume || 70}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume || 70}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    soundFx.setVolume(val);
                    onUpdateSettings({ volume: val });
                  }}
                  className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-[var(--input-bg)] rounded-lg border border-[var(--input-border)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-bold">
                  <span>Mute</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GAMEPLAY DEFAULTS */}
          {activeTab === 'gameplay' && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Default Difficulty Selector */}
              <div className="p-4 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)] space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                  Default Starting Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'easy', label: 'Easy (4-let)' },
                      { id: 'medium', label: 'Medium (5-let)' },
                      { id: 'hard', label: 'Hard (6-let)' },
                    ] as const
                  ).map((diff) => {
                    const isSelected = (settings.defaultDifficulty || 'medium') === diff.id;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ defaultDifficulty: diff.id as Difficulty });
                          triggerFeedback(`Default difficulty set to ${diff.id}`);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all text-xs font-extrabold cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] shadow-sm'
                            : 'bg-[var(--input-bg)] hover:bg-[var(--subcard-hover)] text-[var(--text-secondary)] border-[var(--input-border)]'
                        }`}
                      >
                        {diff.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tile Animations Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[var(--text-primary)]">
                      Tile Flip & Shake Animations
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-semibold">
                      Enable smooth flip animations and vibration effects
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.animationsEnabled ?? true}
                  onChange={(e) => {
                    onUpdateSettings({ animationsEnabled: e.target.checked });
                    triggerFeedback('Animation settings updated');
                  }}
                  className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>

              {/* Daily Reminder Notification Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[var(--text-primary)]">
                      Daily Streak Reminder
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-semibold">
                      Visual reminder badge when Today's Challenge is ready
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dailyReminder ?? true}
                  onChange={(e) => {
                    onUpdateSettings({ dailyReminder: e.target.checked });
                    triggerFeedback('Daily reminder preference saved');
                  }}
                  className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: ACCESSIBILITY */}
          {activeTab === 'accessibility' && (
            <div className="space-y-3 animate-fade-in">
              {/* Colorblind Mode */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[var(--text-primary)]">
                      Colorblind Visual Indicators
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-semibold">
                      Displays explicit status shapes (✓, ?, ✗) on letter tiles
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.colorblindMode}
                  onChange={(e) => {
                    onUpdateSettings({ colorblindMode: e.target.checked });
                    triggerFeedback(e.target.checked ? 'Colorblind mode enabled' : 'Colorblind mode disabled');
                  }}
                  className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>

              {/* High Contrast Mode */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[var(--text-primary)]">
                      High Contrast Palette
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-semibold">
                      Replaces green/yellow with high-visibility orange & sky blue
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => {
                    onUpdateSettings({ highContrast: e.target.checked });
                    triggerFeedback('Contrast mode preference saved');
                  }}
                  className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>

              {/* Large Display Text Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Type className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[var(--text-primary)]">
                      Large Tile Fonts
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-semibold">
                      Increases letter font size for improved legibility
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.largeText ?? false}
                  onChange={(e) => {
                    onUpdateSettings({ largeText: e.target.checked });
                    triggerFeedback('Large font preference updated');
                  }}
                  className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Reset All Data Area */}
          <div className="pt-4 border-t border-[var(--card-border)]">
            {showResetConfirm ? (
              <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3.5 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-extrabold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Warning: Reset all scores, stats & history?</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  This action cannot be undone. All recorded streaks, games, and achievements will be deleted.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--subcard-bg)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] transition-all cursor-pointer border border-[var(--subcard-border)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Clear profile statistics & local history
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

