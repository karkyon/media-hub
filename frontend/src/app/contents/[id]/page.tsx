'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentsApi, getMediaUrl } from '@/lib/api';
import { Content } from '@/types/api';
import EditModal from '@/components/EditModal';
import DeleteModal from '@/components/DeleteModal';

// ========== デバッグユーティリティ ==========
const DEBUG_PREFIX = '[MediaDebug]';

function debugLog(label: string, data?: unknown) {
  const style = 'color: #00bcd4; font-weight: bold;';
  if (data !== undefined) {
    console.log(`%c${DEBUG_PREFIX} ${label}`, style, data);
  } else {
    console.log(`%c${DEBUG_PREFIX} ${label}`, style);
  }
}

function debugError(label: string, data?: unknown) {
  const style = 'color: #f44336; font-weight: bold;';
  if (data !== undefined) {
    console.error(`%c${DEBUG_PREFIX} ❌ ${label}`, style, data);
  } else {
    console.error(`%c${DEBUG_PREFIX} ❌ ${label}`, style);
  }
}

function debugWarn(label: string, data?: unknown) {
  const style = 'color: #ff9800; font-weight: bold;';
  if (data !== undefined) {
    console.warn(`%c${DEBUG_PREFIX} ⚠️ ${label}`, style, data);
  } else {
    console.warn(`%c${DEBUG_PREFIX} ⚠️ ${label}`, style);
  }
}

// メディアURLの詳細分析
function analyzeMediaUrl(filePath: string): void {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const mediaUrl = getMediaUrl(filePath);

  console.group(`${DEBUG_PREFIX} 🔍 URL分析`);
  debugLog('filePath (DB保存値)', filePath);
  debugLog('NEXT_PUBLIC_API_URL', API_BASE_URL);
  debugLog('生成されたmediaUrl', mediaUrl);
  debugLog('filePath長さ', filePath.length);
  debugLog('filePath文字コード (先頭5文字)', [...filePath.slice(0, 5)].map(c => `${c}(${c.charCodeAt(0)})`));

  // パターン判定
  if (filePath.startsWith('media/')) {
    debugLog('パターン', '"media/" で始まる → substring(6) で除去');
    debugLog('除去後', filePath.substring(6));
    debugWarn(
      '注意',
      '"media/" は7文字。substring(6)だと先頭1文字が残る可能性あり！'
    );
    debugLog('"media/".length =', 'media/'.length);
    debugLog('substring(6)の結果', filePath.substring(6));
    debugLog('substring(7)の結果', filePath.substring(7));
  } else if (filePath.startsWith('/media/')) {
    debugLog('パターン', '"/media/" で始まる');
  } else if (filePath.startsWith('images/')) {
    debugLog('パターン', '"images/" で始まる（media/プレフィックスなし）');
  } else if (filePath.startsWith('videos/')) {
    debugLog('パターン', '"videos/" で始まる（media/プレフィックスなし）');
  } else {
    debugWarn('パターン', '不明なパス形式');
  }

  console.groupEnd();
}

// fetchでURLの到達確認
async function checkUrlReachable(url: string, label: string): Promise<void> {
  debugLog(`🌐 URL到達確認開始: ${label}`, url);
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      debugLog(`✅ ${label} → 到達可能`, {
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });
    } else {
      debugError(`${label} → HTTPエラー`, {
        status: response.status,
        statusText: response.statusText,
        url,
      });
    }
  } catch (err: unknown) {
    const error = err as Error;
    debugError(`${label} → ネットワークエラー`, {
      message: error.message,
      url,
    });
  }
}

// ========== コンポーネント ==========

export default function ContentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const fetchContent = async () => {
    debugLog('=== fetchContent 開始 ===', { id });
    try {
      setLoading(true);
      const data = await contentsApi.getById(id);
      debugLog('APIレスポンス成功', data);
      debugLog('filePath', data.filePath);
      debugLog('type', data.type);
      setContent(data);

      // URLの詳細分析
      analyzeMediaUrl(data.filePath);

      // 生成したURLへの到達確認（非同期）
      const mediaUrl = getMediaUrl(data.filePath);
      setDebugInfo(mediaUrl);
      checkUrlReachable(mediaUrl, 'メディアファイル');

      // バックエンドのmediaディレクトリも確認
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      checkUrlReachable(`${API_BASE_URL}/health`, 'バックエンドヘルスチェック');
    } catch (err: unknown) {
      const error = err as Error;
      debugError('fetchContent エラー', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchContent();
  }, [id]);

  // ========== ローディング ==========
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#f0f2f5' }}
      >
        <div className="text-sm" style={{ color: '#9ca3af' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  // ========== 404 ==========
  if (!content) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#f0f2f5' }}
      >
        <p className="text-sm" style={{ color: '#6b7280' }}>
          コンテンツが見つかりません
        </p>
        <Link href="/" className="btn-primary">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const isVideo = content.type === 'video';
  const mediaUrl = getMediaUrl(content.filePath);

  // ========== メディアイベントハンドラ ==========

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.currentTarget;
    const errorInfo = {
      src: target.src,
      filePath: content.filePath,
      generatedUrl: mediaUrl,
      errorCode: target.error?.code,
      errorMessage: target.error?.message,
      networkState: target.networkState,
      // 0=NETWORK_EMPTY, 1=NETWORK_IDLE, 2=NETWORK_LOADING, 3=NETWORK_NO_SOURCE
      networkStateLabel: ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'][
        target.networkState
      ],
      readyState: target.readyState,
      // 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA
      readyStateLabel: [
        'HAVE_NOTHING',
        'HAVE_METADATA',
        'HAVE_CURRENT_DATA',
        'HAVE_FUTURE_DATA',
        'HAVE_ENOUGH_DATA',
      ][target.readyState],
    };
    debugError('動画読み込みエラー', errorInfo);
    setMediaError(true);
    // 改めてfetchで確認
    checkUrlReachable(mediaUrl, '動画URL (エラー後再確認)');
  };

  const handleVideoLoadStart = () => {
    debugLog('動画 loadstart', { url: mediaUrl });
  };

  const handleVideoCanPlay = () => {
    debugLog('✅ 動画 canplay → 再生可能！', { url: mediaUrl });
    setMediaError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const errorInfo = {
      src: target.src,
      filePath: content.filePath,
      generatedUrl: mediaUrl,
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      complete: target.complete,
    };
    debugError('画像読み込みエラー', errorInfo);
    setMediaError(true);
    // 改めてfetchで確認
    checkUrlReachable(mediaUrl, '画像URL (エラー後再確認)');
  };

  const handleImageLoad = () => {
    debugLog('✅ 画像読み込み成功！', { url: mediaUrl });
    setMediaError(false);
  };

  // ========== レンダリング ==========

  return (
    <div className="min-h-screen" style={{ background: '#f0f2f5' }}>
      {/* ヘッダー */}
      <header
        className="bg-white border-b sticky top-0 z-40"
        style={{ borderColor: '#e8eaed' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#6b7280' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            一覧に戻る
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="btn-secondary"
            >
              編集
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="btn-danger"
            >
              削除
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* ======== デバッグパネル（開発用） ======== */}
        <div
          className="mb-4 p-3 rounded-lg text-xs font-mono"
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            border: '1px solid #333',
          }}
        >
          <div style={{ color: '#569cd6', fontWeight: 'bold', marginBottom: 4 }}>
            🔍 DEBUG INFO (F12 Consoleに詳細あり)
          </div>
          <div>
            <span style={{ color: '#9cdcfe' }}>filePath: </span>
            <span style={{ color: '#ce9178' }}>&quot;{content.filePath}&quot;</span>
          </div>
          <div>
            <span style={{ color: '#9cdcfe' }}>type: </span>
            <span style={{ color: '#ce9178' }}>&quot;{content.type}&quot;</span>
          </div>
          <div>
            <span style={{ color: '#9cdcfe' }}>mediaUrl: </span>
            <span style={{ color: '#4ec9b0' }}>{debugInfo || mediaUrl}</span>
          </div>
          <div>
            <span style={{ color: '#9cdcfe' }}>mediaError: </span>
            <span style={{ color: mediaError ? '#f44747' : '#b5cea8' }}>
              {String(mediaError)}
            </span>
          </div>
          <div className="mt-2">
            <button
              onClick={() => {
                analyzeMediaUrl(content.filePath);
                checkUrlReachable(mediaUrl, '手動確認');
              }}
              style={{
                background: '#264f78',
                color: '#fff',
                border: 'none',
                padding: '2px 8px',
                borderRadius: 3,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              ▶ 再チェック (Console確認)
            </button>
          </div>
        </div>

        {/* ======== メディア表示エリア ======== */}
        <div className="card overflow-hidden mb-6">
          {isVideo ? (
            <>
              {!mediaError ? (
                <video
                  controls
                  className="w-full"
                  style={{ maxHeight: '60vh', background: '#000' }}
                  src={mediaUrl}
                  onLoadStart={handleVideoLoadStart}
                  onCanPlay={handleVideoCanPlay}
                  onError={handleVideoError}
                >
                  お使いのブラウザは動画再生に対応していません。
                </video>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-12"
                  style={{ background: '#1e1e1e', color: '#f44747' }}
                >
                  <div className="text-4xl">⚠️</div>
                  <div className="text-sm font-bold">動画を読み込めません</div>
                  <div
                    className="text-xs font-mono px-4 py-2 rounded"
                    style={{ background: '#2d2d2d', color: '#ce9178', wordBreak: 'break-all' }}
                  >
                    {mediaUrl}
                  </div>
                  <div className="text-xs" style={{ color: '#888' }}>
                    F12 Console の [MediaDebug] ログを確認してください
                  </div>
                  <button
                    onClick={() => {
                      setMediaError(false);
                      checkUrlReachable(mediaUrl, '動画URL 再確認');
                    }}
                    style={{
                      background: '#264f78',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 16px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    再試行
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {!mediaError ? (
                <img
                  src={mediaUrl}
                  alt={content.title}
                  className="w-full object-contain"
                  style={{ maxHeight: '60vh', background: '#f9fafb' }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-12"
                  style={{ background: '#fef2f2', color: '#dc2626' }}
                >
                  <div className="text-4xl">🖼️</div>
                  <div className="text-sm font-bold">画像を読み込めません</div>
                  <div
                    className="text-xs font-mono px-4 py-2 rounded"
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      wordBreak: 'break-all',
                    }}
                  >
                    {mediaUrl}
                  </div>
                  <div className="text-xs" style={{ color: '#888' }}>
                    F12 Console の [MediaDebug] ログを確認してください
                  </div>
                  <button
                    onClick={() => {
                      setMediaError(false);
                      checkUrlReachable(mediaUrl, '画像URL 再確認');
                    }}
                    style={{
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 16px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    再試行
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ======== コンテンツ情報 + 詳細情報 ======== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className={isVideo ? 'badge-video' : 'badge-image'}>
                  {isVideo ? '🎬 動画' : '🖼 画像'}
                </span>
              </div>
              <h1
                className="text-2xl font-bold mb-3"
                style={{ color: '#111827' }}
              >
                {content.title}
              </h1>
              {content.description && (
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: '#4b5563' }}
                >
                  {content.description}
                </p>
              )}
              {content.tags?.length > 0 && (
                <div
                  className="flex flex-wrap gap-2 mt-4 pt-4"
                  style={{ borderTop: '1px solid #f3f4f6' }}
                >
                  {content.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#eff6ff', color: '#3b82f6' }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-5 h-fit">
            <h3
              className="text-sm font-semibold mb-4 pb-3"
              style={{
                color: '#374151',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              詳細情報
            </h3>
            <div className="space-y-3">
              {[
                { label: 'ID', value: `#${content.id}` },
                {
                  label: '登録日',
                  value: new Date(content.createdAt).toLocaleDateString(
                    'ja-JP'
                  ),
                },
                {
                  label: '更新日',
                  value: new Date(content.updatedAt).toLocaleDateString(
                    'ja-JP'
                  ),
                },
                {
                  label: '公開設定',
                  value: content.isPublic ? '公開' : '非公開',
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center text-sm"
                >
                  <span style={{ color: '#9ca3af' }}>{label}</span>
                  <span style={{ color: '#374151' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showEdit && content && (
        <EditModal
          content={content}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            fetchContent();
          }}
        />
      )}
      {showDelete && content && (
        <DeleteModal
          content={content}
          onClose={() => setShowDelete(false)}
          onSuccess={() => router.push('/')}
        />
      )}
    </div>
  );
}