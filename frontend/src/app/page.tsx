'use client';

import { useState, useEffect } from 'react';
import { contentsApi } from '@/lib/api';
import { Content } from '@/types/api';
import ContentCard from '@/components/ContentCard';
import FilterBar from '@/components/FilterBar';
import UploadModal from '@/components/UploadModal';
import Pagination from '@/components/Pagination';

export default function Home() {
  const [contents, setContents] = useState<Content[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // フィルター状態
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await contentsApi.getAll({
        page,
        limit: 20,
        type: typeFilter || undefined,
        keyword: searchKeyword || undefined,
      });
      setContents(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [page, typeFilter, searchKeyword]);

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    fetchContents();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b-2 border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">📚 社内メディアライブラリ</h1>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>追加</span>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              コンテンツが見つかりません
            </h3>
            <p className="text-gray-500">
              新しいコンテンツを追加してください
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
