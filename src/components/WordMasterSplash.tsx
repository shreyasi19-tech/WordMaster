import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SplashProps {
  onComplete: () => void;
}

export const WordMasterSplash: React.FC<SplashProps> = ({ onComplete }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const tiles = [
    { char: 'W', highlight: true },
    { char: 'O', highlight: true },
    { char: 'R', highlight: true },
    { char: 'D', highlight: true },
    { char: 'M', highlight: false },
    { char: 'A', highlight: false },
    { char: 'S', highlight: false },
    { char: 'T', highlight: false },
    { char: 'E', highlight: false },
    { char: 'R', highlight: false },
  ];

  useEffect(() => {
    // Play subtle entrance sound
    soundFx.playKeyPress();

    const timer = setTimeout(() => {
      dismiss();
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    if (isDismissed) return;
    setIsDismissed(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={dismiss}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06121e] text-white cursor-pointer select-none overflow-hidden bg-noise"
        >
          {/* Glowing background orbs */}
          <div className="orb w-[350px] h-[350px] bg-emerald-500/20 top-1/4 left-1/4 animate-drift-one" />
          <div className="orb w-[300px] h-[300px] bg-purple-600/20 bottom-1/4 right-1/4 animate-drift-two" />

          {/* Center Brand Assembly */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 font-display font-black text-2xl shadow-[0_0_30px_rgba(0,210,157,0.4)] border border-emerald-300/40"
            >
              W
            </motion.div>

            {/* Letter Tiles Reveal */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {tiles.map((tile, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, rotateX: 90, opacity: 0 }}
                  animate={{ scale: 1, rotateX: 0, opacity: 1 }}
                  transition={{
                    delay: 0.15 + idx * 0.06,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={`w-8 h-10 sm:w-11 sm:h-13 rounded-xl font-display font-black text-lg sm:text-2xl flex items-center justify-center shadow-lg transition-all ${
                    tile.highlight
                      ? 'bg-emerald-500 text-slate-950 border border-emerald-300 shadow-[0_0_20px_rgba(0,210,157,0.4)]'
                      : 'bg-slate-800 text-slate-100 border border-slate-700'
                  }`}
                >
                  {tile.char}
                </motion.div>
              ))}
            </div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-extrabold text-slate-400 pt-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Next-Gen Word Puzzle</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase"
          >
            Click anywhere to skip
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
