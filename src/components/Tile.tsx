import React from 'react';
import { LetterStatus } from '../types';

interface TileProps {
  char?: string;
  status: LetterStatus;
  animationDelay?: number; // in ms
  isShaking?: boolean;
  isWinning?: boolean;
  colorblindMode?: boolean;
  highContrast?: boolean;
  largeText?: boolean;
}

export const Tile: React.FC<TileProps> = ({
  char = '',
  status,
  animationDelay = 0,
  isShaking = false,
  isWinning = false,
  colorblindMode = false,
  highContrast = false,
  largeText = false,
}) => {
  // Colorblind symbols overlay
  const getSymbol = () => {
    if (!colorblindMode) return null;
    if (status === 'correct') return '✓';
    if (status === 'present') return '●';
    if (status === 'absent') return '✕';
    return null;
  };

  // Determine colors based on status & themes
  const getStatusStyles = () => {
    switch (status) {
      case 'correct':
        return highContrast
          ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-500/20 animate-flip'
          : 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20 animate-flip';
      case 'present':
        return highContrast
          ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-500/20 animate-flip'
          : 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20 animate-flip';
      case 'absent':
        return 'bg-slate-800/90 text-slate-400 border-slate-700/80 shadow-sm animate-flip';
      case 'tbd':
        return 'bg-slate-800/80 text-white border-[var(--accent)] scale-105 shadow-md shadow-[var(--accent-glow)] animate-pop';
      case 'empty':
      default:
        return 'bg-slate-900/40 text-slate-600 border-slate-800/90 shadow-inner hover:border-[var(--accent)]/50 hover:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200';
    }
  };

  return (
    <div
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
      className={`
        relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border-2 font-display font-black flex items-center justify-center select-none transition-all duration-300 transform perspective-500
        ${largeText ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}
        ${getStatusStyles()}
        ${isShaking ? 'animate-shake' : ''}
        ${isWinning ? 'animate-cascade-bounce' : ''}
      `}
    >
      <span>{char.toUpperCase()}</span>
      {colorblindMode && getSymbol() && (
        <span className="absolute top-0.5 right-1 text-[10px] font-bold opacity-80">
          {getSymbol()}
        </span>
      )}
    </div>
  );
};
