'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { Difficulty, DIFFICULTY_CONFIG, CONTRACT_ADDRESS, SLIDE_PUZZLE_ABI } from '@/lib/contract';
import { formatTime, shortenAddress } from '@/lib/puzzle';
import { Name } from '@coinbase/onchainkit/identity';

interface LeaderboardProps {
  difficulty: Difficulty;
  isImageMode: boolean;
  refreshTrigger?: number;
}

interface LeaderboardEntry {
  player: string;
  timeInMs: bigint;
  tokenId: bigint;
}

export function Leaderboard({ difficulty, refreshTrigger, isImageMode }: LeaderboardProps) {
  const puzzleType = isImageMode ? 1 : 0;
  const config = DIFFICULTY_CONFIG[difficulty];

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SLIDE_PUZZLE_ABI,
    functionName: 'getLeaderboard',
    args: [difficulty, puzzleType],
  });

  // refreshTriggerが変更されたらリフレッシュ
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const rawEntries = (data as LeaderboardEntry[] | undefined) || [];

  // 各プレイヤーの最高記録のみを保持（時間が最も短いもの）
  const entries = rawEntries.reduce((acc, entry) => {
    const existingIndex = acc.findIndex(e => e.player.toLowerCase() === entry.player.toLowerCase());

    if (existingIndex === -1) {
      // 新しいプレイヤー
      acc.push(entry);
    } else {
      // 既存のプレイヤー - より良い記録なら置き換え
      if (entry.timeInMs < acc[existingIndex].timeInMs) {
        acc[existingIndex] = entry;
      }
    }

    return acc;
  }, [] as LeaderboardEntry[]);

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  };

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-white">
            🏆 Leaderboard
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {config.name} - {isImageMode ? 'Image' : 'Number'}
          </p>
        </div>
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
                <div className="text-sm min-w-0">
                  <Name
                    address={entry.player as `0x${string}`}
                    className="text-white"
                  />
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
