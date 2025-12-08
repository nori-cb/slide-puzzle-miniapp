# Slide Puzzle Master - Base Mini App

スライドパズルを解いて、クリアタイムをNFTとしてミント。リーダーボードで競い合おう！

## 機能

- 🧩 3つの難易度（Easy 3×3, Normal 4×4, Hard 5×5）
- ⏱️ ミリ秒単位のタイム計測
- 🎨 クリア時にオンチェーンNFTをミント
- 🏆 難易度別リーダーボード（トップ10）
- 📢 Farcasterでシェア
- 📖 初回起動時の操作チュートリアル
- 👆 スワイプ/ドラッグで複数タイルを同時スライド
- ▶️ 記憶フェーズ（Startボタンで開始）
- 🏳️ Give Upボタンでリタイア可能
- 🔄 自動ウォレット接続（Farcaster内）

## 操作方法

1. **難易度選択**: Easy/Normal/Hardから選択
2. **記憶**: パズルの配置を確認（数字が表示されている状態）
3. **開始**: ▶ Startボタンを押すと数字が「?」に隠され、タイマースタート
4. **操作**: タイルをスワイプ/ドラッグして移動
   - 複数のタイルを一度にスライド可能
   - 空きマスに向かってスワイプすることで、その列/行全体が移動
5. **完成**: 1から順番に並べるとクリア
6. **ミント**: NFTとして記録を保存し、リーダーボードに登録

## クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集:

```env
# testnet（テスト用）または mainnet（本番用）
NEXT_PUBLIC_NETWORK=testnet

# デプロイ後のURL（ローカル開発時はそのまま）
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. スマートコントラクトのデプロイ

詳細は [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) を参照。

```bash
# Foundryプロジェクトを作成
mkdir slide-puzzle-contracts && cd slide-puzzle-contracts
forge init
forge install OpenZeppelin/openzeppelin-contracts
echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' > remappings.txt

# コントラクトをコピーしてデプロイ
cp ../contracts/SlidePuzzleNFT.sol src/
forge create --rpc-url https://sepolia.base.org \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast \
  src/SlidePuzzleNFT.sol:SlidePuzzleNFT
```

### 4. コントラクトアドレスの更新

`lib/contract.ts` の `CONTRACT_ADDRESS` をデプロイしたアドレスに更新:

```typescript
export const CONTRACT_ADDRESS = '0x...your deployed address...' as const;
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリを確認。

## 本番デプロイ

### Vercelにデプロイ

1. GitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

### Farcaster Manifest設定

デプロイ後:

1. https://www.base.dev/preview?tab=account にアクセス
2. アプリURLを入力して `accountAssociation` を生成
3. `app/.well-known/farcaster.json/route.ts` に認証情報を追加

## プロジェクト構成

```
slide-puzzle-miniapp/
├── app/
│   ├── .well-known/farcaster.json/  # Farcaster manifest
│   ├── globals.css                   # グローバルスタイル
│   ├── layout.tsx                    # ルートレイアウト
│   └── page.tsx                      # メインゲーム画面
├── components/
│   ├── SlidePuzzle.tsx               # パズルUI
│   ├── Timer.tsx                     # タイマー
│   ├── DifficultySelector.tsx        # 難易度選択
│   ├── Leaderboard.tsx               # リーダーボード
│   ├── MintButton.tsx                # NFTミント
│   ├── ShareButton.tsx               # Farcaster共有
│   └── TutorialModal.tsx             # チュートリアル
├── lib/
│   ├── contract.ts                   # コントラクトABI/アドレス
│   └── puzzle.ts                     # パズルロジック
├── providers/
│   └── Providers.tsx                 # OnchainKit/Wagmi設定
├── contracts/
│   └── SlidePuzzleNFT.sol            # スマートコントラクト
└── public/
    ├── og-image.svg                  # OGP画像
    └── splash.svg                    # スプラッシュ画像
```

## 技術スタック

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Web3**:
  - OnchainKit (Transaction/Wallet/Identity コンポーネント)
  - Farcaster Frame SDK (@farcaster/frame-sdk, @farcaster/frame-wagmi-connector)
  - Wagmi 2.x (React Hooks for Ethereum)
  - Viem 2.x (TypeScript Ethereum client)
- **Smart Contract**: Solidity 0.8.20, OpenZeppelin
- **Blockchain**: Base (Ethereum L2)
- **Hosting**: Vercel

## ドキュメント

- [仕様書](./docs/SPECIFICATION.md) - 機能仕様、技術仕様、動作フロー
- [セットアップガイド](./docs/SETUP_GUIDE.md) - 初心者向けステップバイステップガイド

## ライセンス

MIT
