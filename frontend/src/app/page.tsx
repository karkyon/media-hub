'use client';

import { useState, useEffect, useCallback } from 'react';
import { contentsApi } from '@/lib/api';
import { Content } from '@/types/api';
import ContentCard from '@/components/ContentCard';
import UploadModal from '@/components/UploadModal';
import EditModal from '@/components/EditModal';
import DeleteModal from '@/components/DeleteModal';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';

export default function Home() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Content | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Content | null>(null);

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await contentsApi.getAll({
        page, limit: 12,
        type: typeFilter || undefined,
        keyword: keyword || undefined,
        tag: tagFilter || undefined,
      });
      setContents(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, typeFilter, tagFilter]);

  useEffect(() => { fetchContents(); }, [fetchContents]);
  useEffect(() => { setPage(1); }, [keyword, typeFilter, tagFilter]);

  return (
    <div className="min-h-screen" style={{ background: '#f0f2f5' }}>
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: '#e8eaed' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: '#3b82f6' }}>M</div>
            <span className="text-base font-semibold" style={{ color: '#1a1a2e' }}>社内メディアライブラリ</span>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="text-sm" style={{ color: '#6b7280' }}>{total}件</span>
            )}
            <button onClick={() => setIsUploadOpen(true)}
              className="btn-primary">
              ＋ コンテンツを追加
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* フィルターバー */}
        <div className="card p-4 mb-6">
          <FilterBar keyword={keyword} onKeywordChange={setKeyword}
            typeFilter={typeFilter} onTypeFilterChange={setTypeFilter}
            tagFilter={tagFilter} onTagFilterChange={setTagFilter} />
        </div>

        {/* グリッド */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse" style={{ aspectRatio: '4/3' }} />
            ))}
          </div>
        ) : contents.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: '#eff6ff' }}>📭</div>
            <p className="text-base font-medium" style={{ color: '#374151' }}>コンテンツがありません</p>
            <p className="text-sm" style={{ color: '#9ca3af' }}>最初のコンテンツを追加してください</p>
            <button onClick={() => setIsUploadOpen(true)} className="btn-primary mt-2">
              ＋ 追加する
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {contents.map((content) => (
                <ContentCard key={content.id} content={content}
                  onEdit={setEditTarget} onDelete={setDeleteTarget} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </main>

      {isUploadOpen && (
        <UploadModal onClose={() => setIsUploadOpen(false)}
          onSuccess={() => { setIsUploadOpen(false); fetchContents(); }} />
      )}
      {editTarget && (
        <EditModal content={editTarget} onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); fetchContents(); }} />
      )}
      {deleteTarget && (
        <DeleteModal content={deleteTarget} onClose={() => setDeleteTarget(null)}
          onSuccess={() => { setDeleteTarget(null); fetchContents(); }} />
      )}
    </div>
  );
}