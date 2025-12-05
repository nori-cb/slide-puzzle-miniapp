// パズルボードの型定義
export type Board = number[];

// 完成状態のボードを生成
export function createSolvedBoard(gridSize: number): Board {
  const board: Board = [];
  for (let i = 1; i < gridSize * gridSize; i++) {
    board.push(i);
  }
  board.push(0); // 0 = 空白
  return board;
}

// ボードが完成状態かチェック
export function isSolved(board: Board): boolean {
  const gridSize = Math.sqrt(board.length);
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

// 空白タイルのインデックスを取得
export function getEmptyIndex(board: Board): number {
  return board.indexOf(0);
}

// 隣接するインデックスを取得
export function getNeighbors(index: number, gridSize: number): number[] {
  const neighbors: number[] = [];
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;

  if (row > 0) neighbors.push(index - gridSize); // 上
  if (row < gridSize - 1) neighbors.push(index + gridSize); // 下
  if (col > 0) neighbors.push(index - 1); // 左
  if (col < gridSize - 1) neighbors.push(index + 1); // 右

  return neighbors;
}

// タイルが移動可能かチェック
export function canMove(board: Board, tileIndex: number): boolean {
  const gridSize = Math.sqrt(board.length);
  const emptyIndex = getEmptyIndex(board);
  const neighbors = getNeighbors(emptyIndex, gridSize);
  return neighbors.includes(tileIndex);
}

// タイルを移動
export function moveTile(board: Board, tileIndex: number): Board {
  if (!canMove(board, tileIndex)) return board;

  const newBoard = [...board];
  const emptyIndex = getEmptyIndex(board);
  [newBoard[emptyIndex], newBoard[tileIndex]] = [newBoard[tileIndex], newBoard[emptyIndex]];
  return newBoard;
}

// ボードをシャッフル（必ず解ける状態を保証）
export function shuffleBoard(gridSize: number, moves: number = 300): Board {
  let board = createSolvedBoard(gridSize);
  let emptyIndex = getEmptyIndex(board);
  let lastMove = -1;

  for (let i = 0; i < moves; i++) {
    const neighbors = getNeighbors(emptyIndex, gridSize);
    // 直前の移動を戻さないようにフィルタ
    const validMoves = neighbors.filter((n) => n !== lastMove);
    const randomNeighbor = validMoves[Math.floor(Math.random() * validMoves.length)];

    [board[emptyIndex], board[randomNeighbor]] = [board[randomNeighbor], board[emptyIndex]];
    lastMove = emptyIndex;
    emptyIndex = randomNeighbor;
  }

  return board;
}

// タイムをフォーマット (例: 1:23.456)
export function formatTime(timeInMs: number): string {
  const minutes = Math.floor(timeInMs / 60000);
  const seconds = Math.floor((timeInMs % 60000) / 1000);
  const ms = timeInMs % 1000;

  const secondsStr = seconds.toString().padStart(2, '0');
  const msStr = ms.toString().padStart(3, '0');

  return `${minutes}:${secondsStr}.${msStr}`;
}

// アドレスを短縮表示
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
