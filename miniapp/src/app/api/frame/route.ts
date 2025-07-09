import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { untrustedData } = body
    
    // For now, just redirect to the main game page
    // In a full implementation, you'd handle the frame interaction here
    return NextResponse.json({
      frames: {
        version: 'vNext',
        image: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/assets/brooklyn_sprite_excited.png`,
        buttons: [
          {
            label: 'Play Daily Hints Game',
            action: 'post_redirect',
            target: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`
          }
        ]
      }
    })
  } catch (error) {
    console.error('Frame API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 