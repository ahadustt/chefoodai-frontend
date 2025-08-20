import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RecipeAPI, Recipe, SavedRecipe, APIResponse } from '../lib/api';
import { useAuth } from './AuthContext';

interface SavedRecipesContextType {
  savedRecipes: SavedRecipe[];
  loading: boolean;
  error: string | null;
  saveRecipe: (recipe: Recipe) => Promise<boolean>;
  removeRecipe: (recipeId: string) => Promise<boolean>;
  isRecipeSaved: (recipeTitle: string) => boolean;
  getSavedRecipe: (recipeTitle: string) => SavedRecipe | undefined;
  clearAllSavedRecipes: () => Promise<boolean>;
  refreshRecipes: () => Promise<void>;
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(undefined);

export const useSavedRecipes = () => {
  const context = useContext(SavedRecipesContext);
  if (context === undefined) {
    throw new Error('useSavedRecipes must be used within a SavedRecipesProvider');
  }
  return context;
};

interface SavedRecipesProviderProps {
  children: ReactNode;
}

export const SavedRecipesProvider: React.FC<SavedRecipesProviderProps> = ({ children }) => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Load recipes from backend on component mount
  const refreshRecipes = async () => {
    // Don't try to load recipes if user is not authenticated
    if (!isLoggedIn) {
      console.log('🔒 User not authenticated, skipping recipe fetch');
      setSavedRecipes([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching recipes from backend...');
      
      const response: APIResponse<SavedRecipe[]> = await RecipeAPI.getSavedRecipes();
      console.log('✅ Recipes fetched from backend:', response);
      
      setSavedRecipes(response.data || []);
    } catch (error) {
      console.error('❌ Failed to fetch recipes from backend:', error);
      setError('Failed to load recipes');
      setSavedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load recipes when auth is not loading and user is authenticated
    if (!authLoading) {
      refreshRecipes();
    }
  }, [isLoggedIn, authLoading]);

  const saveRecipe = async (recipe: Recipe): Promise<boolean> => {
    try {
      console.log('💾 Saving recipe to backend:', recipe.title);
      
      // Check if recipe already exists
      if (isRecipeSaved(recipe.title)) {
        console.log('⚠️ Recipe already saved:', recipe.title);
        return false;
      }

      // Save to backend - RecipeAPI.saveRecipe handles the conversion
      const savedRecipe = await RecipeAPI.saveRecipe(recipe);
      console.log('✅ Recipe saved to backend:', savedRecipe);
      
      // Refresh the list to get the latest data
      await refreshRecipes();
      return true;
    } catch (error) {
      console.error('❌ Failed to save recipe to backend:', error);
      setError('Failed to save recipe');
      return false;
    }
  };

  const removeRecipe = async (recipeId: string): Promise<boolean> => {
    // Store the recipe to potentially restore it if deletion fails
    const recipeToRemove = savedRecipes.find(recipe => String(recipe.id) === recipeId);
    
    if (!recipeToRemove) {
      console.warn('⚠️ Recipe not found in local state:', recipeId);
      return false;
    }

    try {
      console.log('🗑️ Starting optimistic deletion for recipe:', recipeId);
      
      // Optimistically remove from local state immediately for instant UI feedback
      setSavedRecipes(prevRecipes => 
        prevRecipes.filter(recipe => 
          String(recipe.id) !== recipeId
        )
      );
      
      console.log('✅ Recipe removed from local state optimistically');
      
      // Now try to delete from backend
      await RecipeAPI.deleteSavedRecipe(recipeId);
      console.log('✅ Recipe successfully removed from backend');
      
      return true;
    } catch (error: any) {
      console.error('❌ Failed to remove recipe from backend:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Handle 404 errors gracefully - recipe was already deleted
      if (error.response?.status === 404) {
        console.log('⚠️ Recipe already deleted or not found on backend, keeping local removal');
        return true; // Consider this a success since the recipe is gone from backend
      }
      
      // Handle 400 errors (like type mismatch) - might still be deleted
      if (error.response?.status === 400) {
        console.log('⚠️ Recipe ID format issue, but keeping local removal');
        return true; // Consider this a success and keep the optimistic removal
      }
      
      // For other errors, rollback the optimistic update by restoring the recipe
      console.log('🔄 Rolling back optimistic deletion due to error');
      setSavedRecipes(prevRecipes => {
        // Only add back if it's not already in the list
        const exists = prevRecipes.some(recipe => String(recipe.id) === recipeId);
        if (!exists) {
          return [...prevRecipes, recipeToRemove].sort((a, b) => 
            new Date(b.saved_at || '').getTime() - new Date(a.saved_at || '').getTime()
          );
        }
        return prevRecipes;
      });
      
      console.log('✅ Recipe restored to local state after failed deletion');
      
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      setError(`Failed to remove recipe: ${errorMessage}`);
      return false;
    }
  };

  const isRecipeSaved = (recipeTitle: string): boolean => {
    return savedRecipes.some(recipe => recipe.title === recipeTitle);
  };

  const getSavedRecipe = (recipeTitle: string): SavedRecipe | undefined => {
    return savedRecipes.find(recipe => recipe.title === recipeTitle);
  };

  const clearAllSavedRecipes = async (): Promise<boolean> => {
    try {
      console.log('🗑️ Clearing all recipes from backend...');
      
      // Delete each recipe individually
      const deletePromises = savedRecipes.map(recipe => {
        const recipeId = typeof recipe.id === 'string' ? parseInt(recipe.id) : recipe.id;
        return RecipeAPI.deleteRecipe(recipeId || 0);
      });
      await Promise.all(deletePromises);
      
      console.log('✅ All recipes cleared from backend');
      
      // Refresh the list
      await refreshRecipes();
      return true;
    } catch (error) {
      console.error('❌ Failed to clear all recipes:', error);
      setError('Failed to clear recipes');
      return false;
    }
  };

  const value: SavedRecipesContextType = {
    savedRecipes,
    loading,
    error,
    saveRecipe,
    removeRecipe,
    isRecipeSaved,
    getSavedRecipe,
    clearAllSavedRecipes,
    refreshRecipes
  };

  return (
    <SavedRecipesContext.Provider value={value}>
      {children}
    </SavedRecipesContext.Provider>
  );
}; 