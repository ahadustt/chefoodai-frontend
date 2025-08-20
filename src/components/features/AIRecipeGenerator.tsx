/**
 * ChefoodAI™ Premium AI Recipe Generator
 * Advanced recipe generation with Gemini 2.0 Flash Thinking integration
 */

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  ChefHat, 
  Sparkles, 
  Clock, 
  Users, 
  DollarSign,
  Zap,
  Brain,
  Lightbulb,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Heart,
  Share
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { useAIRecipeGeneration } from '@/hooks/useAI'
import { useAuth } from '@/contexts/AuthContext'

// Form validation schema
const recipeGenerationSchema = z.object({
  prompt: z.string().min(10, 'Please provide more details about your desired recipe'),
  cuisineType: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  servings: z.number().min(1).max(20).default(4),
  prepTimeMax: z.number().min(5).max(480).default(60),
  cookingSkill: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  budgetLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  dietaryRestrictions: z.array(z.string()).default([]),
  availableEquipment: z.array(z.string()).default([]),
})

type RecipeGenerationForm = z.infer<typeof recipeGenerationSchema>

interface AIRecipeGeneratorProps {
  onRecipeGenerated?: (recipe: any) => void
  className?: string
}

export function AIRecipeGenerator({ onRecipeGenerated, className }: AIRecipeGeneratorProps) {
  const { user } = useAuth() // Get logged-in user data
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generatedRecipe, setGeneratedRecipe] = React.useState<any>(null)
  const [showThinkingProcess, setShowThinkingProcess] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<string>('')

  const { generateRecipe } = useAIRecipeGeneration()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<RecipeGenerationForm>({
    resolver: zodResolver(recipeGenerationSchema),
    defaultValues: {
      difficulty: 'intermediate',
      servings: 4,
      prepTimeMax: 60,
      cookingSkill: (user?.cooking_skill_level as 'beginner' | 'intermediate' | 'advanced' | 'expert') || 'intermediate',
      budgetLevel: 'medium',
      dietaryRestrictions: mapUserDietaryPreferences(user?.dietary_preferences),
      availableEquipment: [],
      cuisineType: getUserPreferredCuisine(user?.favorite_cuisines),
    }
  })

  const watchedValues = watch()

  // Update form data when user preferences are loaded
  React.useEffect(() => {
    if (user) {
      console.log('🍳 Auto-populating AI Recipe Generator with user preferences:', {
        dietary_preferences: user.dietary_preferences,
        favorite_cuisines: user.favorite_cuisines,
        cooking_skill_level: user.cooking_skill_level
      });

      const mappedDietaryRestrictions = mapUserDietaryPreferences(user.dietary_preferences);
      const preferredCuisine = getUserPreferredCuisine(user.favorite_cuisines);
      const cookingSkill = user.cooking_skill_level as 'beginner' | 'intermediate' | 'advanced' | 'expert' || 'intermediate';

      // Update form values
      reset({
        difficulty: 'intermediate',
        servings: 4,
        prepTimeMax: 60,
        cookingSkill: cookingSkill,
        budgetLevel: 'medium',
        dietaryRestrictions: mappedDietaryRestrictions,
        availableEquipment: [],
        cuisineType: preferredCuisine,
      });
    }
  }, [user, reset]);

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto',
    'Paleo', 'Low-Carb', 'High-Protein', 'Nut-Free', 'Soy-Free'
  ]

  const equipmentOptions = [
    'Oven', 'Stovetop', 'Microwave', 'Air Fryer', 'Instant Pot',
    'Slow Cooker', 'Food Processor', 'Blender', 'Stand Mixer', 'Grill'
  ]

  const cuisineTypes = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American',
    'Indian', 'French', 'Middle Eastern', 'Thai', 'Japanese'
  ]

  // Mapping function to convert user profile dietary preferences to recipe generator format
  const mapUserDietaryPreferences = (userPreferences: string[] = []): string[] => {
    // The AI Recipe Generator uses the same format as user profile (e.g., "Vegetarian", "Gluten-Free")
    // So we can use them directly, but filter to only include supported options
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

  const onSubmit = async (data: RecipeGenerationForm) => {
    setIsGenerating(true)
    setCurrentStep('Initializing AI recipe generation...')
    
    try {
      // Simulate thinking process steps
      const thinkingSteps = [
        'Analyzing your preferences and dietary restrictions...',
        'Selecting optimal ingredients for your requirements...',
        'Calculating nutritional balance and portions...',
        'Optimizing cooking techniques and timing...',
        'Generating step-by-step instructions...',
        'Finalizing recipe with safety checks...'
      ]

      for (let i = 0; i < thinkingSteps.length; i++) {
        setCurrentStep(thinkingSteps[i])
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const response = await generateRecipe({
        prompt: data.prompt,
        dietary_restrictions: data.dietaryRestrictions,
        preferences: {
          cuisine_type: data.cuisineType,
          difficulty: data.difficulty,
          servings: data.servings,
          prep_time_max: data.prepTimeMax,
          cooking_skill: data.cookingSkill,
          budget_level: data.budgetLevel,
          available_equipment: data.availableEquipment
        }
      })

      setGeneratedRecipe(response.recipe)
      onRecipeGenerated?.(response.recipe)
      toast.success('Recipe generated successfully!')
      
    } catch (error) {
      console.error('Recipe generation failed:', error)
      toast.error('Failed to generate recipe. Please try again.')
    } finally {
      setIsGenerating(false)
      setCurrentStep('')
    }
  }

  const toggleDietaryRestriction = (restriction: string) => {
    const current = watchedValues.dietaryRestrictions || []
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction]
    setValue('dietaryRestrictions', updated)
  }

  const toggleEquipment = (equipment: string) => {
    const current = watchedValues.availableEquipment || []
    const updated = current.includes(equipment)
      ? current.filter(e => e !== equipment)
      : [...current, equipment]
    setValue('availableEquipment', updated)
  }

  const copyRecipe = async () => {
    if (!generatedRecipe) return
    
    try {
      const recipeText = `${generatedRecipe.name}\n\n${generatedRecipe.description}\n\nIngredients:\n${generatedRecipe.ingredients?.map((ing: any) => `- ${ing.amount} ${ing.name}`).join('\n')}\n\nInstructions:\n${generatedRecipe.instructions?.map((inst: any, idx: number) => `${idx + 1}. ${inst.instruction}`).join('\n')}`
      await navigator.clipboard.writeText(recipeText)
      toast.success('Recipe copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy recipe')
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl text-white">
            <Brain className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              AI Recipe Generator
            </h2>
                            <p className="text-gray-600">Powered by Chef AI</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <span>Advanced AI Reasoning</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-4 w-4 text-accent-500" />
            <span>Real-time Generation</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-success-500" />
            <span>Safety Validated</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Generation Form */}
        <Card variant="elevated" className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5" />
              <span>Recipe Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Main Prompt */}
              <Controller
                name="prompt"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="What would you like to cook?"
                    placeholder="Describe the dish you want to create, include any specific ingredients, flavors, or cooking methods you prefer..."
                    error={errors.prompt?.message}
                    className="min-h-[100px]"
                  />
                )}
              />

              {/* Basic Settings */}
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="servings"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Servings"
                      min={1}
                      max={20}
                      leftIcon={<Users className="h-4 w-4" />}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />

                <Controller
                  name="prepTimeMax"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Max Time (min)"
                      min={5}
                      max={480}
                      leftIcon={<Clock className="h-4 w-4" />}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </div>

              {/* Cuisine Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Cuisine Type (Optional)
                  {user && watchedValues.cuisineType && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      Auto-filled from profile
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {cuisineTypes.map(cuisine => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => setValue('cuisineType', 
                        watchedValues.cuisineType === cuisine ? '' : cuisine
                      )}
                      className={cn(
                        'px-3 py-1 text-sm rounded-full border transition-all',
                        watchedValues.cuisineType === cuisine
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                      )}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Dietary Restrictions
                  {user && watchedValues.dietaryRestrictions && watchedValues.dietaryRestrictions.length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Auto-filled from profile
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDietaryRestriction(option)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-full border transition-all',
                        watchedValues.dietaryRestrictions?.includes(option)
                          ? 'bg-success-500 text-white border-success-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-success-300'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Equipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Equipment
                </label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map(equipment => (
                    <button
                      key={equipment}
                      type="button"
                      onClick={() => toggleEquipment(equipment)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-full border transition-all',
                        watchedValues.availableEquipment?.includes(equipment)
                          ? 'bg-accent-500 text-white border-accent-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-accent-300'
                      )}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Skill Level
                    {user && user.cooking_skill_level && (
                      <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                        Auto-filled from profile
                      </span>
                    )}
                  </label>
                  <Controller
                    name="cookingSkill"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <Controller
                    name="budgetLevel"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                fullWidth
                loading={isGenerating}
                disabled={!isValid || isGenerating}
                leftIcon={<Sparkles className="h-5 w-5" />}
                loadingText="Generating Recipe..."
              >
                Generate AI Recipe
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generation Process & Results */}
        <div className="space-y-6">
          {/* Thinking Process */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card variant="gradient" className="border-primary-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-primary-500 rounded-lg">
                        <Brain className="h-5 w-5 text-white animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">AI Thinking Process</h3>
                        <p className="text-sm text-gray-600">Gemini 2.0 Flash Thinking at work</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                        <span className="text-sm text-gray-700">{currentStep}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-1000 animate-pulse" 
                             style={{ width: '60%' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Recipe */}
          <AnimatePresence>
            {generatedRecipe && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="elevated" className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary-50 to-accent-50 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          {generatedRecipe.name}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">{generatedRecipe.description}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={copyRecipe}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Recipe Meta */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                      {generatedRecipe.prep_time_minutes && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{generatedRecipe.prep_time_minutes}m prep</span>
                        </div>
                      )}
                      {generatedRecipe.cook_time_minutes && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{generatedRecipe.cook_time_minutes}m cook</span>
                        </div>
                      )}
                      {generatedRecipe.servings && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{generatedRecipe.servings} servings</span>
                        </div>
                      )}
                      {generatedRecipe.difficulty && (
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          generatedRecipe.difficulty === 'beginner' && 'bg-success-100 text-success-700',
                          generatedRecipe.difficulty === 'intermediate' && 'bg-warning-100 text-warning-700',
                          generatedRecipe.difficulty === 'advanced' && 'bg-error-100 text-error-700'
                        )}>
                          {generatedRecipe.difficulty}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Ingredients */}
                    {generatedRecipe.ingredients && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Ingredients</h4>
                        <ul className="space-y-2">
                          {generatedRecipe.ingredients.map((ingredient: any, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0" />
                              <span className="text-gray-700">
                                {ingredient.amount} {ingredient.name}
                                {ingredient.notes && (
                                  <span className="text-gray-500 text-sm"> ({ingredient.notes})</span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Instructions */}
                    {generatedRecipe.instructions && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Instructions</h4>
                        <ol className="space-y-3">
                          {generatedRecipe.instructions.map((instruction: any, index: number) => (
                            <li key={index} className="flex space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white text-sm font-medium rounded-full flex items-center justify-center">
                                {instruction.step || index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-700">{instruction.instruction}</p>
                                {instruction.time_minutes && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Time: {instruction.time_minutes} minutes
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Nutrition Info */}
                    {generatedRecipe.nutrition_per_serving && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Nutrition (per serving)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(generatedRecipe.nutrition_per_serving).map(([key, value]) => (
                            <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900">{value}</div>
                              <div className="text-xs text-gray-500 capitalize">
                                {key.replace('_', ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    {generatedRecipe.tips && generatedRecipe.tips.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Lightbulb className="h-4 w-4 text-warning-500" />
                          <span>Chef's Tips</span>
                        </h4>
                        <ul className="space-y-2">
                          {generatedRecipe.tips.map((tip: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="w-2 h-2 bg-warning-500 rounded-full mt-2 shrink-0" />
                              <span className="text-gray-700 text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}