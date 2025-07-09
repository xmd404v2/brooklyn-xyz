import { NextRequest, NextResponse } from 'next/server';
import { createFrameResponse } from 'frames.js/server';

export async function POST(req: NextRequest) {
  // You can parse the request and handle frame state here if needed

  // Example: simple frame with a button
  const frame = createFrameResponse({
    image: 'https://your-app.vercel.app/assets/brooklyn_sprite_excited.png', // Replace with your deployed image URL
    buttons: [
      { label: 'Play Cipher City', action: 'post_redirect', target: 'https://your-app.vercel.app' } // Replace with your deployed app URL
    ],
    postUrl: 'https://your-app.vercel.app/api/frame', // Replace with your deployed frame endpoint
  });

  return NextResponse.json(frame);
} 