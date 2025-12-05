'use client';

import { useState, useCallback, useEffect } from 'react';
import { SlidePuzzle } from '@/components/SlidePuzzle';
import { Timer } from '@/components/Timer';
import { DifficultySelector } from '@/components/DifficultySelector';
import { Leaderboard } from '@/components/Leaderboard';
import { MintButton } from '@/components/MintButton';
import { ShareButton } from '@/components/ShareButton';
import { TutorialModal, useTutorial } from '@/components/TutorialModal';
import { Difficulty } from '@/lib/contract';

type GameState = 'idle' | 'playing' | 'completed';

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [hasMinted, setHasMinted] = useState(false);
  
  const { showTutorial, closeTutorial, openTutorial } = useTutorial();

  const handleStart = useCallback(() => {
    setGameState('playing');
    setHasMinted(false);
  }, []);

  const handleComplete = useCallback(() => {
    setGameState('completed');
    setFinalTime(currentTime);
  }, [currentTime]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setGameState('idle');
    setCurrentTime(0);
    setFinalTime(0);
    setHasMinted(false);
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameState('idle');
    setCurrentTime(0);
    setFinalTime(0);
    setHasMinted(false);
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleMintSuccess = useCallback(() => {
    setHasMinted(true);
  }, []);

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8 relative">
          <button
            onClick={openTutorial}
            className="absolute right-0 top-0 w-8 h-8 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors flex items-center justify-center text-sm"
            aria-label="How to play"
          >
            ?
          </button>
          <h1 className="font-display text-3xl text-white mb-2">
            <span className="text-puzzle-accent">SLIDE</span> PUZZLE
          </h1>
          <p className="text-gray-400 text-sm">
            Solve • Mint • Compete
          </p>
        </div>

        {/* 難易度選択 */}
        <div className="mb-6">
          <DifficultySelector
            selected={difficulty}
            onChange={handleDifficultyChange}
            disabled={gameState === 'playing'}
          />
        </div>

        {/* タイマー */}
        <div className="mb-6">
          <Timer
            isRunning={gameState === 'playing'}
            onTimeUpdate={handleTimeUpdate}
            reset={resetTrigger}
          />
        </div>

        {/* パズル */}
        <div className="game-card mb-6">
          <SlidePuzzle
            key={resetTrigger}
            difficulty={difficulty}
            onStart={handleStart}
            onComplete={handleComplete}
            isPlaying={gameState === 'playing'}
          />
        </div>

        {/* クリア後のアクション */}
        {gameState === 'completed' && (
          <div className="space-y-4 mb-6">
            <MintButton
              difficulty={difficulty}
              timeInMs={finalTime}
              onMintSuccess={handleMintSuccess}
            />

            {hasMinted && (
              <ShareButton
                difficulty={difficulty}
                timeInMs={finalTime}
              />
            )}

            <button onClick={handlePlayAgain} className="btn-secondary w-full">
              🔄 Play Again
            </button>
          </div>
        )}

        {/* リーダーボード */}
        <Leaderboard difficulty={difficulty} />

        {/* フッター */}
        <footer className="text-center mt-8 text-gray-500 text-xs">
          <p>Built on Base with MiniKit</p>
        </footer>
      </div>

      {/* チュートリアルモーダル */}
      {showTutorial && <TutorialModal onClose={closeTutorial} />}
    </main>
  );
}
