import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar, Sparkles, Zap, Users, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MealPlanningDashboard, MealPlanCreator } from '@/components/meal-planning'
import { Button } from '@/components/ui/Button'

export function MealPlansPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeView, setActiveView] = useState<'dashboard' | 'create'>('dashboard')
  const [creatingMealPlan, setCreatingMealPlan] = useState<{
    id: string;
    name: string;
    isGenerating: boolean;
    progress: number;
    currentStep: string;
    estimatedTime: string;
    duration_days?: number;
    totalMeals?: number;
    completedMeals?: number;
    family_size?: number;
  } | null>(null)

  const handleCreateNew = () => {
    setActiveView('create')
  }

  const handleBackToDashboard = () => {
    setActiveView('dashboard')
    setCreatingMealPlan(null)
  }

  const handleMealPlanCreated = (mealPlan: any) => {
    // If this is a completed meal plan (has real ID), update the existing card
    if (mealPlan.id && !mealPlan.id.startsWith('temp-')) {
      setCreatingMealPlan(prev => prev ? {
        ...prev,
        id: mealPlan.id,
        isGenerating: false,
        progress: 100,
        currentStep: '✅ Meal plan completed successfully!'
      } : null)
      
      // Clear the creating state after showing success
      setTimeout(() => {
        setCreatingMealPlan(null)
      }, 3000)
    } else {
      // Calculate total meals based on duration and family size
      const duration = mealPlan.duration_days || 7;
      const familySize = mealPlan.family_size || 4;
      const mealsPerDay = familySize > 2 ? 4 : 3; // breakfast, lunch, dinner, and optionally snack
      const totalMeals = duration * mealsPerDay;
      
      // Create a new meal plan card with generating status (initial call)
      setCreatingMealPlan({
        id: mealPlan.id || `temp-${Date.now()}`,
        name: mealPlan.name || 'New Meal Plan',
        isGenerating: true,
        progress: 5,
        currentStep: '🚀 Starting meal plan generation...',
        estimatedTime: '~3 minutes',
        duration_days: duration,
        totalMeals: totalMeals,
        completedMeals: 0,
        family_size: familySize
      })
      
      // Go back to dashboard to show the live progress
      setActiveView('dashboard')
      
      // Force immediate refresh of meal plans data
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] })
      
      // Also refresh periodically during generation
      const refreshInterval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['meal-plans'] })
      }, 3000)
      
      // Clear interval after reasonable time (5 minutes max)
      setTimeout(() => {
        clearInterval(refreshInterval)
      }, 5 * 60 * 1000)
    }
  }

  const handleGenerationProgress = (progress: number, step: string, estimatedTime?: string) => {
    if (creatingMealPlan) {
      setCreatingMealPlan(prev => prev ? {
        ...prev,
        progress,
        currentStep: step,
        estimatedTime: estimatedTime || prev.estimatedTime,
        // Calculate completed meals based on progress
        completedMeals: prev.totalMeals ? Math.floor((progress / 100) * prev.totalMeals) : 0
      } : null)
    }
  }

  const handleGenerationComplete = () => {
    if (creatingMealPlan) {
      setCreatingMealPlan(prev => prev ? {
        ...prev,
        isGenerating: false,
        progress: 100,
        currentStep: '✅ Meal plan completed successfully!',
        completedMeals: prev.totalMeals || 0
      } : null)
      
      // Clear the creating state after a delay to show success
      setTimeout(() => {
        setCreatingMealPlan(null)
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="relative backdrop-blur-sm bg-white/40 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-6"
              >
                {/* Back Button */}
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="bg-white/60 border-white/20 hover:bg-white/80 backdrop-blur-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      My Meal Plans
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      Plan and organize your weekly meals with AI assistance
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MealPlanningDashboard 
                creatingMealPlan={creatingMealPlan}
                onGenerationProgress={handleGenerationProgress}
                onGenerationComplete={handleGenerationComplete}
              />
            </motion.div>
          )}

          {activeView === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Create Page Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create Meal Plan</h1>
                  <p className="text-gray-600 mt-1">Plan your weekly meals with AI assistance</p>
                </div>
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="bg-white/60 border-white/20 hover:bg-white/80 backdrop-blur-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plans
                </Button>
              </div>
              
              <MealPlanCreator 
                onSuccess={handleMealPlanCreated}
                onProgress={handleGenerationProgress}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 