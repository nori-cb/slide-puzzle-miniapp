import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  const manifest = {
    // accountAssociation は本番デプロイ後に Base Build で生成して追加
    // https://www.base.dev/preview?tab=account
    accountAssociation: {
      header: '',
      payload: '',
      signature: '',
    },
    frame: {
      version: '1',
      name: 'Slide Puzzle',
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#0a0a0f',
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return NextResponse.json(manifest);
}
