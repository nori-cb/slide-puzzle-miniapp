'use client';

import { Difficulty, DIFFICULTY_CONFIG } from '@/lib/contract';

interface DifficultySelectorProps {
  selected: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

export function DifficultySelector({
  selected,
  onChange,
  disabled = false,
}: DifficultySelectorProps) {
  const difficulties = [Difficulty.Easy, Difficulty.Normal, Difficulty.Hard];

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {difficulties.map((diff) => {
        const config = DIFFICULTY_CONFIG[diff];
        const isActive = selected === diff;
        const diffClass = diff === Difficulty.Easy
          ? 'easy'
          : diff === Difficulty.Normal
          ? 'normal'
          : 'hard';

        return (
          <button
            key={diff}
            onClick={() => onChange(diff)}
            disabled={disabled}
            className={`difficulty-badge ${diffClass} ${isActive ? 'active' : ''} ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="block">{config.name}</span>
            <span className="block text-xs opacity-70">
              {config.gridSize}×{config.gridSize}
            </span>
          </button>
        );
      })}
    </div>
  );
}
