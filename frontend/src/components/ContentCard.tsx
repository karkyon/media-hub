import { Content } from '@/types/api';
import { getMediaUrl } from '@/lib/api';
import Link from 'next/link';

interface Props {
  content: Content;
}

export default function ContentCard({ content }: Props) {
  return (
    <Link href={`/contents/${content.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-5xl">
          {content.type === 'video' ? '🎥' : '🖼️'}
          
          {/* Type Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded bg-black/60 text-white text-xs font-semibold">
            {content.type === 'video' ? '動画' : '画像'}
          </div>
        </div>

        {/* Content Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 truncate">{content.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {content.description}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{new Date(content.createdAt).toLocaleDateString('ja-JP')}</span>
            <button className="btn-primary text-sm px-4 py-1">表示</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
