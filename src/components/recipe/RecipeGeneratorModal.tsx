import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X,
  ChefHat, 
  Clock, 
  Users, 
  Utensils,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
  Heart,
  TrendingUp,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
  include_images: z.boolean().optional(),
  generate_ingredient_images: z.boolean().optional(),
})

type RecipeFormData = z.infer<typeof recipeFormSchema>

interface RecipeGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onRecipeGenerated: (recipe: Recipe) => void
}

// Quick recipe presets for easy access
const quickPresets = [
  {
    id: 'quick-dinner',
    title: 'Quick Dinner',
    subtitle: '30 min or less',
    icon: '⚡',
    data: { meal_type: 'dinner', cooking_time: 30, difficulty: 'easy' }
  },
  {
    id: 'healthy-lunch',
    title: 'Healthy Lunch',
    subtitle: 'Nutritious & light',
    icon: '🥗',
    data: { meal_type: 'lunch', dietary_restrictions: ['Low-Carb'], difficulty: 'easy' }
  },
  {
    id: 'comfort-food',
    title: 'Comfort Food',
    subtitle: 'Hearty & satisfying',
    icon: '🍲',
    data: { meal_type: 'dinner', cooking_time: 45, difficulty: 'medium' }
  },
  {
    id: 'sweet-treat',
    title: 'Sweet Treat',
    subtitle: 'Desserts & snacks',
    icon: '🍰',
    data: { meal_type: 'dessert', cooking_time: 60, difficulty: 'medium' }
  }
]

// Popular ingredients with autocomplete
const popularIngredients = [
  'chicken breast', 'salmon', 'ground beef', 'eggs', 'pasta', 'rice', 'potatoes',
  'tomatoes', 'onions', 'garlic', 'bell peppers', 'mushrooms', 'spinach',
  'cheese', 'olive oil', 'butter', 'flour', 'milk', 'yogurt', 'avocado'
]

// Cuisine types with flags
const cuisineTypes = [
  { value: 'Any Cuisine', label: 'Any Cuisine', flag: '🌍' },
  { value: 'Italian', label: 'Italian', flag: '🇮🇹' },
  { value: 'Mexican', label: 'Mexican', flag: '🇲🇽' },
  { value: 'Asian', label: 'Asian', flag: '🥢' },
  { value: 'Indian', label: 'Indian', flag: '🇮🇳' },
  { value: 'Mediterranean', label: 'Mediterranean', flag: '🫒' },
  { value: 'American', label: 'American', flag: '🇺🇸' },
  { value: 'French', label: 'French', flag: '🇫🇷' },
  { value: 'Thai', label: 'Thai', flag: '🇹🇭' },
  { value: 'Japanese', label: 'Japanese', flag: '🇯🇵' }
]

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🌱', description: 'Plant-based diet that may include dairy and eggs' },
  { id: 'vegan', label: 'Vegan', icon: '🌿', description: 'Plant-based diet excluding all animal products' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾', description: 'Free from wheat, barley, rye, and other gluten grains' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛', description: 'No milk, cheese, butter, or other dairy products' },
  { id: 'keto', label: 'Keto', icon: '🥑', description: 'High-fat, very low-carb diet for ketosis' },
  { id: 'paleo', label: 'Paleo', icon: '🥩', description: 'Based on foods available to paleolithic hunter-gatherers' },
  { id: 'low-carb', label: 'Low-Carb', icon: '⚖️', description: 'Reduced carbohydrate intake for weight management' },
  { id: 'nut-free', label: 'Nut-Free', icon: '🥜', description: 'Safe for those with tree nut and peanut allergies' }
]

export function RecipeGeneratorModal({ isOpen, onClose, onRecipeGenerated }: RecipeGeneratorModalProps) {
  const { user } = useAuth() // Get logged-in user data
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false)
  const [ingredientInput, setIngredientInput] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])

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
      difficulty: 'medium' as const,
      meal_type: 'dinner' as const,
      cuisine_type: 'Any Cuisine',
      dietary_restrictions: [],
    },
  })

  const watchedValues = watch()

  // Mapping function to convert user profile dietary preferences
  const mapUserDietaryPreferences = (userPreferences: string[] = []): string[] => {
    const modalDietaryOptions = dietaryOptions.map(option => option.label);
    return userPreferences.filter(pref => modalDietaryOptions.includes(pref))
  }

  // Get user's preferred cuisine in the format expected by the form
  const getUserPreferredCuisine = (userCuisines: string[] = []): string => {
    const modalCuisineOptions = cuisineTypes.map(cuisine => cuisine.value);
    const found = userCuisines.find(cuisine => 
      modalCuisineOptions.some(supportedCuisine => 
        supportedCuisine.toLowerCase() === cuisine.toLowerCase()
      )
    );
    return found || 'Any Cuisine';
  }

  // Update form and selected dietary restrictions when user preferences are loaded
  useEffect(() => {
    if (user && isOpen) {
      console.log('🍳 Auto-populating Recipe Generator Modal with user preferences:', {
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
        difficulty: 'medium' as const,
        meal_type: 'dinner' as const,
        cuisine_type: preferredCuisine,
        dietary_restrictions: mappedDietaryRestrictions,
      });
    }
  }, [user, isOpen, reset]);

  const filteredIngredients = popularIngredients.filter(ingredient => {
    // Filter based on current input and exclude already selected ingredients
    return ingredientInput.length > 0 && 
           ingredient.toLowerCase().includes(ingredientInput.toLowerCase()) &&
           !selectedIngredients.includes(ingredient)
  })

  const toggleDietaryRestriction = (restriction: string) => {
    const updated = selectedDietaryRestrictions.includes(restriction)
      ? selectedDietaryRestrictions.filter(r => r !== restriction)
      : [...selectedDietaryRestrictions, restriction]
    
    setSelectedDietaryRestrictions(updated)
    setValue('dietary_restrictions', updated)
  }

  const handlePresetSelect = (preset: typeof quickPresets[0]) => {
    setSelectedPreset(preset.id)
    
    // Apply preset values with animation
    Object.entries(preset.data).forEach(([key, value]) => {
      if (key === 'dietary_restrictions') {
        setSelectedDietaryRestrictions(value as string[])
        setValue('dietary_restrictions', value as string[])
      } else {
        setValue(key as keyof RecipeFormData, value as any)
      }
    })
  }

  const addIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      const updatedIngredients = [...selectedIngredients, ingredient]
      setSelectedIngredients(updatedIngredients)
      setValue('ingredients', updatedIngredients.join(', '))
    }
    setIngredientInput('')
    setShowIngredientSuggestions(false)
  }

  const removeIngredient = (ingredient: string) => {
    const updatedIngredients = selectedIngredients.filter(item => item !== ingredient)
    setSelectedIngredients(updatedIngredients)
    setValue('ingredients', updatedIngredients.join(', '))
  }

  const onSubmit = async (data: RecipeFormData) => {
    setIsGenerating(true)
    setError(null)

    try {
      const request: RecipeRequest = {
        ingredients: selectedIngredients.length > 0 ? selectedIngredients : data.ingredients ? data.ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0) : undefined,
        dietary_restrictions: data.dietary_restrictions?.length ? data.dietary_restrictions : undefined,
        cuisine_type: data.cuisine_type && data.cuisine_type !== 'Any Cuisine' ? data.cuisine_type : undefined,
        cooking_time: data.cooking_time,
        servings: data.servings,
        difficulty: data.difficulty,
        meal_type: data.meal_type,
        description: data.description?.trim() || undefined,
        include_images: data.include_images || false,
        generate_ingredient_images: data.generate_ingredient_images || false,
      }

      console.log('🎨 Generating recipe with image options:', {
        include_images: request.include_images,
        generate_ingredient_images: request.generate_ingredient_images
      })

      const response = await generateRecipe(request)
      if (response.success && response.recipe) {
        console.log('✅ Recipe generated with images:', {
          has_image: !!response.recipe.image_url,
          has_ingredient_images: !!response.recipe.ingredient_images && Object.keys(response.recipe.ingredient_images).length > 0
        })
        onRecipeGenerated(response.recipe)
        reset()
        setSelectedDietaryRestrictions([])
        setSelectedPreset(null)
        setIngredientInput('')
        setSelectedIngredients([])
        setShowIngredientSuggestions(false)
        onClose()
      } else {
        throw new Error(response.error || 'Failed to generate recipe')
      }
    } catch (err: any) {
      console.error('Recipe generation error:', err)
      setError(err?.message || 'Failed to generate recipe. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

      const handleClose = () => {
      if (!isGenerating) {
        reset()
        setSelectedDietaryRestrictions([])
        setSelectedPreset(null)
        setIngredientInput('')
        setSelectedIngredients([])
        setShowIngredientSuggestions(false)
        setError(null)
        onClose()
      }
    }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.12)] border border-white/20 w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Clean Header - Fixed */}
          <div className="flex-shrink-0 bg-white border-b border-gray-100 rounded-t-3xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChefHat className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">AI Recipe Generator</h2>
                    <p className="text-gray-500 text-sm mt-1">Follow the steps below to create your perfect recipe</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1: Quick Presets */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider">Quick Start (Optional)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {quickPresets.map((preset, index) => (
                      <motion.button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`group relative p-6 rounded-2xl border-0 text-left transition-all duration-300 ${
                          selectedPreset === preset.id
                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 ring-2 ring-emerald-400 shadow-lg'
                            : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                            selectedPreset === preset.id 
                              ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg' 
                              : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            {preset.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{preset.title}</div>
                            <div className="text-sm text-gray-500 leading-relaxed">{preset.subtitle}</div>
                          </div>
                        </div>
                        {selectedPreset === preset.id && (
                          <motion.div 
                            className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.3 }}
                          >
                            <span className="text-white text-xs">✓</span>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

                            {/* Step 2: Smart Ingredients Input */}
              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider">Ingredients (Optional)</h3>
                  </div>
                  <motion.div 
                    className="relative p-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300"
                    whileHover={{ y: -2 }}
                  >
                    <div className="absolute top-6 left-6 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Search className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="w-full pl-16 pr-4 py-2">
                      {/* Selected Ingredients Tags */}
                      {selectedIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedIngredients.map((ingredient, index) => (
                            <motion.div
                              key={ingredient}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg px-3 py-1 flex items-center space-x-2 group"
                            >
                              <span className="text-sm font-medium text-emerald-700">{ingredient}</span>
                              <motion.button
                                type="button"
                                onClick={() => removeIngredient(ingredient)}
                                className="w-4 h-4 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="w-2.5 h-2.5 text-emerald-600" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      <input
                        type="text"
                        value={ingredientInput}
                        onChange={(e) => {
                          setIngredientInput(e.target.value)
                          setShowIngredientSuggestions(e.target.value.length > 0)
                        }}
                        onFocus={() => {
                          setShowIngredientSuggestions(ingredientInput.length > 0)
                        }}
                        onBlur={() => {
                          // Delay hiding suggestions to allow clicking on them
                          setTimeout(() => setShowIngredientSuggestions(false), 150)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && ingredientInput.trim()) {
                            e.preventDefault()
                            addIngredient(ingredientInput.trim())
                          }
                        }}
                        placeholder={selectedIngredients.length > 0 ? "Add more ingredients..." : "What ingredients do you have? (e.g., chicken, tomatoes, pasta)"}
                        className="w-full bg-transparent border-0 focus:outline-none placeholder-gray-500 text-gray-900 font-medium"
                      />
                    </div>
                  
                  {/* Autocomplete Suggestions */}
                  <AnimatePresence>
                    {showIngredientSuggestions && filteredIngredients.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto"
                      >
                        {filteredIngredients.slice(0, 6).map((ingredient, index) => (
                          <motion.button
                            key={ingredient}
                            type="button"
                            onClick={() => addIngredient(ingredient)}
                            className="w-full p-3 text-left hover:bg-emerald-50 transition-colors flex items-center space-x-2 first:rounded-t-2xl last:rounded-b-2xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <span className="text-emerald-500">+</span>
                            <span className="capitalize">{ingredient}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Step 3: Recipe Settings */}
              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider">Recipe Settings</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Servings */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Servings</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[2, 4, 6, 8].map((num, index) => (
                          <motion.button
                            key={num}
                            type="button"
                            onClick={() => setValue('servings', num)}
                            className={`group relative p-4 rounded-2xl border-0 text-sm font-medium transition-all duration-300 ${
                              watchedValues.servings === num
                                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 ring-2 ring-emerald-400 shadow-lg'
                                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1 transition-all ${
                              watchedValues.servings === num 
                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg' 
                                : 'bg-gray-100 group-hover:bg-gray-200 text-gray-600'
                            }`}>
                              {num}
                            </div>
                            <div className="text-xs text-gray-500">people</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Cook Time */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Cook Time</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[15, 30, 45, 60].map((time, index) => (
                          <motion.button
                            key={time}
                            type="button"
                            onClick={() => setValue('cooking_time', time)}
                            className={`group relative p-4 rounded-2xl border-0 text-sm font-medium transition-all duration-300 ${
                              watchedValues.cooking_time === time
                                ? 'bg-gradient-to-br from-blue-50 to-cyan-50 ring-2 ring-blue-400 shadow-lg'
                                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1 transition-all ${
                              watchedValues.cooking_time === time 
                                ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg' 
                                : 'bg-gray-100 group-hover:bg-gray-200 text-gray-600'
                            }`}>
                              {time}
                            </div>
                            <div className="text-xs text-gray-500">min</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Difficulty</label>
                      <div className="space-y-2">
                        {[
                          { value: 'easy', label: 'Easy', color: 'from-green-400 to-emerald-500', bgColor: 'from-green-50 to-emerald-50', ringColor: 'ring-green-400', emoji: '😊' },
                          { value: 'medium', label: 'Medium', color: 'from-yellow-400 to-orange-500', bgColor: 'from-yellow-50 to-orange-50', ringColor: 'ring-yellow-400', emoji: '🤔' },
                          { value: 'hard', label: 'Expert', color: 'from-red-400 to-pink-500', bgColor: 'from-red-50 to-pink-50', ringColor: 'ring-red-400', emoji: '🔥' }
                        ].map((difficulty, index) => (
                          <motion.button
                            key={difficulty.value}
                            type="button"
                            onClick={() => setValue('difficulty', difficulty.value as any)}
                            className={`group relative w-full p-4 rounded-2xl border-0 text-sm font-medium transition-all duration-300 ${
                              watchedValues.difficulty === difficulty.value
                                ? `bg-gradient-to-br ${difficulty.bgColor} ring-2 ${difficulty.ringColor} shadow-lg`
                                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                watchedValues.difficulty === difficulty.value 
                                  ? `bg-gradient-to-br ${difficulty.color} shadow-lg` 
                                  : 'bg-gray-100 group-hover:bg-gray-200'
                              }`}>
                                <span className={watchedValues.difficulty === difficulty.value ? 'text-white' : 'text-gray-600'}>
                                  {difficulty.emoji}
                                </span>
                              </div>
                              <span className="flex-1 text-left text-gray-700">{difficulty.label}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Cuisine & Dietary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cuisine Selection */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider flex items-center">
                        Cuisine Style
                        {user && watchedValues.cuisine_type && watchedValues.cuisine_type !== 'Any Cuisine' && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            Auto-filled from profile
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {cuisineTypes.map((cuisine, index) => (
                        <motion.button
                          key={cuisine.value}
                          type="button"
                          onClick={() => setValue('cuisine_type', cuisine.value)}
                          className={`group relative p-6 rounded-2xl border-0 text-left transition-all duration-300 ${
                            watchedValues.cuisine_type === cuisine.value
                              ? 'bg-gradient-to-br from-orange-50 to-red-50 ring-2 ring-orange-400 shadow-lg'
                              : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                              watchedValues.cuisine_type === cuisine.value 
                                ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg' 
                                : 'bg-gray-100 group-hover:bg-gray-200'
                            }`}>
                              {cuisine.flag}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 mb-1">{cuisine.label}</div>
                              <div className="text-sm text-gray-500 leading-relaxed">Authentic flavors</div>
                            </div>
                          </div>
                          {watchedValues.cuisine_type === cuisine.value && (
                            <motion.div 
                              className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", duration: 0.3 }}
                            >
                              <span className="text-white text-xs">✓</span>
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                              {/* Dietary Preferences */}
              <div className="space-y-6 mb-12">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                      <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider flex items-center">
                        Dietary Preferences (Optional)
                        {user && selectedDietaryRestrictions.length > 0 && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            Auto-filled from profile
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {dietaryOptions.map((option, index) => {
                        const isSelected = selectedDietaryRestrictions.includes(option.label)
                        return (
                          <motion.button
                            key={option.id}
                            type="button"
                            onClick={() => toggleDietaryRestriction(option.label)}
                            className={`group relative p-6 rounded-2xl border-0 text-left transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 ring-2 ring-green-400 shadow-lg'
                                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                                isSelected 
                                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg' 
                                  : 'bg-gray-100 group-hover:bg-gray-200'
                              }`}>
                                {option.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                                <div className="text-sm text-gray-500 leading-relaxed">{option.description}</div>
                              </div>
                            </div>
                            {isSelected && (
                              <motion.div 
                                className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.3 }}
                              >
                                <span className="text-white text-xs">✓</span>
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6: AI Image Generation Options */}
              <div className="space-y-6 mb-12">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                    <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider">
                      ✨ AI Image Generation (Optional)
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Recipe Image Option */}
                    <motion.div
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-2xl"
                      whileHover={{ scale: 1.02 }}
                    >
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('include_images')}
                          className="w-4 h-4 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-purple-800">Generate Recipe Image</span>
                            <p className="text-xs text-purple-600">Create an AI-generated photo of your finished dish</p>
                          </div>
                        </div>
                      </label>
                    </motion.div>

                    {/* Ingredient Images Option */}
                    <motion.div
                      className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 rounded-2xl"
                      whileHover={{ scale: 1.02 }}
                    >
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('generate_ingredient_images')}
                          className="w-4 h-4 text-orange-600 bg-white border-orange-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-orange-800">Generate Ingredient Images</span>
                            <p className="text-xs text-orange-600">Create photos of key ingredients (first 5 items)</p>
                          </div>
                        </div>
                      </label>
                    </motion.div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs text-blue-800 font-medium">Note:</p>
                          <p className="text-xs text-blue-700">
                            Image generation adds ~30 seconds to recipe creation and uses advanced AI models.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            </div>
          </div>

          {/* Fixed Action Footer */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-gradient-to-t from-slate-50 to-white rounded-b-3xl">
            <div className="p-6">
              <div className="flex gap-4">
                <motion.button
                  type="button"
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl py-3 px-8 font-medium transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating your recipe...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Generate Recipe</span>
                      <span className="text-lg">✨</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 