'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface LeaderboardEntry {
  farcaster_id: string
  points: number
  rank?: number
}

export function Leaderboard({ simple }: { simple?: boolean }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('farcaster_id, points')
        .order('points', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading leaderboard:', error)
        return
      }

      const entries = data?.map((entry, index) => ({
        ...entry,
        rank: index + 1
      })) || []

      setLeaderboard(entries)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-[var(--neon-yellow)] drop-shadow-[0_0_8px_var(--neon-yellow)]" />
      case 2:
        return <Medal className="w-5 h-5 text-[var(--neon-cyan)]" />
      case 3:
        return <Medal className="w-5 h-5 text-[var(--neon-pink)]" />
      default:
        return <span className="text-sm font-medium text-[var(--neon-cyan)]">#{rank}</span>
    }
  }

  if (isLoading) {
    if (simple) {
      return (
        <div className="bg-[#181a20] border border-gray-700 rounded-lg p-4 w-full">
          <div className="font-semibold text-white mb-2">Leaderboard</div>
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )
    }
    return (
      <div className="bg-[var(--neon-card)] border border-[var(--neon-cyan)] rounded-lg p-4 shadow-xl neon-card">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="w-5 h-5 text-[var(--neon-yellow)]" />
          <h3 className="font-semibold text-[var(--neon-cyan)] drop-shadow-[0_0_6px_var(--neon-cyan)]">Top Players</h3>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2 bg-[#23243a] rounded animate-pulse">
              <div className="w-4 h-4 bg-[var(--neon-cyan)] rounded"></div>
              <div className="w-24 h-4 bg-[var(--neon-cyan)] rounded"></div>
              <div className="w-12 h-4 bg-[var(--neon-cyan)] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (simple) {
    return (
      <div className="bg-[#181a20] border border-gray-700 rounded-lg p-4 w-full">
        <div className="font-semibold text-white mb-2">Leaderboard</div>
        <div className="flex flex-col gap-2">
          {leaderboard.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-2">No players yet. Be the first to play!</div>
          ) : (
            leaderboard.map((entry, index) => (
              <div key={entry.farcaster_id} className="flex items-center justify-between text-white text-sm px-2 py-1">
                <span className="w-6 text-gray-400">{index + 1}.</span>
                <span className="flex-1 truncate">@{entry.farcaster_id.slice(0, 8)}...</span>
                <span className="font-bold">{entry.points}</span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--neon-card)] border border-[var(--neon-cyan)] rounded-lg p-4 shadow-xl neon-card"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="w-5 h-5 text-[var(--neon-yellow)]" />
        <h3 className="font-semibold text-[var(--neon-cyan)] drop-shadow-[0_0_6px_var(--neon-cyan)]">Top Players</h3>
      </div>
      
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <p className="text-sm text-[var(--neon-orange)] text-center py-4">
            No players yet. Be the first to play!
          </p>
        ) : (
          leaderboard.map((entry, index) => (
            <motion.div
              key={entry.farcaster_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 hover:bg-[#23243a] rounded transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6">
                  {getRankIcon(entry.rank!)}
                </div>
                <span className="text-sm font-semibold text-[var(--neon-cyan)] drop-shadow-[0_0_4px_var(--neon-cyan)]">
                  @{entry.farcaster_id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-[var(--neon-yellow)]" />
                <span className="text-sm font-bold text-[var(--neon-yellow)] drop-shadow-[0_0_4px_var(--neon-yellow)]">
                  {entry.points}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
} 