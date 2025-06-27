import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NFT Upload & Gallery",
  description: "Upload and manage your NFTs",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-primary">
                  NFT Gallery
                </Link>
                <div className="flex space-x-6">
                  <Link href="/" className="text-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                  <Link href="/upload" className="text-foreground hover:text-primary transition-colors">
                    Upload
                  </Link>
                  <Link href="/gallery" className="text-foreground hover:text-primary transition-colors">
                    Gallery
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}
