interface Props {
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
}

export default function FilterBar({
  typeFilter,
  setTypeFilter,
  searchKeyword,
  setSearchKeyword,
}: Props) {
  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="🔍 検索キーワード"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1 input-field"
          />

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                typeFilter === ''
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全て
            </button>
            <button
              onClick={() => setTypeFilter('video')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                typeFilter === 'video'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎥 動画
            </button>
            <button
              onClick={() => setTypeFilter('image')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                typeFilter === 'image'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🖼️ 画像
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
