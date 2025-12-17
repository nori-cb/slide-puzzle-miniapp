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
  {
    id: 1,
    name: 'Summer Girl',
    url: '/puzzle-images/SummerGirl.png',
    ipfsHash: 'bafybeiauucnga5lci5oaos6l3zlwzoo2hexgsmqysjmyrr4lnfdsmslck4',
  },
  {
    id: 2,
    name: 'Xmas Violin Boy',
    url: '/puzzle-images/XmasViolinBoy.png',
    ipfsHash: 'bafybeiemjdaipmolnqgnk44hpe6zt7acunkg7nhvbao73cn66zz3tljnje',
  },
  {
    id: 3,
    name: 'Sleeping Cat',
    url: '/puzzle-images/SleepingCat.png',
    ipfsHash: 'bafybeicvnqgcgwg62426bdtpx52zal7jd7shesqgnymf5zs6moopqbgssi',
  },
  {
    id: 4,
    name: 'Fantastic Mountain',
    url: '/puzzle-images/FantasticMountain.png',
    ipfsHash: 'bafybeidpn7ciniqhn74dqopowlltg5ahy6qcbncwtgtewkwmnfrt33grwm',
  },
  {
    id: 5,
    name: 'Dress Miku',
    url: '/puzzle-images/DressMiku.png',
    ipfsHash: 'bafybeia63rsdykbfu3c5lole564pnzeghymcs6hwb6kkhtlrn5sswxr6bm',
  },
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
