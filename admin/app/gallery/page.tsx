"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import type { NFTQueue } from "@/lib/supabase"

export default function GalleryPage() {
  const [nfts, setNfts] = useState<NFTQueue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/nft", {
        cache: "no-store", // Let Vercel handle caching
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      setNfts(result.data || [])
      setError(null)
    } catch (err) {
      setError("Failed to fetch NFTs")
      console.error("Error fetching NFTs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNFTs()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getIPFSUrl = (hash: string) => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading NFTs...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchNFTs} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">NFT Gallery</h1>
          <p className="text-muted-foreground mt-2">Browse all uploaded NFTs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchNFTs} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/upload">
            <Button size="sm">Upload New NFT</Button>
          </Link>
        </div>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No NFTs found</p>
          <Link href="/upload">
            <Button>Upload Your First NFT</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nfts.map((nft) => (
            <Card key={nft.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{nft.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {new Date(nft.created_at || "").toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(nft.status)}>{nft.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {nft.nft_ipfshash && (
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={getIPFSUrl(nft.nft_ipfshash) || "/placeholder.svg"}
                      alt={nft.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=300"
                      }}
                    />
                  </div>
                )}

                {nft.description && <p className="text-sm text-muted-foreground line-clamp-3">{nft.description}</p>}

                <div className="space-y-2">
                  {nft.nft_ipfshash && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">IPFS:</span>
                      <a
                        href={getIPFSUrl(nft.nft_ipfshash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:text-primary/80"
                      >
                        View on IPFS
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {nft.coin && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Coin:</span>
                      <a
                        href={`https://etherscan.io/address/${nft.coin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:text-primary/80 font-mono"
                      >
                        {nft.coin.slice(0, 6)}...{nft.coin.slice(-4)}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {nft.tx && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">TX:</span>
                      <a
                        href={`https://etherscan.io/tx/${nft.tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:text-primary/80 font-mono"
                      >
                        {nft.tx.slice(0, 6)}...{nft.tx.slice(-4)}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {nft.error_message && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                    {nft.error_message}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
