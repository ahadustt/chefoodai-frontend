/**
 * ChefoodAI™ Utility Functions
 * Common utilities for the premium frontend application
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second')
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
}

/**
 * Format duration in minutes to readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Download data as file
 */
export function downloadAsFile(data: string, filename: string, type = 'text/plain'): void {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate color based on string (for avatars, etc.)
 */
export function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'
  ]
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Format cooking time for display
 */
export function formatCookingTime(prepTime?: number, cookTime?: number): string {
  if (!prepTime && !cookTime) return 'Time not specified'
  if (prepTime && cookTime) {
    return `${formatDuration(prepTime)} prep + ${formatDuration(cookTime)} cook`
  }
  if (prepTime) return `${formatDuration(prepTime)} prep time`
  if (cookTime) return `${formatDuration(cookTime)} cook time`
  return ''
}

/**
 * Calculate recipe difficulty color
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
    case 'easy':
      return 'text-success-600 bg-success-50'
    case 'intermediate':
    case 'medium':
      return 'text-warning-600 bg-warning-50'
    case 'advanced':
    case 'hard':
      return 'text-error-600 bg-error-50'
    case 'expert':
      return 'text-purple-600 bg-purple-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Format nutrition value
 */
export function formatNutrition(value: number, unit: string): string {
  if (value === 0) return `0${unit}`
  if (value < 1) return `<1${unit}`
  return `${Math.round(value)}${unit}`
}

/**
 * Generate recipe servings text
 */
export function formatServings(servings: number): string {
  return servings === 1 ? '1 serving' : `${servings} servings`
}

/**
 * Slugify text for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Parse recipe ingredients from text
 */
export function parseIngredients(text: string): Array<{ amount: string; name: string }> {
  const lines = text.split('\n').filter(line => line.trim())
  return lines.map(line => {
    // Simple regex to extract amount and ingredient
    const match = line.match(/^(\d+(?:\/\d+)?(?:\.\d+)?\s*\w*)\s+(.+)/)
    if (match) {
      return { amount: match[1].trim(), name: match[2].trim() }
    }
    return { amount: '', name: line.trim() }
  })
}

/**
 * Calculate recipe rating average
 */
export function calculateRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or disabled
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Storage disabled
    }
  }
}

/**
 * Session storage helpers
 */
export const sessionStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage disabled
    }
  },
  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key)
    } catch {
      // Storage disabled
    }
  }
}