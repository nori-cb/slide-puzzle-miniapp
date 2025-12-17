'use client';

import { useState, useCallback, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { SlidePuzzle } from '@/components/SlidePuzzle';
import { Timer } from '@/components/Timer';
import { DifficultySelector } from '@/components/DifficultySelector';
import { Leaderboard } from '@/components/Leaderboard';
import { MintButton } from '@/components/MintButton';
import { ShareButton } from '@/components/ShareButton';
import { TutorialModal, useTutorial } from '@/components/TutorialModal';
import { WalletInfo } from '@/components/WalletInfo';
import { Difficulty } from '@/lib/contract';
import { getRandomPuzzleImage, type PuzzleImage } from '@/lib/puzzleImages';

type GameState = 'idle' | 'playing' | 'completed';

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [finalMoveCount, setFinalMoveCount] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [hasMinted, setHasMinted] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<number | undefined>(undefined);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [isImageMode, setIsImageMode] = useState(false); // 画像モード切り替え
  const [selectedImage, setSelectedImage] = useState<PuzzleImage | null>(null); // 選択された画像

  const { showTutorial, closeTutorial, openTutorial } = useTutorial();

  // Farcaster SDK初期化
  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready();
        setIsSDKLoaded(true);
      } catch (error) {
        // Farcaster外で実行されている場合はエラーになるが、無視してOK
        console.log('Farcaster SDK not available (running outside Farcaster)');
        setIsSDKLoaded(true);
      }
    };
    initSDK();
  }, []);

  const handleStart = useCallback(() => {
    setGameState('playing');
    setHasMinted(false);

    // Imageモードの場合、ランダムに画像を選択
    if (isImageMode) {
      const randomImage = getRandomPuzzleImage();
      setSelectedImage(randomImage);
    } else {
      setSelectedImage(null);
    }
  }, [isImageMode]);

  const handleComplete = useCallback((moveCount: number) => {
    setGameState('completed');
    setFinalTime(currentTime);
    setFinalMoveCount(moveCount);
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
    setMintedTokenId(undefined);
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleGiveUp = useCallback(() => {
    setGameState('idle');
    setCurrentTime(0);
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleMintSuccess = useCallback((txHash: string, tokenId?: number) => {
    setHasMinted(true);
    if (tokenId !== undefined) {
      setMintedTokenId(tokenId);
    }
    // リーダーボードを自動リフレッシュ
    setLeaderboardRefresh((prev) => prev + 1);
  }, []);

  const handleToggleMode = useCallback(() => {
    if (gameState === 'playing') return; // プレイ中は切り替え不可
    setIsImageMode((prev) => !prev);
    setResetTrigger((prev) => prev + 1); // パズルをリセット
  }, [gameState]);

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
          <h1 className="font-display text-3xl mb-2 rainbow-text">
            SLIDE PUZZLE
          </h1>
          <p className="text-gray-400 text-sm">
            Move • Solve • Mint
          </p>
        </div>

        {/* ウォレット情報 */}
        <WalletInfo />

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

        {/* モード切り替えタブ */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => {
                if (gameState !== 'playing' && isImageMode) {
                  handleToggleMode();
                }
              }}
              disabled={gameState === 'playing'}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                !isImageMode
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              } ${gameState === 'playing' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              Number
            </button>
            <button
              onClick={() => {
                if (gameState !== 'playing' && !isImageMode) {
                  handleToggleMode();
                }
              }}
              disabled={gameState === 'playing'}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                isImageMode
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              } ${gameState === 'playing' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              Image
            </button>
          </div>
        </div>

        {/* パズル */}
        <div className={`game-card mb-6 ${gameState === 'playing' ? 'touch-none' : ''}`}>
          <SlidePuzzle
            key={resetTrigger}
            difficulty={difficulty}
            onStart={handleStart}
            onComplete={handleComplete}
            onGiveUp={handleGiveUp}
            isPlaying={gameState === 'playing'}
            imageUrl={isImageMode && selectedImage ? selectedImage.url : undefined}
          />
        </div>

        {/* クリア後のアクション */}
        {gameState === 'completed' && (
          <div className="space-y-4 mb-6">
            <MintButton
              difficulty={difficulty}
              timeInMs={finalTime}
              moveCount={finalMoveCount}
              isImageMode={isImageMode}
              imageIpfsHash={selectedImage?.ipfsHash || ''}
              onMintSuccess={handleMintSuccess}
            />

            {hasMinted && (
              <ShareButton
                difficulty={difficulty}
                timeInMs={finalTime}
                isImageMode={isImageMode}
                tokenId={mintedTokenId}
              />
            )}

            <button onClick={handlePlayAgain} className="btn-secondary w-full">
              🔄 Play Again
            </button>
          </div>
        )}

        {/* リーダーボード */}
        <Leaderboard difficulty={difficulty} refreshTrigger={leaderboardRefresh} isImageMode={isImageMode} />

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
