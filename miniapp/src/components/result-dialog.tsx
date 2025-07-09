'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, XCircle, Star } from 'lucide-react'

interface ResultDialogProps {
  isOpen: boolean
  onClose: () => void
  isCorrect: boolean
  message: string
  points: number
}

export function ResultDialog({ isOpen, onClose, isCorrect, message, points }: ResultDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isCorrect ? '🎉 Congratulations!' : '😔 Not This Time'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative"
          >
            {isCorrect ? (
              <div className="relative">
                <Trophy className="w-20 h-20 text-yellow-500" />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </motion.div>
              </div>
            ) : (
              <XCircle className="w-20 h-20 text-red-500" />
            )}
          </motion.div>
          
          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-lg font-medium text-gray-800 mb-2">
              {message}
            </p>
            <p className="text-sm text-gray-600">
              {isCorrect 
                ? "You've earned points for your keen intuition!" 
                : "Don't worry, you can try again tomorrow!"
              }
            </p>
          </motion.div>
          
          {/* Points Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full"
          >
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span className="font-bold text-lg">{points} Points</span>
            </div>
          </motion.div>
          
          {/* Confetti Effect for Success */}
          {isCorrect && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -10,
                    opacity: 1,
                  }}
                  animate={{
                    y: window.innerHeight + 10,
                    opacity: 0,
                    rotate: 360,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <Button onClick={onClose} className="w-full">
            {isCorrect ? 'Continue' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 