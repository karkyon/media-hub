import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '社内メディアライブラリ',
  description: '社内向け動画・画像管理システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
