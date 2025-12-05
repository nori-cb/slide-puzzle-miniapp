'use client';

import { ReactNode, useEffect, useState } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { coinbaseWallet, injected } from 'wagmi/connectors';

// 環境変数でネットワークを切り替え
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
const chain = isMainnet ? base : baseSepolia;
const rpcUrl = isMainnet ? 'https://mainnet.base.org' : 'https://sepolia.base.org';

const queryClient = new QueryClient();

// Wagmi設定（Farcasterコネクター優先）
const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(rpcUrl),
  },
  connectors: [
    farcasterFrame(),
    coinbaseWallet({ appName: 'Slide Puzzle' }),
    injected(),
  ],
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          chain={chain}
          rpcUrl={rpcUrl}
          config={{
            appearance: {
              name: 'Slide Puzzle',
              mode: 'dark',
              theme: 'default',
            },
            wallet: {
              display: 'modal',
              preference: 'all',
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
