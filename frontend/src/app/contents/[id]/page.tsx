'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contentsApi, getMediaUrl } from '@/lib/api';
import { Content } from '@/types/api';
import DeleteModal from '@/components/DeleteModal';

export default function ContentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await contentsApi.getById(id);
        setContent(data);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleDelete = async () => {
    try {
      await contentsApi.delete(id);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">コンテンツが見つかりません</h2>
          <button onClick={() => router.push('/')} className="btn-primary">
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b-2 border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="btn-secondary flex items-center gap-2"
          >
            <span>←</span>
            <span>一覧に戻る</span>
          </button>
          <div className="flex gap-2">
            <button className="btn-primary">編集</button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn-danger"
            >
              削除
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Media Display */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
          {content.type === 'video' ? (
            <video
              controls
              className="w-full aspect-video bg-gray-900"
              src={getMediaUrl(content.filePath)}
            >
              お使いのブラウザは動画タグをサポートしていません。
            </video>
          ) : (
            <img
              src={getMediaUrl(content.filePath)}
              alt={content.title}
              className="w-full object-contain max-h-[600px] bg-gray-100"
            />
          )}
        </div>

        {/* Content Info */}
        <div className="card mb-6">
          <h1 className="text-3xl font-bold mb-4">{content.title}</h1>

          <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">種別:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                content.type === 'video' 
                  ? 'bg-pink-100 text-pink-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {content.type === 'video' ? '🎥 動画' : '🖼️ 画像'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">登録日:</span>
              <span>{new Date(content.createdAt).toLocaleDateString('ja-JP')}</span>
            </div>
            {content.tags.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold">タグ:</span>
                <div className="flex gap-2 flex-wrap">
                  {content.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">📝 説明</h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {content.description}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteModal content={content}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={handleDelete}
        />
      )}
    </div>
  );
}
