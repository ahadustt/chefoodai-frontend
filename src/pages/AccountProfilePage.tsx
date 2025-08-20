import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Shield, 
  Bell, 
  CreditCard, 
  Download, 
  Trash2,
  Eye,
  EyeOff,
  Crown,
  CheckCircle,
  AlertCircle,
  ChefHat,
  Heart,
  Settings,
  Lock,
  Database
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { authAPI } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

// Options for dietary preferences and cuisines (same as signup form)
const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 
  'Paleo', 'Low-Carb', 'High-Protein', 'Nut-Free', 'Halal', 'Kosher'
]

const cuisineOptions = [
  'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'French', 
  'Indian', 'Thai', 'Japanese', 'Greek', 'Spanish', 'Chinese', 'Middle Eastern'
]

interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  birthDate: string
  profileImage: string
  plan: 'starter' | 'chef-pro' | 'family-pro'
  joinDate: string
  dietaryPreferences: string[]
  favoriteCuisines: string[]
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced'
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  marketing: boolean
  recipes: boolean
  mealPlans: boolean
  quietHoursStart: string
  quietHoursEnd: string
  frequency: string
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  dataSharing: boolean
  analytics: boolean
  thirdParty: boolean
}

export function AccountProfilePage() {
  const { user, isLoggedIn, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  // Load notification and privacy settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      if (!isLoggedIn) return
      
      try {
        const [notificationSettings, privacySettings] = await Promise.all([
          authAPI.getNotificationSettings(),
          authAPI.getPrivacySettings()
        ])
        
        setNotifications(notificationSettings)
        setPrivacy(privacySettings)
      } catch (error) {
        console.error('Failed to load user settings:', error)
        // Keep default settings on error
      }
    }
    
    loadSettings()
  }, [isLoggedIn])

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      const newProfile = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: '+1 (555) 123-4567', // TODO: Add phone field to User interface
        location: 'San Francisco, CA', // TODO: Add location field to User interface
        bio: 'Food enthusiast and home chef who loves experimenting with new recipes and flavors.', // TODO: Add bio field to User interface
        birthDate: '1990-05-15', // TODO: Add birth_date field to User interface
        profileImage: user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&auto=format',
        plan: (user.subscription_plan as 'starter' | 'chef-pro' | 'family-pro') || 'starter',
        joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '2024-01-15',
        dietaryPreferences: user.dietary_preferences || [],
        favoriteCuisines: user.favorite_cuisines || [],
        cookingSkillLevel: user.cooking_skill_level || 'beginner'
      };
      
      setProfile(newProfile);
      // Initialize the saved profile reference
      lastSavedProfileRef.current = newProfile;
    }
  }, [user])



  const [profile, setProfile] = useState<UserProfile>({
    name: user ? `${user.first_name} ${user.last_name}` : 'Loading...',
    email: user?.email || 'loading@example.com',
    phone: '+1 (555) 123-4567', // TODO: Add phone field to User interface
    location: 'San Francisco, CA', // TODO: Add location field to User interface
    bio: 'Food enthusiast and home chef who loves experimenting with new recipes and flavors.', // TODO: Add bio field to User interface
    birthDate: '1990-05-15', // TODO: Add birth_date field to User interface
    profileImage: user?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&auto=format',
    plan: (user?.subscription_plan as 'starter' | 'chef-pro' | 'family-pro') || 'starter',
    joinDate: user?.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '2024-01-15',
    dietaryPreferences: user?.dietary_preferences || [],
    favoriteCuisines: user?.favorite_cuisines || [],
    cookingSkillLevel: user?.cooking_skill_level || 'beginner'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    recipes: true,
    mealPlans: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    frequency: 'immediately'
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    thirdParty: false
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [savedMessage, setSavedMessage] = useState('')
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedProfileRef = useRef<UserProfile | null>(null)
  
  // Confirmation modal states
  const [showExportConfirm, setShowExportConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Auto-save function with debounce
  const autoSaveProfile = useCallback(async (profileData: UserProfile) => {
    // Don't auto-save if auto-saving is already in progress
    if (isAutoSaving) return;

    try {
      setIsAutoSaving(true);
      console.log('🔄 Auto-saving profile changes...');

      // Split name into first and last name
      const nameParts = profileData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Update user data through AuthContext
      const updatedData = {
        first_name: firstName,
        last_name: lastName,
        email: profileData.email,
        cooking_skill_level: profileData.cookingSkillLevel,
        dietary_preferences: profileData.dietaryPreferences,
        favorite_cuisines: profileData.favoriteCuisines,
        // Note: other fields like phone, location, bio are not yet supported by the API
        // They will be added when the backend User model is extended
      }

      await updateUser(updatedData)
      lastSavedProfileRef.current = { ...profileData };
      setSavedMessage('✓ Auto-saved');
      setTimeout(() => setSavedMessage(''), 2000);
      console.log('✅ Profile auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error)
      setSavedMessage('⚠ Auto-save failed');
      setTimeout(() => setSavedMessage(''), 3000);
    } finally {
      setIsAutoSaving(false);
    }
  }, [updateUser, isAutoSaving]);

  // Debounced auto-save trigger
  const triggerAutoSave = useCallback((newProfile: UserProfile) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Check if profile has actually changed
    if (lastSavedProfileRef.current && 
        JSON.stringify(newProfile) === JSON.stringify(lastSavedProfileRef.current)) {
      return; // No changes detected
    }

    // Set new timeout for auto-save (wait 2 seconds after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveProfile(newProfile);
    }, 2000);
  }, [autoSaveProfile]);

  // Trigger auto-save when profile changes (except on initial load)
  useEffect(() => {
    if (lastSavedProfileRef.current && profile !== lastSavedProfileRef.current) {
      triggerAutoSave(profile);
    }
  }, [profile, triggerAutoSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [])

  // Manual save function (for explicit save button)
  const handleProfileUpdate = async () => {
    try {
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Split name into first and last name
      const nameParts = profile.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Update user data through AuthContext
      const updatedData = {
        first_name: firstName,
        last_name: lastName,
        email: profile.email,
        cooking_skill_level: profile.cookingSkillLevel,
        dietary_preferences: profile.dietaryPreferences,
        favorite_cuisines: profile.favoriteCuisines,
        // Note: other fields like phone, location, bio are not yet supported by the API
        // They will be added when the backend User model is extended
      }

      await updateUser(updatedData)
      lastSavedProfileRef.current = { ...profile };
      setIsEditing(false)
      setSavedMessage('Profile updated successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setSavedMessage('Failed to update profile. Please try again.')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setSavedMessage('New passwords do not match')
      setTimeout(() => setSavedMessage(''), 3000)
      return
    }
    
    if (passwords.new.length < 6) {
      setSavedMessage('New password must be at least 6 characters long')
      setTimeout(() => setSavedMessage(''), 3000)
      return
    }

    try {
      setIsLoading(true)
      await authAPI.changePassword({
        current_password: passwords.current,
        new_password: passwords.new
      })
      
      setShowPasswordChange(false)
      setPasswords({ current: '', new: '', confirm: '' })
      setSavedMessage('Password updated successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error: any) {
      console.error('Password change error:', error)
      setSavedMessage(error.response?.data?.detail || 'Failed to change password')
      setTimeout(() => setSavedMessage(''), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setIsLoading(true)
      const exportData = await authAPI.exportUserData()
      
      // Create blob and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `chefoodai_data_export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setSavedMessage('Data exported successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error: any) {
      console.error('Export data error:', error)
      setSavedMessage(error.response?.data?.detail || 'Failed to export data')
      setTimeout(() => setSavedMessage(''), 3000)
    } finally {
      setIsLoading(false)
      setShowExportConfirm(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setSavedMessage('Please type "DELETE" to confirm account deletion')
      setTimeout(() => setSavedMessage(''), 3000)
      return
    }

    try {
      setIsLoading(true)
      await authAPI.deleteAccount({
        password: passwords.current,
        confirmation: deleteConfirmation
      })
      
      // Logout and redirect to home
      logout()
      navigate('/')
      setSavedMessage('Account deleted successfully')
    } catch (error: any) {
      console.error('Delete account error:', error)
      setSavedMessage(error.response?.data?.detail || 'Failed to delete account')
      setTimeout(() => setSavedMessage(''), 3000)
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmation('')
      setPasswords({ current: '', new: '', confirm: '' })
    }
  }

  const handleNotificationUpdate = async (key: keyof NotificationSettings, value?: any) => {
    try {
      const newValue = value !== undefined ? value : !notifications[key]
      const prevValue = notifications[key]
      
      setNotifications(prev => ({
        ...prev,
        [key]: newValue
      }))

      // Save to backend
      await authAPI.updateNotificationSettings({
        [key]: newValue
      })
      
      setSavedMessage('Notification preferences updated!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      // Revert the change on error
      setNotifications(prev => ({
        ...prev,
        [key]: prev[key]
      }))
      setSavedMessage('Failed to save notification settings. Please try again.')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handlePrivacyUpdate = async (key: keyof PrivacySettings, value: any) => {
    try {
      const prevValue = privacy[key]
      setPrivacy(prev => ({
        ...prev,
        [key]: value
      }))

      // Save to backend
      await authAPI.updatePrivacySettings({
        [key]: value
      })
      
      setSavedMessage('Privacy settings updated!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
      // Revert the change on error
      setPrivacy(prev => ({
        ...prev,
        [key]: prevValue
      }))
      setSavedMessage('Failed to save privacy settings. Please try again.')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Cooking Preferences', icon: ChefHat },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ]

  const planDetails = {
    'starter': { name: 'Free', color: 'gray', icon: ChefHat },
    'chef-pro': { name: 'Pro', color: 'blue', icon: Crown },
    'family-pro': { name: 'Family', color: 'emerald', icon: Heart }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-44 md:pt-52 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                  profile.plan === 'starter' ? 'bg-gray-100 text-gray-700' :
                  profile.plan === 'chef-pro' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {profile.plan === 'starter' && <ChefHat className="w-4 h-4" />}
                  {profile.plan === 'chef-pro' && <Crown className="w-4 h-4" />}
                  {profile.plan === 'family-pro' && <Heart className="w-4 h-4" />}
                  <span>{planDetails[profile.plan].name}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Member since {new Date(profile.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message & Auto-save Status */}
      {savedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
            savedMessage.includes('Auto-saved') 
              ? 'bg-blue-600 text-white' 
              : savedMessage.includes('failed') 
                ? 'bg-red-600 text-white'
                : 'bg-green-600 text-white'
          }`}
        >
          {savedMessage.includes('Auto-saved') ? (
            <CheckCircle className="w-5 h-5" />
          ) : savedMessage.includes('failed') ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span>{savedMessage}</span>
        </motion.div>
      )}

      {/* Auto-saving indicator */}
      {isAutoSaving && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Saving...</span>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full"
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <Input
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                      <Input
                        value={profile.birthDate}
                        onChange={(e) => setProfile(prev => ({ ...prev, birthDate: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full"
                        type="date"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>



                  {isEditing && (
                    <div className="flex space-x-3">
                      <Button onClick={handleProfileUpdate} className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>

                  {/* Password Change */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                        <p className="text-gray-600">Update your password to keep your account secure</p>
                      </div>
                      <Button
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Change Password</span>
                      </Button>
                    </div>

                    {showPasswordChange && (
                      <div className="space-y-4 border-t border-gray-200 pt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <div className="relative">
                            <Input
                              type={passwordVisible.current ? 'text' : 'password'}
                              value={passwords.current}
                              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                              className="w-full pr-10"
                            />
                            <button
                              onClick={() => setPasswordVisible(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {passwordVisible.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <div className="relative">
                            <Input
                              type={passwordVisible.new ? 'text' : 'password'}
                              value={passwords.new}
                              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                              className="w-full pr-10"
                            />
                            <button
                              onClick={() => setPasswordVisible(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {passwordVisible.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <div className="relative">
                            <Input
                              type={passwordVisible.confirm ? 'text' : 'password'}
                              value={passwords.confirm}
                              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                              className="w-full pr-10"
                            />
                            <button
                              onClick={() => setPasswordVisible(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {passwordVisible.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button 
                            onClick={handlePasswordChange} 
                            className="flex items-center space-x-2"
                            disabled={isLoading}
                          >
                            <Save className="w-4 h-4" />
                            <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPasswordChange(false)
                              setPasswords({ current: '', new: '', confirm: '' })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Actions */}
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Data</h3>
                      <p className="text-gray-600 mb-4">Download a copy of your account data including recipes, meal plans, and preferences</p>
                      <Button 
                        variant="outline" 
                        className="flex items-center space-x-2"
                        onClick={() => setShowExportConfirm(true)}
                        disabled={isLoading}
                      >
                        <Download className="w-4 h-4" />
                        <span>{isLoading ? 'Exporting...' : 'Export My Data'}</span>
                      </Button>
                    </div>

                    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                      <p className="text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                      <Button 
                        variant="outline" 
                        className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-100"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{isLoading ? 'Deleting...' : 'Delete Account'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cooking Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Cooking Preferences</h2>
                  <p className="text-gray-600">Customize your cooking preferences to get personalized recipe recommendations</p>

                  {/* Cooking Skill Level */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cooking Skill Level</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                        <label key={level} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            checked={profile.cookingSkillLevel === level}
                            onChange={() => setProfile(prev => ({ ...prev, cookingSkillLevel: level }))}
                            className="form-radio text-blue-600"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{level}</span>
                            <p className="text-sm text-gray-500">
                              {level === 'beginner' && 'Simple recipes with basic techniques'}
                              {level === 'intermediate' && 'Moderate complexity with some advanced techniques'}
                              {level === 'advanced' && 'Complex recipes with professional techniques'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Preferences</h3>
                    <p className="text-gray-600 mb-4">Select any dietary restrictions or preferences you follow</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {dietaryOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={profile.dietaryPreferences.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfile(prev => ({
                                  ...prev,
                                  dietaryPreferences: [...prev.dietaryPreferences, option]
                                }))
                              } else {
                                setProfile(prev => ({
                                  ...prev,
                                  dietaryPreferences: prev.dietaryPreferences.filter(item => item !== option)
                                }))
                              }
                            }}
                            className="form-checkbox text-blue-600"
                          />
                          <span className="text-sm font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                    {profile.dietaryPreferences.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Selected:</strong> {profile.dietaryPreferences.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Favorite Cuisines */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Cuisines</h3>
                    <p className="text-gray-600 mb-4">Choose your favorite types of cuisine for personalized recommendations</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {cuisineOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={profile.favoriteCuisines.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfile(prev => ({
                                  ...prev,
                                  favoriteCuisines: [...prev.favoriteCuisines, option]
                                }))
                              } else {
                                setProfile(prev => ({
                                  ...prev,
                                  favoriteCuisines: prev.favoriteCuisines.filter(item => item !== option)
                                }))
                              }
                            }}
                            className="form-checkbox text-blue-600"
                          />
                          <span className="text-sm font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                    {profile.favoriteCuisines.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Selected:</strong> {profile.favoriteCuisines.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleProfileUpdate} 
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>

                  {/* Communication Channels */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Communication Channels</h3>
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="text-base sm:text-lg font-medium text-gray-900 truncate block">Email Notifications</label>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">Receive updates and alerts via email</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('email')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                            notifications.email ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                              notifications.email ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="text-base sm:text-lg font-medium text-gray-900 truncate block">Push Notifications</label>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">Browser and mobile push notifications</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('push')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                            notifications.push ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                              notifications.push ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-50 rounded-xl">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="text-base sm:text-lg font-medium text-gray-900 truncate block">SMS Notifications</label>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">Text messages for important updates</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('sms')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                            notifications.sms ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                              notifications.sms ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content Notifications */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <ChefHat className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Content & Features</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <div>
                            <label className="font-medium text-gray-900">Recipe Recommendations</label>
                            <p className="text-sm text-gray-600">Get personalized recipe suggestions</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('recipes')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.recipes ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.recipes ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div>
                            <label className="font-medium text-gray-900">Meal Plan Reminders</label>
                            <p className="text-sm text-gray-600">Completion and prep reminders</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('mealPlans')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.mealPlans ? 'bg-orange-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.mealPlans ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <label className="font-medium text-gray-900">Marketing & Promotions</label>
                            <p className="text-sm text-gray-600">Special offers and new features</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotificationUpdate('marketing')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.marketing ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notification Schedule */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Notification Schedule</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 bg-indigo-50 rounded-xl">
                        <label className="block font-medium text-gray-900 mb-2">Quiet Hours</label>
                        <p className="text-sm text-gray-600 mb-3">Pause non-urgent notifications</p>
                        <div className="flex space-x-2">
                          <select 
                            value={notifications.quietHoursStart} 
                            onChange={(e) => handleNotificationUpdate('quietHoursStart', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="20:00">8:00 PM</option>
                            <option value="21:00">9:00 PM</option>
                            <option value="22:00">10:00 PM</option>
                            <option value="23:00">11:00 PM</option>
                            <option value="00:00">12:00 AM</option>
                          </select>
                          <span className="py-2 text-gray-500">to</span>
                          <select 
                            value={notifications.quietHoursEnd} 
                            onChange={(e) => handleNotificationUpdate('quietHoursEnd', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="06:00">6:00 AM</option>
                            <option value="07:00">7:00 AM</option>
                            <option value="08:00">8:00 AM</option>
                            <option value="09:00">9:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <label className="block font-medium text-gray-900 mb-2">Frequency</label>
                        <p className="text-sm text-gray-600 mb-3">How often to receive notifications</p>
                        <select 
                          value={notifications.frequency} 
                          onChange={(e) => handleNotificationUpdate('frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="immediately">Immediately</option>
                          <option value="hourly">Hourly digest</option>
                          <option value="daily">Daily digest</option>
                          <option value="weekly">Weekly digest</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>

                  {/* Privacy Overview */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Your Privacy is Protected</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <Lock className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">End-to-End Encryption</p>
                        <p className="text-xs text-gray-600">Your data is always encrypted</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">GDPR Compliant</p>
                        <p className="text-xs text-gray-600">Full data protection rights</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">You Control Access</p>
                        <p className="text-xs text-gray-600">Decide who sees your data</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Visibility */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Profile Visibility</h3>
                    </div>
                    <div className="space-y-4">
                      {(['public', 'private', 'friends'] as const).map((option) => (
                        <div 
                          key={option} 
                          className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            privacy.profileVisibility === option 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handlePrivacyUpdate('profileVisibility', option)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              privacy.profileVisibility === option 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {privacy.profileVisibility === option && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {option === 'public' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                                {option === 'private' && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                                {option === 'friends' && <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>}
                                <span className="font-medium text-gray-900 capitalize">{option}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {option === 'public' && 'Anyone can discover and view your profile, recipes, and meal plans'}
                                {option === 'private' && 'Only you can see your profile and content - completely private'}
                                {option === 'friends' && 'Only people you connect with can see your content'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data & Analytics */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <Database className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Data Usage & Analytics</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <Database className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="text-base sm:text-lg font-medium text-gray-900 truncate block">Anonymous Data Sharing</label>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">Help improve our services with anonymized usage data</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePrivacyUpdate('dataSharing', !privacy.dataSharing)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                            privacy.dataSharing ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                              privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <AlertCircle className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <label className="text-lg font-medium text-gray-900">Usage Analytics</label>
                            <p className="text-sm text-gray-600">Allow us to analyze how you use features to improve them</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePrivacyUpdate('analytics', !privacy.analytics)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                            privacy.analytics ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                              privacy.analytics ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Settings className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <label className="text-lg font-medium text-gray-900">Third-party Integrations</label>
                            <p className="text-sm text-gray-600">Allow connections with external cooking and shopping services</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePrivacyUpdate('thirdParty', !privacy.thirdParty)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                            privacy.thirdParty ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                              privacy.thirdParty ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>



                  {/* Cookie Preferences */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <Settings className="h-5 w-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                        <div>
                          <label className="font-medium text-gray-900">Essential Cookies</label>
                          <p className="text-sm text-gray-600">Required for the website to function properly</p>
                        </div>
                        <div className="text-gray-500 text-sm">Always On</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                        <div>
                          <label className="font-medium text-gray-900">Performance Cookies</label>
                          <p className="text-sm text-gray-600">Help us understand website performance</p>
                        </div>
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            privacy.analytics ? 'bg-amber-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              privacy.analytics ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                        <div>
                          <label className="font-medium text-gray-900">Marketing Cookies</label>
                          <p className="text-sm text-gray-600">Used to show relevant ads and content</p>
                        </div>
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            privacy.thirdParty ? 'bg-amber-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              privacy.thirdParty ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>

                  {/* Current Plan */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${
                          profile.plan === 'starter' ? 'bg-gray-100' :
                          profile.plan === 'chef-pro' ? 'bg-blue-100' :
                          'bg-emerald-100'
                        }`}>
                          {profile.plan === 'starter' && <ChefHat className="w-6 h-6 text-gray-600" />}
                          {profile.plan === 'chef-pro' && <Crown className="w-6 h-6 text-blue-600" />}
                          {profile.plan === 'family-pro' && <Heart className="w-6 h-6 text-emerald-600" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{planDetails[profile.plan].name}</h4>
                          <p className="text-gray-600">
                            {profile.plan === 'starter' && '$0/month - Free forever'}
                            {profile.plan === 'chef-pro' && '$12/month - Pro plan'}
                            {profile.plan === 'family-pro' && '$19/month - Family plan'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/pricing')}
                        variant="outline"
                      >
                        Change Plan
                      </Button>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
                    <div className="space-y-3">
                      {profile.plan !== 'starter' ? (
                        [
                          { date: '2024-12-01', amount: '$12.00', status: 'Paid' },
                          { date: '2024-11-01', amount: '$12.00', status: 'Paid' },
                          { date: '2024-10-01', amount: '$12.00', status: 'Paid' }
                        ].map((invoice, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div>
                              <p className="font-medium text-gray-900">{invoice.amount}</p>
                              <p className="text-sm text-gray-600">{invoice.date}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {invoice.status}
                              </span>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center py-8">No billing history for free plan</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  {profile.plan !== 'starter' && (
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <Button variant="outline">Update</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Export Data Confirmation Modal */}
      <ConfirmationModal
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        onConfirm={handleExportData}
        title="Export Your Data"
        message="This will download a JSON file containing all your account data including recipes, meal plans, and preferences. The file will be saved to your downloads folder."
        confirmText="Export Data"
        cancelText="Cancel"
        variant="info"
        icon={<Download className="h-6 w-6" />}
      />

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteConfirmation('')
          setPasswords(prev => ({ ...prev, current: '' }))
        }}
        onConfirm={() => {}} // Custom confirmation logic in modal content
        title="Delete Account"
        message=""
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        icon={<Trash2 className="h-6 w-6" />}
      />

      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-lg z-50 flex items-center justify-center p-4 bg-red-50/20"
          onClick={() => {
            setShowDeleteConfirm(false)
            setDeleteConfirmation('')
            setPasswords(prev => ({ ...prev, current: '' }))
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white border border-white/20 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Delete Account
                  </h3>
                  <p className="text-gray-600 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-600">
                  This will permanently delete your account and all associated data including recipes, meal plans, and preferences.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your current password
                  </label>
                  <Input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="Current password"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type "DELETE" to confirm
                  </label>
                  <Input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmation('')
                    setPasswords(prev => ({ ...prev, current: '' }))
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg"
                  disabled={isLoading || deleteConfirmation !== 'DELETE' || !passwords.current}
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
