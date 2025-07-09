import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { shuffleArray, getTodayString } from '@/lib/utils'

// GET /api/hints - Returns a random story's hints in randomized order
export async function GET() {
  try {
    // Get all stories from story_queue
    const { data: stories, error: storiesError } = await supabase
      .from('story_queue')
      .select('*')

    if (storiesError || !stories || stories.length === 0) {
      console.error('Error fetching stories:', storiesError)
      return NextResponse.json({ error: 'No stories available' }, { status: 404 })
    }

    // Pick a random story
    const storyData = stories[Math.floor(Math.random() * stories.length)]

    // Use the hints array from the story
    const hints = Array.isArray(storyData.hints) ? [...storyData.hints] : []
    if (hints.length < 1) {
      return NextResponse.json({ error: 'No hints available for this story' }, { status: 404 })
    }
    // The first hint is always the correct answer
    const correctHint = hints[0]
    // Shuffle the hints for display
    const shuffledHints = shuffleArray([...hints])
    const correctIndex = shuffledHints.findIndex(hint => hint === correctHint)

    return NextResponse.json({
      hints: shuffledHints,
      correctIndex,
      day: storyData.day,
      title: storyData.title
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hints - Records user's guess and returns result
export async function POST(request: NextRequest) {
  try {
    const { userId, selectedHint } = await request.json()
    if (!userId || !selectedHint) {
      return NextResponse.json({ error: 'Missing userId or selectedHint' }, { status: 400 })
    }
    // Get all stories from story_queue
    const { data: stories, error: storiesError } = await supabase
      .from('story_queue')
      .select('*')
    if (storiesError || !stories || stories.length === 0) {
      return NextResponse.json({ error: 'No stories available' }, { status: 404 })
    }
    // Pick a random story (simulate the same as GET)
    const storyData = stories[Math.floor(Math.random() * stories.length)]
    const hints = Array.isArray(storyData.hints) ? [...storyData.hints] : []
    if (hints.length < 1) {
      return NextResponse.json({ error: 'No hints available for this story' }, { status: 404 })
    }
    const correctHint = hints[0]
    const isCorrect = selectedHint === correctHint
    const pointsToAdd = isCorrect ? 10 : 3
    // Fetch user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    // Upsert user record (add to points)
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        points: (existingUser?.points || 0) + pointsToAdd,
      }, { onConflict: 'id' })
    if (upsertError) {
      return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 })
    }
    // Fetch the updated user
    const { data: userData, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (selectError) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }
    return NextResponse.json({
      success: true,
      isCorrect,
      message: isCorrect
        ? '🎉 Correct! You earned 10 points!'
        : 'Not your lucky day today. You earned 3 points!',
      points: userData.points
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 