'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HintCard } from '@/components/hint-card'
import { ResultDialog } from '@/components/result-dialog'
import { Button } from '@/components/ui/button'
import { Star, Sparkles, Clock } from 'lucide-react'
import { useFarcasterAuth } from '@/lib/farcaster-auth'
import { LoginScreen } from '@/components/login-screen'
import { UserProfile } from '@/components/user-profile'
import { Leaderboard } from '@/components/leaderboard'
import Image from 'next/image'

interface GameData {
  hints: string[]
  correctIndex: number
  day: number
  title: string // Add title to GameData
}

interface UserData {
  points: number
  lastGuessDate?: string
}

export default function GamePage() {
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<{
    isCorrect: boolean
    message: string
    points: number
  } | null>(null)
  const [shuffledHints, setShuffledHints] = useState<string[]>([])
  const [correctHint, setCorrectHint] = useState<string>("")
  const { user, isConnected, isLoading: authLoading } = useFarcasterAuth()
  const userId = user?.fid || 'demo-user'

  // Shuffle function
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // Add helper for truncating userId
  function truncateId(id: string) {
    if (!id) return ''
    if (id.length <= 12) return id
    return `${id.slice(0, 6)}...${id.slice(-4)}`
  }

  // Load game data on mount
  useEffect(() => {
    loadGameData()
  }, [])

  const loadGameData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/hints')
      if (response.ok) {
        const data = await response.json()
        setGameData(data)
        // Shuffle hints and store correct answer
        if (data.hints && data.hints.length > 0) {
          const correct = data.hints[0]
          const shuffled = shuffleArray(data.hints)
          setCorrectHint(correct)
          setShuffledHints(shuffled)
        }
      } else {
        console.error('Failed to load game data')
      }
    } catch (error) {
      console.error('Error loading game data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardSelect = (index: number) => {
    if (isSubmitting) return
    setSelectedCard(index)
  }

  const handleSubmitGuess = async () => {
    if (selectedCard === null || isSubmitting) return
    try {
      setIsSubmitting(true)
      const selectedHint = shuffledHints[selectedCard]
      const isCorrect = selectedHint === correctHint
      // POST to backend for points update
      const response = await fetch('/api/hints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          selectedHint,
        }),
      })
      const result = await response.json()
      setResultData({
        isCorrect,
        message: result.message,
        points: result.points,
      })
      // Fetch latest user data for updated points
      fetchUserData()
      setShowResult(true)
    } catch (error) {
      console.error('Error submitting guess:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add fetchUserData function
  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUserData({ points: data.points })
      }
    } catch (error) {
      // ignore
    }
  }

  const handleResultClose = () => {
    setShowResult(false)
    setResultData(null)
    setSelectedCard(null)
    // Reload a new story and reshuffle
    loadGameData()
  }

  // Remove hasPlayedToday and daily restriction logic

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!isConnected) {
    return <LoginScreen />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-orbitron font-bold text-[var(--neon-cyan)] drop-shadow-[0_0_16px_var(--neon-cyan)] mb-4">No Game Available</h1>
          <p className="text-lg text-[var(--neon-orange)]">Check back later for today's hints!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-8 h-8 text-[var(--neon-pink)] opacity-70" />
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white tracking-wide drop-shadow-lg">
            Cipher City
          </h1>
          <Sparkles className="w-8 h-8 text-[var(--neon-pink)] opacity-70" />
        </div>
        <div className="flex flex-col items-center justify-center space-y-2 text-base text-white/80">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Day {gameData.day}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-lg">{gameData.title}</span>
          </div>
          {userData && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-[var(--neon-yellow)]" />
              <span>{userData.points} Points</span>
            </div>
          )}
        </div>
      </motion.header>

      {/* Game Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <p className="text-lg font-orbitron text-white mb-2">
          Which clue cracks today's code?
        </p>
        <p className="text-base text-white/70">
          Unlimited plays · <span className="text-[var(--neon-yellow)] font-semibold">10 points for a correct answer, 3 for incorrect</span>
        </p>
      </motion.div>

      {/* Game Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto mb-8 space-y-8"
      >
        {shuffledHints.map((hint, index) => (
          <HintCard
            key={index}
            hint={hint}
            index={index}
            isSelected={selectedCard === index}
            onClick={() => handleCardSelect(index)}
            disabled={isSubmitting}
          />
        ))}
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        {selectedCard !== null && (
          <Button
            onClick={handleSubmitGuess}
            disabled={isSubmitting}
            size="lg"
            className="neon-btn px-12 py-4 text-xl font-orbitron shadow-[0_0_32px_var(--neon-cyan)]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Pick This Card!</span>
              </div>
            )}
          </Button>
        )}
      </motion.div>

      {/* User Stats Section */}
      <div className="max-w-md mx-auto mt-16 w-full">
        <div className="mb-4 p-4 rounded-lg bg-[#181a20] border border-[var(--neon-cyan)] flex items-center justify-between text-white">
          <div>
            <span className="block text-xs text-gray-400">User</span>
            <span className="text-lg font-bold text-[var(--neon-cyan)]">{truncateId(userId)}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-400">Points</span>
            <span className="text-lg font-bold text-[var(--neon-yellow)]">{userData?.points ?? 0}</span>
          </div>
        </div>
        {/* Simple Leaderboard */}
        <Leaderboard simple />
      </div>

      {/* Result Dialog */}
      {resultData && (
        <ResultDialog
          isOpen={showResult}
          onClose={handleResultClose}
          isCorrect={resultData.isCorrect}
          message={resultData.message}
          points={resultData.points}
        />
      )}
    </div>
  )
} 