import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  SortAsc, 
  Bookmark, 
  ChefHat,
  Trash2,
  Grid3X3,
  List,
  Sparkles,
  CheckSquare,
  Square,
  X,
  Table,
  Clock,
  Users,
  Utensils,
  Eye
} from 'lucide-react'
import { useSavedRecipes } from '@/contexts/SavedRecipesContext'
import { apiClient } from '@/api/client'
import { SavedRecipeCard } from './SavedRecipeCard'
import { RecipeDisplay } from './RecipeDisplay'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { Pagination, usePagination } from '@/components/ui/Pagination'
import ImageWithFallback from '@/components/ImageWithFallback'

export function SavedRecipes() {
  const { savedRecipes, loading, clearAllSavedRecipes, refreshRecipes, removeRecipe } = useSavedRecipes()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest')
  const [filterBy, setFilterBy] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const [showClearAllConfirmation, setShowClearAllConfirmation] = useState(false)
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [recipesWithNutrition, setRecipesWithNutrition] = useState<Map<string, any>>(new Map())
  const [showAllRecipes, setShowAllRecipes] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    recipe: any | null
    onConfirm: (() => void) | null
  }>({ isOpen: false, recipe: null, onConfirm: null })

  // Filter and sort recipes
  const filteredRecipes = savedRecipes
    .filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (recipe.cuisine_type && recipe.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesFilter = filterBy === 'all' || recipe.difficulty === filterBy
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
        case 'oldest':
          return new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime()
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    totalItems: filteredRecipes.length,
    itemsPerPage: 12,
  })

  // Show all recipes if toggle is enabled, otherwise use pagination
  const paginatedRecipes = showAllRecipes ? filteredRecipes : filteredRecipes.slice(startIndex, endIndex)

  // Fetch enhanced recipe data with nutrition info (same as Dashboard)
  const fetchEnhancedRecipeData = async () => {
    const recipesToEnhance = paginatedRecipes;
    const newNutritionData = new Map();

    for (const recipe of recipesToEnhance) {
      try {
        const response = await apiClient.get(`/api/v1/recipes/${recipe.id}/complete`);
        newNutritionData.set(recipe.id!, response.data);
      } catch (error) {
        console.warn(`Failed to fetch nutrition data for recipe ${recipe.id}:`, error);
      }
    }

    setRecipesWithNutrition(prev => new Map([...prev, ...newNutritionData]));
  };

  // Fetch enhanced data when recipes change
  useEffect(() => {
    if (paginatedRecipes.length > 0) {
      fetchEnhancedRecipeData();
    }
  }, [paginatedRecipes.length, currentPage]); // Re-fetch when page changes

  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false)

  const handleViewRecipe = async (recipe: any) => {
    try {
      setIsLoadingRecipe(true);
      
      // Fetch complete recipe details BEFORE showing the modal (same as Dashboard)
      const response = await apiClient.get(`/api/v1/recipes/${recipe.id}/complete`);
      
      // Show the modal with complete data immediately
      setSelectedRecipe(response.data);
      
    } catch (error) {
      console.error('Failed to load complete recipe:', error);
      
      // Fallback to basic recipe data if API fails
      setSelectedRecipe(recipe);
    } finally {
      setIsLoadingRecipe(false);
    }
  }

  const handleCloseRecipeView = () => {
    setSelectedRecipe(null)
  }

  // Delete confirmation functions
  const handleDeleteRecipe = (recipe: any) => {
    setDeleteConfirmation({
      isOpen: true,
      recipe: recipe,
      onConfirm: () => performDeleteRecipe(recipe)
    })
  }

  const performDeleteRecipe = async (recipe: any) => {
    console.log('🗑️ Performing delete for recipe:', { id: recipe.id, title: recipe.title });
    
    if (!recipe.id) {
      console.error('❌ Recipe ID is missing:', recipe);
      alert('Error: Recipe ID is missing. Cannot delete recipe.');
      return;
    }
    
    try {
      const success = await removeRecipe(String(recipe.id));
      if (success) {
        console.log('✅ Recipe deleted successfully:', recipe.title);
      } else {
        console.error('❌ Failed to delete recipe:', recipe.title);
      }
    } catch (error) {
      console.error('❌ Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    } finally {
      // Close the confirmation modal
      setDeleteConfirmation({ isOpen: false, recipe: null, onConfirm: null });
    }
  }

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, recipe: null, onConfirm: null });
  }

  const handleClearAll = () => {
    setShowClearAllConfirmation(true)
  }

  const confirmClearAll = () => {
    clearAllSavedRecipes()
    setShowClearAllConfirmation(false)
  }

  // Selection functions
  const toggleSelection = (recipeId: string) => {
    const newSelected = new Set(selectedRecipes)
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId)
    } else {
      newSelected.add(recipeId)
    }
    setSelectedRecipes(newSelected)
  }

  const selectAll = () => {
    setSelectedRecipes(new Set(paginatedRecipes.map(recipe => recipe.id)))
  }

  const clearSelection = () => {
    setSelectedRecipes(new Set())
    setIsSelectionMode(false)
  }

  const deleteSelected = async () => {
    for (const recipeId of selectedRecipes) {
      await removeRecipe(recipeId)
    }
    clearSelection()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your culinary collection...</p>
        </div>
      </div>
    )
  }

  // Show loading state while fetching complete recipe details (same as Dashboard)
  if (isLoadingRecipe) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span className="text-gray-700">Loading recipe details...</span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  if (selectedRecipe) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={handleCloseRecipeView}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate pr-4">Recipe Details</h2>
            <Button
              onClick={handleCloseRecipeView}
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-gray-100 flex-shrink-0"
            >
              ✕
            </Button>
          </div>
          <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
            <RecipeDisplay recipe={selectedRecipe} />
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {savedRecipes.length === 0 ? (
        /* Modern Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl p-16 shadow-xl shadow-gray-500/10 text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 transform rotate-3">
                <ChefHat className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/25 transform rotate-12">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Start Your Culinary Journey
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            Create your first AI-powered recipe and discover amazing dishes tailored to your taste!
          </p>
          
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 px-8 py-3 text-lg font-semibold transition-all duration-300"
          >
            <ChefHat className="h-5 w-5 mr-2" />
            Generate Your First Recipe
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Consolidated Header and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-lg bg-white/80 border border-white/30 rounded-3xl p-6 shadow-xl shadow-gray-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)'
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Search bar - full width on mobile */}
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search recipes, cuisines, ingredients..."
                  className="pl-12 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl text-base w-full shadow-sm focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
                />
              </div>

              {/* Filters and controls - responsive layout */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                {/* Left group - filters */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  {/* Sort and filter dropdowns */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
                      className="px-3 py-2 bg-white/90 border border-gray-200 rounded-xl text-sm shadow-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all duration-200"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="alphabetical">A-Z</option>
                    </select>

                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                      className="px-3 py-2 bg-white/90 border border-gray-200 rounded-xl text-sm shadow-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all duration-200"
                    >
                      <option value="all">All Difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Right group - view controls and actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  {/* View mode and show all toggles */}
                  <div className="flex flex-wrap gap-2">
                    {/* View Mode Toggle */}
                    <div className="bg-white/90 border border-gray-200 rounded-xl p-1 flex shadow-sm">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'grid' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'list' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'table' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <Table className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Show All Toggle */}
                    <div className="bg-white/90 border border-gray-200 rounded-xl p-1 flex shadow-sm">
                      <button
                        onClick={() => setShowAllRecipes(!showAllRecipes)}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                          showAllRecipes
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                        title={showAllRecipes ? 'Show with pagination' : 'Show all recipes'}
                      >
                        {showAllRecipes ? 'Paginated' : 'Show All'}
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {!isSelectionMode ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsSelectionMode(true)}
                      size="sm"
                    >
                      Select
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        onClick={selectAll}
                        size="sm"
                      >
                        Select All ({paginatedRecipes.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={deleteSelected}
                        disabled={selectedRecipes.size === 0}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        size="sm"
                      >
                        Delete ({selectedRecipes.size})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={clearSelection}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            {/* Results Count */}
            {filteredRecipes.length !== savedRecipes.length && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-gray-600">
                  Found {filteredRecipes.length} of {savedRecipes.length} recipes
                </p>
              </div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {filteredRecipes.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl p-16 shadow-xl shadow-gray-500/10 text-center"
              >
                <Filter className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  No recipes found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Try adjusting your search terms or filters to discover more culinary creations.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl p-8 shadow-xl shadow-gray-500/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {paginatedRecipes.map((recipe, index) => (
                      <motion.div
                        key={`saved-recipe-${recipe.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ 
                          opacity: 0, 
                          scale: 0.8, 
                          y: -20,
                          transition: { duration: 0.3, ease: "easeInOut" }
                        }}
                        transition={{ delay: index * 0.1 }}
                        layout
                      >
                        <SavedRecipeCard
                          recipe={recipe}
                          enhancedRecipe={recipesWithNutrition.get(recipe.id!)}
                          onView={handleViewRecipe}
                          onRemove={(recipeId: string) => {
                            // Find the recipe object for the confirmation modal
                            const recipeToDelete = filteredRecipes.find(r => String(r.id) === String(recipeId));
                            if (recipeToDelete) {
                              handleDeleteRecipe(recipeToDelete);
                            }
                          }}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedRecipes.has(recipe.id)}
                          onToggleSelect={toggleSelection}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl p-8 shadow-xl shadow-gray-500/10 space-y-4"
                  >
                    {paginatedRecipes.map((recipe, index) => (
                      <motion.div
                        key={`saved-recipe-list-${recipe.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                      >
                        {/* Selection Checkbox - Always visible */}
                        <div 
                          className="cursor-pointer"
                          onClick={() => toggleSelection(recipe.id)}
                        >
                          {selectedRecipes.has(recipe.id) ? (
                            <CheckSquare className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        {/* Recipe Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <ImageWithFallback
                            src={recipe.image_url || recipe.recipe_image_url || `https://picsum.photos/seed/${recipe.title}/200/200`}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                            fallbackSrc={`https://picsum.photos/seed/${recipe.title}/200/200`}
                          />
                        </div>

                        {/* Recipe Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{recipe.title}</h3>
                          <p className="text-sm text-gray-600 truncate">{recipe.description}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)}min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{recipe.servings || 4}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Utensils className="h-3 w-3" />
                              <span className="capitalize">{recipe.difficulty || 'Medium'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            onClick={() => handleViewRecipe(recipe)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecipe(recipe);
                            }}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl shadow-xl shadow-gray-500/10 overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="w-12 px-4 py-3 text-left">
                              <CheckSquare 
                                className="h-4 w-4 text-gray-400 cursor-pointer hover:text-emerald-600" 
                                onClick={() => {
                                  if (selectedRecipes.size === paginatedRecipes.length) {
                                    clearSelection();
                                  } else {
                                    selectAll();
                                  }
                                }}
                              />
                            </th>
                            <th className="w-16 px-4 py-3 text-left">Image</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Recipe</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Cuisine</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Time</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Servings</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Difficulty</th>
                            <th className="w-32 px-4 py-3 text-center font-semibold text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedRecipes.map((recipe, index) => (
                            <motion.tr
                              key={`saved-recipe-table-${recipe.id}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.02 }}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div 
                                  className="cursor-pointer"
                                  onClick={() => toggleSelection(recipe.id)}
                                >
                                  {selectedRecipes.has(recipe.id) ? (
                                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                  <ImageWithFallback
                                    src={recipe.image_url || recipe.recipe_image_url || `https://picsum.photos/seed/${recipe.title}/200/200`}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover"
                                    fallbackSrc={`https://picsum.photos/seed/${recipe.title}/200/200`}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium text-gray-900">{recipe.title}</div>
                                  <div className="text-sm text-gray-600 truncate max-w-xs">{recipe.description}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{recipe.cuisine_type || 'International'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{(recipe.prep_time || 0) + (recipe.cook_time || 0)}min</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{recipe.servings || 4}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 capitalize">{recipe.difficulty || 'Medium'}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center gap-1 justify-center">
                                  <Button
                                    onClick={() => handleViewRecipe(recipe)}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRecipe(recipe);
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* Pagination Component */}
                {!showAllRecipes && totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl p-6 shadow-xl shadow-gray-500/10"
                  >
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredRecipes.length}
                      itemsPerPage={pageSize}
                      onPageChange={handlePageChange}
                      showItemsInfo={true}
                      showPageSizeSelector={true}
                      pageSizeOptions={[9, 12, 18, 24]}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </motion.div>
                )}

                {/* Show All Info */}
                {showAllRecipes && filteredRecipes.length > 12 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="backdrop-blur-sm bg-white/60 border border-white/20 rounded-3xl p-4 shadow-xl shadow-gray-500/10 text-center"
                  >
                    <p className="text-sm text-gray-600">
                      Showing all {filteredRecipes.length} recipes
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Recipe Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={() => {
          if (deleteConfirmation.onConfirm) {
            deleteConfirmation.onConfirm();
          }
        }}
        title="Delete Recipe"
        message={
          deleteConfirmation.recipe 
            ? `Are you sure you want to remove "${deleteConfirmation.recipe.title}" from your saved recipes?`
            : "Are you sure you want to delete this recipe?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon={<Trash2 className="h-6 w-6 text-red-600" />}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearAllConfirmation}
        onClose={() => setShowClearAllConfirmation(false)}
        onConfirm={confirmClearAll}
        title="Clear All Recipes"
        message="Are you sure you want to remove all saved recipes? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
        icon={<Trash2 className="h-6 w-6 text-red-600" />}
      />
    </div>
  )
}
