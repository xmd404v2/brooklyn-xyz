import { type NextRequest, NextResponse } from "next/server"
import { PinataSDK } from "pinata"
import { supabase } from "@/lib/supabase"

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud",
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!file || !name) {
      return NextResponse.json({ error: "File and name are required" }, { status: 400 })
    }

    // Upload to Pinata IPFS using SDK
    const upload = await pinata.upload.public.file(file);

    const ipfsHash = upload.cid;

    // Save to Supabase
    const { data, error } = await supabase
      .from("nft_queue")
      .insert([
        {
          name,
          description: description || null,
          nft_ipfshash: ipfsHash,
          status: "pending",
        },
      ])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      ipfsHash,
      ipfsUrl: `https://${process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud"}/ipfs/${ipfsHash}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
