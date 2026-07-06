import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Blurflower — 감성 갤러리 커뮤니티',
  description: '이미지 중심의 감성 갤러리형 커뮤니티 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' className='h-full antialiased'>
      <head>
        <link rel='preconnect' href='https://cdn.jsdelivr.net' />
      </head>
      <body className='min-h-full flex flex-col' style={{ backgroundColor: '#F4EDE8' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
