import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  const manifest = {
    accountAssociation: {
      header: '',
      payload: '',
      signature: '',
    },
    miniapp: {
      name: 'Slide Puzzle',
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#0a0a0f',
      homeUrl: appUrl,
    },
    baseBuilder: {
      ownerAddress: '0xc60d9F919D80594a38a22BDC6929d6A0AA8cD7De',
    },
  };

  return NextResponse.json(manifest);
}
