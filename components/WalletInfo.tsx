'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import {
  ConnectWallet,
  Wallet,
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';

export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const getUserContext = async () => {
      try {
        const context = await sdk.context;
        if (context.user?.username) {
          setUsername(context.user.username);
        }
      } catch (error) {
        console.log('Failed to get user context:', error);
      }
    };
    getUserContext();
  }, []);

  if (!isConnected) {
    return (
      <div className="mb-6">
        <Wallet>
          <ConnectWallet className="btn-primary w-full">
            <span>Connect Wallet</span>
          </ConnectWallet>
        </Wallet>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between bg-puzzle-card rounded-lg px-4 py-3">
        {username ? (
          // Display username from Farcaster/Base App context
          <div className="flex items-center gap-2">
            <Identity address={address} className="flex items-center gap-2">
              <Avatar className="w-6 h-6" />
            </Identity>
            <span className="text-white text-sm">@{username}</span>
          </div>
        ) : (
          // Fallback to OnchainKit Name (Basename/ENS)
          <Identity address={address} className="flex items-center gap-2">
            <Avatar className="w-6 h-6" />
            <Name className="text-white text-sm" />
          </Identity>
        )}
        <button
          onClick={() => disconnect()}
          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
