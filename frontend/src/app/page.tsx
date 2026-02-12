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
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <header className="border-b sticky top-0 z-40" style={{ borderColor: '#2a2a2a', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.3em] uppercase text-gray-500 font-medium">Media</span>
            <span className="w-px h-4 bg-gray-800" />
            <span className="text-sm text-gray-300 font-medium">Library</span>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && <span className="text-xs text-gray-700">{total} items</span>}
            <button onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2 text-xs bg-white text-black hover:bg-gray-100 transition-colors tracking-wider font-medium">
              + ADD
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <FilterBar keyword={keyword} onKeywordChange={setKeyword}
          typeFilter={typeFilter} onTypeFilterChange={setTypeFilter}
          tagFilter={tagFilter} onTagFilterChange={setTagFilter} />

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px" style={{ background: '#2a2a2a' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse" style={{ background: '#111', aspectRatio: '16/10' }} />
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <p className="text-sm tracking-widest text-gray-700 uppercase">No Content</p>
              <button onClick={() => setIsUploadOpen(true)}
                className="mt-2 px-6 py-2 text-xs border text-gray-500 hover:text-white hover:border-gray-500 transition-colors tracking-widest"
                style={{ borderColor: '#2a2a2a' }}>
                + UPLOAD FIRST CONTENT
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px" style={{ background: '#2a2a2a' }}>
                {contents.map((content) => (
                  <ContentCard key={content.id} content={content}
                    onEdit={setEditTarget} onDelete={setDeleteTarget} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
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