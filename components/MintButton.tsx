'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useDisconnect, useConnect, useConnectors, usePublicClient } from 'wagmi';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import {
  ConnectWallet,
  Wallet,
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';
import { Difficulty, DIFFICULTY_CONFIG, CONTRACT_ADDRESS, SLIDE_PUZZLE_ABI } from '@/lib/contract';
import { formatTime } from '@/lib/puzzle';
import { encodeFunctionData, decodeEventLog } from 'viem';
import { baseSepolia, base } from 'viem/chains';

interface MintButtonProps {
  difficulty: Difficulty;
  timeInMs: number;
  moveCount: number;
  isImageMode: boolean;
  imageIpfsHash: string;
  onMintSuccess?: (txHash: string, tokenId?: number) => void;
}

// 環境変数でネットワークを切り替え
const chain = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base : baseSepolia;

export function MintButton({ difficulty, timeInMs, moveCount, isImageMode, imageIpfsHash, onMintSuccess }: MintButtonProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const publicClient = usePublicClient();
  const [hasMinted, setHasMinted] = useState(false);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  // Farcaster内では自動接続を試みる
  useEffect(() => {
    if (!isConnected && !autoConnectAttempted) {
      setAutoConnectAttempted(true);
      const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
      if (farcasterConnector) {
        connect({ connector: farcasterConnector });
      }
    }
  }, [isConnected, autoConnectAttempted, connectors, connect]);

  const handleOnStatus = useCallback(async (status: LifecycleStatus) => {
    console.log('Transaction status:', status.statusName, status.statusData);
    if (status.statusName === 'success') {
      setHasMinted(true);
      const txHash = (status.statusData as { transactionReceipts?: { transactionHash: string; logs?: any[] }[] })?.transactionReceipts?.[0]?.transactionHash;
      const logs = (status.statusData as { transactionReceipts?: { transactionHash: string; logs?: any[] }[] })?.transactionReceipts?.[0]?.logs;

      let tokenId: number | undefined;

      // Extract tokenId from PuzzleSolved event
      if (logs && logs.length > 0) {
        try {
          // Find the PuzzleSolved event
          for (const log of logs) {
            try {
              const decodedLog = decodeEventLog({
                abi: SLIDE_PUZZLE_ABI,
                data: log.data,
                topics: log.topics,
              });

              if (decodedLog.eventName === 'PuzzleSolved' && decodedLog.args) {
                tokenId = Number((decodedLog.args as any).tokenId);
                break;
              }
            } catch (e) {
              // Skip logs that don't match our ABI
              continue;
            }
          }
        } catch (error) {
          console.error('Error decoding logs:', error);
        }
      }

      if (txHash) {
        onMintSuccess?.(txHash, tokenId);
      }
    }
  }, [onMintSuccess]);

  // トランザクションのcalls
  const puzzleType = isImageMode ? 1 : 0; // 0: Number, 1: Image

  const mintCalls = [
    {
      to: CONTRACT_ADDRESS as `0x${string}`,
      data: encodeFunctionData({
        abi: SLIDE_PUZZLE_ABI,
        functionName: 'mint',
        args: [difficulty, BigInt(timeInMs), puzzleType, BigInt(moveCount), imageIpfsHash],
      }),
    },
  ];

  if (!isConnected) {
    return (
      <div className="w-full">
        <Wallet>
          <ConnectWallet className="btn-primary w-full">
            <span>Connect Wallet to Mint</span>
          </ConnectWallet>
        </Wallet>
      </div>
    );
  }

  if (hasMinted) {
    return (
      <div className="text-center">
        <div className="text-puzzle-accent font-display text-lg mb-2">
          ✅ NFT Minted Successfully!
        </div>
        <div className="text-sm text-gray-400">
          Check your wallet for the NFT
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 接続中のウォレット表示 */}
      <div className="flex items-center justify-between bg-puzzle-card rounded-lg px-3 py-2">
        <Identity address={address} className="flex items-center gap-2">
          <Avatar className="w-6 h-6" />
          <Name className="text-white text-sm" />
        </Identity>
        <button
          onClick={() => disconnect()}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* 記録表示 */}
      <div className="game-card text-center">
        <div className="text-gray-400 text-sm mb-2">Your Record</div>
        <div className="font-display text-xl text-white mb-1">
          {config.name} - {isImageMode ? 'Image' : 'Number'}
        </div>
        <div className="timer-display text-3xl">{formatTime(timeInMs)}</div>
        <div className="text-gray-400 text-lg mt-2">Moves: {moveCount}</div>
      </div>

      {/* ミントボタン */}
      <Transaction
        chainId={chain.id}
        calls={mintCalls}
        onStatus={handleOnStatus}
        capabilities={{
          dataSuffix: {
            enabled: true,
            value: '0x6263005f6673396b716336' // "bc_fs9gkqc6" in hex
          }
        }}
      >
        <TransactionButton
          className="btn-primary w-full"
          text="🎨 Mint NFT & Join Leaderboard"
        />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  );
}
