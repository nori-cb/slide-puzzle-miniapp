# Slide Puzzle Master - 仕様書

> Version 1.2 | Base Mini App

## 目次

1. [アプリ概要](#1-アプリ概要)
2. [機能一覧](#2-機能一覧)
3. [技術構成](#3-技術構成)
4. [プロジェクト構成](#4-プロジェクト構成)
5. [動作フロー](#5-動作フロー)
6. [スマートコントラクト仕様](#6-スマートコントラクト仕様)
7. [フロントエンド仕様](#7-フロントエンド仕様)
8. [画面構成](#8-画面構成)
9. [将来の拡張予定](#9-将来の拡張予定)
10. [注意事項・制限](#10-注意事項制限)

---

## 1. アプリ概要

### 1.1 アプリの目的

Slide Puzzle Master は、Base ブロックチェーン上で動作するスライドパズルゲームです。プレイヤーはパズルを解き、そのクリアタイムをNFT（デジタル証明書）としてブロックチェーン上に記録できます。

### 1.2 コンセプト

| コンセプト | 説明 |
|-----------|------|
| **Play to Prove** | 金銭的報酬ではなく「記録を証明する」ことに価値を置く |
| **シンプル & アクセシブル** | 誰でも遊べるカジュアルなゲーム性 |
| **ソーシャル連携** | Farcaster（分散型SNS）でスコアを共有し競い合う |

### 1.3 ターゲットユーザー

- Farcaster / Warpcast ユーザー
- Base ブロックチェーンに興味のある人
- カジュアルにNFTを体験したい人

---

## 2. 機能一覧

### 2.1 ゲーム機能

#### ゲームモード

| モード | 説明 |
|--------|------|
| Number Mode | 伝統的な数字パズル。開始後は「?」で隠される |
| Image Mode | IPFS上の画像を使ったパズル。現在は「Cute Cats」画像を使用 |

各モードは独立したリーダーボードを持ち、NFTにもモード情報が記録されます。

#### 難易度設定

| 難易度 | グリッドサイズ | ピース数 | 目安時間 |
|--------|---------------|----------|----------|
| Easy | 3×3 | 8 | 数十秒〜数分 |
| Normal | 4×4 | 15 | 数分〜十数分 |
| Hard | 5×5 | 24 | 十数分〜 |

#### パズルの仕様

- **シャッフル方式**: 完成状態から実際のスライド操作を300回シミュレートすることで、必ず解ける配置を生成
- **Startボタン**: パズル開始前に▶ Startボタンを押す必要がある
  - 開始前は数字が表示され、配置を記憶できる
  - Start押下後は数字が「?」で隠される
  - Start押下と同時にタイマースタート
- **タイマー**: Startボタン押下でスタート、完成でストップ（ミリ秒単位、MM:SS.CC形式で表示）
- **移動回数**: カウント表示（NFTに記録される）
- **操作方法**: PointerEvent APIによるスワイプ/ドラッグ操作
  - マウスとタッチを統一的に処理
  - 空きマスに向かってスワイプすることで、その列/行全体を同時移動
  - 複数タイルの一括スライドが可能
- **Give Upボタン**: プレイ中にリタイアしてパズルをリセット可能

#### チュートリアルモーダル

- **初回起動時に自動表示**: localStorage使用（`slidepuzzle_tutorial_seen`）
- **再表示機能**: 右上の「?」ボタンでいつでも再表示可能
- **内容**: ゴールの図と操作方法の説明

### 2.2 NFTミント機能

パズルをクリアすると、その記録をNFT（Non-Fungible Token）として発行できます。

#### NFTに記録される情報

- プレイヤーのウォレットアドレス
- 難易度（Easy / Normal / Hard）
- ゲームモード（Number / Image）
- クリアタイム（ミリ秒単位、MM:SS.CC形式で表示）
- 移動回数
- IPFS画像ハッシュ（Imageモードのみ）
- ミント日時

#### NFT画像（オンチェーンSVG）

NFTの画像はブロックチェーン上で動的に生成されます（外部サーバー不要）。

| 難易度 | 背景色 |
|--------|--------|
| Easy | 緑系 (#2d5a27) |
| Normal | 青系 (#1e3a5f) |
| Hard | 赤系 (#7f1d1d) |

**Image Mode特有の要素:**
- IPFS画像を`https://ipfs.io/ipfs/[hash]`形式で埋め込み
- OpenSeaなどのNFTマーケットプレイスで正しく表示

**Number Mode特有の要素:**
- パズルグリッド表示（Rubikフォント、font-weight: 900使用）

### 2.3 リーダーボード機能

- 難易度別・モード別にトップ10を表示（Easy-Number, Easy-Image, Normal-Number, Normal-Image, Hard-Number, Hard-Image の6種類）
- NFTをミントした人のみがランキングに登録される
- クリアタイムが短い順にランク付け
- ミント成功後に自動リフレッシュ

### 2.4 Farcaster連携

NFTミント後、Farcaster（分散型SNS）に結果をCast（投稿）できます。

---

## 3. 技術構成

### 3.1 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │ Puzzle   │ │ Timer    │ │ Mint     │ │ Leaderboard   │   │
│  │ Component│ │ Component│ │ Button   │ │ Component     │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            MiniKit / Wagmi (Wallet Integration)       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JSON-RPC
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Base Blockchain (Ethereum L2)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SlidePuzzleNFT Contract                  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────────┐  │   │
│  │  │ mint()      │ │ Leaderboard │ │ On-chain SVG   │  │   │
│  │  │ ERC-721     │ │ Storage     │ │ Generation     │  │   │
│  │  └─────────────┘ └─────────────┘ └────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 技術スタック

| レイヤー | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **Frontend** | Next.js | 14.x | Reactフレームワーク |
| | React | 18.x | UIライブラリ |
| | TypeScript | 5.x | 型安全なJavaScript |
| | Tailwind CSS | 3.x | スタイリング |
| **Web3** | OnchainKit | latest | CoinbaseのWeb3 UIコンポーネント |
| | Farcaster Frame SDK | latest | @farcaster/frame-sdk, @farcaster/frame-wagmi-connector |
| | Wagmi | 2.x | React用Web3フック |
| | Viem | 2.x | Ethereumクライアント |
| **Smart Contract** | Solidity | 0.8.20 | コントラクト言語 |
| | OpenZeppelin | 5.x | セキュアなコントラクトライブラリ |
| **Blockchain** | Base | - | Ethereum L2 |
| **Hosting** | Vercel | - | フロントエンドホスティング |

---

## 4. プロジェクト構成

### 4.1 ディレクトリ構造

```
slide-puzzle-miniapp/
├── app/                          # Next.js App Router
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # ルートレイアウト
│   └── page.tsx                  # メインページ
│
├── components/                   # Reactコンポーネント
│   ├── SlidePuzzle.tsx           # パズル本体
│   ├── Timer.tsx                 # タイマー表示
│   ├── DifficultySelector.tsx    # 難易度選択UI
│   ├── Leaderboard.tsx           # ランキング表示
│   ├── MintButton.tsx            # NFTミントボタン
│   ├── ShareButton.tsx           # Farcaster共有ボタン
│   └── TutorialModal.tsx         # チュートリアルモーダル
│
├── lib/                          # ユーティリティ・設定
│   ├── contract.ts               # コントラクトABI・アドレス
│   └── puzzle.ts                 # パズルロジック
│
├── providers/                    # Reactプロバイダー
│   └── Providers.tsx             # OnchainKit/Wagmi/ReactQuery設定
│
├── contracts/                    # スマートコントラクト
│   └── SlidePuzzleNFT.sol        # NFTコントラクト
│
├── public/                       # 静的ファイル
│   └── .well-known/              # Farcaster manifest用
│
├── package.json                  # 依存関係
├── tailwind.config.js            # Tailwind設定
├── tsconfig.json                 # TypeScript設定
└── next.config.js                # Next.js設定
```

### 4.2 各ファイル・フォルダの詳細

#### `/app` - Next.js App Router

| ファイル | 説明 |
|---------|------|
| `globals.css` | Tailwind CSSのインポート、カスタムCSSクラス（`.puzzle-tile`, `.btn-primary`等）、フォント設定 |
| `layout.tsx` | HTMLの基本構造、メタデータ（OGP）、Providersのラップ |
| `page.tsx` | ゲームのメイン画面。状態管理（難易度、ゲーム状態、タイム）とコンポーネントの配置 |

#### `/components` - UIコンポーネント

| ファイル | 説明 | Props |
|---------|------|-------|
| `SlidePuzzle.tsx` | パズルボードの表示と操作。PointerEvent APIでスワイプ/ドラッグ処理、複数タイル同時移動、完成判定 | `difficulty`, `onStart`, `onComplete`, `onGiveUp`, `isPlaying` |
| `Timer.tsx` | 経過時間の表示（10ms間隔で更新） | `isRunning`, `onTimeUpdate`, `reset` |
| `DifficultySelector.tsx` | Easy/Normal/Hardボタンの表示 | `selected`, `onChange`, `disabled` |
| `Leaderboard.tsx` | トップ10ランキングの表示。コントラクトから読み取り。自動リフレッシュ機能 | `difficulty`, `refreshTrigger` |
| `MintButton.tsx` | OnchainKitのTransaction/TransactionButtonを使用。ウォレット接続とNFTミント処理。Farcaster内で自動接続を試みる | `difficulty`, `timeInMs`, `onMintSuccess` |
| `ShareButton.tsx` | FarcasterへのCast投稿 | `difficulty`, `timeInMs` |
| `TutorialModal.tsx` | 初回起動時に表示されるチュートリアル。localStorageで既読管理 | `onClose` |

#### `/lib` - ロジック・設定

| ファイル | 説明 |
|---------|------|
| `contract.ts` | コントラクトアドレス、ABI定義、難易度Enum、設定オブジェクト |
| `puzzle.ts` | パズルロジック（シャッフル、移動判定、完成判定、時間フォーマット） |

#### `/providers` - グローバル設定

| ファイル | 説明 |
|---------|------|
| `Providers.tsx` | OnchainKitProvider、WagmiProvider、ReactQueryクライアント。farcasterFrameコネクターを優先配置 |

#### `/contracts` - スマートコントラクト

| ファイル | 説明 |
|---------|------|
| `SlidePuzzleNFT.sol` | ERC-721 NFTコントラクト。ミント、リーダーボード、オンチェーンSVG生成 |

---

## 5. 動作フロー

### 5.1 ゲームプレイフロー

```
┌─────────────────────────────────────────────────────────────┐
│                      ユーザーアクション                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. 難易度選択                                                │
│    DifficultySelector で Easy/Normal/Hard を選択            │
│    → page.tsx の state 更新                                 │
│    → SlidePuzzle が新しいグリッドサイズでリセット            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. パズル表示                                                │
│    SlidePuzzle.tsx                                          │
│    - shuffleBoard() で必ず解ける配置を生成                   │
│    - グリッドサイズに応じたタイルを表示（数字が見える）       │
│    - isReady=false の状態（記憶フェーズ）                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ゲーム開始（Startボタン押下）                             │
│    - handleStart() → setIsReady(true)                       │
│    - タイルの数字が「?」で隠される                            │
│    - onStart() コールバック → Timer 開始                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. パズル操作                                                │
│    - PointerEvent API: onPointerDown/onPointerUp            │
│    - スワイプ方向を判定（getSwipeDirection）                 │
│    - slideTiles() で複数タイル同時移動                       │
│    - 10ms間隔で Timer 更新                                   │
│    - 移動回数カウント                                        │
│    - Give Upボタンでリタイア可能                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. 完成判定                                                  │
│    - isSolved() で [1,2,3,...,n,0] の並びか確認             │
│    - true → onComplete() → Timer 停止、finalTime 記録      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 NFTミントフロー

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ウォレット接続                                            │
│    MintButton.tsx                                           │
│    - Farcaster内では自動接続を試みる（farcasterFrame）       │
│    - useAccount() で接続状態確認                             │
│    - 未接続 → OnchainKitのConnectWalletボタン表示           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ミントトランザクション作成                                 │
│    - OnchainKit Transaction/TransactionButton使用           │
│    - encodeFunctionData で mint(difficulty, timeInMs) 呼出  │
│    - ウォレットで署名リクエスト表示                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. トランザクション送信                                       │
│    Frontend → JSON-RPC → Base Network                       │
│    - ガス代支払い（ETH）                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. コントラクト実行                                          │
│    SlidePuzzleNFT.mint()                                    │
│    - _safeMint() で NFT 発行                                │
│    - puzzleRecords[tokenId] に記録保存                      │
│    - _updateLeaderboard() でランキング更新                  │
│    - PuzzleSolved イベント発行                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. 完了処理                                                  │
│    - onStatus コールバックで status.statusName='success'    │
│    - hasMinted=true に設定                                  │
│    - onMintSuccess() → leaderboardRefresh 更新              │
│    - Leaderboardコンポーネントが自動的にrefetch()実行        │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 リーダーボード更新フロー

```
┌─────────────────────────────────────────────────────────────┐
│ コントラクト内部: _updateLeaderboard()                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. 挿入位置の探索                                            │
│    - leaderboards[difficulty] を先頭から走査                │
│    - timeInMs < board[i].timeInMs となる位置を探す          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ランクイン判定                                            │
│    - 挿入位置 >= MAX_LEADERBOARD_SIZE(10) → ランク外で終了  │
│    - 挿入位置 < 10 → ランクイン処理へ                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. 配列操作                                                  │
│    - 配列長 < 10 → push() で拡張                            │
│    - 挿入位置以降を1つ後ろにシフト                           │
│    - 挿入位置に新エントリを配置                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. イベント発行                                              │
│    LeaderboardUpdated(difficulty, player, timeInMs, rank)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. スマートコントラクト仕様

### 6.1 コントラクト概要

| 項目 | 値 |
|------|-----|
| コントラクト名 | SlidePuzzleNFT |
| 規格 | ERC-721 (OpenZeppelin) |
| Solidity | ^0.8.20 |
| ライセンス | MIT |

### 6.2 データ構造

```solidity
// 難易度Enum
enum Difficulty {
    Easy,      // 0: 3x3
    Normal,    // 1: 4x4
    Hard,      // 2: 5x5
    VeryHard,  // 3: 6x6 (Phase 2)
    Hell       // 4: 7x7 (Phase 2)
}

// パズルタイプEnum
enum PuzzleType {
    Number,    // 0: 数字モード
    Image      // 1: 画像モード
}

// NFTごとの記録
struct PuzzleRecord {
    address player;           // プレイヤーアドレス
    Difficulty difficulty;    // 難易度
    uint256 timeInMs;         // クリアタイム（ミリ秒）
    uint256 timestamp;        // ミント日時（UNIXタイムスタンプ）
    PuzzleType puzzleType;    // パズルタイプ
    uint256 moveCount;        // 移動回数
    string imageIpfsHash;     // IPFS画像ハッシュ（Imageモードのみ）
}

// リーダーボードエントリ
struct LeaderboardEntry {
    address player;           // プレイヤーアドレス
    uint256 timeInMs;         // クリアタイム
    uint256 tokenId;          // NFTのトークンID
}
```

### 6.3 ストレージ

| 変数名 | 型 | 説明 |
|--------|-----|------|
| `_nextTokenId` | `uint256` | 次に発行するトークンID |
| `puzzleRecords` | `mapping(uint256 => PuzzleRecord)` | トークンID → 記録 |
| `leaderboards` | `mapping(bytes32 => LeaderboardEntry[])` | ハッシュ(難易度+タイプ) → ランキング配列 |
| `MAX_LEADERBOARD_SIZE` | `uint256` | 10（定数） |

### 6.4 関数一覧

#### 外部関数（ユーザーが呼び出す）

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `mint` | `difficulty`, `timeInMs`, `puzzleType`, `moveCount`, `imageIpfsHash` | `tokenId` | NFTをミントしリーダーボードを更新 |
| `getLeaderboard` | `difficulty`, `puzzleType` | `LeaderboardEntry[]` | 指定難易度・タイプのランキングを取得 |
| `tokenURI` | `tokenId` | `string` | NFTメタデータ（Base64エンコードJSON + SVG） |
| `totalSupply` | - | `uint256` | 発行済NFT総数 |

#### 内部関数

| 関数 | 説明 |
|------|------|
| `_updateLeaderboard` | リーダーボードを更新（タイム順ソート挿入、難易度+タイプでハッシュ化） |
| `_getDifficultyName` | Difficulty Enum → 文字列変換 |
| `_getGridSize` | Difficulty Enum → "3x3"等の文字列変換 |
| `_formatTime` | ミリ秒 → "M:SS.CC"形式変換（小数点以下2桁） |
| `_generateSVG` | NFT画像のSVGを生成（Number/Imageモード対応） |
| `_getBackgroundColor` | 難易度に応じた背景色を返す |
| `_generatePuzzleGrid` | パズルグリッドのSVG要素を生成（Rubikフォント使用） |

### 6.5 イベント

```solidity
event PuzzleSolved(
    address indexed player,
    uint256 indexed tokenId,
    Difficulty difficulty,
    PuzzleType puzzleType,
    uint256 timeInMs
);

event LeaderboardUpdated(
    Difficulty indexed difficulty,
    PuzzleType indexed puzzleType,
    address indexed player,
    uint256 timeInMs,
    uint256 rank
);
```

### 6.6 NFTメタデータ形式

```json
{
  "name": "Slide Puzzle Master #0",
  "description": "Proof of solving a Easy - Number slide puzzle in 0:45.12 with 96 moves",
  "attributes": [
    { "trait_type": "Difficulty", "value": "Easy" },
    { "trait_type": "Grid Size", "value": "3x3" },
    { "trait_type": "Type", "value": "Number" },
    { "trait_type": "Moves", "value": 96 },
    { "trait_type": "Time (ms)", "value": 45120 },
    { "trait_type": "Time", "value": "0:45.12" }
  ],
  "image": "data:image/svg+xml;base64,..."
}
```

---

## 7. フロントエンド仕様

### 7.1 状態管理（page.tsx）

| State | 型 | 初期値 | 説明 |
|-------|-----|--------|------|
| `difficulty` | `Difficulty` | `Easy` | 選択中の難易度 |
| `gameState` | `'idle' \| 'playing' \| 'completed'` | `'idle'` | ゲーム状態 |
| `currentTime` | `number` | `0` | 現在の経過時間（ms） |
| `finalTime` | `number` | `0` | クリア時の確定タイム |
| `finalMoveCount` | `number` | `0` | クリア時の確定移動回数 |
| `resetTrigger` | `number` | `0` | パズルリセット用カウンター（Give Up時に更新） |
| `hasMinted` | `boolean` | `false` | NFTミント完了フラグ |
| `mintedTokenId` | `number \| undefined` | `undefined` | ミントされたトークンID |
| `isSDKLoaded` | `boolean` | `false` | Farcaster SDK初期化完了フラグ |
| `leaderboardRefresh` | `number` | `0` | リーダーボード自動更新トリガー |
| `isImageMode` | `boolean` | `false` | 画像モード有効フラグ |
| `selectedImage` | `PuzzleImage \| null` | `null` | 選択されたパズル画像 |
| `showTutorial` | `boolean` | - | チュートリアルモーダル表示状態（useTutorialフック） |

### 7.2 パズルロジック（lib/puzzle.ts）

#### シャッフルアルゴリズム

```typescript
function shuffleBoard(gridSize: number, moves: number = 300): Board {
  // 1. 完成状態 [1,2,3,...,n-1,0] を作成
  // 2. 300回ランダムに隣接タイルと空白をスワップ
  // 3. 直前の移動を戻さないようフィルタ（往復防止）
}
```

#### マルチタイルスライド

```typescript
function slideTiles(tileIndex: number, direction: SwipeDirection): boolean {
  // 1. スワイプ方向に空きマスがあるかチェック
  // 2. 移動するタイルのインデックスリストを生成
  // 3. 一斉にスライド（複数タイルを同時移動）
  // 4. 完成判定を実行
}
```

#### スワイプ方向判定

```typescript
function getSwipeDirection(startX, startY, endX, endY): SwipeDirection {
  // PointerEvent の座標から方向を判定
  // 最小スワイプ距離（15px）をチェック
  // 上下左右のいずれかを返す
}
```

#### 完成判定

```typescript
function isSolved(board: Board): boolean {
  // [1,2,3,...,n-1,0] の並びと一致するか確認
}
```

### 7.3 Web3フック（Wagmi）

| フック | 用途 |
|--------|------|
| `useAccount` | 接続中のウォレットアドレス取得 |
| `useConnect` | ウォレット接続処理（自動接続にも使用） |
| `useConnectors` | 利用可能なコネクター一覧取得（farcasterFrame検索） |
| `useDisconnect` | ウォレット切断 |
| `useReadContract` | コントラクトからの読み取り（リーダーボード取得） |

### 7.4 PointerEvent API

タッチとマウスを統一的に処理するため、PointerEvent APIを使用:

| イベント | 用途 |
|---------|------|
| `onPointerDown` | タイル上でドラッグ開始、座標とタイルインデックスを記録 |
| `onPointerUp` | ボード上でドラッグ終了、スワイプ方向を判定してスライド実行 |
| `onPointerLeave` | ボード外でドラッグ終了、同様にスワイプ処理 |

### 7.5 localStorage使用

| キー | 値 | 用途 |
|------|-----|------|
| `slidepuzzle_tutorial_seen` | `"true"` | チュートリアルモーダルの既読フラグ |

### 7.6 OnchainKit コンポーネント

| コンポーネント | 用途 |
|---------------|------|
| `Transaction` | トランザクション実行のラッパー |
| `TransactionButton` | トランザクション送信ボタン |
| `TransactionStatus` | トランザクション状態表示 |
| `TransactionStatusLabel` | ステータスラベル |
| `TransactionStatusAction` | ステータスアクション |
| `ConnectWallet` | ウォレット接続ボタン |
| `Wallet` | ウォレット情報表示コンテナ |
| `Identity` | ユーザーアイデンティティ表示 |
| `Avatar` | ユーザーアバター |
| `Name` | ユーザー名/ENS名 |

### 7.7 スタイリング

#### カスタムCSSクラス（globals.css）

| クラス | 説明 |
|--------|------|
| `.puzzle-tile` | パズルタイルの基本スタイル |
| `.difficulty-badge` | 難易度ボタン（.easy, .normal, .hard） |
| `.timer-display` | タイマー表示（大きなフォント、グロー効果） |
| `.btn-primary` | メインアクションボタン（緑、グロー） |
| `.btn-secondary` | サブアクションボタン（枠線のみ） |
| `.game-card` | カード型コンテナ |
| `.leaderboard-row` | ランキング行 |

#### カラーパレット

| 変数 | 値 | 用途 |
|------|-----|------|
| `puzzle-bg` | #0a0a0f | 背景 |
| `puzzle-card` | #14141f | カード背景 |
| `puzzle-border` | #2a2a3a | 枠線 |
| `puzzle-accent` | #00ff88 | アクセントカラー |
| `puzzle-easy` | #2d5a27 | Easy難易度 |
| `puzzle-normal` | #1e3a5f | Normal難易度 |
| `puzzle-hard` | #5c2d5c | Hard難易度 |

---

## 8. 画面構成

### 8.1 メイン画面レイアウト

```
┌────────────────────────────────────┐
│          SLIDE PUZZLE              │  ← タイトル
│        Solve • Mint • Compete      │
├────────────────────────────────────┤
│   [Easy]  [Normal]  [Hard]         │  ← 難易度選択
├────────────────────────────────────┤
│            0:00.000                │  ← タイマー
├────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  ┌───┬───┬───┐              │   │
│  │  │ 1 │ 2 │ 3 │              │   │
│  │  ├───┼───┼───┤              │   │  ← パズルエリア
│  │  │ 4 │ 5 │ 6 │              │   │
│  │  ├───┼───┼───┤              │   │
│  │  │ 7 │ 8 │   │              │   │
│  │  └───┴───┴───┘              │   │
│  │        Moves: 0              │   │
│  │     [Reset Puzzle]           │   │
│  └─────────────────────────────┘   │
├────────────────────────────────────┤
│         🏆 Leaderboard             │
│  ┌────────────────────────────┐    │
│  │ 1. 0x1234...abcd  0:32.456 │    │  ← リーダーボード
│  │ 2. 0x5678...efgh  0:45.789 │    │
│  │ ...                        │    │
│  └────────────────────────────┘    │
├────────────────────────────────────┤
│      Built on Base with MiniKit    │  ← フッター
└────────────────────────────────────┘
```

### 8.2 クリア後の画面

```
├────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │    🎉 PUZZLE SOLVED! 🎉     │   │
│  └─────────────────────────────┘   │
├────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │      Your Record            │   │
│  │         Easy                │   │  ← 記録表示
│  │       0:45.123              │   │
│  └─────────────────────────────┘   │
│                                    │
│  [🎨 Mint NFT & Join Leaderboard]  │  ← ミントボタン
│  [📢 Share on Farcaster]           │  ← シェアボタン
│  [🔄 Play Again]                   │  ← リプレイボタン
├────────────────────────────────────┤
```

---

## 9. 将来の拡張予定（Phase 2）

| 機能 | 説明 |
|------|------|
| Very Hard (6×6) | 35ピースの超難問 |
| Hell (7×7) | 48ピースの地獄級 |
| カスタム画像パズル | 任意の画像をパズルにする機能 |
| デイリーチャレンジ | 日替わりのシード固定パズル |
| マルチプレイ | リアルタイム対戦 |

---

## 10. 注意事項・制限

### 10.1 技術的制限

| 項目 | 説明 |
|------|------|
| **不正対策なし** | クリアタイムの検証機能は実装されていません。悪意あるユーザーが偽のタイムを送信することは技術的に可能です。 |
| **オフチェーン計測** | タイマーはフロントエンド（ブラウザ）で計測しています。ブロックチェーン上での検証は行っていません。 |

### 10.2 利用時の注意

| 項目 | 説明 |
|------|------|
| **ガス代** | NFTミント時にはBaseネットワークのガス代（手数料）がかかります。通常は数セント程度です。 |
| **ウォレット必須** | NFTミントにはCoinbase Walletなどのウォレットが必要です。 |
| **ネットワーク** | Base Mainnet または Base Sepolia（テストネット）で動作します。 |

### 10.3 セキュリティ

| 項目 | 対策 |
|------|------|
| **コントラクト** | OpenZeppelin の監査済みライブラリを使用 |
| **秘密鍵** | フロントエンドでは秘密鍵を扱わない（ウォレット経由） |
| **入力検証** | コントラクト側で difficulty の範囲チェック（Enum） |
