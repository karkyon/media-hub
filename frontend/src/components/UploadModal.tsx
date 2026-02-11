'use client';

import { useState } from 'react';
import { contentsApi } from '@/lib/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ onClose, onSuccess }: Props) {
  const [type, setType] = useState<'image' | 'video'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('ファイルを選択してください');
      return;
    }

    try {
      setLoading(true);
      await contentsApi.create({
        title,
        description,
        type,
        file,
        tags,
        isPublic,
      });
      onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('アップロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">新規コンテンツ追加</h2>

          <form onSubmit={handleSubmit}>
            {/* Type Selection */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">種別 *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="video"
                    checked={type === 'video'}
                    onChange={(e) => setType(e.target.value as 'video')}
                    className="w-5 h-5"
                  />
                  <span>🎥 動画</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="image"
                    checked={type === 'image'}
                    onChange={(e) => setType(e.target.value as 'image')}
                    className="w-5 h-5"
                  />
                  <span>🖼️ 画像</span>
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">タイトル *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="コンテンツのタイトルを入力"
                required
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">説明 *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[120px]"
                placeholder="コンテンツの説明を入力（Markdown対応）"
                required
              />
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">ファイル *</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={type === 'video' ? 'video/*' : 'image/*'}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📁</div>
                  <div className="text-sm text-gray-600 mb-1">
                    {file ? file.name : 'ファイルをドラッグ&ドロップ'}
                  </div>
                  <div className="text-xs text-gray-500">
                    または、クリックしてファイルを選択
                  </div>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">タグ</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="input-field"
                  placeholder="タグを入力してEnter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary whitespace-nowrap"
                >
                  追加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Public Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-semibold">公開する</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? '登録中...' : '登録'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
