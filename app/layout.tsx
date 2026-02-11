import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '亚马逊全自动分析',
  description: 'Connected to n8n & Feishu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
