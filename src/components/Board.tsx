import React from 'react';
import { LetterState, LetterStatus, Settings } from '../types';
import { Tile } from './Tile';

interface BoardProps {
  wordLength: number;
  maxAttempts: number;
  guesses: LetterState[][];
  currentAttempt: number;
  currentInput: string;
  isShakingRow: boolean;
  isWinningRow: boolean;
  settings: Settings;
  revealedFirstLetter?: string;
  revealedTilePositions?: number[];
}

export const Board: React.FC<BoardProps> = ({
  wordLength,
  maxAttempts,
  guesses,
  currentAttempt,
  currentInput,
  isShakingRow,
  isWinningRow,
  settings,
  revealedFirstLetter,
  revealedTilePositions = [],
}) => {
  const rows = [];

  for (let r = 0; r < maxAttempts; r++) {
    const isCurrentRow = r === currentAttempt;
    const isPastRow = r < currentAttempt;
    const isShaking = isCurrentRow && isShakingRow;
    const isWinning = isPastRow && r === guesses.length - 1 && isWinningRow;

    const tiles = [];

    for (let c = 0; c < wordLength; c++) {
      let char = '';
      let status: LetterStatus = 'empty';
      let delay = 0;

      if (isPastRow) {
        const letterState = guesses[r]?.[c];
        char = letterState?.char || '';
        status = letterState?.status || 'absent';
        delay = c * 100;
        if (isWinning) {
          delay = c * 90;
        }
      } else if (isCurrentRow) {
        char = currentInput[c] || '';
        status = char ? 'tbd' : 'empty';

        // Display revealed hint placeholder if tile is empty
        if (!char) {
          if (c === 0 && revealedFirstLetter) {
            char = revealedFirstLetter;
            status = 'empty';
          }
        }
      }

      tiles.push(
        <Tile
          key={c}
          char={char}
          status={status}
          animationDelay={delay}
          isShaking={isShaking}
          isWinning={isWinning}
          colorblindMode={settings.colorblindMode}
          highContrast={settings.highContrast}
          largeText={settings.largeText}
        />
      );
    }

    rows.push(
      <div
        key={r}
        className={`flex justify-center gap-1.5 sm:gap-2 my-1 sm:my-1.5 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {tiles}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-2 sm:my-4 select-none">
      {rows}
    </div>
  );
};
