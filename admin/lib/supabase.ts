import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type NFTQueue = {
  id: string
  name: string
  description: string | null
  nft_ipfshash: string | null
  created_at: string | null
  posted_at: string | null
  status: "pending" | "processing" | "completed" | "failed"
  tx: string | null
  coin: string | null
  error_message: string | null
}
