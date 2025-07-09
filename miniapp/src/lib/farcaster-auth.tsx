'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@farcaster/auth-client'

interface FarcasterUser {
  fid: string
  username?: string
  displayName?: string
  pfp?: string
}

interface FarcasterAuthContextType {
  user: FarcasterUser | null
  isConnected: boolean
  isLoading: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const FarcasterAuthContext = createContext<FarcasterAuthContextType | undefined>(undefined)

export function FarcasterAuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<any>(null)
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initClient = async () => {
      try {
        const authClient = createClient({
          appName: 'Brooklyn Daily Hints',
          appIcon: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/assets/brooklyn_sprite_excited.png`,
          appDescription: 'Test your intuition with Brooklyn\'s daily hints game!',
          appUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
          appDomain: process.env.NEXT_PUBLIC_BASE_URL?.replace('https://', '').replace('http://', '') || 'localhost:3000',
        })

        setClient(authClient)

        // For now, we'll use a demo user since the auth flow is complex
        // In production, you'd implement the full Farcaster auth flow
        setUser({
          fid: 'demo-user-123',
          username: 'demo',
          displayName: 'Demo User',
          pfp: undefined,
        })
      } catch (error) {
        console.error('Failed to initialize Farcaster auth client:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initClient()
  }, [])

  const connect = async () => {
    try {
      setIsLoading(true)
      // For demo purposes, simulate connection
      setTimeout(() => {
        setUser({
          fid: 'demo-user-123',
          username: 'demo',
          displayName: 'Demo User',
          pfp: undefined,
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to connect to Farcaster:', error)
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      setUser(null)
    } catch (error) {
      console.error('Failed to disconnect from Farcaster:', error)
    }
  }

  const value: FarcasterAuthContextType = {
    user,
    isConnected: !!user,
    isLoading,
    connect,
    disconnect,
  }

  return (
    <FarcasterAuthContext.Provider value={value}>
      {children}
    </FarcasterAuthContext.Provider>
  )
}

export function useFarcasterAuth() {
  const context = useContext(FarcasterAuthContext)
  if (context === undefined) {
    throw new Error('useFarcasterAuth must be used within a FarcasterAuthProvider')
  }
  return context
} 