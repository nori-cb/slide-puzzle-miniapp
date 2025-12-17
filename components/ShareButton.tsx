'use client';

import { useCallback } from 'react';
import { Difficulty, DIFFICULTY_CONFIG, CONTRACT_ADDRESS } from '@/lib/contract';
import { formatTime } from '@/lib/puzzle';

interface ShareButtonProps {
  difficulty: Difficulty;
  timeInMs: number;
  isImageMode: boolean;
  tokenId?: number;
  txHash?: string;
}

export function ShareButton({ difficulty, timeInMs, isImageMode, tokenId, txHash }: ShareButtonProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  const handleShare = useCallback(() => {
    const puzzleMode = isImageMode ? 'Image' : 'Number';
    const appUrl = 'https://slide-puzzle-miniapp.vercel.app';
    const text = `🧩 I just solved a ${config.name} - ${puzzleMode} slide puzzle in ${formatTime(timeInMs)}!\n\nCan you beat my time? 🏆\n\nPlay here: ${appUrl}\n\n#SlidePuzzle #Base #MiniApp`;

    // Warpcast compose URL
    const encodedText = encodeURIComponent(text);
    let warpcastUrl = `https://warpcast.com/~/compose?text=${encodedText}`;

    // Add NFT embed if tokenId is available
    if (tokenId !== undefined) {
      const nftUrl = `https://opensea.io/assets/base/${CONTRACT_ADDRESS}/${tokenId}`;
      const encodedNFTUrl = encodeURIComponent(nftUrl);
      warpcastUrl += `&embeds[]=${encodedNFTUrl}`;
    }

    window.open(warpcastUrl, '_blank');
  }, [config, timeInMs, isImageMode, tokenId]);

  return (
    <button onClick={handleShare} className="btn-secondary w-full">
      📢 SHARE
    </button>
  );
}
