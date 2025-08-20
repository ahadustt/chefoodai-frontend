import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { checkBackendHealth } from '@/lib/api'

interface HealthIndicatorProps {
  className?: string
  showLabel?: boolean
}

export function HealthIndicator({ className = '', showLabel = true }: HealthIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkHealth = async () => {
    setStatus('checking')
    try {
      const health = await checkBackendHealth()
      setStatus(health.ai_connected ? 'connected' : 'disconnected')
      setLastChecked(new Date())
    } catch (error) {
      setStatus('disconnected')
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    checkHealth()
    // Check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: Loader2,
          text: 'Checking AI...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          animate: true
        }
      case 'connected':
        return {
          icon: Wifi,
          text: 'AI Connected',
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          animate: false
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'AI Offline',
          color: 'text-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          animate: false
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${config.bgColor} ${className}`}
    >
      <Icon 
        className={`h-3 w-3 ${config.color} ${config.animate ? 'animate-spin' : ''}`} 
      />
      {showLabel && (
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
      )}
      {lastChecked && status !== 'checking' && (
        <span className="text-xs text-muted-foreground">
          {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </motion.div>
  )
} 