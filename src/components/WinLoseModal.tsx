import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  XCircle,
  RotateCcw,
  Share2,
  Users,
  BookOpen,
  Sparkles,
  Flame,
  Clock,
  Loader2,
  Check,
  Home
} from 'lucide-react';
import { DefinitionData, Difficulty, GameMode, LetterState, Settings, UserProfile } from '../types';
import { LOCALES } from '../data/words';
import { encodeChallengeWord } from '../utils/gameLogic';
import { soundFx } from '../utils/audio';

interface WinLoseModalProps {
  isOpen: boolean;
  result: 'win' | 'loss';
  targetWord: string;
  guesses: LetterState[][];
  attemptsUsed: number;
  maxAttempts: number;
  timeSeconds: number;
  score: number;
  profile: UserProfile;
  difficulty: Difficulty;
  mode: GameMode;
  settings: Settings;
  onPlayAgain: () => void;
  onQuitGame?: () => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 800 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const update = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export const WinLoseModal: React.FC<WinLoseModalProps> = ({
  isOpen,
  result,
  targetWord,
  guesses,
  attemptsUsed,
  maxAttempts,
  timeSeconds,
  score,
  profile,
  difficulty,
  mode,
  settings,
  onPlayAgain,
  onQuitGame,
  onClose,
  onToast,
}) => {
  const t = LOCALES[settings.language] || LOCALES.en;
  const isWin = result === 'win';

  const [definition, setDefinition] = useState<DefinitionData | null>(null);
  const [loadingDef, setLoadingDef] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedChallenge, setCopiedChallenge] = useState(false);
  const [showVocab, setShowVocab] = useState(false);

  // Trigger delayed confetti & sound on open
  useEffect(() => {
    if (!isOpen) {
      setShowVocab(false);
      return;
    }

    let confettiTimer: NodeJS.Timeout;
    let vocabTimer: NodeJS.Timeout;

    if (isWin) {
      soundFx.playVictory();
      confettiTimer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6'],
        });
      }, 350);
    } else {
      soundFx.playDefeat();
    }

    vocabTimer = setTimeout(() => {
      setShowVocab(true);
    }, 450);

    fetchDefinition();

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(vocabTimer);
    };
  }, [isOpen, targetWord, result]);

  const fetchDefinition = async () => {
    setLoadingDef(true);
    try {
      const res = await fetch('/api/word-definition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: targetWord }),
      });
      const data = await res.json();
      setDefinition(data);
    } catch (e) {
      setDefinition({
        word: targetWord,
        phonetic: `/${targetWord.toLowerCase()}/`,
        partOfSpeech: 'noun',
        definition: 'A classic English vocabulary word solved in WordMaster.',
        example: `She solved "${targetWord}" in WordMaster!`,
      });
    } finally {
      setLoadingDef(false);
    }
  };

  // Generate Emoji Share Grid
  const generateEmojiGrid = () => {
    let text = `WordMaster #${Math.floor(Math.random() * 900) + 100} ${
      isWin ? attemptsUsed : 'X'
    }/${maxAttempts}\nMode: ${mode} (${difficulty})\n\n`;

    guesses.forEach((row) => {
      row.forEach((l) => {
        if (l.status === 'correct') text += '🟩';
        else if (l.status === 'present') text += '🟨';
        else text += '⬜';
      });
      text += '\n';
    });

    text += `\nPlay WordMaster now!`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    onToast(t.copiedToClipboard);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Generate Challenge Link
  const generateChallengeLink = () => {
    const token = encodeChallengeWord(targetWord, difficulty);
    const url = `${window.location.origin}?challenge=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedChallenge(true);
    onToast('Challenge link copied! Send it to your friend.');
    setTimeout(() => setCopiedChallenge(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-slate-900/95 border border-purple-500/30 rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto scrollbar-thin layered-shadow"
          >
            {/* Banner Header */}
            <div className="text-center space-y-2 mb-4">
              {isWin ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-sm">
                  <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span>{t.victory}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 font-extrabold text-sm">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>{t.defeat}</span>
                </div>
              )}

              {/* Glowing Target Word Tile Display */}
              <div className="pt-2">
                <span className="text-xs uppercase font-bold tracking-widest text-purple-200/70 block mb-1">
                  {t.targetWordWas}:
                </span>
                <div className="inline-flex gap-1.5 justify-center">
                  {targetWord.split('').map((char, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotateX: 90 }}
                      animate={{ scale: 1, rotateX: 0 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-white/30 text-white font-display font-black text-xl flex items-center justify-center shadow-lg"
                    >
                      {char}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid with Animated Numbers */}
            <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/10 rounded-2xl p-3 my-4 text-center">
              <div>
                <div className="text-[10px] text-purple-200/60 uppercase font-bold">Attempts</div>
                <div className="text-lg font-black text-amber-300 font-display">
                  {isWin ? `${attemptsUsed}/${maxAttempts}` : 'X'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-purple-200/60 uppercase font-bold">Time</div>
                <div className="text-lg font-black text-cyan-300 flex items-center justify-center gap-1 font-display">
                  <Clock className="w-4 h-4 text-cyan-300" />
                  <AnimatedNumber value={timeSeconds} />s
                </div>
              </div>
              <div>
                <div className="text-[10px] text-purple-200/60 uppercase font-bold">Score</div>
                <div className="text-lg font-black text-emerald-300 font-display">
                  +<AnimatedNumber value={score} />
                </div>
              </div>
            </div>

            {/* Vocabulary Mode Card 📚 - Secondary Reveal */}
            <AnimatePresence>
              {showVocab && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="my-4 bg-purple-950/60 border border-purple-500/30 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-indigo-300" />
                    <span>Vocabulary Insights</span>
                  </div>

                  {loadingDef ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-purple-200/70 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                      <span>Fetching dictionary definition...</span>
                    </div>
                  ) : definition ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-white font-display">
                          {definition.word}
                        </span>
                        {definition.phonetic && (
                          <span className="text-purple-300 font-mono text-[11px]">
                            {definition.phonetic}
                          </span>
                        )}
                        {definition.partOfSpeech && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-purple-200 italic">
                            {definition.partOfSpeech}
                          </span>
                        )}
                        {definition.source === 'dictionary' && (
                          <span
                            title="Verified against a real English dictionary"
                            className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold flex items-center gap-1"
                          >
                            ✓ Dictionary
                          </span>
                        )}
                      </div>
                      <p className="text-purple-100 leading-relaxed font-medium">
                        {definition.definition}
                      </p>
                      {definition.example && (
                        <p className="text-purple-300/80 italic text-[11px]">
                          "{definition.example}"
                        </p>
                      )}
                      {definition.funFact && (
                        <div className="pt-2 border-t border-purple-800/40 text-[11px] text-amber-200/90 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                          <span>{definition.funFact}</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  soundFx.playKeyPress();
                  onPlayAgain();
                }}
                className="w-full py-3.5 rounded-xl bg-[#00d29d] hover:bg-[#00b88a] text-[#02131e] font-display font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#00d29d]/20 active:scale-95 transition-all cursor-pointer border border-[#2ef2c2]/40"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t.playAgain}</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playKeyPress();
                  if (onQuitGame) {
                    onQuitGame();
                  } else {
                    onClose();
                  }
                }}
                className="w-full py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Quit Game</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={generateEmojiGrid}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all active:scale-95 cursor-pointer"
                >
                  {copiedShare ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4 text-cyan-300" />
                  )}
                  <span>{copiedShare ? 'Copied!' : t.shareResult}</span>
                </button>

                <button
                  onClick={generateChallengeLink}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all active:scale-95 cursor-pointer"
                >
                  {copiedChallenge ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Users className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{copiedChallenge ? 'Copied Link!' : t.challengeFriend}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
