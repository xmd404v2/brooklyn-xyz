import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, GalleryThumbnailsIcon as Gallery, Coins } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">NFT Upload & Gallery</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your images to IPFS and manage your NFT queue with our simple interface
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              Upload NFT
            </CardTitle>
            <CardDescription>Upload your image to IPFS and add it to the NFT processing queue</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground mb-4 space-y-1">
              <li>• Upload images to IPFS via Pinata</li>
              <li>• Add name and description</li>
              <li>• Automatic queue management</li>
            </ul>
            <Link href="/upload">
              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Start Upload
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gallery className="h-6 w-6 text-primary" />
              View Gallery
            </CardTitle>
            <CardDescription>Browse all uploaded NFTs and view their status and details</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground mb-4 space-y-1">
              <li>• View all uploaded NFTs</li>
              <li>• Check processing status</li>
              <li>• Access IPFS and blockchain links</li>
            </ul>
            <Link href="/gallery">
              <Button variant="outline" className="w-full bg-transparent">
                <Gallery className="mr-2 h-4 w-4" />
                Browse Gallery
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
                  1
                </div>
                <p className="font-medium">Upload</p>
                <p className="text-muted-foreground">Upload your image with name and description</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
                  2
                </div>
                <p className="font-medium">IPFS Storage</p>
                <p className="text-muted-foreground">Image is stored on IPFS via Pinata</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
                  3
                </div>
                <p className="font-medium">Queue & Process</p>
                <p className="text-muted-foreground">NFT enters processing queue for minting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
