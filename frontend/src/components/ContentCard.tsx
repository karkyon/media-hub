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
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <div className="group" style={{ background: '#0f0f0f' }}>
      <Link href={`/contents/${content.id}`}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
          {isVideo ? (
            <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d0d0d' }}>
              <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h11a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/>
              </svg>
            </div>
          ) : !imgError ? (
            <img src={mediaUrl} alt={content.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d0d0d' }}>
              <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wider uppercase ${
              isVideo
                ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
            }`}>
              {isVideo ? 'VIDEO' : 'IMAGE'}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-3 py-3">
        <Link href={`/contents/${content.id}`} className="block">
          <h3 className="text-sm font-medium text-gray-200 truncate hover:text-white transition-colors">
            {content.title}
          </h3>
          {content.description && (
            <p className="text-xs text-gray-600 mt-1 truncate">{content.description}</p>
          )}
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1 flex-wrap">
            {content.tags?.slice(0, 2).map((tag) => (
              <span key={tag.id} className="px-1.5 py-0.5 text-xs text-gray-500"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a2a' }}>
                #{tag.name}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-700 ml-2 flex-shrink-0">
            {formatDate(content.createdAt)}
          </span>
        </div>
        <div className="flex mt-3 pt-2" style={{ borderTop: '1px solid #1a1a1a' }}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(content); }}
            className="flex-1 py-1.5 text-xs text-gray-600 hover:text-gray-200 transition-colors tracking-wider uppercase"
          >
            Edit
          </button>
          <div style={{ width: '1px', background: '#1a1a1a' }} />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(content); }}
            className="flex-1 py-1.5 text-xs text-gray-600 hover:text-red-400 transition-colors tracking-wider uppercase"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}