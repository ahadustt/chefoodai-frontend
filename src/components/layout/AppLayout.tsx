/**
 * ChefoodAI™ Main Application Layout
 * Premium layout with navigation, sidebar, and responsive design
 */

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User,
  ChefHat,
  Home,
  BookOpen,
  Calendar,
  Heart,
  Settings,
  LogOut,
  Crown,
  Sparkles,
  Brain
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  plan: 'free' | 'premium' | 'enterprise'
}

interface AppLayoutProps {
  children: React.ReactNode
  user?: User
  currentPath?: string
  onNavigate?: (path: string) => void
  onLogout?: () => void
  className?: string
}

const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    description: 'Your culinary hub'
  },
  {
    path: '/recipes',
    label: 'Recipes',
    icon: <BookOpen className="h-5 w-5" />,
    description: 'Browse & generate recipes'
  },
  {
    path: '/meal-plans',
    label: 'Meal Plans',
    icon: <Calendar className="h-5 w-5" />,
    description: 'AI-powered meal planning'
  },
  {
    path: '/favorites',
    label: 'Favorites',
    icon: <Heart className="h-5 w-5" />,
    description: 'Your saved recipes'
  },
  {
    path: '/assistant',
    label: 'Recipe Assistant',
    icon: <Brain className="h-5 w-5" />,
    description: 'Cooking guidance & tips',
    premium: true
  }
]

export function AppLayout({ 
  children, 
  user, 
  currentPath = '/dashboard',
  onNavigate,
  onLogout,
  className 
}: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [notifications] = React.useState([
    {
      id: '1',
      title: 'New recipe ready!',
      message: 'Your AI-generated pasta recipe is ready to cook',
      time: '2 min ago',
      unread: true
    },
    {
      id: '2',
      title: 'Meal plan reminder',
      message: 'Tomorrow\'s lunch preparation starts in 1 hour',
      time: '1 hour ago',
      unread: true
    }
  ])

  const handleNavigation = (path: string) => {
    onNavigate?.(path)
    setIsSidebarOpen(false)
  }

  const handleLogout = () => {
    onLogout?.()
    toast.success('Successfully logged out')
  }

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
      premium: { label: 'Premium', color: 'bg-primary-100 text-primary-700' },
      enterprise: { label: 'Enterprise', color: 'bg-accent-100 text-accent-700' }
    }
    return badges[plan as keyof typeof badges] || badges.free
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo & Mobile menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl text-white">
                  <ChefHat className="h-6 w-6" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    ChefoodAI™
                  </h1>
                  <p className="text-xs text-gray-500">Smart Cooking</p>
                </div>
              </div>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes, ingredients, or get suggestions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Right side - Notifications & User menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${user.firstName[0]}${user.lastName[0]}`
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full font-medium',
                        getPlanBadge(user.plan).color
                      )}>
                        {getPlanBadge(user.plan).label}
                      </p>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        
                        <div className="py-2">
                          <button
                            onClick={() => {
                              handleNavigation('/profile')
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="h-4 w-4 mr-3" />
                            Profile Settings
                          </button>
                          
                          <button
                            onClick={() => {
                              handleNavigation('/settings')
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            App Settings
                          </button>
                          
                          {user.plan === 'free' && (
                            <button
                              onClick={() => {
                                handleNavigation('/upgrade')
                                setIsUserMenuOpen(false)
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                            >
                              <Crown className="h-4 w-4 mr-3" />
                              Upgrade to Premium
                            </button>
                          )}
                        </div>
                        
                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={() => {
                              handleLogout()
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'top-16'
        )}>
          <div className="flex flex-col h-full pt-6 pb-4">
            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = currentPath === item.path
                const isDisabled = item.premium && user?.plan === 'free'
                
                return (
                  <button
                    key={item.path}
                    onClick={() => !isDisabled && handleNavigation(item.path)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200',
                      isActive
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-100',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className={cn(
                      'mr-3',
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    )}>
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.premium && user?.plan === 'free' && (
                          <Crown className="h-3 w-3 text-warning-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  </button>
                )
              })}
            </nav>

            {/* Upgrade Card for Free Users */}
            {user?.plan === 'free' && (
              <div className="px-4 pb-4">
                <Card variant="gradient" className="p-4 text-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl text-white mx-auto mb-3">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Unlock Premium</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Get unlimited recipe generations, advanced meal planning, and more
                  </p>
                  <Button
                    variant="gradient"
                    size="sm"
                    fullWidth
                    onClick={() => handleNavigation('/upgrade')}
                    leftIcon={<Crown className="h-3 w-3" />}
                  >
                    Upgrade Now
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              style={{ top: '4rem' }}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}