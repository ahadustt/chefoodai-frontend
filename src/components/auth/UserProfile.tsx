/**
 * ChefoodAI™ Premium User Profile Component
 * Comprehensive profile management with preferences and settings
 */

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Crown,
  Edit3,
  Save,
  X,
  Camera,
  Utensils,
  Heart,
  Award,
  TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dietaryPreferences: z.array(z.string()).default([]),
  cuisinePreferences: z.array(z.string()).default([]),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  cookingGoals: z.array(z.string()).default([]),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false),
    recipeRecommendations: z.boolean().default(true),
    mealPlanReminders: z.boolean().default(true)
  }).default({})
})

type ProfileForm = z.infer<typeof profileSchema>

interface UserProfileProps {
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    bio?: string
    location?: string
    dateOfBirth?: string
    avatar?: string
    plan: 'free' | 'premium' | 'enterprise'
    createdAt: string
    dietaryPreferences?: string[]
    cuisinePreferences?: string[]
    skillLevel?: string
    cookingGoals?: string[]
    stats?: {
      recipesGenerated: number
      mealPlansCreated: number
      favoriteRecipes: number
      cookingStreak: number
    }
  }
  onUpdateProfile?: (data: ProfileForm) => Promise<void>
  onUploadAvatar?: (file: File) => Promise<void>
  className?: string
}

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto',
  'Paleo', 'Low-Carb', 'High-Protein', 'Nut-Free', 'Soy-Free'
]

const cuisineOptions = [
  'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American',
  'Indian', 'French', 'Middle Eastern', 'Thai', 'Japanese'
]

const cookingGoalOptions = [
  'Eat healthier', 'Save money', 'Learn new cuisines', 'Meal prep',
  'Lose weight', 'Gain muscle', 'Cook faster', 'Reduce food waste'
]

export function UserProfile({ 
  user, 
  onUpdateProfile, 
  onUploadAvatar, 
  className 
}: UserProfileProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'profile' | 'preferences' | 'notifications' | 'billing'>('profile')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      dateOfBirth: user?.dateOfBirth || '',
      dietaryPreferences: user?.dietaryPreferences || [],
      cuisinePreferences: user?.cuisinePreferences || [],
      skillLevel: (user?.skillLevel as any) || 'intermediate',
      cookingGoals: user?.cookingGoals || [],
      notifications: {
        email: true,
        push: true,
        marketing: false,
        recipeRecommendations: true,
        mealPlanReminders: true
      }
    }
  })

  const watchedValues = watch()

  React.useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        dateOfBirth: user.dateOfBirth || '',
        dietaryPreferences: user.dietaryPreferences || [],
        cuisinePreferences: user.cuisinePreferences || [],
        skillLevel: (user.skillLevel as any) || 'intermediate',
        cookingGoals: user.cookingGoals || []
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileForm) => {
    if (!onUpdateProfile) return
    
    setIsSubmitting(true)
    try {
      await onUpdateProfile(data)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update failed:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onUploadAvatar) return

    try {
      await onUploadAvatar(file)
      toast.success('Avatar updated successfully!')
    } catch (error) {
      console.error('Avatar upload failed:', error)
      toast.error('Failed to upload avatar. Please try again.')
    }
  }

  const toggleArrayValue = (array: string[], value: string, field: keyof ProfileForm) => {
    const current = array || []
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    setValue(field, updated as any)
  }

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
      premium: { label: 'Premium', color: 'bg-primary-100 text-primary-700' },
      enterprise: { label: 'Enterprise', color: 'bg-accent-100 text-accent-700' }
    }
    return badges[plan as keyof typeof badges] || badges.free
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'preferences' as const, label: 'Preferences', icon: <Utensils className="h-4 w-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'billing' as const, label: 'Billing', icon: <CreditCard className="h-4 w-4" /> }
  ]

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Profile Header */}
      <Card variant="gradient" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
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
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Camera className="h-3 w-3 text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1',
                    getPlanBadge(user.plan).color
                  )}>
                    <Crown className="h-3 w-3" />
                    <span>{getPlanBadge(user.plan).label}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              variant={isEditing ? 'outline' : 'primary'}
              onClick={() => {
                if (isEditing && isDirty) {
                  if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                    setIsEditing(false)
                    reset()
                  }
                } else {
                  setIsEditing(!isEditing)
                }
              }}
              leftIcon={isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
          
          {/* Stats */}
          {user.stats && (
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.stats.recipesGenerated}</div>
                <div className="text-sm text-gray-600">Recipes Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.stats.mealPlansCreated}</div>
                <div className="text-sm text-gray-600">Meal Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.stats.favoriteRecipes}</div>
                <div className="text-sm text-gray-600">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.stats.cookingStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label="First Name"
                            leftIcon={<User className="h-4 w-4" />}
                            error={errors.firstName?.message}
                            disabled={!isEditing}
                          />
                        )}
                      />
                      
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label="Last Name"
                            leftIcon={<User className="h-4 w-4" />}
                            error={errors.lastName?.message}
                            disabled={!isEditing}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          label="Email Address"
                          leftIcon={<Mail className="h-4 w-4" />}
                          error={errors.email?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />

                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="tel"
                          label="Phone Number"
                          leftIcon={<Phone className="h-4 w-4" />}
                          error={errors.phone?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />

                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Location"
                          leftIcon={<MapPin className="h-4 w-4" />}
                          error={errors.location?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />

                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="Date of Birth"
                          leftIcon={<Calendar className="h-4 w-4" />}
                          error={errors.dateOfBirth?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Controller
                      name="bio"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="About You"
                          placeholder="Tell us about your cooking journey, favorite cuisines, or cooking goals..."
                          className="min-h-[120px]"
                          error={errors.bio?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cooking Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Skill Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cooking Skill Level
                      </label>
                      <Controller
                        name="skillLevel"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        )}
                      />
                    </div>

                    {/* Dietary Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dietary Preferences
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {dietaryOptions.map(option => (
                          <button
                            key={option}
                            type="button"
                            disabled={!isEditing}
                            onClick={() => toggleArrayValue(
                              watchedValues.dietaryPreferences, 
                              option, 
                              'dietaryPreferences'
                            )}
                            className={cn(
                              'px-3 py-1 text-sm rounded-full border transition-all disabled:opacity-50',
                              watchedValues.dietaryPreferences?.includes(option)
                                ? 'bg-success-500 text-white border-success-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-success-300'
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cuisine Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favorite Cuisines
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {cuisineOptions.map(cuisine => (
                          <button
                            key={cuisine}
                            type="button"
                            disabled={!isEditing}
                            onClick={() => toggleArrayValue(
                              watchedValues.cuisinePreferences, 
                              cuisine, 
                              'cuisinePreferences'
                            )}
                            className={cn(
                              'px-3 py-1 text-sm rounded-full border transition-all disabled:opacity-50',
                              watchedValues.cuisinePreferences?.includes(cuisine)
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                            )}
                          >
                            {cuisine}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cooking Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cooking Goals
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {cookingGoalOptions.map(goal => (
                          <button
                            key={goal}
                            type="button"
                            disabled={!isEditing}
                            onClick={() => toggleArrayValue(
                              watchedValues.cookingGoals, 
                              goal, 
                              'cookingGoals'
                            )}
                            className={cn(
                              'px-3 py-1 text-sm rounded-full border transition-all disabled:opacity-50',
                              watchedValues.cookingGoals?.includes(goal)
                                ? 'bg-accent-500 text-white border-accent-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-accent-300'
                            )}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <Controller
                        name="notifications.email"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-600">Receive push notifications</p>
                      </div>
                      <Controller
                        name="notifications.push"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Marketing Communications</h4>
                        <p className="text-sm text-gray-600">Receive product updates and cooking tips</p>
                      </div>
                      <Controller
                        name="notifications.marketing"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Recipe Recommendations</h4>
                        <p className="text-sm text-gray-600">Get personalized recipe suggestions</p>
                      </div>
                      <Controller
                        name="notifications.recipeRecommendations"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Meal Plan Reminders</h4>
                        <p className="text-sm text-gray-600">Get reminders about your meal plans</p>
                      </div>
                      <Controller
                        name="notifications.mealPlanReminders"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Current Plan</h4>
                        <p className="text-sm text-gray-600">
                          {getPlanBadge(user.plan).label} Plan
                        </p>
                      </div>
                      <Button variant="outline">
                        Manage Subscription
                      </Button>
                    </div>
                    
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Billing management coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Save Button */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end space-x-4 pt-6 border-t border-gray-200"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              loading={isSubmitting}
              disabled={!isDirty || isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </motion.div>
        )}
      </form>
    </div>
  )
}