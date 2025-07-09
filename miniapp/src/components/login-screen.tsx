'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useFarcasterAuth } from '@/lib/farcaster-auth'
import { Sparkles, User } from 'lucide-react'
import Image from 'next/image'

export function LoginScreen() {
  const { connect, isLoading } = useFarcasterAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto text-center"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-[var(--neon-pink)] opacity-70" />
            <h1 className="text-4xl font-orbitron font-bold text-white tracking-wide drop-shadow-lg">
              Cipher City
            </h1>
            <Sparkles className="w-8 h-8 text-[var(--neon-pink)] opacity-70" />
          </div>
          <p className="text-lg text-white/80 mb-2 font-orbitron">Crack the daily code. Guess the right hint, earn points, and climb the leaderboard.</p>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          {/* <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-[#23243a] bg-[#181a20] mx-auto">
            <Image
              src="/assets/brooklyn-hero.png"
              alt="Cipher City Hero"
              fill
              className="object-contain"
              sizes="160px"
              priority
            />
          </div> */}
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={connect}
            disabled={isLoading}
            size="lg"
            className="neon-btn px-10 py-4 text-lg font-orbitron shadow-[0_0_24px_var(--neon-cyan)]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Connect with Farcaster</span>
              </div>
            )}
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-3 text-center mx-auto max-w-xs"
        >
          <div className="flex items-center justify-center space-x-3 text-sm text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Guess one hint daily</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-sm text-yellow-300">
            <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
            <span>Earn points if correct</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-sm text-pink-400">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span>Climb the leaderboard</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 