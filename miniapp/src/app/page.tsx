'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HintCard } from '@/components/hint-card'
import { ResultDialog } from '@/components/result-dialog'
import { Button } from '@/components/ui/button'
import { Star, Sparkles, Clock } from 'lucide-react'

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
  const [userId, setUserId] = useState<string>('demo-user') // In real app, this would come from Farcaster Connect

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Game Available</h1>
          <p className="text-gray-600">Check back later for today's hints!</p>
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
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Brooklyn's Daily Hints
          </h1>
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Day {gameData.day}</span>
          </div>
          {userData && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
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
        <p className="text-lg text-gray-700 mb-2">
          Pick the hint that best describes today's story!
        </p>
        <p className="text-sm text-gray-500">
          Only one guess per day • Correct answers earn 10 points
        </p>
      </motion.div>

      {/* Game Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
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
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Clock className="w-5 h-5" />
              <span className="font-medium">You've already played today!</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Come back tomorrow for new hints.
            </p>
          </div>
        )}
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