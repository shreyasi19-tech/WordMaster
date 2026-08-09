import React, { useState } from 'react';
import { Bot, Lightbulb, Type, HelpCircle, Loader2, Sparkles, XCircle } from 'lucide-react';
import { Difficulty, HintState, Settings } from '../types';
import { LOCALES } from '../data/words';
import { soundFx } from '../utils/audio';

interface HintPanelProps {
  gameId: string | null;
  wordLength: number;
  guesses: string[];
  remainingAttempts: number;
  difficulty: Difficulty;
  hintState: HintState;
  onUseHint: (
    type: 'vowels' | 'firstLetter' | 'revealTile' | 'aiHint' | 'eliminateKeys',
    data?: any
  ) => void;
  settings: Settings;
  disabled?: boolean;
}

export const HintPanel: React.FC<HintPanelProps> = ({
  gameId,
  wordLength,
  guesses,
  remainingAttempts,
  difficulty,
  hintState,
  onUseHint,
  settings,
  disabled = false,
}) => {
  const t = LOCALES[settings.language] || LOCALES.en;
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Count vowels via server API
  const countVowels = async () => {
    if (!gameId || loadingAction) return;
    soundFx.playKeyPress();
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/game/${gameId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hintType: 'vowels' }),
      });
      const data = await res.json();
      if (data.vowelCount !== undefined) {
        onUseHint('vowels', data.vowelCount);
      }
    } catch (e) {
      console.error('Vowel hint error:', e);
    } finally {
      setLoadingAction(false);
    }
  };

  // Reveal first letter via server API
  const revealFirstLetter = async () => {
    if (!gameId || loadingAction) return;
    soundFx.playKeyPress();
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/game/${gameId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hintType: 'firstLetter' }),
      });
      const data = await res.json();
      if (data.firstLetter) {
        onUseHint('firstLetter', data.firstLetter);
      }
    } catch (e) {
      console.error('First letter hint error:', e);
    } finally {
      setLoadingAction(false);
    }
  };

  // Reveal random tile via server API
  const revealTile = async () => {
    if (!gameId || loadingAction) return;
    soundFx.playKeyPress();
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/game/${gameId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hintType: 'revealTile' }),
      });
      const data = await res.json();
      if (data.index !== undefined && data.char) {
        onUseHint('revealTile', { index: data.index, char: data.char });
      }
    } catch (e) {
      console.error('Reveal tile hint error:', e);
    } finally {
      setLoadingAction(false);
    }
  };

  // 50% Letter Elimination via server API
  const eliminateWrongKeys = async () => {
    if (!gameId || loadingAction) return;
    soundFx.playKeyPress();
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/game/${gameId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hintType: 'eliminateKeys' }),
      });
      const data = await res.json();
      if (data.eliminatedKeys) {
        onUseHint('eliminateKeys', data.eliminatedKeys);
      }
    } catch (e) {
      console.error('Eliminate keys hint error:', e);
    } finally {
      setLoadingAction(false);
    }
  };

  // Request AI Hint Assistant from server `/api/ai-hint` using gameId lookup
  const requestAiHint = async () => {
    if (!gameId || loadingAi) return;
    soundFx.playKeyPress();
    setLoadingAi(true);

    try {
      const response = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          guesses,
          remainingAttempts,
          difficulty,
        }),
      });

      const data = await response.json();
      if (data.hint) {
        onUseHint('aiHint', data.hint);
      }
    } catch (e) {
      onUseHint('aiHint', `Focus on placing common vowels like E or A in the center positions!`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-2 px-3 py-3 rounded-2xl glass border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-amber-300" />
          <span>{t.hints}</span>
          {hintState.hintsUsedCount > 0 && (
            <span className="text-[10px] text-purple-200/60 font-normal">
              ({hintState.hintsUsedCount} used)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {/* Count Vowels */}
        <button
          disabled={disabled || hintState.vowelCountRevealed || loadingAction}
          onClick={countVowels}
          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all text-xs font-semibold ${
            hintState.vowelCountRevealed
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 cursor-default'
              : 'bg-white/10 hover:bg-white/20 border-white/10 text-white active:scale-95'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-300" />
          <span>{t.vowelHint}</span>
        </button>

        {/* First Letter */}
        <button
          disabled={disabled || hintState.firstLetterRevealed || loadingAction}
          onClick={revealFirstLetter}
          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all text-xs font-semibold ${
            hintState.firstLetterRevealed
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 cursor-default'
              : 'bg-white/10 hover:bg-white/20 border-white/10 text-white active:scale-95'
          }`}
        >
          <Type className="w-4 h-4 text-cyan-300" />
          <span>{t.firstLetterHint}</span>
        </button>

        {/* 50% Elimination */}
        <button
          disabled={disabled || (hintState.eliminatedKeys && hintState.eliminatedKeys.length > 0) || loadingAction}
          onClick={eliminateWrongKeys}
          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all text-xs font-semibold ${
            hintState.eliminatedKeys && hintState.eliminatedKeys.length > 0
              ? 'bg-rose-500/20 border-rose-400/40 text-rose-200 cursor-default'
              : 'bg-white/10 hover:bg-white/20 border-white/10 text-white active:scale-95'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-300" />
          <span>50% Eliminate</span>
        </button>

        {/* Reveal Random Tile */}
        <button
          disabled={disabled || hintState.revealedPositions.length >= wordLength - 1 || loadingAction}
          onClick={revealTile}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center gap-2 transition-all text-xs font-semibold active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{t.revealLetterHint}</span>
        </button>

        {/* AI Hint Assistant */}
        <button
          disabled={disabled || loadingAi}
          onClick={requestAiHint}
          className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-300/40 flex items-center gap-2 transition-all text-xs font-bold active:scale-95 shadow-md col-span-2 sm:col-span-1"
        >
          {loadingAi ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Bot className="w-4 h-4 text-purple-200" />
          )}
          <span>{t.aiAssistant}</span>
        </button>
      </div>

      {/* AI Tactical Advice Box */}
      {hintState.aiHintText && (
        <div className="mt-3 p-3 rounded-xl bg-purple-900/50 border border-purple-400/30 text-xs text-purple-100 flex items-start gap-2 animate-fade-in shadow-inner">
          <Bot className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-purple-200 mb-0.5">Tactical AI Analysis:</div>
            <p className="leading-relaxed">{hintState.aiHintText}</p>
          </div>
        </div>
      )}
    </div>
  );
};
