# 社内向けメディア管理システム - Backend API

NestJS + TypeScript + PostgreSQL で構築された社内向けメディア管理システムのバックエンドAPIです。

## 🚀 技術スタック

- **フレームワーク**: NestJS 10.x
- **言語**: TypeScript
- **データベース**: PostgreSQL 16
- **ORM**: TypeORM
- **API仕様**: Swagger/OpenAPI
- **ファイルアップロード**: Multer
- **コンテナ**: Docker + Docker Compose

## 📁 プロジェクト構成

```
backend/
├── src/
│   ├── main.ts                 # アプリケーションエントリーポイント
│   ├── app.module.ts           # ルートモジュール
│   ├── common/
│   │   └── multer.config.ts    # ファイルアップロード設定
│   ├── contents/               # コンテンツ管理モジュール
│   │   ├── contents.controller.ts
│   │   ├── contents.service.ts
│   │   ├── contents.module.ts
│   │   ├── content.entity.ts
│   │   └── dto/
│   │       ├── create-content.dto.ts
│   │       ├── update-content.dto.ts
│   │       └── content-response.dto.ts
│   ├── tags/                   # タグ管理モジュール
│   │   ├── tags.controller.ts
│   │   ├── tags.service.ts
│   │   ├── tags.module.ts
│   │   └── tag.entity.ts
│   └── health/                 # ヘルスチェック
│       └── health.controller.ts
├── media/                      # メディアファイル保存先
│   ├── videos/
│   ├── images/
│   └── thumbnails/
├── test/                       # テスト
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ セットアップ

### 前提条件

- Node.js 20.x 以上
- PostgreSQL 16.x（またはDocker）
- npm または yarn

### 1. 依存関係のインストール

```bash
cd backend
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして編集：

```bash
cp .env.example .env
```

```.env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=media_user
DB_PASS=media_pass
DB_NAME=media_db
```

### 3. データベースの準備

#### Docker Composeを使う場合（推奨）

```bash
# プロジェクトルートで実行
docker-compose up -d db
```

#### 手動でPostgreSQLを使う場合

```bash
# PostgreSQLにログイン
psql -U postgres

# データベースとユーザーを作成
CREATE DATABASE media_db;
CREATE USER media_user WITH PASSWORD 'media_pass';
GRANT ALL PRIVILEGES ON DATABASE media_db TO media_user;
```

### 4. アプリケーションの起動

#### 開発モード

```bash
npm run start:dev
```

#### 本番モード

```bash
npm run build
npm run start:prod
```

#### Docker Composeで起動（全体）

```bash
# プロジェクトルートで実行
docker-compose up -d
```

## 📚 API ドキュメント

アプリケーション起動後、以下のURLでSwagger UIにアクセスできます：

```
http://localhost:3001/api/docs
```

### 主要エンドポイント

#### ヘルスチェック
- `GET /health` - サーバーの稼働状態を確認

#### コンテンツ管理
- `GET /contents` - コンテンツ一覧取得
- `GET /contents/:id` - コンテンツ詳細取得
- `POST /contents` - コンテンツ登録
- `PUT /contents/:id` - コンテンツ更新
- `DELETE /contents/:id` - コンテンツ削除

#### タグ管理
- `GET /tags` - タグ一覧取得
- `GET /tags/:id` - タグ詳細取得

### クエリパラメータ（一覧取得時）

- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 20）
- `type`: 種別フィルタ（`image` または `video`）
- `keyword`: 検索キーワード（タイトル・説明文）
- `tag`: タグフィルタ

## 🧪 テスト

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:cov
```

## 📦 ファイルアップロード仕様

### 対応形式

**画像:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**動画:**
- MP4 (.mp4)
- WebM (.webm)
- QuickTime (.mov)

### ファイルサイズ制限

- 最大: 500MB

### 保存先

- 画像: `./media/images/`
- 動画: `./media/videos/`
- サムネイル: `./media/thumbnails/`

## 🗄️ データベーススキーマ

### contents テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | INTEGER | 主キー |
| title | VARCHAR(200) | タイトル |
| description | TEXT | 説明文 |
| type | ENUM | 種別（image/video） |
| filePath | VARCHAR | ファイルパス |
| thumbnailPath | VARCHAR | サムネイルパス |
| isPublic | BOOLEAN | 公開状態 |
| createdBy | INTEGER | 登録者ID |
| createdAt | TIMESTAMP | 登録日時 |
| updatedAt | TIMESTAMP | 更新日時 |

### tags テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | INTEGER | 主キー |
| name | VARCHAR(50) | タグ名 |

### content_tags テーブル（中間テーブル）

| カラム | 型 | 説明 |
|--------|------|------|
| content_id | INTEGER | コンテンツID |
| tag_id | INTEGER | タグID |

## 🔧 開発ガイド

### コード規約

- ESLint + Prettier を使用
- TypeScript strict mode
- Class-based architecture（NestJS標準）

### フォーマット

```bash
npm run format
npm run lint
```

### モジュールの追加

```bash
nest generate module [module-name]
nest generate controller [controller-name]
nest generate service [service-name]
```

## 🚢 デプロイ

### Docker Composeでのデプロイ

```bash
# ビルドと起動
docker-compose up -d --build

# ログ確認
docker-compose logs -f backend

# 停止
docker-compose down

# データも削除する場合
docker-compose down -v
```

### 本番環境の注意点

1. `.env`ファイルで`NODE_ENV=production`に設定
2. `synchronize: false`に変更（TypeORM）
3. マイグレーションを使用
4. HTTPS通信の設定
5. ログ管理の設定
6. バックアップの設定

## 🔐 セキュリティ

- ファイルアップロードの検証（MIME type, 拡張子, サイズ）
- SQL Injection対策（TypeORM使用）
- XSS対策（class-validator使用）
- CORS設定
- 入力バリデーション

## 📝 ライセンス

UNLICENSED（社内専用）

## 👥 開発者

社内開発チーム

---

## 📞 トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
docker-compose ps

# ログを確認
docker-compose logs db
```

### ポートが使用中

```bash
# 使用中のポートを確認
lsof -i :3001
lsof -i :5432

# プロセスを終了
kill -9 [PID]
```

### メディアファイルが表示されない

- `media`ディレクトリのパーミッションを確認
- Docker volumeのマウント状態を確認

```bash
docker-compose exec backend ls -la /app/media
```
