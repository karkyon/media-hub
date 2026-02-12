'use client';

import { useState, useEffect } from 'react';
import { Content } from '@/types/api';
import { contentsApi } from '@/lib/api';

interface Props {
  content: Content;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteModal({ content, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await contentsApi.delete(content.id);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || '削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div className="card w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#fef2f2' }}>
            <svg className="w-5 h-5" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#111827' }}>コンテンツを削除</h2>
            <p className="text-sm" style={{ color: '#6b7280' }}>この操作は元に戻せません</p>
          </div>
        </div>
        <div className="px-3 py-2 rounded-lg mb-4 text-sm truncate"
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}>
          {content.title}
        </div>
        {error && (
          <div className="px-3 py-2 rounded-lg mb-4 text-sm" style={{ background: '#fef2f2', color: '#ef4444' }}>
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary flex-1 justify-center">キャンセル</button>
          <button type="button" onClick={handleDelete} disabled={loading} className="btn-danger flex-1 justify-center">
            {loading ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  );
}