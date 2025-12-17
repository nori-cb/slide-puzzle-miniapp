'use client';

import { useAccount, useDisconnect } from 'wagmi';
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
        <Identity address={address} className="flex items-center gap-2">
          <Avatar className="w-6 h-6" />
          <Name className="text-white text-sm" />
        </Identity>
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
