'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Content } from '@/types/api';
import { getMediaUrl } from '@/lib/api';

interface Props {
  content: Content;
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
}

export default function ContentCard({ content, onEdit, onDelete }: Props) {
  const [imgError, setImgError] = useState(false);
  const isVideo = content.type === 'video';
  const mediaUrl = getMediaUrl(content.filePath);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* サムネイル */}
      <Link href={`/contents/${content.id}`} className="block">
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/10', background: '#f3f4f6' }}>
          {isVideo ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <svg className="w-10 h-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h11a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/>
              </svg>
              <span className="text-white/70 text-xs">動画</span>
            </div>
          ) : !imgError ? (
            <img src={mediaUrl} alt={content.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <svg className="w-10 h-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="text-white/70 text-xs">画像</span>
            </div>
          )}
          {/* バッジ */}
          <div className="absolute top-2 left-2">
            <span className={isVideo ? 'badge-video' : 'badge-image'}>
              {isVideo ? '🎬 動画' : '🖼 画像'}
            </span>
          </div>
        </div>
      </Link>

      {/* 情報 */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/contents/${content.id}`} className="block flex-1">
          <h3 className="text-sm font-semibold truncate mb-1 hover:text-blue-600 transition-colors"
            style={{ color: '#111827' }}>
            {content.title}
          </h3>
          {content.description && (
            <p className="text-xs truncate mb-2" style={{ color: '#6b7280' }}>
              {content.description}
            </p>
          )}
        </Link>

        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 flex-wrap">
            {content.tags?.slice(0, 2).map((tag) => (
              <span key={tag.id} className="px-2 py-0.5 text-xs rounded-full font-medium"
                style={{ background: '#eff6ff', color: '#3b82f6' }}>
                #{tag.name}
              </span>
            ))}
          </div>
          <span className="text-xs flex-shrink-0 ml-1" style={{ color: '#9ca3af' }}>
            {formatDate(content.createdAt)}
          </span>
        </div>

        {/* ボタン */}
        <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
          <button type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(content); }}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ background: '#eff6ff', color: '#3b82f6' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dbeafe')}
            onMouseLeave={e => (e.currentTarget.style.background = '#eff6ff')}>
            編集
          </button>
          <button type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(content); }}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ background: '#fef2f2', color: '#ef4444' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fef2f2')}>
            削除
          </button>
        </div>
      </div>
    </div>
  );
}