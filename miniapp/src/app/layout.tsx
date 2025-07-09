import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Brooklyn Daily Hints Game',
  description: 'Test your intuition with Brooklyn\'s daily hints game! Pick the right card and earn points.',
  openGraph: {
    title: 'Brooklyn Daily Hints Game',
    description: 'Test your intuition with Brooklyn\'s daily hints game! Pick the right card and earn points.',
    images: ['/assets/brooklyn_sprite_excited.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/assets/brooklyn_sprite_excited.png',
    'fc:frame:button:1': 'Play Daily Hints Game',
    'fc:frame:post_url': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/frame`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {children}
        </div>
      </body>
    </html>
  )
} 