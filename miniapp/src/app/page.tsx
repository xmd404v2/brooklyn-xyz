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
  const { user, isConnected, isLoading: authLoading } = useFarcasterAuth()
  const userId = user?.fid || 'demo-user'

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
      const response = await fetch('/api/hints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          selectedHintIndex: selectedCard,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setResultData({
          isCorrect: result.isCorrect,
          message: result.message,
          points: result.points,
        })
        setUserData({ points: result.points })
        setShowResult(true)
      } else {
        // Handle already played today
        setResultData({
          isCorrect: false,
          message: result.message,
          points: result.points || 0,
        })
        setShowResult(true)
      }
    } catch (error) {
      console.error('Error submitting guess:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResultClose = () => {
    setShowResult(false)
    setResultData(null)
    setSelectedCard(null)
  }

  const hasPlayedToday = () => {
    if (!userData?.lastGuessDate) return false
    const today = new Date().toISOString().split('T')[0]
    return userData.lastGuessDate === today
  }

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
    // Show login with hero image centered
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
      {/* User Profile */}
      <div className="absolute top-4 right-4 z-10">
        <UserProfile />
      </div>

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
        <div className="flex items-center justify-center space-x-4 text-base text-white/80">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Day {gameData.day}</span>
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
          1 guess per day · <span className="text-[var(--neon-yellow)] font-semibold">10 points for a correct answer</span>
        </p>
      </motion.div>

      {/* Game Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto mb-8 space-y-8"
      >
        {gameData.hints.map((hint, index) => (
          <HintCard
            key={index}
            hint={hint}
            index={index}
            isSelected={selectedCard === index}
            onClick={() => handleCardSelect(index)}
            disabled={hasPlayedToday() || isSubmitting}
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
        {selectedCard !== null && !hasPlayedToday() && (
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

        {hasPlayedToday() && (
          <div className="bg-[var(--neon-card)] border border-[var(--neon-cyan)] rounded-lg p-4 max-w-md mx-auto mt-4 shadow-xl">
            <div className="flex items-center space-x-2 text-[var(--neon-yellow)]">
              <Clock className="w-5 h-5" />
              <span className="font-medium">You've already played today!</span>
            </div>
            <p className="text-base text-[var(--neon-orange)] mt-1">
              Come back tomorrow for new hints.
            </p>
          </div>
        )}
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-2xl mx-auto mt-16"
      >
        <Leaderboard />
      </motion.div>

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