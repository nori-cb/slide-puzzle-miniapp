import type { Metadata } from 'next';
import { Providers } from '@/providers/Providers';
import '@coinbase/onchainkit/styles.css';
import './globals.css';

const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Slide Puzzle | Base Mini App',
  description: 'Solve slide puzzles, mint your record as NFT, and compete on the leaderboard!',
  openGraph: {
    title: 'Slide Puzzle',
    description: 'Solve slide puzzles, mint your record as NFT, and compete on the leaderboard!',
    images: [`${appUrl}/og-image.png`],
  },
  other: {
    'base:app_id': '694233d8d19763ca26ddc380',
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: `${appUrl}/og-image.png`,
      button: {
        title: 'Play Slide Puzzle',
        action: {
          type: 'launch_frame',
          name: 'Slide Puzzle',
          url: appUrl,
          splashImageUrl: `${appUrl}/splash.png`,
          splashBackgroundColor: '#0a0a0f',
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
