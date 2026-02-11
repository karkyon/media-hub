# 社内向けメディア管理システム - Frontend

Next.js 14 + TypeScript + Tailwind CSSで構築されたフロントエンドアプリケーションです。

## 🚀 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **HTTPクライアント**: Axios
- **状態管理**: React Hooks

## 📁 プロジェクト構成

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # ルートレイアウト
│   │   ├── page.tsx             # トップページ（一覧）
│   │   ├── contents/
│   │   │   └── [id]/page.tsx   # 詳細ページ
│   │   └── globals.css          # グローバルCSS
│   ├── components/
│   │   ├── ContentCard.tsx      # コンテンツカード
│   │   ├── FilterBar.tsx        # フィルターバー
│   │   ├── UploadModal.tsx      # アップロードモーダル
│   │   ├── DeleteModal.tsx      # 削除確認モーダル
│   │   └── Pagination.tsx       # ページネーション
│   ├── lib/
│   │   └── api.ts               # APIクライアント
│   └── types/
│       └── api.ts               # 型定義
├── public/                      # 静的ファイル
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🛠️ セットアップ

### 前提条件

- Node.js 20.x 以上
- バックエンドAPIが起動していること（http://localhost:3001）

### 1. 依存関係のインストール

```bash
cd frontend
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env.local`にコピー：

```bash
cp .env.example .env.local
```

```.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. アプリケーションの起動

#### 開発モード

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

#### 本番ビルド

```bash
npm run build
npm start
```

## 🎨 実装済み機能

### ✅ コア機能
- [x] コンテンツ一覧表示（グリッドレイアウト）
- [x] コンテンツ詳細表示（動画再生・画像表示）
- [x] コンテンツ登録（ドラッグ&ドロップ対応）
- [x] コンテンツ削除
- [x] 検索・フィルタリング（種別・キーワード）
- [x] ページネーション

### ✅ UI/UX
- [x] レスポンシブデザイン（PC・タブレット・スマホ対応）
- [x] モーダルダイアログ
- [x] ローディング状態表示
- [x] エラーハンドリング
- [x] タグ管理

### ✅ ファイルアップロード
- [x] ドラッグ&ドロップ対応
- [x] プレビュー表示
- [x] ファイル形式チェック

## 📱 画面一覧

### 1. トップページ（一覧）
- パス: `/`
- 機能:
  - コンテンツ一覧をグリッド表示
  - 検索・フィルタリング
  - ページネーション
  - 新規登録ボタン

### 2. 詳細ページ
- パス: `/contents/[id]`
- 機能:
  - 動画再生 / 画像表示
  - コンテンツ情報表示
  - 編集・削除ボタン

## 🎯 APIとの連携

### エンドポイント使用例

```typescript
import { contentsApi } from '@/lib/api';

// 一覧取得
const contents = await contentsApi.getAll({
  page: 1,
  limit: 20,
  type: 'video',
  keyword: '研修',
});

// 詳細取得
const content = await contentsApi.getById(1);

// 作成
await contentsApi.create({
  title: 'タイトル',
  description: '説明',
  type: 'video',
  file: fileObject,
  tags: ['タグ1', 'タグ2'],
  isPublic: true,
});

// 削除
await contentsApi.delete(1);
```

## 🎨 デザインシステム

### カラーパレット

```css
primary: #2563EB     /* メインカラー（青） */
background: #F9FAFB  /* 背景色 */
border: #E5E7EB      /* ボーダー色 */
danger: #DC2626      /* 警告色（赤） */
```

### ボタンスタイル

- `.btn-primary` - メインアクション
- `.btn-secondary` - 副次的アクション
- `.btn-danger` - 削除などの危険な操作

### 入力フィールド

- `.input-field` - テキスト入力
- `.card` - カードコンテナ

## 📦 コンポーネント詳細

### ContentCard
コンテンツカードコンポーネント
- Props: `{ content: Content }`
- 用途: 一覧画面でのカード表示

### FilterBar
検索・フィルターバー
- Props: `{ typeFilter, setTypeFilter, searchKeyword, setSearchKeyword }`
- 用途: 検索とフィルタリング

### UploadModal
アップロードモーダル
- Props: `{ onClose, onSuccess }`
- 用途: コンテンツ登録

### DeleteModal
削除確認モーダル
- Props: `{ onClose, onConfirm }`
- 用途: 削除確認

### Pagination
ページネーション
- Props: `{ currentPage, totalPages, onPageChange }`
- 用途: ページ切り替え

## 🔧 カスタマイズ

### APIエンドポイントの変更

`.env.local`を編集：

```
NEXT_PUBLIC_API_URL=https://api.example.com
```

### スタイルのカスタマイズ

`tailwind.config.js`を編集：

```javascript
theme: {
  extend: {
    colors: {
      primary: '#YOUR_COLOR',
    },
  },
},
```

## 🐛 トラブルシューティング

### ページが真っ白

```bash
# ビルドキャッシュをクリア
rm -rf .next
npm run dev
```

### APIに接続できない

1. バックエンドが起動しているか確認
2. `.env.local`のAPI URLが正しいか確認
3. CORSエラーの場合、バックエンドのCORS設定を確認

### 画像・動画が表示されない

1. `next.config.js`の`images.domains`にバックエンドのホストが含まれているか確認
2. バックエンドの静的ファイル配信設定を確認

## 🚀 デプロイ

### Dockerでデプロイ

```bash
# イメージをビルド
docker build -t media-frontend .

# コンテナを起動
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-api-url media-frontend
```

### Vercelでデプロイ

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel
```

環境変数を設定：
- `NEXT_PUBLIC_API_URL`: バックエンドAPIのURL

## 📝 開発ガイド

### 新しいページの追加

```bash
# src/app/new-page/page.tsx を作成
```

### 新しいコンポーネントの追加

```bash
# src/components/NewComponent.tsx を作成
```

### 型の追加・更新

```typescript
// src/types/api.ts に追加
export interface NewType {
  // ...
}
```

## 🔐 セキュリティ

- XSS対策: Reactの自動エスケープ
- CSRF対策: バックエンド側で実装
- ファイルアップロード: フロントとバックエンドの両方でバリデーション

## 📈 パフォーマンス最適化

- 画像の遅延読み込み
- コード分割（Next.js自動）
- 静的アセットのキャッシュ
- サーバーサイドレンダリング（必要に応じて）

## 📞 サポート

問題が発生した場合は、開発チームまでお問い合わせください。

---

Happy Coding! 🎉
