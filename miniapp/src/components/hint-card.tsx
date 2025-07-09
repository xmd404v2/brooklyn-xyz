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

export function HintCard({ hint, index, isSelected, onClick, disabled }: HintCardProps) {
  const brooklynImage = getBrooklynImage(index)
  
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300",
        "bg-gradient-to-br from-white to-gray-50 shadow-lg",
        isSelected 
          ? "border-blue-500 shadow-blue-200 scale-105" 
          : "border-gray-200 hover:border-blue-300 hover:shadow-xl",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      whileHover={!disabled ? { y: -8, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Brooklyn Image Background */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src={brooklynImage}
          alt="Brooklyn"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Card Number */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            isSelected 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 text-gray-600"
          )}>
            {index + 1}
          </div>
          
          {/* Selection Indicator */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </div>
        
        {/* Hint Text */}
        <div className="flex-1 flex items-center">
          <p className="text-lg font-medium text-gray-800 leading-relaxed">
            "{hint}"
          </p>
        </div>
        
        {/* Brooklyn Image Accent */}
        <div className="mt-4 flex justify-center">
          <div className="relative w-16 h-16">
            <Image
              src={brooklynImage}
              alt="Brooklyn"
              fill
              className="object-contain opacity-60"
              sizes="64px"
            />
          </div>
        </div>
      </div>
      
      {/* Selection Glow Effect */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
} 