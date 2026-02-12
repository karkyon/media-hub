#!/bin/bash
# ============================================================
#  media-hub alias 定義ファイル
#  使い方: source ~/.media-hub-aliases  または
#          ~/.bashrc / ~/.zshrc に以下を追記:
#          source /home/karkyon/projects/media-hub/media-hub-aliases.sh
# ============================================================

# ベースディレクトリ
MH_ROOT="/home/karkyon/projects/media-hub"
MH_COMPOSE="docker compose -f ${MH_ROOT}/docker-compose-full.yml"

# --------------------------------------------------------
# 【ナビゲーション】
# --------------------------------------------------------

# プロジェクトルートに移動
alias mh='cd ${MH_ROOT}'

# Backend ソースに移動
alias mhb='cd ${MH_ROOT}/backend'

# Frontend ソースに移動
alias mhf='cd ${MH_ROOT}/frontend'

# media ディレクトリに移動
alias mhm='cd ${MH_ROOT}/media'

# --------------------------------------------------------
# 【Docker: 起動・停止】
# --------------------------------------------------------

# システム起動（バックグラウンド）
alias mh-up='${MH_COMPOSE} up -d'

# システム起動（ログ表示あり・フォアグラウンド）
alias mh-up-log='${MH_COMPOSE} up'

# システム停止（コンテナ削除、データ保持）
alias mh-down='${MH_COMPOSE} down'

# システム停止（全データ削除 ★注意★）
alias mh-down-v='${MH_COMPOSE} down -v'

# システム再起動
alias mh-restart='${MH_COMPOSE} restart'

# 全コンテナ再ビルド＆起動
alias mh-rebuild='${MH_COMPOSE} up -d --build'

# Backend のみ再ビルド
alias mh-rebuild-b='${MH_COMPOSE} up -d --build backend'

# Frontend のみ再ビルド
alias mh-rebuild-f='${MH_COMPOSE} up -d --build frontend'

# --------------------------------------------------------
# 【Docker: 状態確認】
# --------------------------------------------------------

# コンテナ稼働状態を確認
alias mh-ps='${MH_COMPOSE} ps'

# コンテナのリソース使用状況（CPU/Mem）
alias mh-stats='docker stats media-db media-backend media-frontend'

# ヘルスチェック（API）
alias mh-health='curl -s http://localhost:3001/health | python3 -m json.tool'

# --------------------------------------------------------
# 【ログ確認】
# --------------------------------------------------------

# 全コンテナのログ（最新50行）
alias mh-log='${MH_COMPOSE} logs --tail=50'

# 全コンテナのログ（リアルタイム追従）
alias mh-logf='${MH_COMPOSE} logs -f'

# Backend のみログ（最新50行）
alias mh-log-b='${MH_COMPOSE} logs backend --tail=50'

# Backend のみログ（リアルタイム追従）
alias mh-logf-b='${MH_COMPOSE} logs -f backend'

# Frontend のみログ（最新50行）
alias mh-log-f='${MH_COMPOSE} logs frontend --tail=50'

# Frontend のみログ（リアルタイム追従）
alias mh-logf-f='${MH_COMPOSE} logs -f frontend'

# DB のみログ（最新50行）
alias mh-log-db='${MH_COMPOSE} logs db --tail=50'

# エラーのみ抽出（全サービス）
alias mh-err='${MH_COMPOSE} logs --tail=200 | grep -i "error\|err\|failed\|fatal"'

# Backend エラーのみ抽出
alias mh-err-b='${MH_COMPOSE} logs backend --tail=200 | grep -i "error\|err\|failed\|fatal"'

# --------------------------------------------------------
# 【コンテナシェルアクセス】
# --------------------------------------------------------

# Backend コンテナに入る
alias mh-sh-b='${MH_COMPOSE} exec backend sh'

# Frontend コンテナに入る
alias mh-sh-f='${MH_COMPOSE} exec frontend sh'

# DB コンテナに入る（psql）
alias mh-sh-db='${MH_COMPOSE} exec db psql -U media_user -d media_db'

# --------------------------------------------------------
# 【データベース操作】
# --------------------------------------------------------

# DB バックアップ（タイムスタンプ付き）
alias mh-db-backup='${MH_COMPOSE} exec db pg_dump -U media_user media_db > ${MH_ROOT}/backup_$(date +%Y%m%d_%H%M%S).sql && echo "Backup complete!"'

# コンテンツテーブルを確認
alias mh-db-contents='${MH_COMPOSE} exec db psql -U media_user -d media_db -c "SELECT id, title, type, is_public, created_at FROM contents ORDER BY id DESC LIMIT 20;"'

# タグテーブルを確認
alias mh-db-tags='${MH_COMPOSE} exec db psql -U media_user -d media_db -c "SELECT * FROM tags ORDER BY id;"'

# 全テーブル一覧
alias mh-db-tables='${MH_COMPOSE} exec db psql -U media_user -d media_db -c "\dt"'

# DB 接続数確認
alias mh-db-conn='${MH_COMPOSE} exec db psql -U media_user -d media_db -c "SELECT count(*) FROM pg_stat_activity WHERE datname='"'"'media_db'"'"';"'

# --------------------------------------------------------
# 【API テスト (curl)】
# --------------------------------------------------------

# コンテンツ一覧取得
alias mh-api-list='curl -s http://localhost:3001/contents | python3 -m json.tool'

# コンテンツ一覧（ページ指定）  使い方: mh-api-list-p 2
mh-api-list-p() { curl -s "http://localhost:3001/contents?page=${1:-1}&limit=10" | python3 -m json.tool; }

# コンテンツ詳細取得   使い方: mh-api-get 1
mh-api-get() { curl -s "http://localhost:3001/contents/${1}" | python3 -m json.tool; }

# キーワード検索       使い方: mh-api-search "研修"
mh-api-search() { curl -s "http://localhost:3001/contents?keyword=${1}" | python3 -m json.tool; }

# 種別フィルタ         使い方: mh-api-type video
mh-api-type() { curl -s "http://localhost:3001/contents?type=${1}" | python3 -m json.tool; }

# タグ一覧取得
alias mh-api-tags='curl -s http://localhost:3001/tags | python3 -m json.tool'

# コンテンツ削除       使い方: mh-api-delete 5
mh-api-delete() {
    echo "⚠️  ID=${1} のコンテンツを削除します。よろしいですか？ [y/N]"
    read -r confirm
    if [ "${confirm}" = "y" ] || [ "${confirm}" = "Y" ]; then
        curl -s -X DELETE "http://localhost:3001/contents/${1}" | python3 -m json.tool
    else
        echo "キャンセルしました。"
    fi
}

# --------------------------------------------------------
# 【ストレージ確認】
# --------------------------------------------------------

# media ディレクトリの容量確認
alias mh-size='du -sh ${MH_ROOT}/media/* 2>/dev/null && du -sh ${MH_ROOT}/media/'

# media ファイル一覧
alias mh-media='find ${MH_ROOT}/media -type f | sort'

# 動画ファイル一覧
alias mh-videos='ls -lh ${MH_ROOT}/media/videos/'

# 画像ファイル一覧
alias mh-images='ls -lh ${MH_ROOT}/media/images/'

# ストレージ空き容量確認
alias mh-df='df -h ${MH_ROOT}'

# --------------------------------------------------------
# 【ブラウザ起動（xdg-open / WSL対応）】
# --------------------------------------------------------

# フロントエンドをブラウザで開く
alias mh-open='xdg-open http://localhost:3000 2>/dev/null || echo "Open: http://localhost:3000"'

# Swagger UI をブラウザで開く
alias mh-swagger='xdg-open http://localhost:3001/api/docs 2>/dev/null || echo "Open: http://localhost:3001/api/docs"'

# --------------------------------------------------------
# 【開発ユーティリティ】
# --------------------------------------------------------

# Backend の TypeScript を型チェック（コンテナ内）
alias mh-tsc-b='${MH_COMPOSE} exec backend npx tsc --noEmit'

# Frontend の TypeScript を型チェック（コンテナ内）
alias mh-tsc-f='${MH_COMPOSE} exec frontend npx tsc --noEmit'

# Backend のユニットテスト実行
alias mh-test-b='${MH_COMPOSE} exec backend npm run test'

# Frontend の lint 実行
alias mh-lint-f='${MH_COMPOSE} exec frontend npm run lint'

# --------------------------------------------------------
# 【ワンライナー：一括確認】
# --------------------------------------------------------

# システム全体のステータスを一発確認
mh-status() {
    echo "=============================="
    echo "  media-hub システム状態"
    echo "=============================="
    echo ""
    echo "--- コンテナ ---"
    ${MH_COMPOSE} ps
    echo ""
    echo "--- ヘルスチェック ---"
    curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null || echo "Backend: 応答なし"
    echo ""
    echo "--- コンテンツ件数 ---"
    ${MH_COMPOSE} exec db psql -U media_user -d media_db -c "SELECT type, count(*) FROM contents GROUP BY type;" 2>/dev/null
    echo ""
    echo "--- ストレージ使用量 ---"
    du -sh ${MH_ROOT}/media/* 2>/dev/null
    echo ""
    echo "--- アクセスURL ---"
    echo "  フロントエンド : http://localhost:3000"
    echo "  Swagger UI    : http://localhost:3001/api/docs"
    echo "  Backend API   : http://localhost:3001"
    echo "=============================="
}

# クリーンスタート（停止→ボリューム削除→再起動）
mh-clean-start() {
    echo "⚠️  全データが削除されます。続けますか？ [y/N]"
    read -r confirm
    if [ "${confirm}" = "y" ] || [ "${confirm}" = "Y" ]; then
        ${MH_COMPOSE} down -v
        ${MH_COMPOSE} up -d --build
        echo "✅ クリーンスタート完了"
    else
        echo "キャンセルしました。"
    fi
}

echo "✅ media-hub aliases loaded!"
echo "   ヘルプ: alias | grep 'mh-'   または   mh-status"
