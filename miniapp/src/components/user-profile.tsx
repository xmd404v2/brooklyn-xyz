'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useFarcasterAuth } from '@/lib/farcaster-auth'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'

export function UserProfile() {
  const { user, disconnect } = useFarcasterAuth()

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200"
    >
      {/* User Avatar */}
      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
        {user.pfp ? (
          <Image
            src={user.pfp}
            alt={user.displayName || user.username || 'User'}
            fill
            className="object-cover"
            sizes="32px"
          />
        ) : (
          <User className="w-5 h-5 text-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-800 truncate">
          {user.displayName || user.username || `@${user.fid}`}
        </span>
        {user.displayName && user.username && (
          <span className="text-xs text-gray-500 truncate">
            @{user.username}
          </span>
        )}
      </div>

      {/* Disconnect Button */}
      <Button
        onClick={disconnect}
        variant="ghost"
        size="sm"
        className="p-1 h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </motion.div>
  )
} 