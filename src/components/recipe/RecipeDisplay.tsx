import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Clock, 
  Users, 
  ChefHat, 
  Utensils,
  Star,
  Bookmark,
  BookmarkCheck,
  Heart,
  Timer,
  MessageCircle,
  Share2,
  AlertCircle,
  ThumbsUp,
  Sparkles,
  Printer,
  Download,
  CheckCircle,
  Loader2,
  Calendar,
  Target,
  Circle,
  Zap,
  Flame,
  Mail,
  Copy,
  Smartphone
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, NutritionInfoTooltip, MacroTooltip } from '@/components/ui/Tooltip'
import { useSavedRecipes } from '@/contexts/SavedRecipesContext'
import ImageWithFallback from '@/components/ImageWithFallback'
import { Recipe } from '@/lib/api'
import toast from 'react-hot-toast'

interface RecipeDisplayProps {
  recipe: Recipe
  className?: string
  onClose?: () => void
}

export function RecipeDisplay({ recipe, className, onClose }: RecipeDisplayProps) {
  const { saveRecipe, removeRecipe, isRecipeSaved, getSavedRecipe, refreshRecipes } = useSavedRecipes()
  const isSaved = isRecipeSaved(recipe.title)
  
  // Cuisine flag mapping function (same as cards)
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
  console.log('🔍 Recipe Display:', { 
    title: recipe.title, 
    isSaved,
    hasNutrition: !!recipe.nutrition,
    hasTips: !!(recipe as any).chef_tips,
    hasWinePairing: !!(recipe as any).wine_pairing,
    cuisineType: recipe.cuisine_type
  });
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('ingredients')
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showShareMenu, setShowShareMenu] = useState(false)

  const toggleStepCompletion = (stepIndex: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex)
      } else {
        newSet.add(stepIndex)
      }
      return newSet
    })
  }

  // Handle different field naming conventions from backend vs frontend with proper validation
  const prepTime = Number((recipe as any).prep_time_minutes || (recipe as any).prep_time) || 0
  const cookTime = Number((recipe as any).cook_time_minutes || (recipe as any).cook_time) || 0
  const totalTime = prepTime + cookTime
  const servings = Number((recipe as any).servings) || 4
  const difficulty = (recipe as any).difficulty_level || (recipe as any).difficulty || 'medium'

  const handleSaveRecipe = async () => {
    console.log('🔄 handleSaveRecipe called. isSaved:', isSaved, 'isSaving:', isSaving);
    if (isSaving) {
      console.log('⚠️ Save already in progress, skipping...');
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isSaved) {
        console.log('📝 Taking REMOVE path (recipe is currently saved)');
        // Find the saved recipe by title and remove it using the backend ID
        const savedRecipe = getSavedRecipe(recipe.title)
        if (savedRecipe && savedRecipe.id) {
          console.log('🗑️ Attempting to remove saved recipe:', savedRecipe.id);
          
          // Show removing toast
          const removingToast = toast.loading('🗑️ Removing from your collection...', {
            duration: Infinity,
            position: 'top-center'
          });
          
          const success = await removeRecipe(savedRecipe.id.toString())
          
          // Dismiss loading toast
          toast.dismiss(removingToast);
          
          if (success) {
            console.log('✅ Recipe removed successfully');
            toast.success('Recipe removed from saved!', {
              duration: 3000,
              position: 'top-center'
            });
            
            // Close modal after removal
            if (onClose) {
              console.log('🔄 Scheduling modal close after remove in 1 second...');
              setTimeout(() => {
                console.log('🚪 Closing modal after remove now...');
                onClose();
              }, 1000);
            } else {
              console.warn('⚠️ No onClose function provided to RecipeDisplay for remove');
            }
          } else {
            toast.error('Failed to remove recipe', {
              duration: 3000,
              position: 'top-center'
            });
          }
        } else {
          console.warn('⚠️ Recipe marked as saved but no saved recipe found, refreshing...');
          await refreshRecipes();
          toast.error('Recipe not found in saved list.', {
            duration: 3000,
            position: 'top-center'
          });
        }
      } else {
        console.log('📝 Taking SAVE path (recipe is not currently saved)');
        console.log('💾 Attempting to save recipe:', recipe.title);
        
        // Show saving toast
        const savingToast = toast.loading('💾 Adding to your recipe collection...', {
          duration: Infinity,
          position: 'top-center'
        });
        
        const success = await saveRecipe(recipe)
        
        // Dismiss loading toast
        toast.dismiss(savingToast);
        
        if (success) {
          console.log('✅ Recipe saved successfully');
          
          // Show success message
          toast.success('🎉 Recipe saved to your collection!', {
            icon: '✨',
            duration: 2000,
            position: 'top-center',
            style: {
              background: '#10b981',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              borderRadius: '12px',
              padding: '16px 24px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
            }
          });
          
          // Close modal immediately after success - no complex delays
          if (onClose) {
            console.log('🔄 Scheduling modal close in 1 second...');
            setTimeout(() => {
              console.log('🚪 Closing modal now...');
              onClose();
            }, 1000); // Simple 1 second delay for user to see success
          } else {
            console.warn('⚠️ No onClose function provided to RecipeDisplay');
          }
        } else {
          toast.error('Failed to save recipe', {
            duration: 3000,
            position: 'top-center'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error in handleSaveRecipe:', error);
      toast.error('Something went wrong. Please try again.', {
        duration: 3000,
        position: 'top-center'
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleShareRecipe = () => {
    setShowShareMenu(!showShareMenu)
  }

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareMenu && !(event.target as Element).closest('.share-menu-container')) {
        setShowShareMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareMenu])



  const generateShareContent = () => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/recipes/${recipe.id}`
    
    const shareText = `🍽️ ${recipe.title}

${recipe.description || 'Delicious AI-generated recipe'}

⏱️ ${prepTime || 0} min prep + ${cookTime || 0} min cook = ${(prepTime || 0) + (cookTime || 0)} min total
👥 Serves ${servings} people  
📊 ${difficulty} difficulty
${getCuisineFlag(recipe.cuisine_type || 'International')} ${recipe.cuisine_type || 'International'} cuisine

✨ Generated by ChefoodAI™ - Your AI-Powered Cooking Companion

🔗 Get the full recipe: ${shareUrl}

💫 Join ChefoodAI™ for FREE to unlock:
• Thousands of AI-generated recipes
• Personalized meal plans
• Smart nutrition tracking  
• Cooking tips & techniques

Sign up free at ChefoodAI.com! 🚀`

    return { shareText, shareUrl }
  }

  const shareViaEmail = () => {
    const { shareText } = generateShareContent()
    const subject = `🍽️ Try this recipe: ${recipe.title}`
    const body = encodeURIComponent(shareText)
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`
    window.open(emailUrl)
    setShowShareMenu(false)
  }

  const shareViaSMS = () => {
    const { shareText } = generateShareContent()
    const smsUrl = `sms:?body=${encodeURIComponent(shareText)}`
    window.open(smsUrl)
    setShowShareMenu(false)
  }

  const copyToClipboard = async () => {
    const { shareText } = generateShareContent()
    try {
      await navigator.clipboard.writeText(shareText)
      console.log('Recipe card copied to clipboard!')
      setShowShareMenu(false)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Defensive check for recipe data
  if (!recipe || !recipe.title) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Recipe data not available</p>
      </div>
    )
  }

  // Ensure ingredients and instructions are arrays
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card className="overflow-hidden">
        {/* Recipe Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-chef-500 to-chef-600 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <ChefHat className="h-5 w-5 flex-shrink-0" />
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {recipe.ai_generated ? 'Generated' : 'Recipe'}
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 pr-4">{recipe.title}</h2>
              <p className="text-chef-100 text-sm leading-relaxed mb-3">{recipe.description}</p>
              
              {/* Tags integrated into header */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => {
                    // Clean up tag display - remove # prefix and capitalize properly
                    const cleanTag = tag.replace(/^#/, '').trim();
                    const displayTag = cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1).toLowerCase();
                    
                    return (
                      <span
                        key={index}
                        className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-white/30 font-medium"
                      >
                        {displayTag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="flex justify-center sm:justify-end">
              <div className="flex space-x-2 relative share-menu-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShareRecipe}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                </motion.button>

              {/* Share Menu */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50"
                  >
                    <div className="p-5">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Recipe
                      </h3>
                      
                      <div className="space-y-2">
                        <button
                          onClick={shareViaEmail}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 text-left group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">Email</div>
                            <div className="text-xs text-gray-600">Send beautiful recipe card</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={shareViaSMS}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 text-left group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Smartphone className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">Text Message</div>
                            <div className="text-xs text-gray-600">Send via SMS</div>
                          </div>
                        </button>

                        <button
                          onClick={copyToClipboard}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 text-left group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Copy className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">Copy Text</div>
                            <div className="text-xs text-gray-600">Copy to clipboard</div>
                          </div>
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200/50">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Powered by</div>
                          <div className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            ChefoodAI™
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Recipe Meta */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">
                {totalTime} min total
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{servings} servings</span>
            </div>
            <div className="flex items-center space-x-1">
              {(() => {
                const difficultyLevel = difficulty.toLowerCase();
                if (difficultyLevel === 'easy' || difficultyLevel === 'beginner') {
                  return <Target className="h-4 w-4" />; // Single target
                } else if (difficultyLevel === 'medium' || difficultyLevel === 'intermediate') {
                  return (
                    <div className="flex items-center space-x-0.5">
                      <Target className="h-3.5 w-3.5" />
                      <Target className="h-3.5 w-3.5" />
                    </div>
                  ); // Two targets side by side
                } else if (difficultyLevel === 'hard' || difficultyLevel === 'advanced' || difficultyLevel === 'expert') {
                  return (
                    <div className="flex items-center space-x-0.5">
                      <Target className="h-3 w-3" />
                      <Target className="h-3 w-3" />
                      <Target className="h-3 w-3" />
                    </div>
                  ); // Three targets side by side
                } else {
                  return <Target className="h-4 w-4" />; // Fallback single target
                }
              })()}
              <span className="text-sm capitalize">{difficulty}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm">{getCuisineFlag(recipe.cuisine_type || 'International')}</span>
              <span className="text-sm capitalize">{recipe.cuisine_type || 'International'}</span>
            </div>
            {(recipe as any).meal_type && (
              <div className="flex items-center space-x-1">
                <span className="text-sm">🍴</span>
                <span className="text-sm capitalize">{(recipe as any).meal_type}</span>
              </div>
            )}
            {recipe.fallback_used && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-orange-400">Simplified Generation</span>
              </div>
            )}
          </div>
        </div>



        {/* AI Generated Recipe Image */}
        {recipe.image_url && (
          <div className="relative h-64">
            <ImageWithFallback 
              src={recipe.image_url} 
              alt={recipe.title}
              title={recipe.title}
              className="w-full h-64 object-cover"
              fallbackText="Recipe Image"
            />

          </div>
        )}

        <div className="p-6">
          {/* Prep, Cook, and Total Time Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl hover:bg-white/80 transition-all duration-300 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{prepTime}</div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Prep Time</div>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl hover:bg-white/80 transition-all duration-300 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{cookTime}</div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Cook Time</div>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl hover:bg-white/80 transition-all duration-300 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{(prepTime || 0) + (cookTime || 0)}</div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Time</div>
            </div>
          </div>

          {/* Tabbed Recipe Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            {/* Simple Tab Navigation */}
            <div className="mb-8">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'ingredients', label: 'Ingredients' },
                  { id: 'instructions', label: 'Instructions' },
                  { id: 'nutrition', label: 'Nutrition' },
                  { id: 'highlights', label: 'Benefits' },
                  { id: 'wine', label: 'Wine' },
                  { id: 'tips', label: 'Tips' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {/* Ingredients Tab */}
              {activeTab === 'ingredients' && (
                <motion.div
                  key="ingredients"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {ingredients.map((ingredient: any, index: number) => {
                    // Clean up ingredient text completely
                    let cleanText = '';
                    if (typeof ingredient === 'string') {
                      cleanText = ingredient;
                      
                      // Handle parenthetical duplicates more aggressively
                      const parenMatch = cleanText.match(/^(.*?)\s*\((.*)\)$/);
                      if (parenMatch) {
                        const [, before, inside] = parenMatch;
                        // Always prefer the version with proper cooking units
                        if (inside.match(/\d+(\.\d+)?\s*(lbs?|oz|cups?|tbsp|tsp|pint|quart|gallon)/)) {
                          cleanText = inside;
                        } else {
                          cleanText = before;
                        }
                      }
                      
                      // Convert decimals to fractions and clean up formatting
                      cleanText = cleanText
                        .replace(/^\d+\.\d+\s*pc\s+/i, '') // Remove "1.500 pc "
                        .replace(/^\d+\.000\s+/g, match => `${parseInt(match)} `) // "4.000 " → "4 "
                        .replace(/^0\.100\s*g\s+/i, 'Pinch of ') // "0.100 g" → "Pinch of"
                        
                        // Clean up weird trailing zeros first
                        .replace(/(\d+)\.000\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 $2') // "1.000 tsp" → "1 tsp"
                        .replace(/(\d+)\.200\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 1/5 $2') // "1.200 tsp" → "1 1/5 tsp"
                        .replace(/(\d+)\.400\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 2/5 $2') // "1.400 tsp" → "1 2/5 tsp"
                        .replace(/(\d+)\.600\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 3/5 $2') // "1.600 tsp" → "1 3/5 tsp"
                        .replace(/(\d+)\.800\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 4/5 $2') // "1.800 tsp" → "1 4/5 tsp"
                        
                        // Standard fractions
                        .replace(/(\d+)\.5\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 1/2 $2') // "1.5 lbs" → "1 1/2 lbs"
                        .replace(/(\d+)\.25\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 1/4 $2') // "2.25 cups" → "2 1/4 cups"
                        .replace(/(\d+)\.75\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 3/4 $2') // "1.75 lbs" → "1 3/4 lbs"
                        .replace(/(\d+)\.33\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 1/3 $2') // "2.33 cups" → "2 1/3 cups"
                        .replace(/(\d+)\.67\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '$1 2/3 $2') // "1.67 cups" → "1 2/3 cups"
                        
                        // Starting with zero
                        .replace(/0\.5\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '1/2 $1') // "0.5 cups" → "1/2 cups"
                        .replace(/0\.25\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '1/4 $1') // "0.25 cups" → "1/4 cups"
                        .replace(/0\.75\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '3/4 $1') // "0.75 cups" → "3/4 cups"
                        .replace(/0\.33\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '1/3 $1') // "0.33 cups" → "1/3 cups"
                        .replace(/0\.67\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '2/3 $1') // "0.67 cups" → "2/3 cups"
                        .replace(/0\.200\s+(lbs?|oz|cups?|tbsp|tsp)/gi, '1/5 $1') // "0.200 tsp" → "1/5 tsp"
                        
                        // Clean up any remaining weird decimals by rounding
                        .replace(/(\d+)\.(\d+)\s+(lbs?|oz|cups?|tbsp|tsp)/gi, (match, whole, decimal, unit) => {
                          const wholeNum = parseInt(whole);
                          const decimalNum = parseInt(decimal);
                          if (decimalNum > 50) {
                            return `${wholeNum + 1} ${unit}`;
                          } else {
                            return `${wholeNum} ${unit}`;
                          }
                        })
                        .trim();

                      // Comprehensive ingredient refinement
                      cleanText = cleanText
                        // Standardize units (case and abbreviations)
                        .replace(/\bteaspoons?\b/gi, 'tsp')
                        .replace(/\btablespoons?\b/gi, 'tbsp')
                        .replace(/\bpounds?\b/gi, 'lbs')
                        .replace(/\bounces?\b/gi, 'oz')
                        .replace(/\bcups?\b/gi, 'cup')
                        .replace(/\bpints?\b/gi, 'pint')
                        .replace(/\bquarts?\b/gi, 'quart')
                        .replace(/\bgallons?\b/gi, 'gallon')
                        .replace(/\bfluid ounces?\b/gi, 'fl oz')
                        .replace(/\bkilograms?\b/gi, 'kg')
                        .replace(/\bgrams?\b/gi, 'g')
                        .replace(/\bmilliliters?\b/gi, 'ml')
                        .replace(/\bliters?\b/gi, 'L')
                        
                        // Fix quantity formatting
                        .replace(/\b(\d+)\s*-\s*(\d+)\b/g, '$1 to $2') // "2-3" → "2 to 3"
                        .replace(/\b(\d+)\/(\d+)\s*-\s*(\d+)\/(\d+)\b/g, '$1/$2 to $3/$4') // "1/2-3/4" → "1/2 to 3/4"
                        
                        // Standardize ingredient names (proper case)
                        .replace(/\bolive oil\b/gi, 'olive oil')
                        .replace(/\bextra virgin\b/gi, 'extra virgin')
                        .replace(/\bsalt and pepper\b/gi, 'salt and pepper')
                        .replace(/\bblack pepper\b/gi, 'black pepper')
                        .replace(/\bgarlic cloves?\b/gi, 'garlic clove')
                        .replace(/\bonions?\b/gi, 'onion')
                        .replace(/\btomatoes?\b/gi, 'tomato')
                        .replace(/\bchicken breast\b/gi, 'chicken breast')
                        .replace(/\bchicken stock\b/gi, 'chicken stock')
                        .replace(/\bvegetable stock\b/gi, 'vegetable stock')
                        .replace(/\bbeef stock\b/gi, 'beef stock')
                        
                        // Fix missing quantities with smart defaults
                        .replace(/^can black beans/i, '1 can black beans')
                        .replace(/^bell pepper/i, '1 bell pepper')
                        .replace(/^onion,/i, '1 onion,')
                        .replace(/^lime juice/i, '2 tbsp lime juice')
                        .replace(/^lemon juice/i, '2 tbsp lemon juice')
                        .replace(/^ripe$/i, '2 ripe tomatoes')
                        .replace(/^ripe,/i, '2 ripe tomatoes,')
                        .replace(/^ripe avocado/i, '1 ripe avocado')
                        .replace(/^garlic clove/i, '1 garlic clove')
                        .replace(/^medium/i, '1 medium')
                        .replace(/^large/i, '1 large')
                        .replace(/^small/i, '1 small')
                        
                        // Add missing preparation notes
                        .replace(/(\d+\s+(?:can\s+)?black beans)(?!\s*,)/i, '$1, rinsed and drained')
                        .replace(/(\d+\s+bell pepper)(?!\s*,)/i, '$1, diced')
                        .replace(/(\d+\s+onion)(?!\s*,)/i, '$1, diced')
                        .replace(/(\d+\s+garlic clove)(?!\s*,)/i, '$1, minced')
                        .replace(/(\d+\s+(?:ripe\s+)?tomato)(?!\s*,)/i, '$1, diced')
                        
                        // Fix capitalization - capitalize first letter, keep rest lowercase except proper nouns
                        .replace(/^([a-z])/g, (match) => match.toUpperCase())
                        .replace(/\b(parmesan|cheddar|swiss|gouda|feta|mozzarella)\b/gi, (match) => 
                          match.charAt(0).toUpperCase() + match.slice(1).toLowerCase())
                        .replace(/\b(italian|french|spanish|greek|mexican|thai|indian|chinese)\b/gi, (match) => 
                          match.charAt(0).toUpperCase() + match.slice(1).toLowerCase())
                        
                        // Standardize spacing and punctuation
                        .replace(/\s*,\s*/g, ', ') // Fix comma spacing
                        .replace(/\s+/g, ' ') // Fix multiple spaces
                        .replace(/^(\d+(?:\s+\d+\/\d+)?)\s+/g, '$1 ') // Fix spacing after numbers
                        .trim();

                      // Fix parentheses issues properly
                      // Count opening and closing parentheses
                      const openCount = (cleanText.match(/\(/g) || []).length;
                      const closeCount = (cleanText.match(/\)/g) || []).length;
                      
                      // Fix common patterns
                      cleanText = cleanText
                        .replace(/\s*\)\s*\(/g, ' (') // Fix ")(" → " ("
                        .replace(/^\s*\)\s*/, '') // Remove leading ")"
                        .replace(/\s*\(\s*$/, '') // Remove trailing "("
                        .replace(/\(\s*\)/g, '') // Remove empty "()"
                        .trim();

                      // Balance parentheses if needed
                      if (openCount > closeCount) {
                        // Add missing closing parentheses
                        cleanText += ')'.repeat(openCount - closeCount);
                      } else if (closeCount > openCount) {
                        // Remove extra closing parentheses from the end
                        for (let i = 0; i < (closeCount - openCount); i++) {
                          cleanText = cleanText.replace(/\)\s*$/, '');
                        }
                      }
                    } else {
                      cleanText = ingredient.preparation_notes 
                        ? ingredient.preparation_notes
                        : `${ingredient.quantity || ''} ${ingredient.name}`.trim();
                    }

                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-800 font-medium">
                          {cleanText}
                        </p>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Instructions Tab with Checkboxes */}
              {activeTab === 'instructions' && (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Progress Header */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Cooking Progress</h4>
                          <p className="text-xs text-blue-700">
                            {completedSteps.size} of {instructions.length} steps completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${(completedSteps.size / instructions.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-blue-700">
                          {Math.round((completedSteps.size / instructions.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {instructions.map((instruction: any, index: number) => {
                      const isCompleted = completedSteps.has(index);
                      return (
                        <div
                          key={index}
                          className={`group relative bg-white/60 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
                            isCompleted 
                              ? 'border-green-300/60 bg-green-50/30' 
                              : 'border-gray-200/50 hover:bg-white/90 hover:border-gray-300/60'
                          }`}
                          onClick={() => toggleStepCompletion(index)}
                        >
                          <div className="flex space-x-4">
                            <div className="flex-shrink-0 mt-1">
                              <div className="relative">
                                {/* Checkbox */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-green-600 text-white scale-110' 
                                    : 'bg-blue-600 text-white group-hover:bg-blue-700'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                {isCompleted && (
                                  <div className="absolute -inset-1 bg-green-400/20 rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div 
                                className={`text-sm leading-relaxed font-medium transition-all duration-300 ${
                                  isCompleted 
                                    ? 'text-green-800 line-through opacity-75' 
                                    : 'text-gray-800'
                                }`}
                                dangerouslySetInnerHTML={{
                                  __html: (() => {
                                    const text = typeof instruction === 'string' 
                                      ? instruction 
                                      : instruction.instruction || instruction;
                                    
                                    return text
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                      .replace(/`(.*?)`/g, '<code class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
                                  })()
                                }}
                              />
                              {typeof instruction === 'object' && instruction.time_minutes && (
                                <div className={`mt-2 flex items-center space-x-1 text-xs transition-colors ${
                                  isCompleted ? 'text-green-600' : 'text-blue-600'
                                }`}>
                                  <Timer className="h-3 w-3" />
                                  <span className="font-medium">{instruction.time_minutes} min</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-100'
                              : 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100'
                          }`}></div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Completion Message */}
                  {completedSteps.size === instructions.length && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 text-center"
                    >
                      <div className="text-4xl mb-2">🎉</div>
                      <h3 className="text-lg font-bold text-green-800 mb-1">Recipe Complete!</h3>
                      <p className="text-sm text-green-700">Great job following all the steps. Enjoy your meal!</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Nutrition Tab */}
              {activeTab === 'nutrition' && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const nutrition = recipe.nutrition || (recipe as any).nutrition_per_serving || {};
                    
                    // Define all available nutrition fields from API (based on actual API response)
                    const nutritionFields = [
                      {
                        key: 'calories',
                        label: 'Calories',
                        unit: '',
                        dailyValue: 2000,
                        description: 'Total energy from all macronutrients',
                        color: 'blue'
                      },
                      {
                        key: 'protein',
                        label: 'Protein',
                        unit: 'g',
                        dailyValue: 50,
                        description: 'Builds & repairs muscles',
                        color: 'green'
                      },
                      {
                        key: 'carbs',
                        label: 'Carbs',
                        unit: 'g',
                        dailyValue: 300,
                        description: 'Primary energy source',
                        color: 'orange'
                      },
                      {
                        key: 'fat',
                        label: 'Fat',
                        unit: 'g',
                        dailyValue: 65,
                        description: 'Essential for vitamins & hormones',
                        color: 'purple'
                      },
                      {
                        key: 'fiber',
                        label: 'Fiber',
                        unit: 'g',
                        dailyValue: 25,
                        description: 'Aids digestion & heart health',
                        color: 'emerald'
                      },
                      {
                        key: 'sugar',
                        label: 'Sugar',
                        unit: 'g',
                        dailyValue: 50,
                        description: 'Natural & added sugars',
                        color: 'pink'
                      },
                      {
                        key: 'sodium',
                        label: 'Sodium',
                        unit: 'mg',
                        dailyValue: 2300,
                        description: 'Electrolyte balance & blood pressure',
                        color: 'red'
                      },
                      {
                        key: 'cholesterol',
                        label: 'Cholesterol',
                        unit: 'mg',
                        dailyValue: 300,
                        description: 'Dietary cholesterol intake',
                        color: 'yellow'
                      }
                    ];

                    // Show all fields - some will be actual data, some will be estimates
                    const allFields = nutritionFields.map(field => {
                      const apiValue = nutrition[field.key];
                      const hasActualData = apiValue !== null && apiValue !== undefined && apiValue !== 0;
                      
                      if (hasActualData) {
                        return { ...field, value: apiValue, isActual: true };
                      } else {
                        // Provide USDA estimates for missing fields
                        const estimatedCalories = Math.round(servings * 300);
                        let estimatedValue;
                        
                        switch (field.key) {
                          case 'calories':
                            estimatedValue = estimatedCalories;
                            break;
                          case 'protein':
                            estimatedValue = Math.round(estimatedCalories * 0.15 / 4);
                            break;
                          case 'carbs':
                            estimatedValue = Math.round(estimatedCalories * 0.45 / 4);
                            break;
                          case 'fat':
                            estimatedValue = Math.round(estimatedCalories * 0.30 / 9);
                            break;
                          case 'fiber':
                            estimatedValue = Math.round(estimatedCalories * 0.02); // ~2% of calories as fiber grams
                            break;
                          case 'sugar':
                            estimatedValue = Math.round(estimatedCalories * 0.08); // ~8% of calories as sugar grams
                            break;
                          case 'sodium':
                            estimatedValue = Math.round(estimatedCalories * 0.5); // rough sodium estimate
                            break;
                          case 'cholesterol':
                            estimatedValue = Math.round(estimatedCalories * 0.1); // rough cholesterol estimate
                            break;
                          default:
                            estimatedValue = 0;
                        }
                        
                        return { ...field, value: estimatedValue, isActual: false };
                      }
                    });

                    // Filter out fields with 0 estimates
                    const displayFields = allFields.filter(field => field.value > 0);

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {displayFields.map((field) => {
                          const displayValue = typeof field.value === 'number' 
                            ? (field.value < 1 ? field.value.toFixed(1) : Math.round(field.value))
                            : field.value;
                          const dailyPercent = field.dailyValue 
                            ? Math.round((parseFloat(field.value) / field.dailyValue) * 100)
                            : null;
                          
                          return (
                            <Tooltip
                              key={field.key}
                              content={
                                <div className="space-y-1">
                                  <div className="font-semibold">{field.label}</div>
                                  <p className="text-xs">{field.description}</p>
                                  {dailyPercent && (
                                    <p className="text-xs text-gray-300">
                                      {dailyPercent}% of daily value ({field.dailyValue}{field.unit})
                                    </p>
                                  )}
                                  {!field.isActual && (
                                    <p className="text-xs italic text-yellow-300">Estimated using USDA data</p>
                                  )}
                                </div>
                              }
                            >
                              <div className={`group relative bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4 hover:bg-white/90 hover:border-gray-300/60 transition-all duration-300 cursor-help hover:shadow-lg hover:shadow-gray-200/50`}>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                  {displayValue}{field.unit}
                                </div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {field.label}
                                </div>
                                {dailyPercent && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {dailyPercent}% DV
                                  </div>
                                )}
                                {!field.isActual && (
                                  <div className="text-xs text-amber-600 mt-1 italic font-medium">
                                    USDA Est.
                                  </div>
                                )}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${field.color}-500/5 to-${field.color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                              </div>
                            </Tooltip>
                          );
                        })}
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {/* Nutrition Highlights Tab */}
              {activeTab === 'highlights' && (recipe as any).nutrition_highlights && (
                <motion.div
                  key="highlights"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {Array.isArray((recipe as any).nutrition_highlights) ? 
                    (recipe as any).nutrition_highlights.map((highlight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-sm"></div>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-800 font-medium">
                          {highlight}
                        </p>
                      </div>
                    )) :
                    (recipe as any).nutrition_highlights.split('\n').map((highlight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-sm"></div>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-800 font-medium">
                          {highlight}
                        </p>
                      </div>
                    ))
                  }
                </motion.div>
              )}

              {/* Wine Pairing Tab */}
              {activeTab === 'wine' && (
                <motion.div
                  key="wine"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {(() => {
                    const wineData = (recipe as any).wine_pairing || (recipe as any).wine_pairings;
                    
                    if (typeof wineData === 'object' && !Array.isArray(wineData)) {
                      return (
                        <div className="space-y-4">
                          {wineData.recommended && (
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-sm"></div>
                              </div>
                              <p className="text-sm leading-relaxed text-gray-800">
                                <span className="font-semibold text-purple-800">Recommended:</span> {wineData.recommended}
                              </p>
                            </div>
                          )}
                          {wineData.alternatives && (
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-sm"></div>
                              </div>
                              <p className="text-sm leading-relaxed text-gray-800">
                                <span className="font-semibold text-purple-800">Alternatives:</span> {
                                  Array.isArray(wineData.alternatives) 
                                    ? wineData.alternatives.join(', ')
                                    : wineData.alternatives
                                }
                              </p>
                            </div>
                          )}
                          {wineData.notes && (
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-sm"></div>
                              </div>
                              <p className="text-sm leading-relaxed text-gray-800">
                                <span className="font-semibold text-purple-800">Notes:</span> {wineData.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    } else if (wineData) {
                      // Handle string wine pairing - only split on clear delimiters
                      const winePairings = wineData.split(/\n\n+|\n\d+\.\s+/).filter((item: string) => item.trim().length > 20);
                      if (winePairings.length > 1) {
                        return (
                          <div className="space-y-4">
                            {winePairings.map((pairing: string, index: number) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-sm"></div>
                                </div>
                                <p className="text-sm leading-relaxed text-gray-800 font-medium">
                                  {pairing.trim().replace(/^\d+\.\s*/, '')}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        // Don't split - show as single paragraph with bullet
                        return (
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-sm"></div>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-800 font-medium">{wineData}</p>
                          </div>
                        );
                      }
                    } else {
                      return (
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-gray-300 rounded-full shadow-sm"></div>
                          </div>
                          <p className="text-sm leading-relaxed text-gray-600 italic">No specific wine pairing available for this recipe.</p>
                        </div>
                      );
                    }
                  })()}
                </motion.div>
              )}

              {/* Chef Tips Tab */}
              {activeTab === 'tips' && (
                <motion.div
                  key="tips"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {(() => {
                    const tips = (recipe as any).chef_tips || (recipe as any).tips || (recipe as any).cooking_tips;
                    
                    const fallbackTips = [
                      "Taste and adjust seasoning throughout the cooking process",
                      "Let proteins rest for a few minutes after cooking for better texture",
                      "Use fresh herbs at the end of cooking for maximum flavor",
                      "Preheat your pan or oven to ensure even cooking"
                    ];
                    
                    if (Array.isArray(tips)) {
                      return tips.map((tip: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
                          </div>
                          <p className="text-sm leading-relaxed text-gray-800 font-medium">
                            {tip}
                          </p>
                        </div>
                      ));
                    } else if (tips) {
                      // Handle string tips - split by periods, newlines, or numbered lists
                      const tipsList = tips.split(/[.\n]|(?:\d+\.)/g).filter((item: string) => item.trim().length > 10);
                      if (tipsList.length > 1) {
                        return tipsList.map((tip: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-800 font-medium">
                              {tip.trim()}
                            </p>
                          </div>
                        ));
                      } else {
                        return (
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-800 font-medium">
                              {tips}
                            </p>
                          </div>
                        );
                      }
                    } else {
                      return fallbackTips.slice(0, 2).map((tip: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
                          </div>
                          <p className="text-sm leading-relaxed text-gray-800 font-medium">
                            {tip} <span className="text-gray-500 text-xs italic">(General tip)</span>
                          </p>
                        </div>
                      ));
                    }
                  })()}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Remove old sections - Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-blue-600" />
              Instructions
            </h3>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/60 rounded-2xl p-5 shadow-sm">
              <div className="space-y-4">
                {instructions.map((instruction: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex space-x-4 group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div 
                        className="text-sm leading-relaxed text-gray-800 font-medium"
                        dangerouslySetInnerHTML={{
                          __html: (() => {
                            const text = typeof instruction === 'string' 
                              ? instruction 
                              : instruction.instruction || instruction;
                            
                            // Convert basic markdown to HTML
                            return text
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                              .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
                              .replace(/`(.*?)`/g, '<code class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>'); // Code
                          })()
                        }}
                      />
                      {/* Step timing if available */}
                      {typeof instruction === 'object' && instruction.time_minutes && (
                        <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
                          <Timer className="h-3 w-3" />
                          <span className="font-medium">{instruction.time_minutes} min</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Subtle instructions badge */}
              <div className="mt-4 pt-3 border-t border-blue-200/50">
                <div className="flex items-center justify-center">
                  <span className="text-xs text-blue-700/80 font-medium bg-blue-100/50 px-3 py-1.5 rounded-full">
                    🍳 Follow these steps for perfect results
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Nutrition Highlights */}
          {(recipe as any).nutrition_highlights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="w-5 h-5 mr-2 text-emerald-500">🌿</div>
                Nutrition Highlights
              </h3>
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-5 shadow-sm">
                <div className="space-y-3">
                  {Array.isArray((recipe as any).nutrition_highlights) ? 
                    (recipe as any).nutrition_highlights.map((highlight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed text-emerald-900 font-medium">
                            {highlight}
                          </p>
                        </div>
                      </div>
                    )) :
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed text-emerald-900 font-medium">
                          {(recipe as any).nutrition_highlights}
                        </p>
                      </div>
                    </div>
                  }
                </div>
                
                {/* Subtle nutrition badge */}
                <div className="mt-4 pt-3 border-t border-emerald-200/50">
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-emerald-700/80 font-medium bg-emerald-100/50 px-3 py-1.5 rounded-full">
                      ✨ Key nutritional benefits for your health
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Wine Pairing - Show with general pairing if none provided */}
          {((recipe as any).wine_pairing || (recipe as any).wine_pairings || (recipe.cuisine_type && recipe.cuisine_type !== 'unknown')) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="w-5 h-5 mr-2 text-purple-500">🍷</div>
                Wine Pairing
              </h3>
              <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 border border-purple-200/60 rounded-2xl p-5 shadow-sm">
                <div className="space-y-3">
                  {(() => {
                    const wineData = (recipe as any).wine_pairing || (recipe as any).wine_pairings;
                    
                    // Fallback wine pairings based on cuisine type
                    const getDefaultPairing = (cuisineType: string) => {
                      const cuisine = cuisineType?.toLowerCase() || '';
                      if (cuisine.includes('italian')) {
                        return { recommended: 'Chianti or Pinot Grigio', notes: 'Italian wines complement the flavors perfectly' };
                      } else if (cuisine.includes('french')) {
                        return { recommended: 'Burgundy or Chardonnay', notes: 'Classic French wine pairings enhance the dish' };
                      } else if (cuisine.includes('asian') || cuisine.includes('chinese') || cuisine.includes('thai')) {
                        return { recommended: 'Riesling or Gewürztraminer', notes: 'Slightly sweet wines balance spicy Asian flavors' };
                      } else if (cuisine.includes('mexican') || cuisine.includes('latin')) {
                        return { recommended: 'Tempranillo or Sauvignon Blanc', notes: 'Bold wines that stand up to rich, spicy flavors' };
                      } else if (cuisine.includes('american')) {
                        return { recommended: 'Cabernet Sauvignon or Chardonnay', notes: 'Classic American wine varieties for hearty dishes' };
                      } else {
                        return { recommended: 'Medium-bodied red or crisp white wine', notes: 'Versatile wines that pair well with most dishes' };
                      }
                    };
                    
                    if (typeof wineData === 'object' && !Array.isArray(wineData)) {
                      return (
                        <>
                          {wineData.recommended && (
                            <div>
                              <h4 className="font-semibold text-purple-800 mb-2">Recommended:</h4>
                              <p className="text-purple-700 text-sm leading-relaxed">
                                {wineData.recommended}
                              </p>
                            </div>
                          )}
                          {wineData.alternatives && (
                            <div>
                              <h4 className="font-semibold text-purple-800 mb-2">Alternatives:</h4>
                              <p className="text-purple-700 text-sm leading-relaxed">
                                {Array.isArray(wineData.alternatives) 
                                  ? wineData.alternatives.join(', ')
                                  : wineData.alternatives
                                }
                              </p>
                            </div>
                          )}
                          {wineData.notes && (
                            <div>
                              <h4 className="font-semibold text-purple-800 mb-2">Notes:</h4>
                              <p className="text-purple-700 text-sm leading-relaxed">
                                {wineData.notes}
                              </p>
                            </div>
                          )}
                        </>
                      );
                    } else if (wineData) {
                      return (
                        <p className="text-purple-700 text-sm leading-relaxed">
                          {wineData}
                        </p>
                      );
                    } else {
                      // Show cuisine-based wine pairing suggestions
                      const defaultPairing = getDefaultPairing(recipe.cuisine_type);
                      return (
                        <>
                          <div>
                            <h4 className="font-semibold text-purple-800 mb-2">Suggested Pairing:</h4>
                            <p className="text-purple-700 text-sm leading-relaxed">
                              {defaultPairing.recommended} <span className="text-purple-600 text-xs">(Based on cuisine type)</span>
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-purple-800 mb-2">Notes:</h4>
                            <p className="text-purple-700 text-sm leading-relaxed">
                              {defaultPairing.notes}
                            </p>
                          </div>
                        </>
                      );
                    }
                  })()}
                </div>
                
                {/* Subtle wine badge */}
                <div className="mt-4 pt-3 border-t border-purple-200/50">
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-purple-700/80 font-medium bg-purple-100/50 px-3 py-1.5 rounded-full">
                      🍷 Perfect pairings to enhance your dining experience
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chef Tips - Show with general tips if none provided */}
          {((recipe as any).chef_tips || (recipe as any).tips || (recipe as any).cooking_tips || true) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="w-5 h-5 mr-2 text-amber-500">👨‍🍳</div>
                Chef's Tips
              </h3>
              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 shadow-sm">
                <div className="space-y-3">
                  {(() => {
                    const tips = (recipe as any).chef_tips || (recipe as any).tips || (recipe as any).cooking_tips;
                    
                    // Fallback tips based on cuisine type and cooking method
                    const fallbackTips = [
                      "Taste and adjust seasoning throughout the cooking process",
                      "Let proteins rest for a few minutes after cooking for better texture",
                      "Use fresh herbs at the end of cooking for maximum flavor",
                      "Preheat your pan or oven to ensure even cooking"
                    ];
                    
                    if (Array.isArray(tips)) {
                      return tips.map((tip: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-amber-800 text-sm leading-relaxed font-medium">
                            {tip}
                          </p>
                        </div>
                      ));
                    } else if (tips) {
                      return (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-amber-800 text-sm leading-relaxed font-medium">
                            {tips}
                          </p>
                        </div>
                      );
                    } else {
                      // Show general cooking tips when no specific tips are available
                      return fallbackTips.slice(0, 2).map((tip: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-amber-800 text-sm leading-relaxed font-medium">
                            {tip} <span className="text-amber-600 text-xs">(General tip)</span>
                          </p>
                        </div>
                      ));
                    }
                  })()}
                </div>
                
                {/* Subtle chef badge */}
                <div className="mt-4 pt-3 border-t border-amber-200/50">
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-amber-700/80 font-medium bg-amber-100/50 px-3 py-1.5 rounded-full">
                      👨‍🍳 Professional insights for cooking success
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Saved Recipe Details */}
          {(recipe as any).saved_at && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookmarkCheck className="h-4 w-4 mr-2 text-emerald-500" />
                Recipe History
              </h3>
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl p-4 space-y-3">
                
                {/* Saved Date */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    Saved: {new Date((recipe as any).saved_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Times Cooked */}
                {(recipe as any).times_cooked && (recipe as any).times_cooked > 0 && (
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">
                      Cooked {(recipe as any).times_cooked} time{(recipe as any).times_cooked > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Last Cooked */}
                {(recipe as any).last_cooked && (
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">
                      Last cooked: {new Date((recipe as any).last_cooked).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Personal Notes */}
                {(recipe as any).personal_notes && (
                  <div className="pt-2 border-t border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-2">Personal Notes:</h4>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      {(recipe as any).personal_notes}
                    </p>
                  </div>
                )}

                {/* Modifications */}
                {(recipe as any).modifications && (recipe as any).modifications.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-2">Your Modifications:</h4>
                    <div className="space-y-1">
                      {(recipe as any).modifications.map((modification: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-emerald-700">{modification}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex space-x-3 mt-6 pt-6 border-t border-border relative"
          >
            <Button
              onClick={handleSaveRecipe}
              disabled={isSaving}
              className={`flex-1 text-white ${
                isSaving 
                  ? 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed opacity-75' 
                  : isSaved 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-chef-500 hover:bg-chef-600'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSaved ? 'Removing...' : 'Saving...'}
                </>
              ) : isSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                  Remove from Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Recipe
                </>
              )}
            </Button>
            <div className="flex-1 relative share-menu-container">
              <Button
                onClick={handleShareRecipe}
                variant="outline"
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              {/* Share Menu */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full right-0 mb-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50"
                  >
                    <div className="p-5">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Recipe
                      </h3>
                      
                      <div className="space-y-2">
                        <button
                          onClick={shareViaEmail}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 text-left group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">Email</div>
                            <div className="text-xs text-gray-600">Send beautiful recipe card</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={shareViaSMS}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 text-left group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Smartphone className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">Text Message</div>
                            <div className="text-xs text-gray-600">Send via SMS</div>
                          </div>
                        </button>

                        <button
                          onClick={copyToClipboard}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 text-left group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Copy className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">Copy Text</div>
                            <div className="text-xs text-gray-600">Copy to clipboard</div>
                          </div>
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200/50">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Powered by</div>
                          <div className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            ChefoodAI™
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
} 