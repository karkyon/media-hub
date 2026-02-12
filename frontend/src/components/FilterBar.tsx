'use client';

interface Props {
  keyword: string;
  onKeywordChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  tagFilter: string;
  onTagFilterChange: (v: string) => void;
}

export default function FilterBar({ keyword, onKeywordChange, typeFilter, onTypeFilterChange, tagFilter, onTagFilterChange }: Props) {
  const hasFilter = keyword || typeFilter || tagFilter;
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" value={keyword} onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="キーワードで検索..." className="input-field pl-10" />
      </div>
      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #d1d5db' }}>
        {[{ value: '', label: 'すべて' }, { value: 'image', label: '画像' }, { value: 'video', label: '動画' }].map((opt) => (
          <button key={opt.value} type="button" onClick={() => onTypeFilterChange(opt.value)}
            className="px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: typeFilter === opt.value ? '#3b82f6' : 'white',
              color: typeFilter === opt.value ? 'white' : '#374151',
            }}>
            {opt.label}
          </button>
        ))}
      </div>
      <input type="text" value={tagFilter} onChange={(e) => onTagFilterChange(e.target.value)}
        placeholder="タグで絞り込み" className="input-field sm:w-40" />
      {hasFilter && (
        <button type="button" onClick={() => { onKeywordChange(''); onTypeFilterChange(''); onTagFilterChange(''); }}
          className="btn-secondary">クリア</button>
      )}
    </div>
  );
}