import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, ChefHat, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login, isLoggedIn, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const from = location.state?.from?.pathname || '/dashboard'

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      console.log('👤 User already authenticated, redirecting to dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, authLoading, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Ensure required fields are present
      const loginData = {
        email: data.email!,
        password: data.password!,
      }
      
      await login(loginData)
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error('Login failed:', err)
      
      // Extract meaningful error message
      let errorMessage = 'Login failed. Please try again.'
      
      if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.response?.data) {
        errorMessage = typeof err.response.data === 'string' 
          ? err.response.data 
          : JSON.stringify(err.response.data)
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      // Check for specific error cases
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('not found')) {
        errorMessage = "Account not found. Please register first."
      } else if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('invalid')) {
        errorMessage = "Incorrect password. Please try again."
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chef-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,theme(colors.chef.500/10),transparent)] animate-float"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.sage.500/10),transparent)] animate-pulse-slow"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8"
      >
        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-chef-500 to-chef-600 text-white mb-4 shadow-lg"
            >
              <ChefHat className="h-8 w-8" />
            </motion.div>
            <h1 className="text-2xl font-medium text-foreground mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">Sign in to your ChefoodAI™ account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 bg-background/50 border-border/50 focus:border-chef-500 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-chef-500 transition-colors"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-chef-500 to-chef-600 hover:from-chef-600 hover:to-chef-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-chef-600 hover:text-chef-700 font-medium transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}