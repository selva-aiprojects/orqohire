import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OrqoHire — Recruitment Intelligence Platform',
  description: 'Enterprise AI Recruitment Hub',
  icons: [
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', url: '/icon', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/icon' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}