import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { ChefHat } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chef-50/30 via-white to-chef-100/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-chef-500 to-chef-600 text-white mb-4 shadow-lg"
          >
            <ChefHat className="h-8 w-8" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Checking authentication...</h3>
          <p className="text-sm text-gray-600">Please wait while we verify your access</p>
        </motion.div>
      </div>
    )
  }

  if (!isLoggedIn) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
} 