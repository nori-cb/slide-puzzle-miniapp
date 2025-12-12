// パズル画像の定義
export interface PuzzleImage {
  id: number;
  name: string;
  url: string; // ローカルプレビュー用
  ipfsHash: string; // IPFSハッシュ（CID）
}

// TODO: NFT.Storageにアップロード後、ipfsHashを更新
export const PUZZLE_IMAGES: readonly PuzzleImage[] = [
  {
    id: 0,
    name: 'Cute Cats',
    url: '/puzzle-images/CuteCats.png',
    ipfsHash: 'bafybeia2jo2snz7dqibqn6fqx6zcwvtob3ivhkhcidi7vkmyih256pfbpu',
  },
  // 将来的に画像を追加
  // {
  //   id: 1,
  //   name: 'Cute Cat',
  //   url: '/puzzle-images/cat.png',
  //   ipfsHash: 'bafybeig...',
  // },
  // {
  //   id: 2,
  //   name: 'Mountain Landscape',
  //   url: '/puzzle-images/landscape.png',
  //   ipfsHash: 'bafkreih...',
  // },
] as const;

/**
 * ランダムにパズル画像を選択
 */
export function getRandomPuzzleImage(): PuzzleImage {
  const randomIndex = Math.floor(Math.random() * PUZZLE_IMAGES.length);
  return PUZZLE_IMAGES[randomIndex];
}

/**
 * IDから画像を取得
 */
export function getPuzzleImageById(id: number): PuzzleImage | undefined {
  return PUZZLE_IMAGES.find((img) => img.id === id);
}
