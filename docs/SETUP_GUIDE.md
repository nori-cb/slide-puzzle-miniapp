# Slide Puzzle Master - セットアップガイド

> ブロックチェーン初心者向け・ステップバイステップガイド

## 目次

1. [はじめに（用語説明）](#1-はじめに用語説明)
2. [事前準備（アカウント作成）](#2-事前準備アカウント作成)
3. [開発環境の構築](#3-開発環境の構築)
4. [プロジェクトのセットアップ](#4-プロジェクトのセットアップ)
5. [スマートコントラクトのデプロイ](#5-スマートコントラクトのデプロイ)
6. [フロントエンドの設定とテスト](#6-フロントエンドの設定とテスト)
7. [本番公開](#7-本番公開)
8. [トラブルシューティング](#8-トラブルシューティング)

---

## 1. はじめに（用語説明）

この手順書で出てくる専門用語を最初に説明します。分からなくなったらここに戻ってきてください。

| 用語 | 説明 |
|------|------|
| **ブロックチェーン** | 改ざんできないデータベースのようなもの。世界中のコンピュータが同じデータを持ち、誰も勝手に変更できない。 |
| **スマートコントラクト** | ブロックチェーン上で動くプログラム。一度デプロイ（公開）すると自動で動き続ける。 |
| **ウォレット** | ブロックチェーン上の「財布」兼「身分証明書」。秘密鍵（パスワードのようなもの）で管理される。 |
| **ガス代** | ブロックチェーンを使うための手数料。処理を実行してくれるコンピュータへの報酬。 |
| **テストネット** | 練習用のブロックチェーン。本物のお金を使わずにテストできる。今回は「Base Sepolia」を使用。 |
| **メインネット** | 本番のブロックチェーン。本物のお金（暗号資産）が動く。 |
| **デプロイ** | プログラムをブロックチェーン上に公開すること。一度デプロイしたら削除・変更は基本的にできない。 |
| **NFT** | Non-Fungible Token。「唯一無二」を証明できるデジタルデータ。今回はクリア証明として使用。 |
| **秘密鍵** | ウォレットの「マスターパスワード」。**絶対に他人に教えてはいけない**。漏れると資産を全て盗まれる。 |
| **RPC** | Remote Procedure Call。ブロックチェーンと通信するためのエンドポイント（URL）。 |
| **ABI** | Application Binary Interface。スマートコントラクトの「取扱説明書」のようなもの。 |

---

## 2. 事前準備（アカウント作成）

以下のアカウントを事前に作成してください。**すべて無料**です。

### 2.1 必要なアカウント一覧

| サービス | 用途 | URL |
|---------|------|-----|
| **Coinbase Wallet** | ウォレット（テスト用） | https://wallet.coinbase.com |
| **Vercel** | フロントエンドのホスティング | https://vercel.com |
| **GitHub** | ソースコード管理 | https://github.com |
| **Warpcast** | Farcasterアカウント | https://warpcast.com |

### 2.2 Coinbase Walletの作成

1. https://wallet.coinbase.com にアクセス
2. 「Create new wallet」をクリック
3. パスワードを設定
4. **リカバリーフレーズ（12個の英単語）をメモ**
   - ⚠️ **このフレーズは絶対に他人に見せないでください**
   - ⚠️ **紙に書いて安全な場所に保管してください**
5. ウォレット作成完了

### 2.3 テスト用ETHの入手

テストネットでは「フォーセット（Faucet）」という仕組みで無料のテスト用ETHをもらえます。

1. Coinbase Walletでウォレットのアドレス（`0x...`で始まる文字列）をコピー
2. Base Sepolia Faucet にアクセス: https://www.alchemy.com/faucets/base-sepolia
3. ウォレットアドレスを入力して「Send Me ETH」をクリック
4. 数秒〜数分でETHが届きます

> ⚠️ **注意**: テスト用ETHは本物のお金ではありません。テストネットでのみ使えます。

---

## 3. 開発環境の構築

> ⚠️ **Windowsユーザーへ**: このガイドでは **WSL（Windows Subsystem for Linux）** を使用します。Web3開発ではUnix系環境の方がトラブルが少なく、長期的に見て開発が楽になります。

### 3.1 必要なソフトウェア

| ソフトウェア | 用途 |
|-------------|------|
| **WSL2** (Windows) | Linux環境 |
| **Node.js** (v18以上) | JavaScript実行環境 |
| **Git** | バージョン管理 |
| **Foundry** | スマートコントラクト開発ツール |
| **VS Code** | コードエディタ |

### 3.2 WSL2のインストール（Windowsのみ）

既にWindowsにNode.jsやGitがインストールされていても、WSL内に別途インストールします。Windows環境とWSL環境は独立しているため、共存しても問題ありません。

#### ステップ1: WSL2を有効化

PowerShellを **管理者として実行** し、以下を入力:

```powershell
wsl --install
```

インストールが完了したら、PCを**再起動**してください。

#### ステップ2: Ubuntuの初期設定

再起動後、自動的にUbuntuが起動します（または「Ubuntu」アプリをスタートメニューから起動）。

初回起動時にユーザー名とパスワードを設定します:

```
Enter new UNIX username: あなたの好きなユーザー名
New password: パスワード（入力しても表示されません）
Retype new password: もう一度パスワード
```

> 💡 **ヒント**: このパスワードは `sudo` コマンド実行時に使います。忘れないようにメモしてください。

#### ステップ3: パッケージの更新

Ubuntuターミナルで以下を実行:

```bash
sudo apt update && sudo apt upgrade -y
```

### 3.3 Node.jsのインストール

WSLターミナル（Ubuntu）で以下を実行します。nvm（Node Version Manager）を使うと、バージョン管理が楽になります。

```bash
# nvmをインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# シェルを再読み込み
source ~/.bashrc

# Node.js 20をインストール
nvm install 20

# デフォルトに設定
nvm alias default 20
```

確認:

```bash
node --version
# → v20.x.x

npm --version
# → 10.x.x
```

### 3.4 Gitのインストール

WSLのUbuntuには最初からGitが入っていますが、念のため最新版に更新:

```bash
sudo apt install git -y
```

確認:

```bash
git --version
# → git version 2.x.x
```

初期設定（あなたの情報に置き換えてください）:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3.5 Foundryのインストール

Foundryはスマートコントラクトの開発・テスト・デプロイを行うツールです。

```bash
# Foundryをインストール
curl -L https://foundry.paradigm.xyz | bash

# シェルを再読み込み
source ~/.bashrc

# Foundryツールをダウンロード
foundryup
```

確認:

```bash
forge --version
# → forge 0.2.0 以上が表示されればOK
```

### 3.6 VS Codeのセットアップ

VS CodeはWindows側にインストールし、WSLに接続して使います。

#### ステップ1: VS Codeのインストール（Windows側）

https://code.visualstudio.com からダウンロードしてインストール。

#### ステップ2: WSL拡張機能のインストール

1. VS Codeを起動
2. 左側の拡張機能アイコン（四角が4つ）をクリック
3. 「WSL」で検索
4. 「WSL」（Microsoft製）をインストール

#### ステップ3: 動作確認

WSLターミナルで以下を実行して、VS Codeが開くか確認します:

```bash
# ホームディレクトリに移動
cd ~

# VS Codeを開く
code .
```

初回は自動的にVS Code Serverがインストールされます（少し時間がかかります）。

VS Codeが開いたら、左下に **「WSL: Ubuntu」** と表示されていることを確認してください。これが表示されていれば、WSL内のファイルを編集できる状態です。

> 💡 **ヒント**: 今後、プロジェクトフォルダで `code .` を実行すれば、そのフォルダがVS Codeで開きます。

### 3.7 作業フォルダの準備

WSLターミナル（Ubuntuアプリ）で開発用フォルダを作成します。

```bash
# ホームディレクトリに移動
cd ~

# 開発用フォルダを作成
mkdir -p projects
cd projects

# 現在地を確認
pwd
# → /home/あなたのユーザー名/projects
```

> 💡 **ヒント**: VS Codeを開いている場合は、VS Code内のターミナル（`Ctrl + @`で開く）でも同じコマンドを実行できます。どちらで実行しても結果は同じです。

### 3.8 インストール確認まとめ

すべてが正しくインストールされたか確認:

```bash
echo "=== 環境確認 ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
echo "Forge: $(forge --version)"
```

以下のように表示されれば成功です:

```
=== 環境確認 ===
Node.js: v20.x.x
npm: 10.x.x
Git: git version 2.x.x
Forge: forge 0.2.0 (xxxxxxx 2024-xx-xx...)
```

---

## 4. プロジェクトのセットアップ

### 4.1 プロジェクトファイルの展開

#### 方法A: Windows側でダウンロードしてWSLにコピー

1. Windows側で `slide-puzzle-miniapp.zip` をダウンロード（例: `C:\Users\あなた\Downloads\`）
2. WSLターミナルで以下を実行:

```bash
# 作業ディレクトリに移動
cd ~/projects

# Windowsのダウンロードフォルダからコピー
# 「あなた」の部分を実際のWindowsユーザー名に置き換え
cp /mnt/c/Users/あなた/Downloads/slide-puzzle-miniapp.zip .

# 解凍
unzip slide-puzzle-miniapp.zip

# プロジェクトフォルダに移動
cd slide-puzzle-miniapp
```

#### 方法B: GitHubからクローン（リポジトリがある場合）

```bash
cd ~/projects
git clone https://github.com/あなた/slide-puzzle-miniapp.git
cd slide-puzzle-miniapp
```

### 4.2 依存関係のインストール

以下のコマンドで必要なライブラリをインストールします（数分かかります）。

```bash
npm install
```

成功すると以下のようなメッセージが表示されます:

```
added XXX packages in XXs
```

### 4.3 フォルダ構成の確認

```bash
ls -la
```

以下のような構成になっていればOKです:

```
slide-puzzle-miniapp/
├── app/           # 画面のコード
├── components/    # 部品（パズル、タイマー等）
├── contracts/     # スマートコントラクト
├── docs/          # ドキュメント
├── lib/           # ロジック・設定
├── providers/     # ウォレット接続設定
└── public/        # 静的ファイル
```

### 4.4 VS Codeで開く

```bash
code .
```

VS Codeが開き、左下に「WSL: Ubuntu」と表示されていれば正しく接続されています。

### 4.5 補足: WindowsエクスプローラーからWSLのファイルにアクセスする

WSL内のファイルはWindowsエクスプローラーからも見ることができます。

1. エクスプローラーのアドレスバーに以下を入力:
   ```
   \\wsl$\Ubuntu\home\あなたのユーザー名\projects
   ```
2. Enterキーを押す

ただし、**ファイルの編集はVS Code（WSL接続）で行うことを推奨**します。Windowsアプリで直接編集すると、改行コードの問題などが発生することがあります。

---

## 5. スマートコントラクトのデプロイ

> ⚠️ **重要**: この手順では秘密鍵を使用します。秘密鍵は**絶対に他人に見せないでください**。GitHubにも**絶対に公開しないでください**。

### 5.1 Foundryプロジェクトの準備

新しいフォルダを作成してFoundryプロジェクトを初期化します。

```bash
# projectsフォルダに移動（slide-puzzle-miniappと同階層）
cd ~/projects

# 現在のディレクトリ構成を確認
ls
# → slide-puzzle-miniapp

# Foundryプロジェクト用のフォルダを作成
mkdir slide-puzzle-contracts
cd slide-puzzle-contracts

# Foundryプロジェクトを初期化
forge init

# 構成確認
ls
# → foundry.toml  lib  script  src  test
```

この時点でのディレクトリ構成:

```
~/projects/
├── slide-puzzle-miniapp/     # フロントエンド
└── slide-puzzle-contracts/   # スマートコントラクト ← 今ここ
```

### 5.2 OpenZeppelinライブラリのインストール

```bash
forge install OpenZeppelin/openzeppelin-contracts
```

### 5.3 remappings.txtの作成

ライブラリのパスを設定します。

```bash
echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' > remappings.txt
```

### 5.4 コントラクトファイルのコピー

`slide-puzzle-miniapp/contracts/SlidePuzzleNFT.sol` を `slide-puzzle-contracts/src/` にコピーします。

```bash
# ~/projects/slide-puzzle-contracts にいることを確認
pwd
# → /home/あなた/projects/slide-puzzle-contracts

# コントラクトファイルをコピー
cp ../slide-puzzle-miniapp/contracts/SlidePuzzleNFT.sol src/

# コピーされたか確認
ls src/
# → Counter.sol  SlidePuzzleNFT.sol
```

> 💡 `Counter.sol` は `forge init` で自動生成されたサンプルファイルです。削除しても構いません。

### 5.5 コンパイル（コードをチェック）

```bash
forge build
```

成功すると以下が表示されます:

```
[⠒] Compiling...
[⠒] Compiling X files with solc X.X.X
[⠒] Solc X.X.X finished in X.XXs
Compiler run successful!
```

エラーが出た場合は、エラーメッセージを確認してください。

### 5.6 秘密鍵の取得

1. Coinbase Wallet を開く
2. 設定（歯車アイコン）→「セキュリティとプライバシー」
3. 「秘密鍵を表示」→ パスワード入力
4. 表示された秘密鍵（`0x...`で始まる長い文字列）をコピー

> ⚠️ **警告**: この秘密鍵は**絶対に**以下のことをしないでください:
> - 他人に教える
> - Slackやメールで送る
> - GitHubにコミットする
> - スクリーンショットを撮る

### 5.7 テストネット（Base Sepolia）へのデプロイ

```bash
forge create --rpc-url https://sepolia.base.org \
  --private-key あなたの秘密鍵 \
  --broadcast \
  src/SlidePuzzleNFT.sol:SlidePuzzleNFT
```

> 💡 **ヒント**: `あなたの秘密鍵` の部分を、先ほどコピーした秘密鍵に置き換えてください。

### 5.8 デプロイ結果の確認

成功すると以下のような情報が表示されます:

```
Deployer: 0x1234...5678
Deployed to: 0xabcd...ef01  ← これがコントラクトアドレス！
Transaction hash: 0x9876...5432
```

> 📝 **重要**: `Deployed to:` の後のアドレスを**必ずメモ**してください。次の手順で使います。

### 5.9 デプロイの確認（オプション）

BaseScan（ブロックチェーンエクスプローラー）でデプロイを確認できます:

```
https://sepolia.basescan.org/address/あなたのコントラクトアドレス
```

---

## 6. フロントエンドの設定とテスト

### 6.1 環境変数の設定

1. `slide-puzzle-miniapp` フォルダに移動

```bash
cd ~/projects/slide-puzzle-miniapp
```

2. `.env.example` をコピーして `.env.local` を作成

```bash
cp .env.example .env.local
```

3. `.env.local` をエディタで開き、以下を設定

```env
# テストネットを使用
NEXT_PUBLIC_NETWORK=testnet

# ローカル開発時はそのまま
NEXT_PUBLIC_URL=http://localhost:3000
```

> 💡 **ヒント**: 公開RPCエンドポイント（https://sepolia.base.org）を使用するため、APIキーは不要です。

### 6.2 コントラクトアドレスの設定

1. `lib/contract.ts` をエディタで開く
2. `CONTRACT_ADDRESS` を先ほどデプロイしたアドレスに変更

```typescript
// 変更前
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// 変更後（あなたのアドレスに置き換え）
export const CONTRACT_ADDRESS = '0xabcd...ef01' as const;
```

### 6.3 ローカルでテスト

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて動作確認します。

### 6.3 確認項目

- [ ] 難易度ボタン（Easy / Normal / Hard）が押せる
- [ ] パズルのピースをクリックして動かせる
- [ ] 最初のピースを動かすとタイマーが動き始める
- [ ] パズルを解くと「PUZZLE SOLVED!」と表示される
- [ ] 「Connect Wallet to Mint」ボタンが表示される

### 6.4 ウォレット接続のテスト

1. 「Connect Wallet to Mint」ボタンをクリック
2. Coinbase Walletが起動する
3. 接続を承認
4. ネットワークが「Base Sepolia」になっていることを確認

### 6.5 NFTミントのテスト

1. パズルをクリア
2. 「🎨 Mint NFT & Join Leaderboard」をクリック
3. ウォレットでトランザクションを承認
4. 「✅ NFT Minted Successfully!」が表示されれば成功

---

## 7. 本番公開

### 7.1 GitHubにプッシュ

#### リポジトリの作成

1. https://github.com にログイン
2. 右上の「+」→「New repository」
3. Repository name: `slide-puzzle-miniapp`
4. Private（推奨）または Public を選択
5. 「Create repository」をクリック

#### コードをプッシュ

```bash
cd slide-puzzle-miniapp

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/slide-puzzle-miniapp.git
git push -u origin main
```

#### GitHub認証について

`git push` 時にユーザー名とパスワードを聞かれます。

```
Username: （GitHubのユーザー名）
Password: （Personal Access Token）
```

**パスワードにはGitHubのログインパスワードではなく、Personal Access Token (PAT) が必要です。**

1. https://github.com/settings/tokens にアクセス
2. 「Generate new token」→「Generate new token (classic)」をクリック
3. Note: 任意の名前（例: `slide-puzzle`）
4. Expiration: 適切な有効期限を選択
5. Select scopes: `repo` にチェック
6. 「Generate token」をクリック
7. 生成されたトークンをコピー（**一度しか表示されません**）
8. `git push` 時のPassword欄にこのトークンを貼り付け

### 7.2 Vercelにデプロイ

1. https://vercel.com にログイン（GitHubアカウントで）
2. 「Add New...」→「Project」をクリック
3. 「Import Git Repository」でリポジトリを選択
4. Framework Preset: **Next.js** を選択
5. **Environment Variables** をクリックして以下を追加:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_NETWORK` | `testnet` または `mainnet` |
| `NEXT_PUBLIC_URL` | デプロイ後に更新（後述） |

6. 「Deploy」ボタンをクリック

数分でデプロイが完了し、以下のようなURLが発行されます:

```
https://slide-puzzle-miniapp.vercel.app
```

#### URLの環境変数を更新

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」
3. `NEXT_PUBLIC_URL` を実際のデプロイURLに更新
4. 「Redeploy」で再デプロイ

### 7.3 Farcaster Manifestの設定

プロジェクトには既にFarcaster Manifest用のAPIルート（`app/.well-known/farcaster.json/route.ts`）が含まれています。本番公開時に `accountAssociation` を設定する必要があります。

#### accountAssociation の取得

1. アプリがVercelにデプロイされていることを確認
2. https://www.base.dev/preview?tab=account にアクセス
3. 「App URL」にデプロイしたURL（例: `https://slide-puzzle-miniapp.vercel.app`）を入力
4. 「Submit」→「Verify」の手順に従う
5. 生成された `accountAssociation` オブジェクトをコピー

#### route.tsの更新

`app/.well-known/farcaster.json/route.ts` を開き、`accountAssociation` を更新:

```typescript
const manifest = {
  accountAssociation: {
    header: 'ここにコピーしたheader',
    payload: 'ここにコピーしたpayload',
    signature: 'ここにコピーしたsignature',
  },
  // ... 以下はそのまま
};
```

更新後、GitHubにプッシュして再デプロイしてください。

#### 動作確認

https://www.base.dev/preview でアプリURLを入力し、以下を確認:
- 「Account association」タブで認証が成功している
- 「Metadata」タブでメタデータが正しく表示される
- 「Launch」ボタンでアプリが起動する

### 7.4 本番ネットワーク（Base Mainnet）への切り替え

> ⚠️ **注意**: 本番ネットワークでは**本物のお金（ETH）**がかかります。十分にテストしてから実行してください。

#### 1. コントラクトを本番にデプロイ

```bash
cd ~/projects/slide-puzzle-contracts

forge create --rpc-url https://mainnet.base.org \
  --private-key あなたの秘密鍵 \
  --broadcast \
  src/SlidePuzzleNFT.sol:SlidePuzzleNFT
```

#### 2. フロントエンドの設定を更新

`lib/contract.ts` のアドレスを本番用に変更:

```typescript
export const CONTRACT_ADDRESS = '本番のコントラクトアドレス' as const;
```

#### 3. Vercelの環境変数を更新

Vercelダッシュボードで `NEXT_PUBLIC_NETWORK` を `mainnet` に変更。

#### 4. 再デプロイ

```bash
cd ~/projects/slide-puzzle-miniapp
git add .
git commit -m "Switch to mainnet"
git push
```

Vercelが自動的に再デプロイします。

---

## 8. トラブルシューティング

### よくあるエラーと解決方法

#### 「insufficient funds」エラー

**原因**: ウォレットにガス代を払うためのETHがない

**解決方法**:
- テストネット: Faucetから追加のETHを取得
- メインネット: 取引所でETHを購入してウォレットに送金

#### 「nonce too low」エラー

**原因**: トランザクションの順序に問題がある

**解決方法**:
1. しばらく待ってから再試行
2. ウォレットの「トランザクション履歴」で前のトランザクションが完了しているか確認

#### コンパイルエラー

**原因**: Solidityのバージョンや依存関係の問題

**解決方法**:
```bash
# 依存関係を再インストール
forge install

# キャッシュをクリア
forge clean
forge build
```

#### 「Contract not found」エラー

**原因**: コントラクトアドレスが間違っている、またはネットワークが違う

**解決方法**:
1. `lib/contract.ts` のアドレスが正しいか確認
2. ウォレットのネットワークがコントラクトと同じか確認
   - テストネット: Base Sepolia
   - メインネット: Base

#### ミントが失敗する

**原因**: 様々な可能性

**確認項目**:
1. ウォレットが接続されているか
2. 正しいネットワークに接続しているか
3. ガス代のETHが十分にあるか
4. コントラクトアドレスが正しいか

#### リーダーボードが表示されない

**原因**: コントラクトからの読み取りに失敗している

**解決方法**:
1. ブラウザのコンソール（F12）でエラーを確認
2. ネットワーク接続を確認
3. コントラクトアドレスが正しいか確認

---

## お疲れさまでした！ 🎉

これでSlide Puzzle Masterのデプロイが完了です。

### 次のステップ

- [ ] 友達にシェアして遊んでもらう
- [ ] Farcasterでアプリを宣伝する
- [ ] Phase 2の機能（Very Hard、Hell難易度）を追加する
- [ ] カスタム画像パズル機能を実装する

### サポート

問題が発生した場合:

1. このドキュメントの[トラブルシューティング](#8-トラブルシューティング)を確認
2. Base公式ドキュメント: https://docs.base.org
3. MiniKitドキュメント: https://docs.base.org/builderkits/minikit/overview
