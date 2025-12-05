'use client';

import { useCallback } from 'react';
import { Difficulty, DIFFICULTY_CONFIG } from '@/lib/contract';
import { formatTime } from '@/lib/puzzle';

interface ShareButtonProps {
  difficulty: Difficulty;
  timeInMs: number;
  txHash?: string;
}

export function ShareButton({ difficulty, timeInMs, txHash }: ShareButtonProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  const handleShare = useCallback(() => {
    const text = `🧩 I just solved a ${config.gridSize}×${config.gridSize} (${config.name}) slide puzzle in ${formatTime(timeInMs)}!\n\nCan you beat my time? 🏆\n\n#SlidePuzzle #Base #MiniApp`;

    // Warpcast compose URL
    const encodedText = encodeURIComponent(text);
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodedText}`;

    window.open(warpcastUrl, '_blank');
  }, [config, timeInMs]);

  return (
    <button onClick={handleShare} className="btn-secondary w-full">
      📢 Share on Farcaster
    </button>
  );
}
