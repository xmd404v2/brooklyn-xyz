import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Orbitron } from 'next/font/google'
import './globals.css'
import { FarcasterAuthProvider } from '@/lib/farcaster-auth'
import { EnvCheck } from '@/components/env-check'
import { ErrorBoundary } from '@/components/error-boundary'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], weight: ['700'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'Cipher City',
  description: 'Crack the daily code in Cipher City. Guess the right hint, earn points, and climb the leaderboard.',
  openGraph: {
    title: 'Cipher City',
    description: 'Crack the daily code in Cipher City. Guess the right hint, earn points, and climb the leaderboard.',
    images: ['/assets/brooklyn_sprite_excited.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/assets/brooklyn_sprite_excited.png',
    'fc:frame:button:1': 'Play Cipher City',
    'fc:frame:post_url': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/frame`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={"dark " + orbitron.variable}>
      <body className={inter.className + ' dark bg-[#10121a] text-white font-sans ' + orbitron.variable}>
        <ErrorBoundary>
          <EnvCheck />
          <FarcasterAuthProvider>
            {/* Clean, dark cyberpunk background */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#10121a] via-[#181a20] to-[#181a20]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#23243a]/60 via-[#181a20]/60 to-black/80" />
              {/* Hero image accent, subtle and clean */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[340px] h-[340px] pointer-events-none opacity-60">
                {/* <Image src="/assets/brooklyn-hero.png" alt="Cipher City Hero" fill className="object-contain" priority /> */}
              </div>
            </div>
            <div className="min-h-screen relative flex flex-col dark">
              {children}
            </div>
          </FarcasterAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 