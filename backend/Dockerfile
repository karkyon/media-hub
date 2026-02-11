FROM node:20-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードのコピー
COPY . .

# ビルド
RUN npm run build

# メディアディレクトリの作成
RUN mkdir -p media/videos media/images media/thumbnails

# ポート公開
EXPOSE 3001

# アプリケーション起動
CMD ["npm", "run", "start:prod"]
