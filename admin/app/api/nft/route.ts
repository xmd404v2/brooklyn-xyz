import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("nft_queue").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(
      { data },
      {
        headers: {
          // Cache for 30 seconds, stale-while-revalidate for 60 seconds
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
