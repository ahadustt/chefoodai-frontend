import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Target,
  ChefHat,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import ImageWithFallback from '../ImageWithFallback';

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
import { RecipeDisplay } from '../recipe/RecipeDisplay';
import { mealPlanningApi } from '../../services/mealPlanningApi';
import { recipeApi, CompleteRecipe } from '../../api/client';

interface MealPlan {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  target_calories_per_day?: number;
  goals?: string[];
  dietary_restrictions?: string[];
  family_size?: number;
  budget_per_week?: number;
  days: MealPlanDay[];
  analytics?: MealPlanAnalytics[];
  shopping_lists?: ShoppingList[];
  created_at: string;
  updated_at: string;
}

interface MealPlanDay {
  date: string;
  meals: MealPlanMeal[];
}

interface MealPlanMeal {
  id: string | null;
  meal_type: string;
  typical_time: string | null;
  servings: number;
  is_prepared: boolean;
  notes: string | null;
  recipe: {
    id: string | null;
    title: string;
    prep_time_minutes: number;
    cook_time_minutes: number;
    difficulty_level: string;
    cuisine_type: string;
  };
}

interface MealPlanAnalytics {
  total_calories: number;
  avg_calories_per_day: number;
  total_protein: number;
  total_carbohydrates: number;
  total_fat: number;
  unique_recipes_count: number;
  nutritional_balance_score: number;
  goal_achievement_score: number;
  cuisine_distribution: Record<string, number>;
}

interface ShoppingList {
  id: number;
  ingredients_by_category: Record<string, Array<{
    name: string;
    amount: string | number;
    unit: string;
  }>>;
  total_items: number;
  estimated_cost: number;
}

interface MealPlanViewProps {
  mealPlanId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MealPlanView: React.FC<MealPlanViewProps> = ({
  mealPlanId,
  onEdit,
  onDelete
}) => {
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  // Function to load complete recipe details
  const handleRecipeClick = async (meal: any) => {
    try {
      setIsLoadingRecipe(true);
      
      // Fetch complete recipe details BEFORE showing the modal
      const completeRecipe = await recipeApi.getCompleteRecipe(meal.recipe.id);
      
      // Show the modal with complete data immediately
      setSelectedRecipe({
        ...completeRecipe,
        servings: meal.servings, // Use meal servings, not recipe default
      });
      
    } catch (error) {
      console.error('Failed to load complete recipe:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Create a fallback recipe with basic data if API fails
      const fallbackRecipe = {
        id: meal.recipe.id,
        title: meal.recipe.title,
        description: meal.recipe.description || 'Recipe details are temporarily unavailable. Please try again later.',
        image_url: meal.recipe.image_url,
        prep_time_minutes: meal.recipe.prep_time_minutes,
        cook_time_minutes: meal.recipe.cook_time_minutes,
        servings: meal.servings,
        difficulty_level: meal.recipe.difficulty_level,
        cuisine_type: meal.recipe.cuisine_type,
        chef_tips: meal.recipe.chef_tips || 'Chef tips not available.',
        calories_per_serving: meal.recipe.calories_per_serving,
        ingredient_images: meal.recipe.ingredient_images || {},
        ai_generated: true,
        created_at: new Date().toISOString(),
        ingredients: ['Recipe ingredients are temporarily unavailable.'],
        instructions: ['Recipe instructions are temporarily unavailable.'],
        nutrition: null,
        total_time_minutes: (meal.recipe.prep_time_minutes || 0) + (meal.recipe.cook_time_minutes || 0),
        hasError: true
      };
      
      setSelectedRecipe(fallbackRecipe);
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const { data: mealPlan, isLoading, error } = useQuery({
    queryKey: ['meal-plan', mealPlanId],
    queryFn: () => mealPlanningApi.getMealPlan(mealPlanId),
    retry: (failureCount, error: any) => {
      // Don't retry for temporary ID errors
      if (error?.message?.includes('temporary meal plan')) {
        return false;
      }
      return failureCount < 3;
    }
  });



  // Format time from 24-hour format to 12-hour format with AM/PM
  const formatMealTime = (time: string): string => {
    if (!time) return '';
    
    // Parse time string (e.g., "08:00:00" or "18:00:00")
    const [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    // Format without leading zeros and only show minutes if not :00
    return minutes === 0 
      ? `${displayHours}:00 ${period}`
      : `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };





  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    // Handle temporary meal plan error specifically
    if (error.message?.includes('temporary meal plan')) {
      return (
        <div className="text-center py-12">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-purple-600 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-purple-800 mb-2">Meal Plan Generating</h3>
            <p className="text-purple-600 text-sm">
              This meal plan is still being created. Please wait for generation to complete before viewing.
            </p>
          </div>
        </div>
      );
    }
    
    // Generic error fallback
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading meal plan: {error.message}</p>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Meal plan not found</p>
      </div>
    );
  }

  // Add safety check for days array
  if (!mealPlan.days || !Array.isArray(mealPlan.days)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No meal plan data available</p>
      </div>
    );
  }

  const weekDays = mealPlan.days.slice(currentWeek * 7, (currentWeek + 1) * 7);
  const totalWeeks = Math.ceil(mealPlan.days.length / 7);



  const getMealTypeIcon = (mealType: string) => {
    const icons = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍎'
    };
    return icons[mealType as keyof typeof icons] || '🍴';
  };

  const renderMealPlanHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{mealPlan.name}</h1>
          {mealPlan.description && (
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{mealPlan.description}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-full sm:w-auto justify-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Charts</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShoppingList(!showShoppingList)}
            className="w-full sm:w-auto justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Shopping List</span>
            <span className="sm:hidden">List</span>
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="w-full sm:w-auto justify-center">
              <Edit3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete} className="w-full sm:w-auto justify-center">
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Delete</span>
              <span className="sm:hidden">Del</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            {format(parseISO(mealPlan.start_date), 'MMM dd')} - {format(parseISO(mealPlan.end_date), 'MMM dd')}
          </span>
        </div>
        {mealPlan.family_size && (
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{mealPlan.family_size} people</span>
          </div>
        )}
        {mealPlan.budget_per_week && (
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>${mealPlan.budget_per_week}/week</span>
          </div>
        )}
        {mealPlan.target_calories_per_day && (
          <div className="flex items-center text-sm text-gray-600">
            <Target className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{mealPlan.target_calories_per_day} cal/day</span>
          </div>
        )}
        {mealPlan.goals && mealPlan.goals.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <Target className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{mealPlan.goals.join(', ')}</span>
          </div>
        )}
      </div>

      {((mealPlan.goals && mealPlan.goals.length > 0) || (mealPlan.dietary_restrictions && mealPlan.dietary_restrictions.length > 0)) && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {mealPlan.goals && mealPlan.goals.map(goal => (
              <span key={goal} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                {goal.replace('_', ' ')}
              </span>
            ))}
            {mealPlan.dietary_restrictions && mealPlan.dietary_restrictions.map(restriction => (
              <span key={restriction} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {restriction.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    if (!showAnalytics || !mealPlan.analytics?.length) return null;

    const analytics = mealPlan.analytics[0];

    return (
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutritional Analytics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round(analytics.avg_calories_per_day)}
            </div>
            <div className="text-sm text-gray-600">Avg Calories/Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(analytics.total_protein)}g
            </div>
            <div className="text-sm text-gray-600">Total Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.unique_recipes_count}
            </div>
            <div className="text-sm text-gray-600">Unique Recipes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(analytics.nutritional_balance_score)}%
            </div>
            <div className="text-sm text-gray-600">Balance Score</div>
          </div>
        </div>

        {Object.keys(analytics.cuisine_distribution).length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Cuisine Distribution</h4>
            <div className="flex flex-wrap gap-2">
              {analytics && typeof analytics === 'object' && 'cuisine_distribution' in analytics && 
               Object.entries((analytics as any).cuisine_distribution || {}).map(([cuisine, count]) => (
                <span key={cuisine} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {cuisine}: {count as any} meals
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderShoppingList = () => {
    if (!showShoppingList || !mealPlan.shopping_lists?.length) return null;

    const shoppingList = mealPlan.shopping_lists[0];

    return (
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Shopping List</h3>
          <div className="text-sm text-gray-600">
            {shoppingList.total_items} items • Est. ${shoppingList.estimated_cost}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Object.entries(shoppingList.ingredients_by_category).map(([category, ingredients]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-900 mb-2 capitalize">
                {category.replace('_', ' ')}
              </h4>
              <ul className="space-y-1">
                {Array.isArray(ingredients) && ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-600 flex justify-between">
                    <span>{(ingredient as any).name}</span>
                    <span>{(ingredient as any).amount} {(ingredient as any).unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderDailyView = () => {
    const selectedDay = mealPlan.days[currentDay];
    if (!selectedDay) return null;

    return (
      <div className="space-y-6">
        {/* Daily Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
              disabled={currentDay === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {format(parseISO(selectedDay.date), 'EEEE')}
              </div>
              <div className="text-sm text-gray-600">
                {format(parseISO(selectedDay.date), 'MMMM dd, yyyy')} • Day {currentDay + 1} of {mealPlan.days.length}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDay(Math.min(mealPlan.days.length - 1, currentDay + 1))}
              disabled={currentDay >= mealPlan.days.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={viewMode === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('daily')}
            >
              Daily
            </Button>
          </div>
        </div>

        {/* Single Day Detailed View */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {selectedDay.meals.map((meal, index) => (
            <motion.div
              key={meal.id || `${selectedDay.date}-${meal.meal_type}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl overflow-hidden shadow-xl shadow-gray-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 cursor-pointer"
              onClick={() => handleRecipeClick(meal)}
            >
              {/* Recipe Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                {meal.recipe.image_url ? (
                  <ImageWithFallback 
                    src={meal.recipe.image_url} 
                    alt={meal.recipe.title}
                    title={meal.recipe.title}
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
                
                {/* Better positioned overlay content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  {/* Top badges with meal type */}
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-2">
                      {/* Meal Type Badge */}
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/30">
                        <span className="text-lg">{getMealTypeIcon(meal.meal_type)}</span>
                        <span className="text-sm font-bold text-white capitalize">
                          {meal.meal_type}
                        </span>
                        {meal.typical_time && (
                          <span className="text-xs text-white/90 bg-white/20 px-2 py-1 rounded-full">
                            {formatMealTime(meal.typical_time)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom content with enhanced contrast */}
                  <div className="bg-gradient-to-t from-black/80 to-transparent p-3 -m-4 mt-8">
                    <h3 className="text-white font-bold mb-2 line-clamp-2 leading-tight drop-shadow-lg text-shadow-sm">
                      {meal.recipe.title}
                    </h3>
                    
                    {/* Enhanced Quick Stats with better visibility */}
                    <div className="flex items-center space-x-3 text-xs text-white/90">
                      {meal.servings && (
                        <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                          <Users className="h-3 w-3" />
                          <span className="font-medium">{meal.servings}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                        {(() => {
                          const difficulty = (meal.recipe.difficulty_level || 'Easy').toLowerCase();
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
                        <span className="capitalize font-medium">{meal.recipe.difficulty_level || 'Easy'}</span>
                      </div>
                      {meal.recipe.calories_per_serving && meal.recipe.calories_per_serving > 0 && (
                        <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                          <Zap className="h-3 w-3" />
                          <span className="font-medium">{meal.recipe.calories_per_serving} cal</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Recipe Content */}
              <div className="p-4 space-y-4">
                {/* Cuisine and Meal Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center opacity-85">
                      <span className="text-xs">{getCuisineFlag(meal.recipe.cuisine_type || 'International')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 capitalize">{meal.recipe.cuisine_type || 'International'}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Meal Plan Recipe
                  </div>
                </div>

                {/* Enhanced Description */}
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                  {meal.recipe.description || "A delicious recipe crafted with care and attention to detail."}
                </p>

                {/* Improved Time Display */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200/50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-700">
                        {meal.recipe.prep_time_minutes || 15}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Prep Min</div>
                    </div>
                    <div className="w-px h-8 bg-slate-300"></div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-700">
                        {meal.recipe.cook_time_minutes || 15}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Cook Min</div>
                    </div>
                    <div className="w-px h-8 bg-slate-300"></div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-700">
                        {(meal.recipe.prep_time_minutes || 15) + (meal.recipe.cook_time_minutes || 15)}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Total Min</div>
                    </div>
                  </div>
                </div>

                {/* Action Button - Always at bottom */}
                <div className="mt-auto">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecipeClick(meal);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200"
                    size="sm"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    View Recipe
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* No meals fallback */}
          {selectedDay.meals.length === 0 && (
            <div className="col-span-full">
              <div className="text-center py-16 bg-white/60 rounded-2xl border border-white/40">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No meals planned for this day</h3>
                <p className="text-gray-600">Add some delicious meals to get started!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
            disabled={currentWeek === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            Week {currentWeek + 1} of {totalWeeks}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(Math.min(totalWeeks - 1, currentWeek + 1))}
            disabled={currentWeek >= totalWeeks - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('daily')}
          >
            Daily
          </Button>
        </div>
      </div>

      {/* Days Grid - Mobile Responsive Design */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {weekDays.map((day) => (
          <div
            key={day.date}
            className="group backdrop-blur-sm bg-white/70 border border-white/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Day Header - Enhanced */}
            <div className="bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-purple-500/15 p-6 border-b border-white/30 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl -translate-y-6 translate-x-6"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-lg translate-y-4 -translate-x-4"></div>
              
              <div className="text-center relative z-10">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {format(parseISO(day.date), 'EEE')}
                </div>
                <div className="text-sm text-gray-600 font-semibold tracking-wide">
                  {format(parseISO(day.date), 'MMM dd')}
                </div>
                <div className="mt-2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
            </div>

            {/* Meals List */}
            <div className="p-6 space-y-4">
              {day.meals.map((meal, index) => {
                // Detect fallback/placeholder recipes
                const isFallbackRecipe = meal.recipe.title?.includes('Simple ') || 
                                       meal.recipe.title === 'Simple Breakfast' || 
                                       meal.recipe.title === 'Simple Lunch' || 
                                       meal.recipe.title === 'Simple Dinner' ||
                                       meal.recipe.description?.includes('nutritious and easy');
                
                if (isFallbackRecipe) {
                  // Show generating status instead of fallback recipe
                  return (
                    <div 
                      key={meal.id || `${day.date}-${meal.meal_type}-${index}`} 
                      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-300 shadow-sm"
                    >
                      <div className="p-4">
                        {/* Meal Type Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getMealTypeIcon(meal.meal_type)}</span>
                            <span className="text-sm font-semibold text-purple-700 capitalize">
                              {meal.meal_type}
                            </span>
                            {meal.typical_time && (
                              <span className="text-xs text-purple-500 bg-purple-100 px-2 py-1 rounded-full">
                                {formatMealTime(meal.typical_time)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Generating Status */}
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-3 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                            <div className="text-purple-700 text-sm font-medium mb-1">Generating Recipe</div>
                            <div className="text-purple-500 text-xs">AI is creating your perfect {meal.meal_type}</div>
                          </div>
                        </div>

                        {/* Status Message */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-purple-800">
                            Creating {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)} Recipe
                          </h4>
                          
                          <div className="text-xs text-purple-600 bg-purple-100 px-3 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              <span>AI is working on your personalized {meal.meal_type} recipe...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={meal.id || `${day.date}-${meal.meal_type}-${index}`} 
                    className="group/meal relative overflow-hidden rounded-xl bg-white/60 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => handleRecipeClick(meal)}
                  >
                  <div className="p-4">
                    {/* Meal Type Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMealTypeIcon(meal.meal_type)}</span>
                        <span className="text-sm font-semibold text-gray-700 capitalize">
                          {meal.meal_type}
                        </span>
                        {meal.typical_time && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {formatMealTime(meal.typical_time)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Recipe Image */}
                    {meal.recipe.image_url ? (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-3">
                        <ImageWithFallback 
                          src={meal.recipe.image_url} 
                          alt={meal.recipe.title}
                          title={meal.recipe.title}
                          className="w-full h-full object-cover group-hover/meal:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-3 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <div className="text-center">
                          <ChefHat className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                          <span className="text-emerald-700 text-xs font-medium">Recipe Image</span>
                        </div>
                      </div>
                    )}

                    {/* Recipe Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {meal.recipe.title}
                      </h4>
                      
                      {/* Recipe Stats - Improved Layout */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <div className="flex items-center space-x-1 bg-blue-50 px-2.5 py-1.5 rounded-full min-w-fit">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium whitespace-nowrap">
                            {(meal.recipe.prep_time_minutes || 0) + (meal.recipe.cook_time_minutes || 0)} min
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 bg-green-50 px-2.5 py-1.5 rounded-full min-w-fit">
                          <Target className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium capitalize whitespace-nowrap">
                            {meal.recipe.difficulty_level || 'Easy'}
                          </span>
                        </div>
                        {meal.servings && (
                          <div className="flex items-center space-x-1 bg-purple-50 px-2.5 py-1.5 rounded-full min-w-fit">
                            <Users className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium whitespace-nowrap">{meal.servings}</span>
                          </div>
                        )}
                      </div>

                      {/* Ingredients Preview */}
                      {meal.recipe.ingredients && meal.recipe.ingredients.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1 font-medium">Ingredients:</div>
                          <div className="flex flex-wrap gap-1">
                            {meal.recipe.ingredients.slice(0, 3).map((ingredient: any, idx: number) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded-full border border-gray-200"
                              >
                                {typeof ingredient === 'string' ? ingredient : ingredient.name || ingredient}
                              </span>
                            ))}
                            {meal.recipe.ingredients.length > 3 && (
                              <span className="inline-block px-2 py-1 bg-indigo-50 text-xs text-indigo-600 rounded-full border border-indigo-200 font-medium">
                                +{meal.recipe.ingredients.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover/meal:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                );
              })}

              {/* No meals fallback */}
              {day.meals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">🍽️</div>
                  <div className="text-sm">No meals planned</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {renderMealPlanHeader()}
      {renderAnalytics()}
      {renderShoppingList()}
      {viewMode === 'daily' ? renderDailyView() : renderWeeklyView()}

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
              <p className="text-gray-600 text-lg font-medium">Loading recipe...</p>
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
                  onClose={() => setSelectedRecipe(null)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};