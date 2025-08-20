/**
 * Shopping List API Service
 * Handles all shopping list operations with the backend
 */
import { apiClient } from '../api/client';

export enum ShoppingListStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SHOPPING = 'shopping',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum IngredientCategory {
  PRODUCE = 'produce',
  DAIRY = 'dairy',
  MEAT_SEAFOOD = 'meat_seafood',
  PANTRY = 'pantry',
  BAKERY = 'bakery',
  FROZEN = 'frozen',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  CONDIMENTS = 'condiments',
  SPICES = 'spices',
  HOUSEHOLD = 'household',
  OTHER = 'other'
}

export interface ShoppingListItem {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  notes?: string;
  estimated_cost?: number;
  is_purchased: boolean;
  purchased_at?: string;
  created_at: string;
  recipe_sources?: Array<{
    recipe_id: string;
    recipe_title: string;
  }>;
  
  // AI Enhancement Data
  confidence_score?: number;
  confidence_level?: 'high' | 'medium' | 'low';
  optimization_notes?: string;
  package_suggestion?: string;
  bulk_opportunity?: boolean;
  preparation?: string;
  standard_quantity?: number;
  standard_unit?: string;
  ai_processed?: boolean;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  meal_plan_id?: string;
  shop_date?: string;
  status: ShoppingListStatus;
  items: ShoppingListItem[];
  total_items: number;
  purchased_items: number;
  total_estimated_cost?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  // AI Enhancement Metadata
  ai_enhancement?: {
    used_ai: boolean;
    confidence_average: number;
    processing_time: number;
    optimization_level: 'basic' | 'standard' | 'premium';
    cost_estimate: number;
    cache_hit_rate: number;
    fallback_count: number;
    model_used?: string;
  };
}

export interface CreateShoppingListRequest {
  name: string;
  meal_plan_id?: string;
  shop_date?: string;
  items?: Array<{
    ingredient_name: string;
    quantity: number;
    unit: string;
    category?: IngredientCategory;
    notes?: string;
    estimated_cost?: number;
  }>;
}

export interface GenerateShoppingListRequest {
  meal_plan_id: string;
  name?: string;
  exclude_pantry_items?: boolean;
  group_by_store_section?: boolean;
  optimize_quantities?: boolean;
}

export interface UpdateShoppingListItemRequest {
  quantity?: number;
  unit?: string;
  category?: IngredientCategory;
  notes?: string;
  estimated_cost?: number;
  is_purchased?: boolean;
}

export interface ShoppingListFilters {
  status?: ShoppingListStatus;
  limit?: number;
}

export const shoppingListApi = {
  // Get all shopping lists for user
  getShoppingLists: async (filters?: ShoppingListFilters): Promise<ShoppingList[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await apiClient.get(`/api/v1/shopping-lists?${params.toString()}`);
    return response.data;
  },

  // Get specific shopping list
  getShoppingList: async (id: string): Promise<ShoppingList> => {
    const response = await apiClient.get(`/api/v1/shopping-lists/${id}`);
    return response.data;
  },

  // Create new shopping list manually
  createShoppingList: async (data: CreateShoppingListRequest): Promise<ShoppingList> => {
    const response = await apiClient.post('/api/v1/shopping-lists', data);
    return response.data;
  },

  // Generate shopping list from meal plan
  generateFromMealPlan: async (data: GenerateShoppingListRequest): Promise<ShoppingList> => {
    const response = await apiClient.post('/api/v1/shopping-lists/generate', data);
    return response.data;
  },

  // Update shopping list item
  updateItem: async (
    shoppingListId: string, 
    itemId: string, 
    data: UpdateShoppingListItemRequest
  ): Promise<ShoppingListItem> => {
    const response = await apiClient.put(`/api/v1/shopping-lists/${shoppingListId}/items/${itemId}`, data);
    return response.data;
  },

  // Toggle item purchased status
  toggleItemPurchased: async (
    shoppingListId: string, 
    itemId: string, 
    isPurchased: boolean
  ): Promise<ShoppingListItem> => {
    return shoppingListApi.updateItem(shoppingListId, itemId, { is_purchased: isPurchased });
  },

  // Update multiple items at once (bulk operations)
  bulkUpdateItems: async (
    shoppingListId: string,
    updates: Array<{ itemId: string; data: UpdateShoppingListItemRequest }>
  ): Promise<ShoppingListItem[]> => {
    const promises = updates.map(({ itemId, data }) => 
      shoppingListApi.updateItem(shoppingListId, itemId, data)
    );
    return Promise.all(promises);
  },

  // Delete shopping list
  deleteShoppingList: async (shoppingListId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/shopping-lists/${shoppingListId}`);
  }
};

// Category display helpers
export const getCategoryDisplayName = (category: IngredientCategory): string => {
  const names: Record<IngredientCategory, string> = {
    [IngredientCategory.PRODUCE]: 'Produce',
    [IngredientCategory.DAIRY]: 'Dairy',
    [IngredientCategory.MEAT_SEAFOOD]: 'Meat & Seafood',
    [IngredientCategory.PANTRY]: 'Pantry',
    [IngredientCategory.BAKERY]: 'Bakery',
    [IngredientCategory.FROZEN]: 'Frozen',
    [IngredientCategory.BEVERAGES]: 'Beverages',
    [IngredientCategory.SNACKS]: 'Snacks',
    [IngredientCategory.CONDIMENTS]: 'Condiments',
    [IngredientCategory.SPICES]: 'Spices & Herbs',
    [IngredientCategory.HOUSEHOLD]: 'Household',
    [IngredientCategory.OTHER]: 'Other'
  };
  return names[category];
};

export const getCategoryColor = (category: IngredientCategory): string => {
  const colors: Record<IngredientCategory, string> = {
    [IngredientCategory.PRODUCE]: 'bg-green-100 text-green-800',
    [IngredientCategory.DAIRY]: 'bg-blue-100 text-blue-800',
    [IngredientCategory.MEAT_SEAFOOD]: 'bg-red-100 text-red-800',
    [IngredientCategory.PANTRY]: 'bg-amber-100 text-amber-800',
    [IngredientCategory.BAKERY]: 'bg-orange-100 text-orange-800',
    [IngredientCategory.FROZEN]: 'bg-cyan-100 text-cyan-800',
    [IngredientCategory.BEVERAGES]: 'bg-purple-100 text-purple-800',
    [IngredientCategory.SNACKS]: 'bg-pink-100 text-pink-800',
    [IngredientCategory.CONDIMENTS]: 'bg-yellow-100 text-yellow-800',
    [IngredientCategory.SPICES]: 'bg-emerald-100 text-emerald-800',
    [IngredientCategory.HOUSEHOLD]: 'bg-gray-100 text-gray-800',
    [IngredientCategory.OTHER]: 'bg-slate-100 text-slate-800'
  };
  return colors[category];
};

export const formatQuantity = (quantity: number, unit: string): string => {
  // Format quantity nicely for display
  const num = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2).replace(/\.?0+$/, '');
  return `${num} ${unit}${quantity !== 1 && !unit.endsWith('s') ? 's' : ''}`;
};
