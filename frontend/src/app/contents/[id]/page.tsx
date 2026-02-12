'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentsApi, getMediaUrl } from '@/lib/api';
import { Content } from '@/types/api';
import EditModal from '@/components/EditModal';
import DeleteModal from '@/components/DeleteModal';

export default function ContentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await contentsApi.getById(id);
      setContent(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchContent(); }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f2f5' }}>
      <div className="text-sm" style={{ color: '#9ca3af' }}>読み込み中...</div>
    </div>
  );

  if (!content) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#f0f2f5' }}>
      <p className="text-sm" style={{ color: '#6b7280' }}>コンテンツが見つかりません</p>
      <Link href="/" className="btn-primary">一覧に戻る</Link>
    </div>
  );

  const isVideo = content.type === 'video';

  return (
    <div className="min-h-screen" style={{ background: '#f0f2f5' }}>
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: '#e8eaed' }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#6b7280' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            一覧に戻る
          </Link>
          <div className="flex gap-2">
            <button onClick={() => setShowEdit(true)} className="btn-secondary">編集</button>
            <button onClick={() => setShowDelete(true)} className="btn-danger">削除</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="card overflow-hidden mb-6">
          {isVideo ? (
            <video controls className="w-full" style={{ maxHeight: '60vh', background: '#000' }}
              src={getMediaUrl(content.filePath)}>
              お使いのブラウザは動画再生に対応していません。
            </video>
          ) : (
            <img src={getMediaUrl(content.filePath)} alt={content.title}
              className="w-full object-contain" style={{ maxHeight: '60vh', background: '#f9fafb' }} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className={isVideo ? 'badge-video' : 'badge-image'}>
                  {isVideo ? '🎬 動画' : '🖼 画像'}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-3" style={{ color: '#111827' }}>{content.title}</h1>
              {content.description && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#4b5563' }}>
                  {content.description}
                </p>
              )}
              {content.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                  {content.tags.map((tag) => (
                    <span key={tag.id} className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#eff6ff', color: '#3b82f6' }}>#{tag.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-5 h-fit">
            <h3 className="text-sm font-semibold mb-4 pb-3" style={{ color: '#374151', borderBottom: '1px solid #f3f4f6' }}>
              詳細情報
            </h3>
            <div className="space-y-3">
              {[
                { label: 'ID', value: `#${content.id}` },
                { label: '登録日', value: new Date(content.createdAt).toLocaleDateString('ja-JP') },
                { label: '更新日', value: new Date(content.updatedAt).toLocaleDateString('ja-JP') },
                { label: '公開設定', value: content.isPublic ? '公開' : '非公開' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span style={{ color: '#9ca3af' }}>{label}</span>
                  <span style={{ color: '#374151' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showEdit && content && (
        <EditModal content={content} onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); fetchContent(); }} />
      )}
      {showDelete && content && (
        <DeleteModal content={content} onClose={() => setShowDelete(false)}
          onSuccess={() => router.push('/')} />
      )}
    </div>
  );
}