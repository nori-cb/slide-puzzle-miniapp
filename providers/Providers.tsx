'use client';

import { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'viem/chains';

// 環境変数でネットワークを切り替え
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
const chain = isMainnet ? base : baseSepolia;
const rpcUrl = isMainnet ? 'https://mainnet.base.org' : 'https://sepolia.base.org';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
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
  );
}
