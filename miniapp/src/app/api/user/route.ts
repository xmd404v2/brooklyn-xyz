import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/user?userId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }
  const { data: user, error } = await supabase
    .from('users')
    .select('points')
    .eq('id', userId)
    .single()
  if (error || !user) {
    return NextResponse.json({ points: 0 })
  }
  return NextResponse.json({ points: user.points || 0 })
} 