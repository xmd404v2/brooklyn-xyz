import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface StoryQueue {
  id: number
  day: number
  title: string
  prompt: string
  hints: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  posted_at?: string
  nft_ipfshash?: string
  tx?: string
  coin?: string
}

export interface User {
  id: string
  farcaster_id: string
  points: number
  last_guess_date?: string
  created_at: string
} 