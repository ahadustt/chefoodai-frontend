import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthAPI, UserAPI, User, LoginRequest, RegisterRequest, isAuthenticated, getCurrentUser } from '@/lib/api'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  isLoggedIn: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isLoggedIn = isAuthenticated() && user !== null

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 Initializing authentication...')
      setLoading(true)
      
      try {
        // Clean up any corrupted localStorage data first
        const keys = ['chefoodai_token', 'chefoodai_refresh_token', 'chefoodai_user']
        keys.forEach(key => {
          const value = localStorage.getItem(key)
          if (value === 'undefined' || value === 'null') {
            console.warn(`🧹 Cleaning corrupted localStorage key: ${key}`)
            localStorage.removeItem(key)
          }
        })
        
        // Check if user is authenticated
        const hasValidToken = isAuthenticated()
        console.log('🎯 Has valid token:', hasValidToken)
        
        if (hasValidToken) {
          const currentUser = getCurrentUser()
          console.log('👤 Found cached user:', currentUser?.email)
          
          if (currentUser) {
            setUser(currentUser)
            console.log('✅ User authenticated from cache')
            
            // Optionally refresh user data from server
            try {
              console.log('🔄 Refreshing user data from server...')
              const freshUser = await AuthAPI.getCurrentUser()
              setUser(freshUser)
              console.log('✅ User data refreshed')
            } catch (error) {
              // If refresh fails, keep cached user
              console.warn('⚠️ Failed to refresh user data from server, keeping cached user:', error)
              console.log('✅ Using cached user data during initialization')
            }
          } else {
            console.warn('⚠️ Valid token but no cached user found, fetching from server...')
            try {
              const freshUser = await AuthAPI.getCurrentUser()
              setUser(freshUser)
              console.log('✅ User data fetched from server:', freshUser.email)
            } catch (error) {
              console.error('❌ Failed to fetch user data from server:', error)
            }
          }
        } else {
          console.log('❌ No valid authentication found')
          // Only show notification if user was trying to access protected content
          // Don't show on initial app load to avoid annoying notifications
          const isProtectedRoute = window.location.pathname.includes('/dashboard') || 
                                 window.location.pathname.includes('/generate')
          
          if (isProtectedRoute) {
            toast.error('Please sign in to access this feature', {
              duration: 4000,
              position: 'top-center'
            })
          }
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error)
        // Clear invalid tokens
        await logout()
      } finally {
        setLoading(false)
        console.log('🏁 Auth initialization complete')
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    console.log('🚀 Starting login process...')
    setLoading(true)
    try {
      const authResponse = await AuthAPI.login(credentials)
      console.log('📦 Login response received:', JSON.stringify(authResponse, null, 2))
      
      // Check if we have a user in the response
      if (authResponse.user) {
        setUser(authResponse.user)
        console.log('✅ Login successful for:', authResponse.user.email || authResponse.user.full_name || 'User')
      } else {
        console.warn('⚠️ Login successful but no user data in response')
        
        // Try to get user data from the server, but don't fail if it's not available
        try {
          const currentUser = await AuthAPI.getCurrentUser()
          setUser(currentUser)
          console.log('✅ Retrieved user data from server:', currentUser.email)
        } catch (userError) {
          console.warn('⚠️ Could not fetch user data from server during login:', userError)
          
          // For login, we don't have the user data to create a minimal object
          // So we'll set a placeholder and let the app try to fetch it later
          const placeholderUser = {
            id: 'temp_id',
            email: credentials.email,
            full_name: 'User', // We don't have the full name from login credentials
            created_at: new Date().toISOString()
          }
          
          setUser(placeholderUser)
          console.log('✅ Using placeholder user object for login')
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    console.log('🚀 Starting registration process...')
    setLoading(true)
    try {
      const authResponse = await AuthAPI.register(userData)
      console.log('📦 Registration response received:', JSON.stringify(authResponse, null, 2))
      
      // Check if we have a user in the response
      if (authResponse.user) {
        setUser(authResponse.user)
        console.log('✅ Registration successful for:', authResponse.user.email || authResponse.user.full_name || 'User')
      } else {
        console.warn('⚠️ Registration successful but no user data in response')
        
        // Try to get user data from the server, but don't fail if it's not available
        try {
          const currentUser = await AuthAPI.getCurrentUser()
          setUser(currentUser)
          console.log('✅ Retrieved user data from server:', currentUser.email)
        } catch (userError) {
          console.warn('⚠️ Could not fetch user data from server, creating minimal user object:', userError)
          
          // Create a minimal user object from the registration data
          const minimalUser = {
            id: 'temp_id', // Temporary ID until we can get real data
            email: userData.email,
            full_name: userData.full_name,
            cooking_skill_level: userData.cooking_skill_level,
            dietary_preferences: userData.dietary_preferences,
            favorite_cuisines: userData.favorite_cuisines,
            created_at: new Date().toISOString()
          }
          
          setUser(minimalUser)
          console.log('✅ Using minimal user object:', minimalUser.email)
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    console.log('🚪 Starting logout process...')
    setLoading(true)
    try {
      await AuthAPI.logout()
      console.log('✅ Logout successful')
    } catch (error) {
      console.error('⚠️ Logout error:', error)
    } finally {
      setUser(null)
      setLoading(false)
      console.log('🧹 User state cleared')
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      console.log('🔄 Updating user profile...', userData)
      const updatedUser = await UserAPI.updateProfile(userData)
      setUser(updatedUser)
      console.log('✅ User profile updated successfully')
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('❌ Failed to update user profile:', error)
      toast.error('Failed to update profile. Please try again.')
      throw error
    }
  }

  const refreshUser = async () => {
    if (!isLoggedIn) return
    
    try {
      const freshUser = await AuthAPI.getCurrentUser()
      setUser(freshUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}