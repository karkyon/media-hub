'use client';

import { useState, useEffect } from 'react';
import { Content } from '@/types/api';
import { contentsApi } from '@/lib/api';

interface Props {
  content: Content;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditModal({ content, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description);
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>(content.tags?.map((t) => t.name) || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(content.isPublic ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(''); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('タイトルを入力してください'); return; }
    try {
      setLoading(true);
      setError(null);
      await contentsApi.update(content.id, {
        title: title.trim(),
        description: description.trim(),
        file: file || undefined,
        tags,
        isPublic,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || '更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: '#111', border: '1px solid #333' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <h2 className="text-sm font-medium text-gray-100 tracking-wider uppercase">Edit Content</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-200 transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {error && (
            <div className="px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-xs tracking-widest uppercase text-gray-600">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200}
              className="w-full px-4 py-2.5 text-sm text-gray-100 placeholder-gray-700 focus:outline-none transition-colors"
              style={{ background: 'transparent', border: '1px solid #2a2a2a' }} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs tracking-widest uppercase text-gray-600">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              className="w-full px-4 py-2.5 text-sm text-gray-100 placeholder-gray-700 focus:outline-none transition-colors resize-none"
              style={{ background: 'transparent', border: '1px solid #2a2a2a' }} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs tracking-widest uppercase text-gray-600">
              Replace File <span className="normal-case text-gray-700 tracking-normal">(optional)</span>
            </label>
            <label className="block cursor-pointer p-6 text-center transition-colors"
              style={{ border: '1px dashed #2a2a2a' }}>
              <input type="file" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                accept={content.type === 'video' ? 'video/*' : 'image/*'} className="hidden" />
              {file
                ? <p className="text-sm text-gray-300">{file.name} ({(file.size/1024/1024).toFixed(1)}MB)</p>
                : <p className="text-sm text-gray-600">ファイルを選択（変更しない場合は空白）</p>
              }
            </label>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs tracking-widest uppercase text-gray-600">Tags</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
                placeholder="タグを入力してEnter"
                className="flex-1 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-700 focus:outline-none"
                style={{ background: 'transparent', border: '1px solid #2a2a2a' }} />
              <button type="button" onClick={handleAddTag}
                className="px-4 text-xs text-gray-500 hover:text-gray-200 transition-colors tracking-wider"
                style={{ border: '1px solid #2a2a2a' }}>Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a2a' }}>
                    #{tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="text-gray-600 hover:text-red-400 transition-colors">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid #2a2a2a' }}>
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 text-xs tracking-widest text-gray-400 hover:text-white transition-colors"
              style={{ border: '1px solid #333' }}>CANCEL</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-xs tracking-widest bg-white text-black hover:bg-gray-100 transition-colors">
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}