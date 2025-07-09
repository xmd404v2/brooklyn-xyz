import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getBrooklynImage(index: number): string {
  const images = [
    '/assets/brooklyn_sprite_excited.png',
    '/assets/brooklyn_sprite_sleeping.png',
    '/assets/brooklyn_sprite_strong.png',
    '/assets/brooklyn_sprite_wave.png'
  ]
  return images[index % images.length]
} 