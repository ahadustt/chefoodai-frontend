import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { mealPlanningApi } from '../../services/mealPlanningApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, BookmarkCheck, Shuffle, CheckCircle, Repeat, Users, Target, Clock, ChefHat, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

// AI-powered personalized meal plan name generation
const generatePersonalizedMealPlanName = async (preferences: {
  duration_days: number;
  family_size: number;
  goals: string[];
  dietary_restrictions: string[];
  cuisine_preferences: string[];
  skill_level: string;
}) => {
  try {
    const response = await fetch('/api/v1/ai/generate-meal-plan-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate AI name');
    }
    
    const data = await response.json();
    return data.name || generateFallbackName(preferences.duration_days);
  } catch (error) {
    console.warn('AI name generation failed, using fallback:', error);
    return generateFallbackName(preferences.duration_days);
  }
};

// Fallback name generator for when AI fails
const generateFallbackName = (duration_days: number) => {
  const adjectives = ['Amazing', 'Perfect', 'Healthy', 'Fresh', 'Balanced'];
  const themes = ['Journey', 'Adventure', 'Plan', 'Experience', 'Quest'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  
  return `${randomAdjective} ${duration_days}-Day ${randomTheme}`;
};

interface MealPlanCreatorProps {
  onSuccess: (mealPlan: any) => void;
  onProgress?: (progress: number, step: string, estimatedTime?: string) => void;
}

// Recipe source selection component
const RecipeSourceSelector: React.FC<{
  recipeMode: 'ai' | 'saved' | 'hybrid';
  onModeChange: (mode: 'ai' | 'saved' | 'hybrid') => void;
  savedRecipePercentage: number;
  onPercentageChange: (percentage: number) => void;
}> = ({ recipeMode, onModeChange, savedRecipePercentage, onPercentageChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ChefHat className="w-5 h-5 mr-2" />
          Recipe Sources
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you want to build your meal plan
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          className={`p-6 border-2 rounded-xl transition-all duration-200 ${
            recipeMode === 'ai' 
              ? 'border-blue-500 bg-blue-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => onModeChange('ai')}
        >
          <Bot className={`w-8 h-8 mx-auto mb-3 ${
            recipeMode === 'ai' ? 'text-blue-600' : 'text-gray-400'
          }`} />
          <div className="text-base font-medium mb-2">AI Generated</div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Fresh recipes tailored to your preferences using advanced AI
          </div>
          {recipeMode === 'ai' && (
            <div className="mt-3 text-sm text-blue-600 font-medium">
              ✨ Pure creativity & personalization
            </div>
          )}
        </button>
        
        <button
          type="button"
          className={`p-6 border-2 rounded-xl transition-all duration-200 ${
            recipeMode === 'saved' 
              ? 'border-green-500 bg-green-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => onModeChange('saved')}
        >
          <BookmarkCheck className={`w-8 h-8 mx-auto mb-3 ${
            recipeMode === 'saved' ? 'text-green-600' : 'text-gray-400'
          }`} />
          <div className="text-base font-medium mb-2">Saved Favorites</div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Use your tested and loved saved recipes
          </div>
          {recipeMode === 'saved' && (
            <div className="mt-3 text-sm text-green-600 font-medium">
              ❤️ Familiar & reliable choices
            </div>
          )}
        </button>
        
        <button
          type="button"
          className={`p-6 border-2 rounded-xl transition-all duration-200 ${
            recipeMode === 'hybrid' 
              ? 'border-purple-500 bg-purple-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => onModeChange('hybrid')}
        >
          <Shuffle className={`w-8 h-8 mx-auto mb-3 ${
            recipeMode === 'hybrid' ? 'text-purple-600' : 'text-gray-400'
          }`} />
          <div className="text-base font-medium mb-2">Smart Mix</div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Perfect blend of AI creativity and your favorites
          </div>
          {recipeMode === 'hybrid' && (
            <div className="mt-3 text-sm text-purple-600 font-medium">
              🎯 Best of both worlds
            </div>
          )}
        </button>
      </div>
      
      {/* Hybrid Mode Controls */}
      {recipeMode === 'hybrid' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">
              Recipe Mix Balance
            </label>
            <span className="text-sm font-semibold text-purple-600">
              {savedRecipePercentage}% Saved • {100 - savedRecipePercentage}% AI
            </span>
          </div>
          
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={savedRecipePercentage}
              onChange={(e) => onPercentageChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${savedRecipePercentage}%, #3b82f6 ${savedRecipePercentage}%, #3b82f6 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center">
                <Bot className="w-3 h-3 mr-1" />
                All AI
              </span>
              <span className="font-medium text-purple-600">Balanced</span>
              <span className="flex items-center">
                <BookmarkCheck className="w-3 h-3 mr-1" />
                All Saved
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Saved Recipe Browser Component
const SavedRecipeBrowser: React.FC<{
  onRecipesSelected: (recipeIds: string[]) => void;
  maxSelections?: number;
  filters?: {
    mealType?: string;
    cuisineType?: string;
    maxPrepTime?: number;
  };
}> = ({ onRecipesSelected, maxSelections, filters }) => {
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: savedRecipes, isLoading, error } = useQuery({
    queryKey: ['saved-recipes-for-meal-planning', filters],
    queryFn: () => mealPlanningApi.getAvailableRecipes(filters),
    enabled: true
  });
  
  const handleRecipeToggle = (recipeId: string) => {
    const newSelection = selectedRecipes.includes(recipeId)
      ? selectedRecipes.filter(id => id !== recipeId)
      : maxSelections && selectedRecipes.length >= maxSelections
        ? selectedRecipes
        : [...selectedRecipes, recipeId];
    
    setSelectedRecipes(newSelection);
    onRecipesSelected(newSelection);
  };
  
  const filteredRecipes = savedRecipes?.recipes?.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-sm">Unable to load saved recipes</div>
        <div className="text-xs mt-1">Please try again later</div>
      </div>
    );
  }
  
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          <BookmarkCheck className="w-4 h-4 mr-2 text-green-600" />
          Choose from Your Saved Recipes
        </h4>
        {maxSelections && (
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-md border">
            {selectedRecipes.length}/{maxSelections} selected
          </span>
        )}
      </div>
      
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search your recipes..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Recipe Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookmarkCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <div className="text-sm font-medium">No saved recipes found</div>
          <div className="text-xs mt-1">
            {searchTerm ? 'Try a different search term' : 'Save some recipes first to use them in meal planning'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedRecipes.includes(recipe.id)
                  ? 'border-green-500 bg-green-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
              }`}
              onClick={() => handleRecipeToggle(recipe.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-gray-900">
                    {recipe.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {recipe.prep_time_minutes || 0}min
                    </span>
                    {recipe.cuisine_name && (
                      <span>• {recipe.cuisine_name}</span>
                    )}
                  </div>
                </div>
                {selectedRecipes.includes(recipe.id) && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function MealPlanCreator({ onSuccess, onProgress }: MealPlanCreatorProps) {
  const { user } = useAuth(); // Get logged-in user data
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [useBlazingFast, setUseBlazingFast] = useState(true);
  const [generationStats, setGenerationStats] = useState<any>(null);
  
  // Initialize form data with user preferences or defaults
  const [formData, setFormData] = useState(() => {
    // Define mapping function here since it's needed for initialization
    const mapDietaryPreferencesToIds = (userPreferences: string[] = []): string[] => {
      const mappings: { [key: string]: string } = {
        'Vegetarian': 'vegetarian',
        'Vegan': 'vegan',
        'Gluten-Free': 'gluten_free',
        'Dairy-Free': 'dairy_free',
        'Nut-Free': 'nut_free',
        'Low-Carb': 'low_carb',
        'Keto': 'keto',
        'Paleo': 'paleo',
        'High-Protein': 'low_carb',
        'Halal': 'paleo',
        'Kosher': 'paleo'
      };
      
      return userPreferences
        .map(pref => mappings[pref])
        .filter(Boolean);
    };

    return {
      name: 'My Awesome Journey', // Will be updated by AI when component loads
      start_date: '',
      duration_days: 7,
      family_size: 4,
      target_calories_per_day: 2000,
      cooking_time_available: 60,
      goals: [] as string[],
      dietary_restrictions: mapDietaryPreferencesToIds(user?.dietary_preferences),
      preferences: {
        cuisine_preferences: (user?.favorite_cuisines || []).map(cuisine => cuisine.toLowerCase()),
        skill_level: (user?.cooking_skill_level || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
        meal_prep_style: 'mixed' as 'batch' | 'daily_fresh' | 'mixed'
      }
    };
  });
  
  // Recipe source preferences
  const [recipeMode, setRecipeMode] = useState<'ai' | 'saved' | 'hybrid'>('hybrid');
  const [savedRecipePercentage, setSavedRecipePercentage] = useState(30);
  const [selectedSavedRecipes, setSelectedSavedRecipes] = useState<string[]>([]);
  
  // Name generation state
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Progress tracking state
  const [generationProgress, setGenerationProgress] = useState<{
    isGenerating: boolean;
    currentStep: string;
    progress: number;
    estimatedTime: string;
    totalMeals: number;
    completedMeals: number;
  }>({
    isGenerating: false,
    currentStep: '',
    progress: 0,
    estimatedTime: '',
    totalMeals: 0,
    completedMeals: 0
  });

  // Real-time WebSocket progress updates
  const { isConnected: wsConnected, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'meal_plan_progress') {
        console.log('📡 Real-time progress update:', message);
        setGenerationProgress(prev => ({
          ...prev,
          progress: message.progress,
          currentStep: message.current_step,
          totalMeals: message.total_meals,
          completedMeals: message.completed_meals,
          isGenerating: message.status !== 'completed'
        }));

        // Show completion toast
        if (message.status === 'completed') {
          toast.success('🎉 Meal plan generated successfully!', {
            duration: 4000,
          });
        }
      }
    },
    onConnect: () => {
      console.log('🔌 WebSocket connected for real-time progress');
    }
  });
  
  const createMealPlanMutation = useMutation({
    mutationFn: async (data: { meal_plan_data: any; recipe_preferences: any }) => {
      const duration = data.meal_plan_data.duration_days || 7;
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      if (data.meal_plan_data.family_size > 2) mealTypes.push('snack');
      
      const totalMeals = duration * mealTypes.length;
      const estimatedSeconds = totalMeals * 15; // 15 seconds average per meal (more realistic)
      const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
      
      setGenerationProgress({
        isGenerating: true,
        currentStep: `🚀 Starting generation of ${totalMeals} meals...`,
        progress: 5,
        estimatedTime: `~${estimatedMinutes} minute${estimatedMinutes > 1 ? 's' : ''}`,
        totalMeals: totalMeals,
        completedMeals: 0
      });

      // Simulate real-time progress updates since WebSocket is disabled
      console.log('🚀 Starting meal plan generation with simulated progress updates');
      const progressStartTime = Date.now();

      // Start progress simulation with timeout fallback
      let progressInterval: NodeJS.Timeout | null = null;
      let timeoutFallback: NodeJS.Timeout | null = null;
      let isApiCompleted = false;

      progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          // Don't update if API already completed
          if (isApiCompleted) {
            return prev;
          }
          
          // Allow progress to reach 99% maximum during simulation
          const maxProgress = 99;
          const newProgress = Math.min(prev.progress + Math.random() * 10 + 3, maxProgress);
          const completed = Math.floor((newProgress / 100) * totalMeals);
          
          const steps = [
            '🔍 Analyzing your preferences...',
            '🧠 AI is selecting recipes...',
            '📋 Creating meal schedule...',
            '🛒 Generating shopping list...',
            '✨ Optimizing nutrition balance...',
            '🎯 Finalizing your meal plan...'
          ];
          
          const stepIndex = Math.floor((newProgress / 100) * steps.length);
          const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
          
          // Notify parent component of progress
          if (onProgress) {
            onProgress(newProgress, currentStep, `~${estimatedMinutes} minute${estimatedMinutes > 1 ? 's' : ''}`);
          }
          
          return {
            ...prev,
            progress: newProgress,
            currentStep,
            completedMeals: completed
          };
        });
      }, 1500);

      // Fallback timeout - complete progress after 30 seconds if API hasn't responded
      timeoutFallback = setTimeout(() => {
        if (!isApiCompleted) {
          console.warn('⚠️ API taking longer than expected, completing progress...');
          setGenerationProgress(prev => ({
            ...prev,
            progress: 100,
            currentStep: '✅ Meal plan completed! Loading results...',
            completedMeals: totalMeals
          }));
        }
      }, 30000);

      try {
        const response = await mealPlanningApi.createMealPlan(data.meal_plan_data, data.recipe_preferences);
        
        // Mark API as completed
        isApiCompleted = true;
        
        // Clear intervals
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        if (timeoutFallback) {
          clearTimeout(timeoutFallback);
        }
        
        const generationTime = Math.round((Date.now() - progressStartTime) / 1000);
        console.log(`✅ Meal plan generation completed in ${generationTime} seconds`);
        
        // Final progress update
        setGenerationProgress(prev => ({
          ...prev,
          isGenerating: false,
          currentStep: `✅ Generated in ${generationTime}s! Meal plan ready!`,
          progress: 100,
          completedMeals: totalMeals,
          estimatedTime: ''
        }));
        
        // Notify parent component of completion
        if (onProgress) {
          onProgress(100, `✅ Generated in ${generationTime}s! Meal plan ready!`, '');
        }
        
        return response;
      } catch (error) {
        // Mark API as completed (failed)
        isApiCompleted = true;
        
        // Clear intervals on error
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        if (timeoutFallback) {
          clearTimeout(timeoutFallback);
        }
        
        console.error('❌ Meal plan generation failed:', error);
        setGenerationProgress(prev => ({
          ...prev,
          isGenerating: false,
          currentStep: '❌ Generation failed. Please try again.',
          progress: 0,
          estimatedTime: ''
        }));
        throw error;
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('🎉 Meal plan created successfully!');
      
      // Reset progress after success
      setTimeout(() => {
        setGenerationProgress(prev => ({
          ...prev,
          isGenerating: false,
          currentStep: '',
          progress: 0,
          estimatedTime: ''
        }));
      }, 3000);
      
      // Call onSuccess with the real meal plan data to update the ID
      onSuccess(response);
    },
    onError: (error: any) => {
      console.error('Meal plan creation error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        code: error.code
      });
      
      let errorMessage = 'Failed to create meal plan';
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Meal plan generation is taking longer than expected. This might be due to a complex request. Please try reducing the duration or simplifying dietary restrictions, then try again.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid meal plan data. Please check your inputs and try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during meal plan generation. Please try again with fewer days or simpler preferences.';
      } else if (error.response?.status === 503) {
        errorMessage = 'AI service is temporarily unavailable. Please try again in a few moments.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Generation failed: ${error.message}`;
      }
      
      // Reset progress state
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        currentStep: '',
        progress: 0,
        estimatedTime: ''
      }));
      
      toast.error(errorMessage, {
        duration: 8000, // Longer duration for timeout messages
      });
    }
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setProgress(0);
    setProgressMessage('🚀 Starting meal plan generation...');
    setGenerationStats(null);

    try {
      const mealPlanData = {
        name: formData.name,
        start_date: formData.start_date,
        duration_days: formData.duration_days,
        family_size: formData.family_size,
        target_calories_per_day: formData.target_calories_per_day,
        cooking_time_available: formData.cooking_time_available,
        goals: formData.goals,
        dietary_restrictions: formData.dietary_restrictions,
        preferences: {
          cuisine_preferences: formData.preferences.cuisine_preferences,
          skill_level: formData.preferences.skill_level,
          meal_prep_style: formData.preferences.meal_prep_style
        },
        saved_recipe_percentage: recipeMode === 'hybrid' ? savedRecipePercentage : 
                               recipeMode === 'saved' ? 100 : 0,
        preferred_saved_recipes: selectedSavedRecipes,
        ai_fallback: true
      };

      // Calculate end_date for temporary meal plan display
      const startDate = new Date(mealPlanData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + mealPlanData.duration_days - 1);

      // Call onSuccess immediately to create the live progress card and refresh dashboard
      const tempMealPlan = {
        id: `temp-${Date.now()}`,
        name: mealPlanData.name,
        duration_days: mealPlanData.duration_days,
        status: 'generating',
        start_date: mealPlanData.start_date,
        end_date: endDate.toISOString().split('T')[0], // Correctly calculated
        family_size: mealPlanData.family_size,
        goals: mealPlanData.goals,
        dietary_restrictions: mealPlanData.dietary_restrictions,
        target_calories_per_day: mealPlanData.target_calories_per_day
      };
      
      onSuccess(tempMealPlan);

      // Progress callback for real-time updates
      const handleProgress = (progress: number, message: string, data?: any) => {
        setProgress(progress);
        setProgressMessage(message);
        
        // Handle completion
        if (data?.completed) {
          setGenerationStats(data.meal_plan || data);
          setIsGenerating(false);
          
          // Show success notification
          const generationTime = data.meal_plan?.generation_time || 'unknown';
          setProgressMessage(`✅ Generated in ${generationTime}s with AI images!`);
        }
        
        // Handle errors
        if (data?.error) {
          setIsGenerating(false);
          setProgress(0);
        }
      };

      // Create meal plan with blazing fast generation
      const result = await mealPlanningApi.createMealPlan(
        mealPlanData, 
        handleProgress,
        useBlazingFast
      );

      console.log('🎉 Meal plan created:', result);
      
      // If no real-time updates, handle completion here
      if (!useBlazingFast) {
        setGenerationStats({
          generation_method: 'standard',
          generation_time: 'N/A',
          has_images: false
        });
        setIsGenerating(false);
        setProgress(100);
        setProgressMessage('✅ Meal plan created successfully!');
      }

    } catch (error: any) {
      console.error('❌ Meal plan creation failed:', error);
      setIsGenerating(false);
      setProgress(0);
      setProgressMessage(`❌ Generation failed: ${error.message}`);
    }
  };
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };
  
  const generateAIName = async () => {
    setIsGeneratingName(true);
    try {
      const preferences = {
        duration_days: formData.duration_days,
        family_size: formData.family_size,
        goals: formData.goals,
        dietary_restrictions: formData.dietary_restrictions,
        cuisine_preferences: formData.preferences.cuisine_preferences,
        skill_level: formData.preferences.skill_level
      };
      
      const aiName = await generatePersonalizedMealPlanName(preferences);
      handleInputChange('name', aiName);
      toast.success('✨ AI generated a personalized name for you!', { duration: 3000 });
    } catch (error) {
      console.error('Name generation failed:', error);
      const fallbackName = generateFallbackName(formData.duration_days);
      handleInputChange('name', fallbackName);
      toast.error('AI name generation failed, using fallback name', { duration: 2000 });
    } finally {
      setIsGeneratingName(false);
    }
  };
  
  const goalOptions = [
    { id: 'weight_loss', label: 'Weight Loss', description: 'Lower calorie, high protein meals' },
    { id: 'muscle_gain', label: 'Muscle Gain', description: 'Higher protein, complex carbs' },
    { id: 'heart_health', label: 'Heart Health', description: 'Low sodium, healthy fats' },
    { id: 'balanced_nutrition', label: 'Balanced Nutrition', description: 'Well-rounded, nutritious meals' },
    { id: 'energy_boost', label: 'Energy Boost', description: 'Energizing, nutrient-dense foods' }
  ];
  
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', description: 'Plant-based with dairy and eggs' },
    { id: 'vegan', label: 'Vegan', description: 'Completely plant-based' },
    { id: 'gluten_free', label: 'Gluten-Free', description: 'No wheat, barley, or rye' },
    { id: 'dairy_free', label: 'Dairy-Free', description: 'No milk or dairy products' },
    { id: 'nut_free', label: 'Nut-Free', description: 'Safe for nut allergies' },
    { id: 'low_carb', label: 'Low Carb', description: 'Reduced carbohydrate intake' },
    { id: 'keto', label: 'Keto', description: 'Very low carb, high fat' },
    { id: 'paleo', label: 'Paleo', description: 'Whole foods, no processed items' }
  ];
  
  const cuisineOptions = [
    'American', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 
    'Indian', 'French', 'Thai', 'Japanese', 'Greek', 'Chinese', 'Korean'
  ];
  
  // Mapping function to convert user profile dietary preferences to meal plan form IDs
  const mapDietaryPreferencesToIds = (userPreferences: string[] = []): string[] => {
    const mappings: { [key: string]: string } = {
      'Vegetarian': 'vegetarian',
      'Vegan': 'vegan',
      'Gluten-Free': 'gluten_free',
      'Dairy-Free': 'dairy_free',
      'Nut-Free': 'nut_free',
      'Low-Carb': 'low_carb',
      'Keto': 'keto',
      'Paleo': 'paleo',
      'High-Protein': 'low_carb', // Map to closest available option
      'Halal': 'paleo', // Map to closest available option  
      'Kosher': 'paleo' // Map to closest available option
    };
    
    return userPreferences
      .map(pref => mappings[pref])
      .filter(Boolean); // Remove undefined mappings
  };
  
  // Update form data when user preferences are loaded
  useEffect(() => {
    if (user) {
      const mappedDietaryRestrictions = mapDietaryPreferencesToIds(user.dietary_preferences);
      
      console.log('🍳 Auto-populating meal plan form with user preferences:', {
        original_dietary_preferences: user.dietary_preferences,
        mapped_dietary_restrictions: mappedDietaryRestrictions,
        favorite_cuisines: user.favorite_cuisines,
        cooking_skill_level: user.cooking_skill_level
      });
      
      setFormData(prev => ({
        ...prev,
        dietary_restrictions: mappedDietaryRestrictions,
        preferences: {
          ...prev.preferences,
          cuisine_preferences: (user.favorite_cuisines || []).map(cuisine => cuisine.toLowerCase()),
          skill_level: user.cooking_skill_level || 'intermediate'
        }
      }));
    }
  }, [user]);

  // Set default start date to tomorrow and generate initial AI name
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      start_date: tomorrow.toISOString().split('T')[0]
    }));
    
    // Generate initial AI name with user preferences (after they're loaded)
    const generateInitialName = async () => {
      try {
        const mappedDietaryRestrictions = user ? mapDietaryPreferencesToIds(user.dietary_preferences) : [];
        
        const initialPreferences = {
          duration_days: 7,
          family_size: 4,
          goals: [],
          dietary_restrictions: mappedDietaryRestrictions,
          cuisine_preferences: (user?.favorite_cuisines || []).map(cuisine => cuisine.toLowerCase()),
          skill_level: user?.cooking_skill_level || 'intermediate'
        };
        
        const aiName = await generatePersonalizedMealPlanName(initialPreferences);
        setFormData(prev => ({ ...prev, name: aiName }));
      } catch (error) {
        console.warn('Initial AI name generation failed, using fallback');
        setFormData(prev => ({ ...prev, name: generateFallbackName(7) }));
      }
    };
    
    generateInitialName();
  }, [user]); // Re-run when user data is available
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold mb-2">Create Your Meal Plan</h2>
          <p className="text-purple-100">
            Design a personalized meal plan that fits your lifestyle and preferences
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Step 1: Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Plan Name *
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    (AI generates personalized names based on your preferences)
                  </span>
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., February Healthy Eating"
                  />
                  <button
                    type="button"
                    onClick={generateAIName}
                    disabled={isGeneratingName}
                    className="px-4 py-3 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-100 text-purple-700 disabled:text-gray-500 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    title="Generate AI-powered personalized name"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGeneratingName ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">
                      {isGeneratingName ? 'AI Thinking...' : 'AI Name'}
                    </span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Family Size
                </label>
                <select
                  value={formData.family_size}
                  onChange={(e) => handleInputChange('family_size', Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4].map(size => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? 'person' : 'people'} 
                      {size <= 2 ? ' (3 meals/day)' : ' (4 meals/day incl. snacks)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.family_size <= 2 
                    ? '📱 Individual/couple meal plan with breakfast, lunch & dinner'
                    : '👨‍👩‍👧‍👦 Family meal plan includes snacks for growing appetites'
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <select
                  value={formData.duration_days}
                  onChange={(e) => handleInputChange('duration_days', Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={1}>1 day</option>
                  <option value={7}>1 week</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Step 2: Recipe Sources */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <h3 className="text-lg font-semibold">Recipe Sources</h3>
            </div>
            
            <RecipeSourceSelector
              recipeMode={recipeMode}
              onModeChange={setRecipeMode}
              savedRecipePercentage={savedRecipePercentage}
              onPercentageChange={setSavedRecipePercentage}
            />
            
            {/* Saved Recipe Browser */}
            {(recipeMode === 'saved' || recipeMode === 'hybrid') && (
              <SavedRecipeBrowser
                onRecipesSelected={setSelectedSavedRecipes}
                maxSelections={recipeMode === 'saved' ? undefined : Math.ceil(formData.duration_days * 3 * savedRecipePercentage / 100)}
              />
            )}
          </div>
          
          {/* Step 3: Goals & Preferences */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <h3 className="text-lg font-semibold">Goals & Preferences</h3>
            </div>
            
            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-1" />
                Health Goals
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map(goal => (
                  <label
                    key={goal.id}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.goals.includes(goal.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.goals.includes(goal.id)}
                      onChange={() => handleArrayToggle('goals', goal.id)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{goal.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{goal.description}</div>
                    </div>
                    {formData.goals.includes(goal.id) && (
                      <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                Dietary Preferences & Restrictions
                {user && formData.dietary_restrictions.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    Auto-filled from profile
                  </span>
                )}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dietaryOptions.map(diet => (
                  <label
                    key={diet.id}
                    className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.dietary_restrictions.includes(diet.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.dietary_restrictions.includes(diet.id)}
                      onChange={() => handleArrayToggle('dietary_restrictions', diet.id)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{diet.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{diet.description}</div>
                    </div>
                    {formData.dietary_restrictions.includes(diet.id) && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Cuisine Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                Preferred Cuisines
                {user && formData.preferences.cuisine_preferences.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Auto-filled from profile
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {cuisineOptions.map(cuisine => (
                  <label
                    key={cuisine}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.preferences.cuisine_preferences.includes(cuisine.toLowerCase())
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferences.cuisine_preferences.includes(cuisine.toLowerCase())}
                      onChange={() => {
                        const newPreferences = { ...formData.preferences };
                        const cuisineKey = cuisine.toLowerCase();
                        if (newPreferences.cuisine_preferences.includes(cuisineKey)) {
                          newPreferences.cuisine_preferences = newPreferences.cuisine_preferences.filter(c => c !== cuisineKey);
                        } else {
                          newPreferences.cuisine_preferences.push(cuisineKey);
                        }
                        handleInputChange('preferences', newPreferences);
                      }}
                      className="sr-only"
                    />
                    <span className="font-medium text-sm flex-1">{cuisine}</span>
                    {formData.preferences.cuisine_preferences.includes(cuisine.toLowerCase()) && (
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Cooking Skills & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Cooking Skill Level
                  {user && user.cooking_skill_level && (
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                      Auto-filled from profile
                    </span>
                  )}
                </label>
                <select
                  value={formData.preferences.skill_level}
                  onChange={(e) => handleInputChange('preferences', {
                    ...formData.preferences,
                    skill_level: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner (Simple recipes)</option>
                  <option value="intermediate">Intermediate (Moderate complexity)</option>
                  <option value="advanced">Advanced (Complex techniques)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Available Cooking Time (minutes/day)
                </label>
                <select
                  value={formData.cooking_time_available}
                  onChange={(e) => handleInputChange('cooking_time_available', Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={15}>15 minutes (Quick meals)</option>
                  <option value={30}>30 minutes (Fast cooking)</option>
                  <option value={45}>45 minutes (Moderate time)</option>
                  <option value={60}>1 hour (Comfortable pace)</option>
                  <option value={90}>1.5 hours (Relaxed cooking)</option>
                  <option value={120}>2+ hours (Love to cook)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Your Meal Plan...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <ChefHat className="w-5 h-5 mr-2" />
                  Create My Meal Plan
                </span>
              )}
            </button>

                    {/* Real-Time Progress Bar and Status */}
        {generationProgress.isGenerating && (
          <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-purple-800">
                  🍽️ Generating Your Meal Plan
                </h3>
                {/* WebSocket Connection Indicator */}
                <div className="flex items-center space-x-1">
                  {wsConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {wsConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {generationProgress.totalMeals > 0 && (
                  <div className="text-sm text-purple-600 font-medium bg-white/70 px-3 py-1 rounded-full">
                    {generationProgress.completedMeals}/{generationProgress.totalMeals} meals
                  </div>
                )}
                <div className="text-xs text-purple-500 mt-1">
                  {generationProgress.estimatedTime}
                </div>
              </div>
            </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-white/50 rounded-full h-4 mb-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${generationProgress.progress}%` }}
                  ></div>
                </div>
                
                {/* Current Step */}
                <p className="text-purple-700 font-medium mb-3">
                  {generationProgress.currentStep}
                </p>
                
                {/* Progress Details */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600 font-medium">
                    Progress: {generationProgress.progress}%
                  </span>
                  <span className="text-xs text-purple-500 bg-white/50 px-2 py-1 rounded-full">
                    Please wait while we craft your personalized meal plan ✨
                  </span>
                </div>
              </div>
            )}
            
            {recipeMode !== 'ai' && (
              <p className="text-center text-sm text-gray-500 mt-3">
                {recipeMode === 'saved' 
                  ? '🍽️ Your meal plan will use your saved favorite recipes'
                  : `🎯 Perfect mix: ${savedRecipePercentage}% saved recipes + ${100 - savedRecipePercentage}% AI-generated`
                }
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}