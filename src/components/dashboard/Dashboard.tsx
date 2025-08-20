/**
 * ChefoodAI™ Premium Dashboard
 * Modern, sleek dashboard with glass morphism and contemporary design
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  Users, 
  Utensils, 
  Plus, 
  Sparkles, 
  ChefHat,
  Star,
  Calendar,
  Bookmark,
  TrendingUp,
  Award,
  Trash2,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSavedRecipes } from '@/contexts/SavedRecipesContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'

import { RecipeGeneratorModal } from '@/components/recipe/RecipeGeneratorModal'
import { RecipeDisplay } from '@/components/recipe/RecipeDisplay'
import { RecipeAPI, SavedRecipe, Recipe } from '@/lib/api'
import { recipeApi } from '@/api/client'
import { apiClient } from '@/api/client'
import { formatIngredientDisplay, getIngredientCategory } from '@/utils/ingredientParser'

// Function to get cuisine flag emoji
const getCuisineFlag = (cuisineType: string): string => {
  const cuisine = cuisineType?.toLowerCase() || '';
  
  const cuisineFlags: Record<string, string> = {
    'american': '🇺🇸',
    'italian': '🇮🇹', 
    'french': '🇫🇷',
    'mexican': '🇲🇽',
    'chinese': '🇨🇳',
    'japanese': '🇯🇵',
    'indian': '🇮🇳',
    'thai': '🇹🇭',
    'spanish': '🇪🇸',
    'greek': '🇬🇷',
    'korean': '🇰🇷',
    'german': '🇩🇪',
    'british': '🇬🇧',
    'vietnamese': '🇻🇳',
    'turkish': '🇹🇷',
    'lebanese': '🇱🇧',
    'moroccan': '🇲🇦',
    'brazilian': '🇧🇷',
    'argentinian': '🇦🇷',
    'peruvian': '🇵🇪',
    'russian': '🇷🇺',
    'polish': '🇵🇱',
    'ethiopian': '🇪🇹',
    'mediterranean': '🇬🇷', // Use Greek flag for Mediterranean
    'middle eastern': '🇱🇧', // Use Lebanese flag for Middle Eastern
    'asian': '🇨🇳', // Use Chinese flag for general Asian
    'european': '🇪🇺', // EU flag for general European
    'african': '🌍', // Africa emoji for general African
    'latin american': '🇲🇽', // Use Mexican flag for Latin American
    'caribbean': '🇯🇲', // Jamaican flag for Caribbean
    'international': '🌎', // World emoji for international
  };
  
  // Check for exact matches first
  if (cuisineFlags[cuisine]) {
    return cuisineFlags[cuisine];
  }
  
  // Check for partial matches
  for (const [key, flag] of Object.entries(cuisineFlags)) {
    if (cuisine.includes(key) || key.includes(cuisine)) {
      return flag;
    }
  }
  
  // Default to world emoji
  return '🌎';
};
import { mealPlanningApi } from '@/services/mealPlanningApi'
import toast from 'react-hot-toast'
import ImageWithFallback from '@/components/ImageWithFallback'

interface DashboardStats {
  total_recipes: number
  saved_recipes: number
  favorite_recipes: number
  total_meal_plans: number
  total_cooking_time: number
  weekly_streak: number
}

export function Dashboard() {
  const { user, logout } = useAuth()
  const { savedRecipes, loading: savedRecipesLoading, refreshRecipes, getSavedRecipe, removeRecipe } = useSavedRecipes()
  const navigate = useNavigate()
  
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total_recipes: 0,
    saved_recipes: 0,
    favorite_recipes: 0,
    total_meal_plans: 0,
    total_cooking_time: 0,
    weekly_streak: 0
  })
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false)
  const [recipesWithNutrition, setRecipesWithNutrition] = useState<Map<string, any>>(new Map())
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [mealPlansLoaded, setMealPlansLoaded] = useState(false)
  const [showMoreRecipes, setShowMoreRecipes] = useState(false)
  
  // Function to load complete recipe details (same as meal plan)
  const handleRecipeClick = async (recipe: SavedRecipe) => {
    try {
      setIsLoadingRecipe(true);
      
      // Fetch complete recipe details BEFORE showing the modal  
      const completeRecipe = await recipeApi.getCompleteRecipe(recipe.id);
      
      // Show the modal with complete data immediately
      setSelectedRecipe(completeRecipe);
      
    } catch (error) {
      console.error('Failed to load complete recipe:', error);
      
      // Fallback to basic recipe data if API fails
      setSelectedRecipe(recipe);
    } finally {
      setIsLoadingRecipe(false);
    }
  };
  
  // Combine loading states - only show loading on initial load
  const loading = isInitialLoad && (dashboardLoading || savedRecipesLoading)
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // Load dashboard data when saved recipes change
  useEffect(() => {
    if (savedRecipes.length >= 0) { // Check for valid array
      loadDashboardData()
      // Fetch enhanced nutrition data for dashboard recipes
      fetchEnhancedRecipeData()
    }
  }, [savedRecipes.length]) // Only re-run when count changes, not array reference

  // Fetch enhanced recipe data with nutrition info
  const fetchEnhancedRecipeData = async () => {
    const recipesToEnhance = savedRecipes.slice(0, maxDashboardRecipes);
    const newNutritionData = new Map();

    for (const recipe of recipesToEnhance) {
      try {
        const response = await apiClient.get(`/api/v1/recipes/${recipe.id}/complete`);
        newNutritionData.set(recipe.id!, response.data);
      } catch (error) {
        console.warn(`Failed to fetch nutrition data for recipe ${recipe.id}:`, error);
      }
    }

    setRecipesWithNutrition(newNutritionData);
  };

  // Load meal plans data separately, but only when user is available
  useEffect(() => {
    const loadMealPlansCount = async () => {
      if (!user) {
        console.log('📊 User not available yet, skipping meal plans count load');
        return;
      }
      
      try {
        console.log('📊 Loading meal plans count for user:', user.email);
        const mealPlansResponse = await mealPlanningApi.getMealPlans();
        const totalMealPlans = mealPlansResponse.total || 0;
        
        // Update only the meal plans count in stats
        setStats(prevStats => ({
          ...prevStats,
          total_meal_plans: Math.max(0, totalMealPlans)
        }));
        
        setMealPlansLoaded(true);
        console.log('✅ Meal plans count loaded:', totalMealPlans);
      } catch (error) {
        console.warn('Failed to fetch meal plans count:', error);
        setMealPlansLoaded(true); // Mark as loaded even if failed
      }
    };

    // Load meal plans data when user is available
    loadMealPlansCount();
  }, [user]); // Depend on user availability

  // Refresh meal plans when dashboard becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mealPlansLoaded && user) {
        console.log('🔄 Dashboard visible, refreshing meal plans count...');
        const refreshMealPlansCount = async () => {
          try {
            const mealPlansResponse = await mealPlanningApi.getMealPlans();
            const totalMealPlans = mealPlansResponse.total || 0;
            
            setStats(prevStats => ({
              ...prevStats,
              total_meal_plans: Math.max(0, totalMealPlans)
            }));
            console.log('✅ Meal plans count refreshed:', totalMealPlans);
          } catch (error) {
            console.warn('Failed to refresh meal plans count:', error);
          }
        };
        refreshMealPlansCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mealPlansLoaded, user]); // Re-run when mealPlansLoaded or user changes

  // Refresh meal plans when returning to dashboard (navigation-based)
  useEffect(() => {
    if (user && isInitialLoad === false) { // Only after initial load is complete
      console.log('🔄 Dashboard route accessed, refreshing meal plans count...');
      const refreshMealPlansCount = async () => {
        try {
          const mealPlansResponse = await mealPlanningApi.getMealPlans();
          const totalMealPlans = mealPlansResponse.total || 0;
          setStats(prevStats => ({
            ...prevStats,
            total_meal_plans: Math.max(0, totalMealPlans)
          }));
          console.log('✅ Navigation-based meal plans count refreshed:', totalMealPlans);
        } catch (error) {
          console.warn('Failed to refresh meal plans count on navigation:', error);
        }
      };
      refreshMealPlansCount();
    }
  }, [user, isInitialLoad]); // Run when user is available and after initial load

  // Initial data loading - only on mount
  useEffect(() => {
    const initializeData = async () => {
      console.log('🔄 Dashboard initializing...');
      
      // Only refresh if we don't have data yet
      if (savedRecipes.length === 0 && refreshRecipes) {
        await refreshRecipes();
      }
      
      // Mark initial load as complete after first render
      setTimeout(() => setIsInitialLoad(false), 100);
    };

    initializeData();
  }, []); // Only run once on mount

  const loadDashboardData = async () => {
    // Only show loading on initial load, not on subsequent updates
    if (isInitialLoad) {
      setDashboardLoading(true)
    }
    try {
      // Calculate more meaningful stats based on saved recipes with proper NaN handling
      const cuisineTypes = [...new Set(savedRecipes.map(r => r.cuisine_type || r.cuisine_name).filter(Boolean))]
      
      // More accurate time calculation with proper data validation
      const totalCookingTime = savedRecipes.reduce((total, recipe) => {
        const prepTime = Number((recipe as any).prep_time_minutes || (recipe as any).prep_time) || 0;
        const cookTime = Number((recipe as any).cook_time_minutes || (recipe as any).cook_time) || 0;
        const recipeTime = prepTime + cookTime;
        return total + (recipeTime > 0 ? recipeTime : 30); // Default to 30 min if no time data
      }, 0);
      
      // Calculate AI generated count with validation
      const aiGeneratedCount = savedRecipes.filter(r => r.ai_generated === true).length;
      
      // Calculate days since first recipe saved for streak with validation
      const sortedRecipes = savedRecipes
        .filter(recipe => recipe.saved_at) // Only include recipes with valid dates
        .sort((a, b) => new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime());
      
      const daysSinceFirst = sortedRecipes.length > 0 
        ? Math.floor((Date.now() - new Date(sortedRecipes[0].saved_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      // Ensure all values are valid numbers (meal plans handled separately)
      const newStats = {
        total_recipes: savedRecipes.length,
        saved_recipes: savedRecipes.length,
        favorite_recipes: Math.max(0, aiGeneratedCount), // Ensure non-negative
        total_meal_plans: stats.total_meal_plans, // Keep existing value, updated separately
        total_cooking_time: Math.max(0, Math.round(totalCookingTime)), // Total cooking time in minutes
        weekly_streak: Math.max(0, Math.min(daysSinceFirst + 1, savedRecipes.length)) // Ensure positive, realistic streak
      };
      
      // Log for debugging
      console.log('📊 Dashboard stats calculated:', newStats);
      
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Keep existing stats if calculation fails to avoid flickering
      if (stats.total_recipes === 0) {
        setStats({
          total_recipes: 0,
          saved_recipes: 0,
          favorite_recipes: 0,
          total_meal_plans: 0,
          total_cooking_time: 0,
          weekly_streak: 0
        });
      }
    } finally {
      if (isInitialLoad) {
        setDashboardLoading(false)
      }
    }
  }

  // Show recipes based on toggle state
  const maxDashboardRecipes = 6
  const maxExpandedRecipes = 18 // Show up to 18 when expanded
  const recipesToShow = showMoreRecipes ? maxExpandedRecipes : maxDashboardRecipes
  const dashboardRecipes = savedRecipes.slice(0, recipesToShow)
  const hasMoreRecipes = savedRecipes.length > recipesToShow
  const canShowMore = !showMoreRecipes && savedRecipes.length > maxDashboardRecipes

  const handleGenerateNew = () => {
    setShowRecipeModal(true)
  }

  const handleRecipeGenerated = (recipe: Recipe) => {
    setGeneratedRecipe(recipe)
  }

  const handleDeleteRecipe = async (recipe: Recipe) => {
    console.log('🗑️ Delete button clicked for recipe:', recipe.title);
    console.log('📋 Recipe object:', recipe);
    
    // Show custom confirmation modal instead of native alert
    setConfirmationModal({
      isOpen: true,
      title: 'Remove Recipe',
      message: `Are you sure you want to remove "${recipe.title}" from your saved recipes?`,
      onConfirm: () => performDeleteRecipe(recipe)
    });
  }

  const performDeleteRecipe = async (recipe: Recipe) => {

    try {
      let recipeIdToDelete = null;
      
      // Try to use the recipe's direct ID first
      if (recipe.id) {
        console.log('🔍 Using recipe.id directly:', recipe.id);
        recipeIdToDelete = recipe.id.toString();
      } else {
        console.log('🔍 Looking for saved recipe by title:', recipe.title);
        // Find the saved recipe by title to get the correct ID
        const savedRecipe = getSavedRecipe(recipe.title);
        console.log('📋 Found saved recipe:', savedRecipe);
        
        if (savedRecipe && savedRecipe.id) {
          recipeIdToDelete = savedRecipe.id.toString();
        }
      }
      
      if (recipeIdToDelete) {
        console.log('🔥 Attempting to remove recipe with ID:', recipeIdToDelete);
        const success = await removeRecipe(recipeIdToDelete);
        console.log('✅ Remove operation result:', success);
        
        if (success) {
          toast.success('Recipe removed from saved recipes!', {
            duration: 3000,
            position: 'top-center'
          });
        } else {
          toast.error('Failed to remove recipe. Please try again.', {
            duration: 3000,
            position: 'top-center'
          });
        }
      } else {
        console.log('❌ Recipe ID not found');
        toast.error('Recipe not found in saved list.', {
          duration: 3000,
          position: 'top-center'
        });
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      toast.error('Failed to remove recipe. Please try again.', {
        duration: 3000,
        position: 'top-center'
      });
    }
  };

  // Extract first name from full name for greeting
  const firstName = user?.first_name || 'Chef'
  const userInitials = user?.first_name && user?.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() 
    : 'U'

  // Memoize expensive calculations to prevent unnecessary re-renders
  const memoizedStats = useMemo(() => stats, [
    stats.saved_recipes,
    stats.total_meal_plans,
    stats.favorite_recipes,
    stats.total_cooking_time,
    stats.weekly_streak
  ])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-300 rounded-full animate-ping mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">🎨 Crafting your personalized cooking universe...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24"
    >
      {/* Simplified Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="relative backdrop-blur-sm bg-white/40 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                      <ChefHat className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                  Welcome back, Chef {firstName}! 
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Your culinary dashboard is ready to inspire your next masterpiece.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section - Now First */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div 
            onClick={() => navigate('/recipes')}
            className="text-center backdrop-blur-sm bg-white/60 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:bg-white/70 hover:border-emerald-300 group"
          >
            <div className="text-2xl font-bold text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">{memoizedStats.saved_recipes}</div>
            <div className="text-sm text-gray-600 font-medium group-hover:text-gray-700 transition-colors">Saved Recipes</div>
          </div>
          <div 
            onClick={() => navigate('/meal-plans')}
            className="text-center backdrop-blur-sm bg-white/60 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:bg-white/70 hover:border-orange-300 group"
          >
            <div className="text-2xl font-bold text-orange-600 mb-1 group-hover:text-orange-700 transition-colors">{memoizedStats.total_meal_plans}</div>
            <div className="text-sm text-gray-600 font-medium group-hover:text-gray-700 transition-colors">Meal Plans Created</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-white/60 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {memoizedStats.total_cooking_time === 0 
                ? '0h'
                : memoizedStats.total_cooking_time >= 60 
                  ? `${Math.floor(memoizedStats.total_cooking_time / 60)}h ${memoizedStats.total_cooking_time % 60}m`
                  : `${memoizedStats.total_cooking_time}m`
              }
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Cooking Time</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-white/60 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl font-bold text-pink-600 mb-1">{memoizedStats.weekly_streak}</div>
            <div className="text-sm text-gray-600 font-medium">Day Streak</div>
          </div>
        </motion.div>

        {/* My Recipes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Simple Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Recipes</h2>
              <p className="text-gray-600">
                {savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} in your collection
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Show More Button */}
              {canShowMore && (
                <Button
                  onClick={() => setShowMoreRecipes(true)}
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Show More ({savedRecipes.length - maxDashboardRecipes} more)
                </Button>
              )}
              
              {/* Show Less Button */}
              {showMoreRecipes && (
                <Button
                  onClick={() => setShowMoreRecipes(false)}
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Show Less
                </Button>
              )}

              {/* View All Button */}
              {hasMoreRecipes && (
                <Button
                  onClick={() => navigate('/recipes')}
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  View All ({savedRecipes.length})
                </Button>
              )}

              {/* Create Button */}
              <Button
                onClick={() => setShowRecipeModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Recipe
              </Button>
            </div>
          </div>

          {/* Recipe Grid */}
          {savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {dashboardRecipes.map((recipe, index) => {
                // Safe data extraction with fallbacks to prevent NaN errors
                const prepTime = Number((recipe as any).prep_time_minutes || (recipe as any).prep_time) || 0;
                const cookTime = Number((recipe as any).cook_time_minutes || (recipe as any).cook_time) || 0;
                const totalTime = prepTime + cookTime;
                const servings = Number(recipe.servings) || 4;
                // Try to get calories from enhanced data first, then fall back to basic data
                const enhancedRecipe = recipesWithNutrition.get(recipe.id!);
                const calories = Number(enhancedRecipe?.calories_per_serving) || 
                                Number((recipe as any).calories_per_serving) || 
                                Number((recipe as any).nutrition?.calories) || 
                                Number((recipe as any).nutrition_info?.calories) || 0;
                
                // Use real difficulty level values
                const rawDifficulty = (recipe as any).difficulty_level || recipe.difficulty;
                const difficulty = rawDifficulty || 'easy'; // Default to easy if not specified
                
                // Use real cuisine type values
                const rawCuisine = (recipe as any).cuisine_type || (recipe as any).cuisine_name;
                const cuisineType = rawCuisine || 'International'; // Default to International if not specified
                
                return (
                <motion.div
                  key={`recipe-${recipe.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: -20,
                    transition: { duration: 0.3, ease: "easeInOut" }
                  }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  layout
                  className="group backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl overflow-hidden shadow-xl shadow-gray-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 cursor-pointer"
                  onClick={() => handleRecipeClick(recipe)}
                >
                  {/* Recipe Image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                    {recipe.image_url ? (
                      <ImageWithFallback 
                        src={recipe.image_url} 
                        alt={recipe.title}
                        title={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <div className="text-center">
                          <ChefHat className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                          <span className="text-emerald-700 text-sm font-medium">Recipe Image</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Gradient Overlay for Better Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {/* Better positioned overlay content with stronger contrast */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      {/* Top badges with delete icon */}
                      <div className="flex justify-between items-start">
                        <div className="flex space-x-2">
                          {recipe.ai_generated && (
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-sm text-white text-xs rounded-full font-medium shadow-lg">
                              ✨ AI Generated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Subtle delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecipe(recipe);
                            }}
                            className="p-1.5 bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm rounded-full transition-all duration-200 opacity-60 group-hover:opacity-100"
                            title="Remove from saved recipes"
                          >
                            <Trash2 className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Bottom content with enhanced contrast */}
                      <div className="bg-gradient-to-t from-black/80 to-transparent p-3 -m-4 mt-8">
                        <h3 className="text-white font-bold mb-2 line-clamp-2 leading-tight drop-shadow-lg text-shadow-sm">
                          {recipe.title}
                        </h3>
                        
                        {/* Enhanced Quick Stats with better visibility */}
                        <div className="flex items-center space-x-3 text-xs text-white/90">
                          {servings > 0 && (
                            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                              <Users className="h-3 w-3" />
                              <span className="font-medium">{servings}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                            {(() => {
                              const difficulty = ((recipe as any).difficulty_level || 'Easy').toLowerCase();
                              if (difficulty === 'easy' || difficulty === 'beginner') {
                                return <Target className="h-3 w-3" />; // Single target
                              } else if (difficulty === 'medium' || difficulty === 'intermediate') {
                                return (
                                  <div className="flex items-center space-x-0.5">
                                    <Target className="h-2.5 w-2.5" />
                                    <Target className="h-2.5 w-2.5" />
                                  </div>
                                ); // Two targets side by side
                              } else if (difficulty === 'hard' || difficulty === 'advanced' || difficulty === 'expert') {
                                return (
                                  <div className="flex items-center space-x-0.5">
                                    <Target className="h-2.5 w-2.5" />
                                    <Target className="h-2.5 w-2.5" />
                                    <Target className="h-2.5 w-2.5" />
                                  </div>
                                ); // Three targets side by side
                              } else {
                                return <Target className="h-3 w-3" />; // Fallback single target
                              }
                            })()}
                            <span className="capitalize font-medium">{(recipe as any).difficulty_level || 'Easy'}</span>
                          </div>
                          {(calories > 0) && (
                            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                              <Zap className="h-3 w-3" />
                              <span className="font-medium">{calories} cal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Recipe Content */}
                  <div className="p-4 space-y-4">
                    {/* Cuisine and Creation Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center opacity-85">
                          <span className="text-xs">{getCuisineFlag(cuisineType)}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 capitalize">{cuisineType}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {new Date(recipe.saved_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Enhanced Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {recipe.description || "A delicious recipe crafted with care and attention to detail."}
                    </p>

                    {/* Improved Time Display */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200/50 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-700">
                            {prepTime > 0 ? prepTime : '15'}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">Prep Min</div>
                        </div>
                        <div className="w-px h-8 bg-slate-300"></div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-700">
                            {cookTime > 0 ? cookTime : '15'}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">Cook Min</div>
                        </div>
                        <div className="w-px h-8 bg-slate-300"></div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-700">
                            {totalTime > 0 ? totalTime : '30'}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">Total Min</div>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Key Ingredients Parser */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Key Ingredients</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(recipe.ingredients) && recipe.ingredients.slice(0, 3).map((ingredient: any, idx: number) => {
                          // Advanced ingredient name extraction with multiple format support
                          const displayName = formatIngredientDisplay(ingredient);
                          const category = getIngredientCategory(ingredient);
                          
                          return (
                            <span 
                              key={idx}
                              className={`px-2.5 py-1 border text-xs rounded-full font-medium ${
                                category === 'protein' ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200/50 text-red-800' :
                                category === 'vegetable' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 text-green-800' :
                                category === 'herb' ? 'bg-gradient-to-r from-lime-50 to-green-50 border-lime-200/50 text-lime-800' :
                                category === 'dairy' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 text-blue-800' :
                                category === 'grain' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200/50 text-amber-800' :
                                'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200/50 text-purple-800'
                              }`}
                            >
                              {displayName}
                            </span>
                          );
                        })}
                        {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 3 && (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/50 text-gray-600 text-xs rounded-full font-medium">
                            +{recipe.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Primary Action Button */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecipeClick(recipe);
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 font-medium py-2.5"
                        size="sm"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        View Recipe
                      </Button>
                    </div>
                  </div>
                </motion.div>
                )
                })}
                
                {/* Show More/View All Card */}
                {hasMoreRecipes && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: dashboardRecipes.length * 0.1 }}
                    className="group bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 cursor-pointer flex items-center justify-center min-h-[300px]"
                    onClick={() => navigate('/recipes')}
                  >
                    <div className="text-center">
                      <ArrowRight className="h-8 w-8 text-gray-400 group-hover:text-emerald-600 mx-auto mb-3 transition-colors" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        View All Recipes
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {savedRecipes.length - recipesToShow} more recipes
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Enhanced Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <ChefHat className="h-16 w-16 text-emerald-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/25 transform rotate-12">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Start Your Culinary Journey
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Create your first AI-powered recipe and discover amazing dishes tailored to your taste!
              </p>
              
              <Button
                onClick={() => setShowRecipeModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 px-8 py-3 text-lg font-semibold transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Generate Your First Recipe
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Recipe Display Modal */}
      <AnimatePresence>
        {isLoadingRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading complete recipe...</p>
            </motion.div>
          </motion.div>
        )}

        {selectedRecipe && !isLoadingRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Recipe Details</h2>
                <Button
                  onClick={() => setSelectedRecipe(null)}
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <RecipeDisplay 
                  recipe={selectedRecipe} 
                  onClose={() => {
                    setSelectedRecipe(null);
                    // Refresh saved recipes data for smooth dashboard update
                    setTimeout(() => {
                      refreshRecipes();
                    }, 500); // Small delay for smooth transition
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe Generator Modal */}
      <RecipeGeneratorModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onRecipeGenerated={(recipe) => {
          setGeneratedRecipe(recipe)
          setShowRecipeModal(false)
        }}
      />

      {/* Modern Generated Recipe Display Modal */}
      <AnimatePresence>
        {generatedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="backdrop-blur-sm bg-white/90 border border-white/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-gray-200/50 flex items-center justify-between bg-gradient-to-r from-white/60 to-white/40">
                <h2 className="text-2xl font-bold text-gray-900">Your Generated Recipe</h2>
                <button
                  onClick={() => setGeneratedRecipe(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100/50 hover:bg-gray-200/50 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8">
                <RecipeDisplay 
                  recipe={generatedRecipe} 
                  onClose={() => {
                    setGeneratedRecipe(null);
                  }}
                />
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={() => {
                      setGeneratedRecipe(null)
                      setShowRecipeModal(true)
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300"
                  >
                    Generate Another Recipe
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        icon={<Trash2 className="h-6 w-6 text-red-600" />}
      />
    </motion.div>
  )
}