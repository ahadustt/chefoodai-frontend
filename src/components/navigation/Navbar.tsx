import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChefHat, Sparkles, ChevronDown, Bell, User, Settings, LogOut, Crown, Zap, HelpCircle, Heart } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import { useSavedRecipes } from '@/contexts/SavedRecipesContext'
// RecipeGeneratorModal import removed - recipe generation now handled in My Recipes page

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  // showRecipeModal removed - recipe generation now happens from My Recipes page
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoggedIn, logout } = useAuth()
  const { savedRecipes } = useSavedRecipes() // Get actual saved recipes count

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.profile-dropdown')) {
        setShowProfileMenu(false)
      }
    }

    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showProfileMenu])

  const handleNavigation = (path: string, sectionId?: string) => {
    if (path === '/') {
      navigate('/')
      if (sectionId) {
        // If we're navigating to a section on the home page, scroll to it after navigation
        setTimeout(() => {
          const element = document.getElementById(sectionId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    } else {
      navigate(path)
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setShowProfileMenu(false)
    navigate('/')
  }

  // handleRecipeGenerated removed - recipe generation now handled in My Recipes page

  // Extract user info for display
  const firstName = user?.first_name || 'Chef'
  const userInitials = user?.first_name && user?.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() 
    : 'U'
  const fullName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : 'User'

  // Different nav links for authenticated vs non-authenticated users
  const publicNavLinks = [
    { name: 'Home', path: '/', sectionId: 'home' },
    { name: 'Features', path: '/', sectionId: 'features' },
    { name: 'About', path: '/', sectionId: 'about' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ]

  const authenticatedNavLinks = [
    { name: 'Dashboard', path: '/dashboard', sectionId: undefined },
    { name: 'My Recipes', path: '/recipes', sectionId: undefined },
    { name: 'My Meal Plans', path: '/meal-plans', sectionId: undefined },
    { name: 'Shopping Lists', path: '/shopping-lists', sectionId: undefined },
    { name: 'Nutrition', path: '/nutrition', sectionId: undefined },
  ]

  const navLinks = isLoggedIn ? authenticatedNavLinks : publicNavLinks

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLoggedIn 
          ? 'bg-white border-b border-gray-200 shadow-lg' 
          : isScrolled 
            ? 'bg-background/80 backdrop-blur-md shadow-lg border-b border-border/50' 
            : 'bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200/50'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            {isLoggedIn ? (
              // CredifyTX style logo for authenticated users
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-chef-500 to-chef-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">ChefoodAI™</span>
              </>
            ) : (
              // Original animated logo for public pages
              <>
                <div className="relative">
                  <ChefHat className="h-8 w-8 text-chef-500" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-4 w-4 text-chef-400" />
                  </motion.div>
                </div>
                <span className="text-xl lg:text-2xl font-bold gradient-text">
                  ChefoodAI™
                </span>
              </>
            )}
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.button
                key={link.name}
                onClick={() => handleNavigation(link.path, link.sectionId)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative font-medium transition-colors duration-200 group bg-transparent border-none cursor-pointer ${
                  isLoggedIn 
                    ? 'text-gray-700 hover:text-chef-600 px-3 py-2 text-sm' 
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {link.name}
                {!isLoggedIn && (
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-chef-500 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn && <ThemeToggle />}
            
            {isLoggedIn ? (
              // Authenticated user section - CredifyTX style
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.full_name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {userInitials}
                        </div>
                      )}
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{fullName}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user?.cooking_skill_level || 'Chef'}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20"
                      >
                        {/* Modern User Info Header */}
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-chef-50 to-blue-50">
                          <div className="flex items-center space-x-3">
                            {user?.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.full_name}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-md"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-chef-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white">
                                {userInitials}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {fullName}
                                </p>
                                {/* Subscription Badge */}
                                {user?.subscription_plan === 'starter' ? (
                                  <div className="flex items-center px-2 py-0.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full">
                                    <ChefHat className="h-3 w-3 text-white mr-1" />
                                    <span className="text-xs font-medium text-white">Free</span>
                                  </div>
                                ) : user?.subscription_plan === 'chef-pro' ? (
                                  <div className="flex items-center px-2 py-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full">
                                    <Crown className="h-3 w-3 text-white mr-1" />
                                    <span className="text-xs font-medium text-white">Pro</span>
                                  </div>
                                ) : user?.subscription_plan === 'family-pro' ? (
                                  <div className="flex items-center px-2 py-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full">
                                    <Heart className="h-3 w-3 text-white mr-1" />
                                    <span className="text-xs font-medium text-white">Family</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center px-2 py-0.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full">
                                    <ChefHat className="h-3 w-3 text-white mr-1" />
                                    <span className="text-xs font-medium text-white">Free</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 truncate">
                                {user?.email}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                {user?.cooking_skill_level && (
                                  <span className="text-xs px-2 py-0.5 bg-chef-100 text-chef-700 rounded-full capitalize font-medium">
                                    {user.cooking_skill_level} Chef
                                  </span>
                                )}
                                <div className="flex items-center text-xs text-gray-500">
                                  <Zap className="h-3 w-3 mr-1 text-green-500" />
                                  <span>{savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} saved</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Modern Menu Items */}
                        <div className="p-1">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false)
                              navigate('/account')
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium">Account & Profile</p>
                              <p className="text-xs text-gray-500">Manage your personal information</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setShowProfileMenu(false)
                              navigate('/upgrade')
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                              <Crown className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium">Upgrade Plan</p>
                              <p className="text-xs text-gray-500">Unlock premium features</p>
                            </div>
                            <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium">
                              NEW
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setShowProfileMenu(false)
                              navigate('/help')
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                              <HelpCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium">Help & Support</p>
                              <p className="text-xs text-gray-500">Get help when you need it</p>
                            </div>
                          </button>

                          <hr className="my-2 border-gray-100" />
                          
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                              <LogOut className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium">Sign Out</p>
                              <p className="text-xs text-gray-500">You'll be missed!</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              // Public user section
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="border-chef-300 text-chef-600 hover:bg-chef-50 px-4 py-2 rounded-full transition-all duration-200"
                  >
                    Sign In
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => navigate('/register')}
                    className="bg-chef-500 hover:bg-chef-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {!isLoggedIn && <ThemeToggle />}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden ${
              isLoggedIn 
                ? 'bg-white border-t border-gray-200' 
                : 'bg-background/95 backdrop-blur-md border-t border-border/50'
            }`}
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.name}
                  onClick={() => handleNavigation(link.path, link.sectionId)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`block text-lg font-medium transition-colors py-2 bg-transparent border-none cursor-pointer w-full text-left ${
                    isLoggedIn 
                      ? 'text-gray-700 hover:text-chef-600' 
                      : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {link.name}
                </motion.button>
              ))}
              
              {isLoggedIn ? (
                // Mobile authenticated user menu
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="pt-4 border-t border-gray-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {userInitials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        navigate('/account')
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Account & Profile</p>
                        <p className="text-xs text-gray-500">Manage your personal information</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        navigate('/upgrade')
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all duration-150 group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                        <Crown className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Upgrade Plan</p>
                        <p className="text-xs text-gray-500">Unlock premium features</p>
                      </div>
                      <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium">
                        NEW
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        navigate('/help')
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <HelpCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Help & Support</p>
                        <p className="text-xs text-gray-500">Get help when you need it</p>
                      </div>
                    </button>

                    <hr className="my-2 border-gray-100" />
                    
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-gray-500">You'll be missed!</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ) : (
                // Mobile public user menu
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="pt-4 space-y-3"
                >
                  <Button 
                    onClick={() => handleNavigation('/login')}
                    variant="outline"
                    className="w-full border-chef-300 text-chef-600 hover:bg-chef-50 py-3 rounded-full"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => handleNavigation('/register')}
                    className="w-full bg-chef-500 hover:bg-chef-600 text-white py-3 rounded-full shadow-lg"
                  >
                    Get Started
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

                   {/* Recipe Generator Modal removed - now handled in My Recipes page */}
    </motion.nav>
  )
} 