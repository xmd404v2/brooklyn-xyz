import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { shuffleArray, getTodayString } from '@/lib/utils'

// GET /api/hints - Returns today's hints in randomized order
export async function GET() {
  try {
    const today = getTodayString()
    
    // Get today's story from story_queue
    const { data: storyData, error: storyError } = await supabase
      .from('story_queue')
      .select('*')
      .gte('created_at', today)
      .lt('created_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (storyError) {
      console.error('Error fetching story:', storyError)
      return NextResponse.json({ error: 'No story found for today' }, { status: 404 })
    }

    // For now, we'll create hints from the prompt since hints field doesn't exist yet
    // In a real implementation, this would come from storyData.hints
    const prompt = storyData.prompt
    const words = prompt.split(' ').filter(word => word.length > 3)
    const correctHint = words.slice(0, 5).join(' ') + '...'
    const incorrectHint1 = words.slice(5, 10).join(' ') + '...'
    const incorrectHint2 = words.slice(10, 15).join(' ') + '...'
    
    const hints = [correctHint, incorrectHint1, incorrectHint2]
    const shuffledHints = shuffleArray(hints)
    
    // Find the index of the correct hint in the shuffled array
    const correctIndex = shuffledHints.findIndex(hint => hint === correctHint)

    return NextResponse.json({
      hints: shuffledHints,
      correctIndex,
      day: storyData.day
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hints - Records user's guess and returns result
export async function POST(request: NextRequest) {
  try {
    const { userId, selectedHintIndex } = await request.json()
    
    if (!userId || selectedHintIndex === undefined) {
      return NextResponse.json({ error: 'Missing userId or selectedHintIndex' }, { status: 400 })
    }

    const today = getTodayString()
    
    // Check if user has already guessed today
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('farcaster_id', userId)
      .single()

    if (existingUser?.last_guess_date === today) {
      return NextResponse.json({
        success: false,
        isCorrect: false,
        message: 'You have already played today! Come back tomorrow.',
        points: existingUser.points
      })
    }

    // Get today's story to check the correct answer
    const { data: storyData, error: storyError } = await supabase
      .from('story_queue')
      .select('*')
      .gte('created_at', today)
      .lt('created_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (storyError) {
      return NextResponse.json({ error: 'No story found for today' }, { status: 404 })
    }

    // Create hints (same logic as GET)
    const prompt = storyData.prompt
    const words = prompt.split(' ').filter(word => word.length > 3)
    const correctHint = words.slice(0, 5).join(' ') + '...'
    const incorrectHint1 = words.slice(5, 10).join(' ') + '...'
    const incorrectHint2 = words.slice(10, 15).join(' ') + '...'
    
    const hints = [correctHint, incorrectHint1, incorrectHint2]
    const shuffledHints = shuffleArray(hints)
    const correctIndex = shuffledHints.findIndex(hint => hint === correctHint)

    const isCorrect = selectedHintIndex === correctIndex
    const pointsToAdd = isCorrect ? 10 : 0

    // Upsert user record
    const { data: userData, error: upsertError } = await supabase
      .from('users')
      .upsert({
        farcaster_id: userId,
        points: (existingUser?.points || 0) + pointsToAdd,
        last_guess_date: today,
        created_at: existingUser?.created_at || new Date().toISOString()
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Error upserting user:', upsertError)
      return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      message: isCorrect 
        ? '🎉 Correct! You earned 10 points!' 
        : 'Not your lucky day today. Try again tomorrow!',
      points: userData.points
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 