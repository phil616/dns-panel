import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cloudflare DNS 管理器',
  description: '纯前端 Cloudflare DNS 管理工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
