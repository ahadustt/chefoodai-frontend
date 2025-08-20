import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ChefHat, 
  Clock, 
  Users, 
  Utensils, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { generateRecipe, RecipeRequest, Recipe } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// Form validation schema
const recipeFormSchema = z.object({
  ingredients: z.string().optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  cuisine_type: z.string().optional(),
  cooking_time: z.number().min(5).max(240).optional(),
  servings: z.number().min(1).max(12).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']).optional(),
  description: z.string().optional(),
})

type RecipeFormData = z.infer<typeof recipeFormSchema>

interface RecipeGeneratorFormProps {
  onRecipeGenerated: (recipe: Recipe) => void
  className?: string
}

export function RecipeGeneratorForm({ onRecipeGenerated, className }: RecipeGeneratorFormProps) {
  const { user } = useAuth() // Get logged-in user data
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      servings: 4,
      cooking_time: 30,
      difficulty: 'medium',
      meal_type: 'dinner',
      dietary_restrictions: mapUserDietaryPreferences(user?.dietary_preferences),
      cuisine_type: getUserPreferredCuisine(user?.favorite_cuisines),
    },
  })

  const watchedValues = watch()

  // Update form and selected dietary restrictions when user preferences are loaded
  useEffect(() => {
    if (user) {
      console.log('🍳 Auto-populating Recipe Generator with user preferences:', {
        dietary_preferences: user.dietary_preferences,
        favorite_cuisines: user.favorite_cuisines,
      });

      const mappedDietaryRestrictions = mapUserDietaryPreferences(user.dietary_preferences);
      const preferredCuisine = getUserPreferredCuisine(user.favorite_cuisines);

      // Update selected dietary restrictions state
      setSelectedDietaryRestrictions(mappedDietaryRestrictions);

      // Update form values
      reset({
        servings: 4,
        cooking_time: 30,
        difficulty: 'medium',
        meal_type: 'dinner',
        dietary_restrictions: mappedDietaryRestrictions,
        cuisine_type: preferredCuisine,
      });
    }
  }, [user, reset]);

  const cuisineTypes = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'French', 
    'Indian', 'Thai', 'Japanese', 'Greek', 'Spanish', 'Chinese'
  ]

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 
    'Paleo', 'Low-Carb', 'High-Protein', 'Nut-Free', 'Halal'
  ]

  // Mapping function to convert user profile dietary preferences to recipe generator format
  const mapUserDietaryPreferences = (userPreferences: string[] = []): string[] => {
    // Filter user preferences to only include supported options
    return userPreferences.filter(pref => dietaryOptions.includes(pref))
  }

  // Get user's preferred cuisine in the format expected by the form
  const getUserPreferredCuisine = (userCuisines: string[] = []): string | undefined => {
    // Find the first user cuisine that matches our supported cuisine types
    return userCuisines.find(cuisine => 
      cuisineTypes.some(supportedCuisine => 
        supportedCuisine.toLowerCase() === cuisine.toLowerCase()
      )
    )
  }

  const toggleDietaryRestriction = (restriction: string) => {
    setSelectedDietaryRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    )
  }

  const onSubmit = async (data: RecipeFormData) => {
    setIsGenerating(true)
    setError(null)

    try {
      const request: RecipeRequest = {
        ...data,
        ingredients: data.ingredients ? data.ingredients.split(',').map(i => i.trim()) : undefined,
        dietary_restrictions: selectedDietaryRestrictions.length > 0 ? selectedDietaryRestrictions : undefined,
      }

      const response = await generateRecipe(request)

      if (response.success && response.recipe) {
        onRecipeGenerated(response.recipe)
        reset()
        setSelectedDietaryRestrictions([])
      } else {
        setError(response.error || 'Failed to generate recipe')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Recipe generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-chef-500 rounded-lg">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Generate Your Recipe</h2>
            <p className="text-sm text-muted-foreground">Tell our AI what you'd like to cook</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What would you like to cook? (Optional)
            </label>
            <Input
              {...register('description')}
              placeholder="E.g., A healthy pasta dish with vegetables..."
              className="w-full"
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Available Ingredients (Optional)
            </label>
            <Input
              {...register('ingredients')}
              placeholder="E.g., chicken, tomatoes, garlic, pasta (comma-separated)"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for AI to suggest ingredients
            </p>
          </div>

          {/* Basic Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Servings
              </label>
              <Input
                {...register('servings', { valueAsNumber: true })}
                type="number"
                min={1}
                max={12}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Cooking Time (min)
              </label>
              <Input
                {...register('cooking_time', { valueAsNumber: true })}
                type="number"
                min={5}
                max={240}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <Utensils className="h-4 w-4 mr-1" />
                Difficulty
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-chef-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Meal Type & Cuisine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Meal Type</label>
              <select
                {...register('meal_type')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-chef-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                Cuisine Type
                {user && watchedValues.cuisine_type && watchedValues.cuisine_type !== '' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Auto-filled from profile
                  </span>
                )}
              </label>
              <select
                {...register('cuisine_type')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-chef-500"
              >
                <option value="">Any Cuisine</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center">
              Dietary Restrictions (Optional)
              {user && selectedDietaryRestrictions.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  Auto-filled from profile
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(option => (
                <motion.button
                  key={option}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleDietaryRestriction(option)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedDietaryRestrictions.includes(option)
                      ? 'bg-chef-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-chef-500 hover:bg-chef-600 text-white py-3 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Recipe...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Recipe with AI</span>
                </div>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </Card>
  )
} 