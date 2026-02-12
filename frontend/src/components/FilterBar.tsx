'use client';

interface Props {
  keyword: string;
  onKeywordChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  tagFilter: string;
  onTagFilterChange: (v: string) => void;
}

export default function FilterBar({
  keyword, onKeywordChange,
  typeFilter, onTypeFilterChange,
  tagFilter, onTagFilterChange,
}: Props) {
  const hasFilter = keyword || typeFilter || tagFilter;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" value={keyword} onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none transition-colors"
          style={{ background: 'transparent', border: '1px solid #2a2a2a' }} />
      </div>

      <div className="flex" style={{ border: '1px solid #2a2a2a' }}>
        {[{ value: '', label: 'ALL' }, { value: 'image', label: 'IMAGE' }, { value: 'video', label: 'VIDEO' }].map((opt) => (
          <button key={opt.value} type="button" onClick={() => onTypeFilterChange(opt.value)}
            className="px-4 py-2 text-xs tracking-widest transition-all duration-150"
            style={{
              background: typeFilter === opt.value ? 'white' : 'transparent',
              color: typeFilter === opt.value ? 'black' : '#6b7280',
            }}>
            {opt.label}
          </button>
        ))}
      </div>

      <input type="text" value={tagFilter} onChange={(e) => onTagFilterChange(e.target.value)}
        placeholder="# Tag"
        className="px-4 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none transition-colors sm:w-36"
        style={{ background: 'transparent', border: '1px solid #2a2a2a' }} />

      {hasFilter && (
        <button type="button"
          onClick={() => { onKeywordChange(''); onTypeFilterChange(''); onTagFilterChange(''); }}
          className="px-3 py-2 text-xs text-gray-500 hover:text-gray-200 transition-colors whitespace-nowrap"
          style={{ border: '1px solid #2a2a2a' }}>
          Clear
        </button>
      )}
    </div>
  );
}