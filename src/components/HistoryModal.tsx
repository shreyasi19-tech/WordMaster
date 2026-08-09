import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Download, Trash2, Check, XCircle, Search, Filter, AlertTriangle, Calendar, Clock, Award } from 'lucide-react';
import { GameHistoryItem, Settings } from '../types';
import { LOCALES } from '../data/words';
import { soundFx } from '../utils/audio';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameHistoryItem[];
  onClearHistory: () => void;
  settings: Settings;
}

type FilterResult = 'all' | 'win' | 'loss' | 'hard';

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<FilterResult>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const t = LOCALES[settings.language] || LOCALES.en;

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase().trim());
    if (!matchesSearch) return false;

    if (filterResult === 'win') return item.result === 'win';
    if (filterResult === 'loss') return item.result === 'loss';
    if (filterResult === 'hard') return item.difficulty === 'hard';
    return true;
  });

  // Export history to CSV file
  const exportCSV = () => {
    soundFx.playKeyPress();
    if (history.length === 0) return;

    const headers = ['Date', 'Word', 'Difficulty', 'Result', 'Attempts', 'Max Attempts', 'Time (s)', 'Score', 'Mode'];
    const rows = history.map((item) => [
      item.date,
      item.word,
      item.difficulty,
      item.result,
      item.attempts,
      item.maxAttempts,
      item.timeSeconds,
      item.score,
      item.mode,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wordmaster_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmClear = () => {
    soundFx.playKeyPress();
    onClearHistory();
    setShowClearConfirm(false);
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
            className="relative w-full max-w-xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl text-[var(--text-primary)] max-h-[88vh] flex flex-col overflow-hidden theme-smooth-transition layered-shadow"
          >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--card-border)] mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <History className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] leading-snug">
                {t.history}
              </h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                {history.length} {history.length === 1 ? 'Game' : 'Games'} Logged
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={exportCSV}
                className="px-3 py-1.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-text)] font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-[var(--accent)]"
                title="Export History to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
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
        </div>

        {/* Search & Filter Bar */}
        {history.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mb-3.5 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search word..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'win', label: 'Wins' },
                  { id: 'loss', label: 'Losses' },
                  { id: 'hard', label: 'Hard' },
                ] as const
              ).map((tab) => {
                const isSelected = filterResult === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundFx.playKeyPress();
                      setFilterResult(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] shadow-sm'
                        : 'bg-[var(--subcard-bg)] hover:bg-[var(--subcard-hover)] text-[var(--text-secondary)] border-[var(--subcard-border)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Clear Confirmation Banner */}
        {showClearConfirm && (
          <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3 mb-3 shrink-0 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Are you sure you want to clear all history?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-all cursor-pointer"
              >
                Yes, Clear
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 rounded-xl bg-[var(--subcard-bg)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2.5 pr-1">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-secondary)]">
              <History className="w-8 h-8 mx-auto mb-2 opacity-30 text-[var(--text-muted)]" />
              <p className="text-sm font-bold">
                {history.length === 0
                  ? 'No games played yet. Complete a puzzle to view history!'
                  : 'No games match your search filters.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[var(--subcard-bg)] border border-[var(--subcard-border)] flex items-center justify-between gap-3 text-xs theme-smooth-transition hover:border-[var(--card-border)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 font-extrabold shadow-sm ${
                      item.result === 'win'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-400/40'
                    }`}
                  >
                    {item.result === 'win' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-base text-[var(--text-primary)] tracking-wider uppercase font-display">
                      {item.word}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase font-extrabold flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-[var(--input-bg)] border border-[var(--input-border)]">
                        {item.difficulty}
                      </span>
                      <span>•</span>
                      <span>{item.mode}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="font-extrabold text-sm text-[var(--accent)] flex items-center gap-1">
                    {item.result === 'win' ? (
                      <span>
                        {item.attempts}/{item.maxAttempts} tries
                      </span>
                    ) : (
                      <span className="text-rose-400">Failed</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                      {item.timeSeconds}s
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-extrabold">+{item.score} pts</span>
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] font-semibold mt-0.5">
                    {item.date}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Clear Button */}
        {history.length > 0 && !showClearConfirm && (
          <div className="pt-3 border-t border-[var(--card-border)] mt-2 shrink-0 flex justify-between items-center text-xs">
            <span className="text-[11px] font-bold text-[var(--text-muted)]">
              Showing {filteredHistory.length} of {history.length}
            </span>
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyPress();
                setShowClearConfirm(true);
              }}
              className="text-rose-400 hover:text-rose-300 font-extrabold flex items-center gap-1 hover:underline cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

