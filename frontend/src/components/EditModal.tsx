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
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
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
        title: title.trim(), description: description.trim(),
        file: file || undefined, tags, isPublic,
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
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e8eaed' }}>
          <h2 className="text-base font-semibold" style={{ color: '#111827' }}>コンテンツを編集</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#ef4444' }}>{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>タイトル *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="input-field" required maxLength={200} placeholder="タイトルを入力" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>説明</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} className="input-field resize-none" placeholder="説明を入力" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
              ファイル差し替え <span className="font-normal text-gray-400">（任意）</span>
            </label>
            <label className="block cursor-pointer rounded-lg p-4 text-center transition-colors"
              style={{ border: '2px dashed #d1d5db', background: '#f9fafb' }}>
              <input type="file" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                accept={content.type === 'video' ? 'video/*' : 'image/*'} className="hidden" />
              {file
                ? <p className="text-sm font-medium" style={{ color: '#374151' }}>{file.name}（{(file.size/1024/1024).toFixed(1)}MB）</p>
                : <p className="text-sm" style={{ color: '#9ca3af' }}>クリックしてファイルを選択</p>
              }
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>タグ</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
                className="input-field flex-1" placeholder="タグを入力してEnterまたは追加ボタン" />
              <button type="button" onClick={handleAddTag} className="btn-secondary flex-shrink-0">追加</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    #{tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-red-500 transition-colors ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid #f3f4f6' }}>
            <span className="text-sm font-medium" style={{ color: '#374151' }}>公開設定</span>
            <button type="button" onClick={() => setIsPublic(!isPublic)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ background: isPublic ? '#3b82f6' : '#d1d5db' }}>
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ left: '2px', transform: isPublic ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary flex-1 justify-center">キャンセル</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}