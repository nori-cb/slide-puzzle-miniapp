'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { Difficulty, DIFFICULTY_CONFIG, CONTRACT_ADDRESS, SLIDE_PUZZLE_ABI } from '@/lib/contract';
import { formatTime, shortenAddress } from '@/lib/puzzle';

interface LeaderboardProps {
  difficulty: Difficulty;
}

interface LeaderboardEntry {
  player: string;
  timeInMs: bigint;
  tokenId: bigint;
}

export function Leaderboard({ difficulty }: LeaderboardProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SLIDE_PUZZLE_ABI,
    functionName: 'getLeaderboard',
    args: [difficulty],
  });

  const entries = (data as LeaderboardEntry[] | undefined) || [];

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  };

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-white">
          🏆 Leaderboard
          <span className="ml-2 text-sm opacity-70">({config.name.toUpperCase()})</span>
        </h3>
        <button
          onClick={() => refetch()}
          className="text-xs text-gray-400 hover:text-puzzle-accent transition-colors"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-8">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No records yet. Be the first!
        </div>
      ) : (
        <div className="space-y-0">
          {entries.map((entry, index) => (
            <div key={index} className="leaderboard-row">
              <div className="flex items-center gap-3">
                <div className={`rank-badge ${getRankClass(index + 1)}`}>
                  {index + 1}
                </div>
                <div className="font-mono text-sm">
                  {shortenAddress(entry.player)}
                </div>
              </div>
              <div className="font-mono text-puzzle-accent">
                {formatTime(Number(entry.timeInMs))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
