import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  const manifest = {
    accountAssociation: {
      header: 'eyJmaWQiOjM4NjkwOCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEE1MEZjYjA2ZDc1RDYwQTQ3M0RiZWE0NjMyYTFFQzcyZTg5YzdCZmIifQ',
      payload: 'eyJkb21haW4iOiJzbGlkZS1wdXp6bGUtbWluaWFwcC52ZXJjZWwuYXBwIn0',
      signature: 'WxYyqMtS/3/iY2hlYkYIRiSf+nn2+yOCgBUhGVa3iJgYIE1sSPs3qbdDhvAGroaAN/O0RGEbyxppJH0VxuxzGxw=',
    },
    miniapp: {
      version: '1',
      name: 'Slide Puzzle',
      subtitle: 'Classic puzzle game on Base',
      description: 'Solve slide puzzles, mint your record as NFT, and compete on the leaderboard!',
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#0a0a0f',
      primaryCategory: 'games',
      tags: ['puzzle', 'nft', 'leaderboard', 'base', 'onchain'],
      heroImageUrl: `${appUrl}/og-image.png`,
      tagline: 'Move, Solve, Mint',
      ogTitle: 'Slide Puzzle',
      ogDescription: 'Solve puzzles and mint your record as NFT!',
      ogImageUrl: `${appUrl}/og-image.png`,
    },
    baseBuilder: {
      ownerAddress: '0xc60d9F919D80594a38a22BDC6929d6A0AA8cD7De',
    },
  };

  return NextResponse.json(manifest);
}
