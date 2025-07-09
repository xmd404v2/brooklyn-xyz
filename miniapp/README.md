# Brooklyn Daily Hints - Farcaster Mini App

A beautiful, mobile-first Farcaster Mini App that lets users test their intuition with Brooklyn's daily hints game. Players pick from 3 hint cards each day, with correct guesses earning points.

## 🎮 Features

- **Daily Hints Game**: Pick the correct hint from 3 options each day
- **Farcaster Authentication**: Seamless login with Farcaster Connect
- **Points System**: Earn 10 points for correct guesses
- **Leaderboard**: See top players and compete for high scores
- **Beautiful UI**: Brooklyn-themed cards with smooth animations
- **Mobile Optimized**: Perfect for mobile devices and Farcaster Frames
- **Real-time Updates**: Instant feedback and score updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Farcaster account (for testing)

### Installation

1. **Clone and navigate to the miniapp directory:**
   ```bash
   cd miniapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Framer Motion
- **Authentication**: Farcaster Connect (@farcaster/auth-client)
- **Database**: Supabase
- **Styling**: Tailwind CSS with custom animations

### Key Components

- **`/src/app/page.tsx`**: Main game interface
- **`/src/components/hint-card.tsx`**: Interactive hint cards with Brooklyn images
- **`/src/components/result-dialog.tsx`**: Success/failure feedback modal
- **`/src/components/login-screen.tsx`**: Farcaster authentication screen
- **`/src/components/user-profile.tsx`**: User profile display
- **`/src/components/leaderboard.tsx`**: Top players leaderboard
- **`/src/lib/farcaster-auth.tsx`**: Farcaster authentication context
- **`/src/app/api/hints/route.ts`**: Game logic API endpoints

### Database Schema

The app uses two main tables:

**`story_queue`** (from existing backend):
- `id`, `day`, `title`, `prompt`, `status`, `created_at`
- Hints are generated from the `prompt` field

**`users`** (new table):
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farcaster_id TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  last_guess_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Game Flow

1. **User visits the app** → Login screen appears
2. **User connects with Farcaster** → Authentication via Farcaster Connect
3. **Game loads** → 3 hint cards displayed (randomized order)
4. **User selects a card** → Card highlights, "Pick This Card" button appears
5. **User submits guess** → API validates and returns result
6. **Result shown** → Success/failure dialog with points update
7. **User can't play again** → Until next day

## 🎨 UI/UX Features

- **Brooklyn Images**: Each card features a different Brooklyn sprite
- **Smooth Animations**: Framer Motion for delightful interactions
- **Mobile-First**: Optimized for thumb navigation
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: Graceful error messages

## 🔧 API Endpoints

### `GET /api/hints`
Returns today's hints in randomized order:
```json
{
  "hints": ["hint1", "hint2", "hint3"],
  "correctIndex": 1,
  "day": 42
}
```

### `POST /api/hints`
Submit user's guess:
```json
{
  "userId": "farcaster_fid",
  "selectedHintIndex": 1
}
```

Returns:
```json
{
  "success": true,
  "isCorrect": true,
  "message": "🎉 Correct! You earned 10 points!",
  "points": 50
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 🔮 Future Enhancements

- [ ] **Streak Counter**: Track consecutive correct guesses
- [ ] **Achievement System**: Badges for milestones
- [ ] **Social Sharing**: Share results on Farcaster
- [ ] **Custom Hints**: Admin interface to create custom hints
- [ ] **Multiplayer**: Real-time competition features
- [ ] **Analytics**: Track game performance and user engagement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Brooklyn NFT collection ecosystem.

## 🆘 Support

For issues or questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include browser console logs if applicable

---

**Built with ❤️ for the Farcaster community** 