'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Board, shuffleBoard, isSolved, getEmptyIndex } from '@/lib/puzzle';
import { Difficulty, DIFFICULTY_CONFIG } from '@/lib/contract';

interface SlidePuzzleProps {
  difficulty: Difficulty;
  onStart: () => void;
  onComplete: () => void;
  onGiveUp?: () => void;
  isPlaying: boolean;
}

type SwipeDirection = 'up' | 'down' | 'left' | 'right' | null;

export function SlidePuzzle({ difficulty, onStart, onComplete, onGiveUp, isPlaying }: SlidePuzzleProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const gridSize = config.gridSize;

  const [board, setBoard] = useState<Board | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasGivenUp, setHasGivenUp] = useState(false);

  // スワイプ用の状態
  const dragState = useRef<{ x: number; y: number; index: number } | null>(null);

  // 初期化・難易度変更時にシャッフル
  useEffect(() => {
    setBoard(null);
    setMoveCount(0);
    setHasStarted(false);
    setIsComplete(false);
    setHasGivenUp(false);
    
    requestAnimationFrame(() => {
      setBoard(shuffleBoard(gridSize));
    });
  }, [gridSize]);

  const resetPuzzle = useCallback(() => {
    setBoard(null);
    setMoveCount(0);
    setHasStarted(false);
    setIsComplete(false);
    setHasGivenUp(false);
    
    requestAnimationFrame(() => {
      setBoard(shuffleBoard(gridSize));
    });
  }, [gridSize]);

  // リタイア処理
  const handleGiveUp = useCallback(() => {
    setHasGivenUp(true);
    onGiveUp?.();
  }, [onGiveUp]);

  // スワイプ方向を判定
  const getSwipeDirection = (startX: number, startY: number, endX: number, endY: number): SwipeDirection => {
    const dx = endX - startX;
    const dy = endY - startY;
    const minSwipeDistance = 15;

    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
      return null;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  // ⑤複数タイルを一斉にスライド
  const slideTiles = useCallback(
    (tileIndex: number, direction: SwipeDirection) => {
      if (!board || isComplete || !direction) return false;
      if (board[tileIndex] === 0) return false;

      const emptyIndex = getEmptyIndex(board);
      const tileRow = Math.floor(tileIndex / gridSize);
      const tileCol = tileIndex % gridSize;
      const emptyRow = Math.floor(emptyIndex / gridSize);
      const emptyCol = emptyIndex % gridSize;

      // スワイプ方向に空きスペースがあるかチェックし、移動するタイルのインデックスを取得
      const tilesToMove: number[] = [];

      if (direction === 'up' && emptyCol === tileCol && emptyRow < tileRow) {
        // 上方向: emptyRow+1 から tileRow までのタイルを上に移動
        for (let r = emptyRow + 1; r <= tileRow; r++) {
          tilesToMove.push(r * gridSize + tileCol);
        }
      } else if (direction === 'down' && emptyCol === tileCol && emptyRow > tileRow) {
        // 下方向: emptyRow-1 から tileRow までのタイルを下に移動
        for (let r = emptyRow - 1; r >= tileRow; r--) {
          tilesToMove.push(r * gridSize + tileCol);
        }
      } else if (direction === 'left' && emptyRow === tileRow && emptyCol < tileCol) {
        // 左方向: emptyCol+1 から tileCol までのタイルを左に移動
        for (let c = emptyCol + 1; c <= tileCol; c++) {
          tilesToMove.push(tileRow * gridSize + c);
        }
      } else if (direction === 'right' && emptyRow === tileRow && emptyCol > tileCol) {
        // 右方向: emptyCol-1 から tileCol までのタイルを右に移動
        for (let c = emptyCol - 1; c >= tileCol; c--) {
          tilesToMove.push(tileRow * gridSize + c);
        }
      }

      if (tilesToMove.length === 0) return false;

      if (!hasStarted) {
        setHasStarted(true);
        onStart();
      }

      // 一斉に移動
      const newBoard = [...board];
      let currentEmpty = emptyIndex;

      for (const idx of tilesToMove) {
        [newBoard[currentEmpty], newBoard[idx]] = [newBoard[idx], newBoard[currentEmpty]];
        currentEmpty = idx;
      }

      setBoard(newBoard);
      setMoveCount((prev) => prev + tilesToMove.length);

      if (isSolved(newBoard)) {
        setIsComplete(true);
        onComplete();
      }
      return true;
    },
    [board, hasStarted, isComplete, gridSize, onStart, onComplete]
  );

  // タイル上でドラッグ開始
  const handleTilePointerDown = (e: React.PointerEvent, index: number) => {
    // ゲームプレイ中のみスワイプを処理
    if (!isPlaying && !hasStarted) return;
    if (isComplete || hasGivenUp || !board || board[index] === 0) return;
    
    e.preventDefault();
    dragState.current = {
      x: e.clientX,
      y: e.clientY,
      index,
    };
  };

  // ボード上でドラッグ終了（どこで離しても検知）
  const handleBoardPointerUp = (e: React.PointerEvent) => {
    if (!dragState.current) return;

    const { x, y, index } = dragState.current;
    const direction = getSwipeDirection(x, y, e.clientX, e.clientY);

    if (direction) {
      slideTiles(index, direction);
    }

    dragState.current = null;
  };

  // ボード外でもドラッグ終了を検知
  const handleBoardPointerLeave = (e: React.PointerEvent) => {
    if (!dragState.current) return;

    const { x, y, index } = dragState.current;
    const direction = getSwipeDirection(x, y, e.clientX, e.clientY);

    if (direction) {
      slideTiles(index, direction);
    }

    dragState.current = null;
  };

  // タイルサイズを計算
  const getTileSize = () => {
    const baseSize = 280;
    const gap = 4;
    return (baseSize - gap * (gridSize - 1)) / gridSize;
  };

  const tileSize = getTileSize();
  const fontSize = Math.max(16, Math.floor(tileSize / 2.5));

  if (!board) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative bg-puzzle-border rounded-xl p-2 flex items-center justify-center"
          style={{
            width: 280 + 16,
            height: 280 + 16,
          }}
        >
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* パズルボード */}
      <div
        className={`relative bg-puzzle-border rounded-xl p-2 select-none ${isPlaying && !isComplete && !hasGivenUp ? 'touch-none' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
          gap: '4px',
        }}
        onPointerUp={handleBoardPointerUp}
        onPointerLeave={handleBoardPointerLeave}
      >
        {board.map((value, index) => {
          const difficultyClass = difficulty === 0 ? 'tile-easy' : difficulty === 1 ? 'tile-normal' : 'tile-hard';
          return (
            <div
              key={index}
              onPointerDown={(e) => handleTilePointerDown(e, index)}
              className={`puzzle-tile ${difficultyClass} ${value === 0 ? 'empty' : ''} ${
                isComplete ? 'animate-celebrate' : ''
              } ${value !== 0 && isPlaying && !isComplete && !hasGivenUp ? 'cursor-grab active:cursor-grabbing' : ''}`}
              style={{
                width: tileSize,
                height: tileSize,
                fontSize: `${fontSize}px`,
                visibility: value === 0 ? 'hidden' : 'visible',
                userSelect: 'none',
              }}
            >
              {value !== 0 && value}
            </div>
          );
        })}
      </div>

      {/* 移動回数 */}
      <div className="text-gray-400 font-mono">
        Moves: <span className="text-white font-bold">{moveCount}</span>
      </div>

      {/* ④リタイア/リスタートボタン */}
      {isPlaying && !isComplete && !hasGivenUp && (
        <button onClick={handleGiveUp} className="btn-secondary text-sm">
          Give Up
        </button>
      )}

      {hasGivenUp && (
        <button onClick={resetPuzzle} className="btn-secondary text-sm">
          🔄 Restart
        </button>
      )}

      {/* クリアメッセージ */}
      {isComplete && (
        <div className="text-puzzle-accent font-display text-xl animate-pulse-glow px-4 py-2 rounded-lg">
          🎉 PUZZLE SOLVED! 🎉
        </div>
      )}
    </div>
  );
}
