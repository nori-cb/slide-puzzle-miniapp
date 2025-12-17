# Slide Puzzle Master - Base Mini App

スライドパズルを解いて、クリアタイムをNFTとしてミント。リーダーボードで競い合おう！

## 機能

- 🧩 3つの難易度（Easy 3×3, Normal 4×4, Hard 5×5）
- 🎮 2つのゲームモード（Number / Image）
- ⏱️ ミリ秒単位のタイム計測
- 📊 移動回数のカウント
- 🎨 クリア時にNFTをミント
- 🏆 難易度別・モード別リーダーボード（トップ10）
- 📢 Base App/Farcasterでシェア
- 📖 初回起動時の操作チュートリアル
- 👆 スワイプで複数タイルを同時移動
- 🏳️ Give Upボタンでリタイア可能
- 🔄 自動ウォレット接続（Farcaster内）
- 開始前は「?」マークで隠される

## ゲームモード

### Number Mode（数字モード）
- 伝統的なスライドパズル
- タイルに数字が表示される

### Image Mode（画像モード）
- IPFS上の画像を使ったパズル
- ランダムで画像が変わる

## NFTの特徴

### 記録される情報
- プレイヤーのウォレットアドレス
- 難易度（Easy / Normal / Hard）
- ゲームモード（Number / Image）
- クリアタイム（ミリ秒精度、MM:SS.CC形式で表示）
- 移動回数
- IPFS画像ハッシュ（Imageモードのみ）
- ミント日時

### オンチェーンSVG画像
- 難易度別の背景色（Easy: 緑、Normal: 青、Hard: 赤）
- Number Mode: パズルグリッド表示、クリアタイム、移動回数、モードを含む
- Image Mode: IPFS画像表示

## 操作方法

2. **難易度選択**: Easy/Normal/Hardから選択
1. **モード選択**: 画面上部のトグルでNumber/Imageを選択
4. **開始**: ▶ Startボタンを押すとプレイ開始（タイマー開始）
5. **操作**: タイルをスワイプして移動
   - 複数のタイルを一度にスライド可能
   - 空きマスに向かってスワイプすることで、その列/行全体が移動
6. **完成**: 1から順番にZ方向に並べ終わるとクリア
7. **ミント**: NFTとして記録を保存し、リーダーボードに登録

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
│   ├── puzzle.ts                     # パズルロジック
│   └── puzzleImages.ts               # パズル画像定義（IPFS）
├── providers/
│   └── Providers.tsx                 # OnchainKit/Wagmi設定
├── contracts/
│   └── SlidePuzzleNFT.sol            # スマートコントラクト
├── public/
│   ├── og-image.png                  # OGP画像
│   ├── splash.png                    # スプラッシュ画像
│   ├── icon.png                      # アプリアイコン
│   └── puzzle-images/                # パズル画像アセット
└── docs/
    ├── SPECIFICATION.md              # 詳細仕様書
    └── SETUP_GUIDE.md                # セットアップガイド
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
- **Storage**: IPFS (画像ストレージ)
- **Hosting**: Vercel
- **Contract Deployment**: Foundry

## ドキュメント

- [仕様書](./docs/SPECIFICATION.md) - 機能仕様、技術仕様、動作フロー
- [セットアップガイド](./docs/SETUP_GUIDE.md) - 初心者向けステップバイステップガイド

## ライセンス

MIT
