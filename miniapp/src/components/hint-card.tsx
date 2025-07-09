'use client'

import React from 'react'
import Image from 'next/image'
import { cn, getBrooklynImage } from '@/lib/utils'
import { motion } from 'framer-motion'

interface HintCardProps {
  hint: string
  index: number
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

const spriteImages = [
  '/assets/brooklyn_sprite_excited.png',
  '/assets/brooklyn_sprite_sleeping.png',
  '/assets/brooklyn_sprite_strong.png',
  '/assets/brooklyn_sprite_wave.png',
]

export function HintCard({ hint, index, isSelected, onClick, disabled }: HintCardProps) {
  const sprite = spriteImages[index % spriteImages.length]
  
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300',
        'flex flex-col min-h-[180px] shadow-xl border border-[#23243a] bg-[#181a20]',
        isSelected && 'ring-2 ring-[var(--neon-yellow)]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      whileHover={!disabled ? { y: -4, scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Brooklyn Sprite Full Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={sprite}
          alt="Brooklyn Sprite"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/70" />
      </div>
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center">
        {/* Card Number */}
        <div className={cn(
          'w-8 h-8 mb-2 rounded-full flex items-center justify-center text-base font-bold',
          isSelected
            ? 'bg-[var(--neon-yellow)] text-black'
            : 'bg-[#23243a] text-white border border-white/20',
          'transition-colors duration-200',
        )}>
          {index + 1}
        </div>
        {/* Hint Text */}
        <div className="flex-1 flex items-center justify-center w-full">
          <p className="text-xl font-bold text-white text-center leading-snug drop-shadow-md">
            "{hint}"
          </p>
        </div>
      </div>
    </motion.div>
  )
} 