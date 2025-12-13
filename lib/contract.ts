import { Abi } from 'viem';

// デプロイ後にこのアドレスを更新
//export const CONTRACT_ADDRESS = '0xF0fF4783fE53531aBAEfef67cE0f15c559E04a04' as const;
export const CONTRACT_ADDRESS = '0xbcC3a112c66cE729BB65434C6b4e6fFE93cf5347' as const;

export const SLIDE_PUZZLE_ABI: Abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'difficulty', type: 'uint8' },
      { internalType: 'uint256', name: 'timeInMs', type: 'uint256' },
      { internalType: 'uint8', name: 'puzzleType', type: 'uint8' },
      { internalType: 'uint256', name: 'moveCount', type: 'uint256' },
      { internalType: 'string', name: 'imageIpfsHash', type: 'string' },
    ],
    name: 'mint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'difficulty', type: 'uint8' },
      { internalType: 'uint8', name: 'puzzleType', type: 'uint8' },
    ],
    name: 'getLeaderboard',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'player', type: 'address' },
          { internalType: 'uint256', name: 'timeInMs', type: 'uint256' },
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        internalType: 'struct SlidePuzzleNFT.LeaderboardEntry[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'puzzleRecords',
    outputs: [
      { internalType: 'address', name: 'player', type: 'address' },
      { internalType: 'uint8', name: 'difficulty', type: 'uint8' },
      { internalType: 'uint256', name: 'timeInMs', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'uint8', name: 'puzzleType', type: 'uint8' },
      { internalType: 'uint256', name: 'moveCount', type: 'uint256' },
      { internalType: 'string', name: 'imageIpfsHash', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint8', name: 'difficulty', type: 'uint8' },
      { indexed: false, internalType: 'uint256', name: 'timeInMs', type: 'uint256' },
    ],
    name: 'PuzzleSolved',
    type: 'event',
  },
] as const;

// 難易度の定義
export enum Difficulty {
  Easy = 0,    // 3x3
  Normal = 1,  // 4x4
  Hard = 2,    // 5x5
}

export const DIFFICULTY_CONFIG = {
  [Difficulty.Easy]: {
    name: 'Easy',
    gridSize: 3,
    color: '#2d5a27',
  },
  [Difficulty.Normal]: {
    name: 'Normal',
    gridSize: 4,
    color: '#1e3a5f',
  },
  [Difficulty.Hard]: {
    name: 'Hard',
    gridSize: 5,
    color: '#5c2d5c',
  },
} as const;
