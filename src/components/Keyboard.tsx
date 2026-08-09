import React, { useEffect } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { LetterStatus, Settings } from '../types';
import { soundFx } from '../utils/audio';

interface KeyboardProps {
  keyStatuses: Record<string, LetterStatus>;
  eliminatedKeys?: string[];
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  settings: Settings;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
];

export const Keyboard: React.FC<KeyboardProps> = ({
  keyStatuses,
  eliminatedKeys = [],
  onKeyPress,
  onEnter,
  onDelete,
  settings,
  disabled = false,
}) => {
  // Listen for physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        soundFx.playKeyPress();
        onEnter();
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        soundFx.playDelete();
        onDelete();
      } else if (/^[A-Z]$/.test(key)) {
        soundFx.playKeyPress();
        onKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, onEnter, onDelete, disabled]);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (_) {}
    }
  };

  const getKeyStyle = (status?: LetterStatus) => {
    switch (status) {
      case 'correct':
        return settings.highContrast
          ? 'bg-orange-600 text-white border-orange-500 font-extrabold shadow-md shadow-orange-500/20'
          : 'bg-emerald-600 text-white border-emerald-500 font-extrabold shadow-md shadow-emerald-500/20';
      case 'present':
        return settings.highContrast
          ? 'bg-sky-600 text-white border-sky-500 font-extrabold shadow-md shadow-sky-500/20'
          : 'bg-amber-600 text-white border-amber-500 font-extrabold shadow-md shadow-amber-500/20';
      case 'absent':
        return 'bg-slate-900/90 text-slate-500 border border-slate-800/80 opacity-50';
      default:
        return 'bg-slate-800/90 text-slate-100 hover:bg-slate-700/90 border border-slate-700/60';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-2 py-2 flex flex-col gap-1.5 select-none my-2">
      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5 touch-manipulation">
          {row.map((key) => {
            const isEnter = key === 'ENTER';
            const isDelete = key === 'DELETE';
            const status = keyStatuses[key];
            const isEliminated = eliminatedKeys.includes(key);

            return (
              <button
                key={key}
                disabled={disabled || isEliminated}
                onClick={() => {
                  if (disabled || isEliminated) return;
                  triggerHaptic();
                  if (isEnter) {
                    soundFx.playKeyPress();
                    onEnter();
                  } else if (isDelete) {
                    soundFx.playDelete();
                    onDelete();
                  } else {
                    soundFx.playKeyPress();
                    onKeyPress(key);
                  }
                }}
                className={`
                  min-h-[44px] h-11 sm:h-13 rounded-lg sm:rounded-xl font-display font-extrabold flex items-center justify-center keycap-btn transition-colors duration-300 text-xs sm:text-sm md:text-base
                  ${isEnter || isDelete ? 'px-2.5 sm:px-4 flex-1 max-w-[76px] min-w-[50px] bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/40' : 'w-8 sm:w-10 md:w-12 min-w-[32px] sm:min-w-[40px]'}
                  ${isEliminated ? 'bg-red-950/40 text-red-300/40 line-through border border-red-900/30 scale-90 opacity-40 cursor-not-allowed' : getKeyStyle(status)}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isEnter ? (
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline text-[10px]">ENTER</span>
                  </span>
                ) : isDelete ? (
                  <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
