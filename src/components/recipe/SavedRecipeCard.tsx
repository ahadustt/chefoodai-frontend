import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Target, 
  Trash2,
  Loader2,
  ChefHat,
  CheckSquare,
  Square,
  Eye,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ImageWithFallback from '@/components/ImageWithFallback';

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

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  recipe_image_url?: string;
  prep_time?: number;
  prep_time_minutes?: number;
  cook_time?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty?: string;
  difficulty_level?: string;
  cuisine_type?: string;
  cuisine_name?: string;
  calories_per_serving?: number;
  ai_generated?: boolean;
  saved_at?: string;
  created_at?: string;
}

interface SavedRecipeCardProps {
  recipe: Recipe;
  enhancedRecipe?: any; // Enhanced recipe data with nutrition info
  onRemove?: (id: string) => void;
  onView?: (recipe: Recipe) => void;
  className?: string;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const SavedRecipeCard: React.FC<SavedRecipeCardProps> = React.memo(({ 
  recipe, 
  enhancedRecipe,
  onRemove, 
  onView, 
  className = "",
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Safe data extraction with fallbacks to prevent NaN errors
  const prepTime = Number(recipe.prep_time_minutes || recipe.prep_time) || 0;
  const cookTime = Number(recipe.cook_time_minutes || recipe.cook_time) || 0;
  const totalTime = prepTime + cookTime;
  const servings = Number(recipe.servings) || 0;
  // Try to get calories from enhanced data first, then fall back to basic data
  const calories = Number(enhancedRecipe?.calories_per_serving) || 
                  Number(recipe.calories_per_serving) || 
                  Number((recipe as any).nutrition?.calories) || 
                  Number((recipe as any).nutrition_info?.calories) || 0;
  
  // Use real cuisine type values
  const rawCuisine = recipe.cuisine_type || recipe.cuisine_name;
  const cuisineType = rawCuisine || 'International'; // Default to International if not specified

  const handleDeleteRecipe = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting || !onRemove) return;
    
    setIsDeleting(true);
    try {
      await onRemove(recipe.id);
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      setIsDeleting(false);
    }
  }, [recipe.id, onRemove, isDeleting]);

  const handleViewRecipe = useCallback(() => {
    if (onView) {
      onView(recipe);
    }
  }, [recipe, onView]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 0.8, 
        y: -20,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      layout
      className={`group backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl overflow-hidden shadow-xl shadow-gray-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 cursor-pointer ${className}`}
      onClick={!isSelectionMode ? handleViewRecipe : () => onToggleSelect?.(recipe.id)}
    >
      {/* Recipe Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        {recipe.image_url || recipe.recipe_image_url ? (
          <ImageWithFallback 
            src={recipe.image_url || recipe.recipe_image_url || `https://picsum.photos/seed/${recipe.title}/400/300`}
            alt={recipe.title}
            title={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackSrc={`https://picsum.photos/seed/${recipe.title}/400/300`}
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
              {/* Selection Checkbox */}
              <div 
                className="p-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full cursor-pointer hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSelect?.(recipe.id)
                }}
              >
                {isSelected ? (
                  <CheckSquare className="h-3 w-3 text-white" />
                ) : (
                  <Square className="h-3 w-3 text-white" />
                )}
              </div>
              {recipe.ai_generated && (
                <span className="px-2 py-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-sm text-white text-xs rounded-full font-medium shadow-lg">
                  ✨ AI Generated
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Subtle delete button */}
              <button
                onClick={handleDeleteRecipe}
                className="p-1.5 bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm rounded-full transition-all duration-200 opacity-60 group-hover:opacity-100"
                title="Remove from saved recipes"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 text-white animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3 text-white" />
                )}
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
              {servings && (
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">{servings}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                {(() => {
                  const difficulty = (recipe.difficulty_level || 'Easy').toLowerCase();
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
                <span className="capitalize font-medium">{recipe.difficulty_level || 'Easy'}</span>
              </div>
              {calories > 0 && (
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
            {new Date(recipe.saved_at || recipe.created_at || Date.now()).toLocaleDateString()}
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

        {/* Action Button - Always at bottom */}
        <div className="mt-auto">
          <Button 
            onClick={handleViewRecipe}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Recipe
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

SavedRecipeCard.displayName = 'SavedRecipeCard';

export default SavedRecipeCard;