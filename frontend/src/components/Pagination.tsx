'use client';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors disabled:opacity-40"
        style={{ border: '1px solid #e5e7eb', background: 'white', color: '#374151' }}>‹</button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <span key={p} className="flex items-center gap-1">
            {prev && p - prev > 1 && <span className="px-1 text-gray-400">…</span>}
            <button onClick={() => onPageChange(p)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
              style={{
                background: p === currentPage ? '#3b82f6' : 'white',
                color: p === currentPage ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
              }}>
              {p}
            </button>
          </span>
        );
      })}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors disabled:opacity-40"
        style={{ border: '1px solid #e5e7eb', background: 'white', color: '#374151' }}>›</button>
    </div>
  );
}