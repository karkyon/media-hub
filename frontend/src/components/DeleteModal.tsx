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
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div className="w-full max-w-sm" style={{ background: '#111', border: '1px solid #333' }}>
        <div className="px-6 py-6">
          <div className="w-10 h-10 flex items-center justify-center mb-4"
            style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>

          <h2 className="text-sm font-medium text-gray-100 mb-2">Delete Content</h2>
          <p className="text-xs text-gray-600 mb-3">この操作は元に戻せません。</p>
          <p className="text-sm text-gray-400 px-3 py-2 truncate"
            style={{ border: '1px solid #2a2a2a', background: 'rgba(255,255,255,0.02)' }}>
            {content.title}
          </p>

          {error && (
            <div className="mt-3 px-4 py-3 text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: '1px solid #2a2a2a' }}>
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 text-xs tracking-widest text-gray-400 hover:text-white transition-colors"
              style={{ border: '1px solid #333' }}>
              CANCEL
            </button>
            <button type="button" onClick={handleDelete} disabled={loading}
              className="flex-1 py-2.5 text-xs tracking-widest text-red-400 hover:text-white hover:bg-red-600 transition-colors"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              {loading ? 'DELETING...' : 'DELETE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}