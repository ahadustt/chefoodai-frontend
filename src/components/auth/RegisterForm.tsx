import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ChefHat, 
  User,
  Mail,
  Lock,
  Utensils,
  Heart,
  Globe,
  Loader2,
  Check,
  Sparkles,
  Star
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  cooking_skill_level: z.string().optional(),
  dietary_preferences: z.array(z.string()).optional(),
  favorite_cuisines: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 
  'Paleo', 'Low-Carb', 'High-Protein', 'Nut-Free', 'Halal', 'Kosher'
]

const cuisineOptions = [
  'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'French', 
  'Indian', 'Thai', 'Japanese', 'Greek', 'Spanish', 'Chinese', 'Middle Eastern'
]

export function RegisterForm() {
  const { register: registerUser, isLoggedIn, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      console.log('👤 User already authenticated, redirecting to dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, authLoading, navigate])

  // Auto-redirect after successful registration
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 2000) // 2 second delay to show success message
      
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      cooking_skill_level: 'intermediate',
      dietary_preferences: [],
      favorite_cuisines: [],
    },
  })

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = []
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['first_name', 'last_name']
        break
      case 2:
        fieldsToValidate = ['email', 'password', 'confirmPassword']
        break
      case 3:
        fieldsToValidate = ['cooking_skill_level']
        break
      case 4:
        // Dietary preferences are optional, no validation needed
        break
      case 5:
        // Cuisines are optional, no validation needed
        break
    }
    
    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate)
      if (!isValid) return
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleDietaryPreference = (option: string) => {
    const updated = selectedDietary.includes(option)
      ? selectedDietary.filter(item => item !== option)
      : [...selectedDietary, option]
    setSelectedDietary(updated)
    setValue('dietary_preferences', updated)
  }

  const toggleCuisinePreference = (option: string) => {
    const updated = selectedCuisines.includes(option)
      ? selectedCuisines.filter(item => item !== option)
      : [...selectedCuisines, option]
    setSelectedCuisines(updated)
    setValue('favorite_cuisines', updated)
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { confirmPassword, ...registerData } = data
      
      // Validate required fields
      if (!registerData.first_name?.trim() || !registerData.last_name?.trim()) {
        throw new Error('First name and last name are required')
      }
      if (!registerData.email?.trim()) {
        throw new Error('Email is required')
      }
      if (!registerData.password?.trim()) {
        throw new Error('Password is required')
      }
      
      // Send data in the format the backend expects
      const userData = {
        first_name: registerData.first_name.trim(),
        last_name: registerData.last_name.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        cooking_skill_level: registerData.cooking_skill_level || 'intermediate',
        dietary_preferences: registerData.dietary_preferences || [],
        favorite_cuisines: registerData.favorite_cuisines || [],
      }
      
      console.log('🚀 Sending registration data:', JSON.stringify(userData, null, 2)) // Debug log
      await registerUser(userData)
      console.log('✅ Registration successful!') // Debug log
      setIsSuccess(true) // Set success state
    } catch (err: any) {
      console.error('❌ Registration failed:', err) // Debug log
      
      // Extract meaningful error message
      let errorMessage = 'Registration failed. Please try again.'
      
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
      
      console.error('🔍 Extracted error message:', errorMessage)
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

  // Show success message
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="h-10 w-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to ChefoodAI™! 🎉</h2>
          <p className="text-muted-foreground mb-4">
            Your account has been created successfully. We're preparing your personalized dashboard...
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-chef-500" />
            <span className="text-sm text-chef-600">Redirecting to dashboard...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-foreground mb-2">
          Nice to meet you! 👋
        </h2>
        <p className="text-muted-foreground">
          What should we call you?
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">First name</label>
          <Input
            {...register('first_name')}
            placeholder="What's your first name?"
            className="py-3 text-base"
            disabled={isLoading}
          />
          {errors.first_name && (
            <p className="text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Last name</label>
          <Input
            {...register('last_name')}
            placeholder="And your last name?"
            className="py-3 text-base"
            disabled={isLoading}
          />
          {errors.last_name && (
            <p className="text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-foreground mb-2">
          Great! How can we reach you? 📧
        </h2>
        <p className="text-muted-foreground">
          We'll send you amazing recipe suggestions
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              {...register('email')}
              type="email"
              placeholder="your.email@example.com"
              className="pl-11 py-3 text-base"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Create a password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Make it strong"
                className="pl-11 pr-12 py-3 text-base"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Type it again"
                className="pl-11 pr-12 py-3 text-base"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-foreground mb-2">
          How comfortable are you in the kitchen? 👨‍🍳
        </h2>
        <p className="text-muted-foreground">
          We'll match recipes to your skill level!
        </p>
      </div>
      
      <div className="max-w-md mx-auto space-y-3">
        <label className="text-sm font-medium text-foreground">Your cooking experience</label>
        <select
          {...register('cooking_skill_level')}
          className="w-full px-4 py-3 text-base border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-chef-500 focus:border-chef-500 transition-colors"
          disabled={isLoading}
        >
          <option value="beginner">🌱 Beginner - I'm just starting to explore cooking</option>
          <option value="intermediate">👨‍🍳 Intermediate - I know my way around the kitchen</option>
          <option value="advanced">⭐ Advanced - I love complex recipes and techniques</option>
        </select>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-foreground mb-2">
          Any dietary preferences? 🌱
        </h2>
        <p className="text-muted-foreground mb-1">
          Help us tailor recipes to your dietary needs and restrictions
        </p>
        <p className="text-sm text-muted-foreground/80">
          Examples: Vegetarian, Gluten-Free, Keto, Dairy-Free, Halal, etc.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
          {dietaryOptions.map(option => (
            <motion.button
              key={option}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleDietaryPreference(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedDietary.includes(option)
                  ? 'bg-chef-500 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
              disabled={isLoading}
            >
              {option}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {selectedDietary.length === 0 ? "No worries if none apply!" : `${selectedDietary.length} selected`}
        </p>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-foreground mb-2">
          What flavors make you happy? 😋
        </h2>
        <p className="text-muted-foreground">
          Pick your favorites for personalized suggestions
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
          {cuisineOptions.map(option => (
            <motion.button
              key={option}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCuisinePreference(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCuisines.includes(option)
                  ? 'bg-sage-500 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
              disabled={isLoading}
            >
              {option}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {selectedCuisines.length === 0 ? "Skip if you're adventurous!" : `${selectedCuisines.length} selected`}
        </p>
      </div>
    </div>
  )

  const renderStep6 = () => {
    const formData = getValues()
    
    return (
      <div className="space-y-6">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mb-4"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-chef-500/20 to-chef-600/10 relative">
              <Sparkles className="h-10 w-10 text-chef-500" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-chef-300/30"
              />
            </div>
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2"
            >
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </motion.div>
          </motion.div>
          
          <h2 className="text-2xl font-medium text-foreground mb-2">
            You're almost ready to cook! 🎉
          </h2>
          <p className="text-muted-foreground">
            Let's review your profile before we get started
          </p>
        </div>
        
        {/* Enhanced Profile Summary */}
        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-gradient-to-br from-chef-50/50 to-sage-50/30 rounded-xl p-6 border border-chef-100/50">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Check className="h-5 w-5 text-chef-500 mr-2" />
              Your Culinary Profile
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-chef-100/30">
                <span className="text-sm font-medium text-muted-foreground">👤 Name:</span>
                <span className="text-sm text-foreground font-medium">{formData.first_name} {formData.last_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-chef-100/30">
                <span className="text-sm font-medium text-muted-foreground">📧 Email:</span>
                <span className="text-sm text-foreground font-medium">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-chef-100/30">
                <span className="text-sm font-medium text-muted-foreground">👨‍🍳 Experience:</span>
                <span className="text-sm text-foreground font-medium capitalize">{formData.cooking_skill_level}</span>
              </div>
              
              {selectedDietary.length > 0 && (
                <div className="py-2 border-b border-chef-100/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-muted-foreground">🥗 Dietary Preferences:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDietary.map(item => (
                      <span key={item} className="text-xs bg-chef-500/10 text-chef-700 px-3 py-1 rounded-full border border-chef-200/50">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedCuisines.length > 0 && (
                <div className="py-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-muted-foreground">🌍 Favorite Cuisines:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCuisines.map(item => (
                      <span key={item} className="text-xs bg-sage-500/10 text-sage-700 px-3 py-1 rounded-full border border-sage-200/50">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Terms Acceptance */}
          <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
            <div className="flex items-start space-x-3">
              <button
                type="button"
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 ${
                  acceptedTerms 
                    ? 'bg-chef-500 border-chef-500 text-white' 
                    : 'border-border hover:border-chef-300'
                }`}
              >
                {acceptedTerms && <Check className="h-3 w-3 m-auto" />}
              </button>
              <div className="text-sm">
                <p className="text-foreground font-medium mb-1">
                  I agree to the Terms & Conditions
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-chef-600 hover:text-chef-700 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-chef-600 hover:text-chef-700 underline">
                    Privacy Policy
                  </Link>
                  . We'll use your preferences to suggest personalized recipes.
                </p>
              </div>
            </div>
          </div>
          
          {/* What happens next */}
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg p-4 border border-blue-100/50">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <ArrowRight className="h-4 w-4 text-blue-500 mr-2" />
              What happens next?
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• We'll create your personalized recipe dashboard</li>
              <li>• You'll get access to AI-powered recipe generation</li>
              <li>• Start discovering recipes tailored to your tastes</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      case 6: return renderStep6()
      default: return renderStep1()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chef-50/30 via-white to-chef-100/20 p-4 relative overflow-hidden">
      {/* Beautiful flowing background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-chef-200/40 to-chef-300/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-chef-100/30 to-chef-200/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-chef-50/20 to-sage-50/20 rounded-full blur-2xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="p-8 shadow-2xl border-border/30 bg-white/80 backdrop-blur-md rounded-3xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-chef-500/20 to-chef-600/10 text-chef-600 mb-3">
              <ChefHat className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-light tracking-tight text-foreground mb-1">
              Welcome to ChefoodAI™
            </h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {Array.from({ length: totalSteps }, (_, i) => {
                const stepNumber = i + 1
                const isActive = stepNumber === currentStep
                const isCompleted = stepNumber < currentStep
                
                return (
                  <div
                    key={stepNumber}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-chef-500 text-white' 
                        : isActive 
                          ? 'bg-chef-500 shadow-lg shadow-chef-500/30'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                )
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-chef-500 to-chef-600 h-1 rounded-full transition-all duration-700 ease-out shadow-sm"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center">
                <div className="text-red-600 text-sm font-medium">
                  {error}
                </div>
              </div>
            </motion.div>
          )}


          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              {renderCurrentStep()}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-chef-500 hover:bg-chef-600 text-white"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !acceptedTerms}
                  className={`flex items-center space-x-2 transition-all duration-300 ${
                    acceptedTerms 
                      ? 'bg-gradient-to-r from-chef-500 to-chef-600 hover:from-chef-600 hover:to-chef-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating your culinary profile...</span>
                    </>
                  ) : acceptedTerms ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Create My Account & Start Cooking!</span>
                      <ChefHat className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Please accept terms to continue</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-chef-600 hover:text-chef-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}