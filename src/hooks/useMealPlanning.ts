import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Types
interface MealPlan {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  goals: string[];
  dietary_restrictions: string[];
  family_size: number;
  budget_per_week?: number;
  cooking_time_available?: number;
  preferences: {
    cuisine_preferences: string[];
    skill_level: string;
    meal_prep_style: string;
  };
  days: MealPlanDay[];
  analytics?: MealPlanAnalytics[];
  shopping_lists?: ShoppingList[];
  created_at: string;
  updated_at: string;
}

interface MealPlanDay {
  id: number;
  date: string;
  day_number: number;
  target_calories: number;
  meals: MealPlanMeal[];
  status: string;
}

interface MealPlanMeal {
  id: number;
  meal_type: string;
  scheduled_time: string;
  servings: number;
  target_calories: number;
  recipe: {
    id: number;
    name: string;
    description: string;
    prep_time_minutes: number;
    cook_time_minutes: number;
    difficulty: string;
    cuisine_type: string;
    calories_per_serving: number;
    ingredients: Array<{
      name: string;
      amount: string;
      unit: string;
    }>;
  };
  status: string;
}

interface MealPlanAnalytics {
  total_calories: number;
  avg_calories_per_day: number;
  total_protein: number;
  total_carbohydrates: number;
  total_fat: number;
  total_fiber: number;
  unique_recipes_count: number;
  nutritional_balance_score: number;
  goal_achievement_score: number;
  cuisine_distribution: Record<string, number>;
  difficulty_distribution: Record<string, number>;
  daily_breakdown: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meals: Array<{
      type: string;
      recipe_name: string;
      calories: number;
    }>;
  }>;
}

interface ShoppingList {
  id: number;
  ingredients_by_category: Record<string, Array<{
    name: string;
    amount: string | number;
    unit: string;
    recipes: string[];
  }>>;
  total_items: number;
  estimated_cost: number;
  cost_breakdown_by_category: Record<string, number>;
  generated_at: string;
}

interface MealPlanListResponse {
  meal_plans: MealPlan[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

interface CreateMealPlanData {
  name: string;
  description?: string;
  start_date: string;
  duration_days: number;
  goals: string[];
  dietary_restrictions: string[];
  family_size: number;
  budget_per_week?: number;
  cooking_time_available?: number;
  preferences: {
    cuisine_preferences: string[];
    skill_level: string;
    meal_prep_style: string;
  };
}

interface UpdateMealPlanData {
  name?: string;
  description?: string;
  status?: string;
  preferences?: Record<string, any>;
}

interface MealSwapRequest {
  preferences?: {
    cuisine_type?: string;
    max_prep_time?: number;
    dietary_restrictions?: string[];
    avoid_ingredients?: string[];
  };
}

interface NutritionAnalysis {
  analytics: MealPlanAnalytics;
  recommendations: Array<{
    recommendation_type: 'increase' | 'decrease' | 'maintain' | 'caution';
    nutrient: string;
    current_amount: number;
    target_amount: number;
    priority: number;
    reason: string;
    specific_foods: string[];
    health_impact: string;
  }>;
}

// Hooks
export const useMealPlans = (page: number = 1, limit: number = 10, status?: string) => {
  return useQuery({
    queryKey: ['meal-plans', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });
      const response = await api.get(`/meal-plans/?${params}`);
      return response.data as MealPlanListResponse;
    },
  });
};

export const useMealPlan = (mealPlanId: number, includeAnalytics: boolean = false) => {
  return useQuery({
    queryKey: ['meal-plan', mealPlanId, includeAnalytics],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(includeAnalytics && { include_analytics: 'true' })
      });
      const response = await api.get(`/meal-plans/${mealPlanId}?${params}`);
      return response.data as MealPlan;
    },
    enabled: !!mealPlanId,
  });
};

export const useCreateMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMealPlanData) => {
      const response = await api.post('/meal-plans/', data);
      return response.data as MealPlan;
    },
    onSuccess: (newMealPlan) => {
      // Invalidate meal plans list
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      
      // Add the new meal plan to cache
      queryClient.setQueryData(['meal-plan', newMealPlan.id], newMealPlan);
    },
  });
};

export const useUpdateMealPlan = (mealPlanId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMealPlanData) => {
      const response = await api.put(`/meal-plans/${mealPlanId}`, data);
      return response.data as MealPlan;
    },
    onSuccess: (updatedMealPlan) => {
      // Update the meal plan in cache
      queryClient.setQueryData(['meal-plan', mealPlanId], updatedMealPlan);
      
      // Invalidate meal plans list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
};

export const useDeleteMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealPlanId: number) => {
      await api.delete(`/meal-plans/${mealPlanId}`);
      return mealPlanId;
    },
    onSuccess: (deletedMealPlanId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['meal-plan', deletedMealPlanId] });
      
      // Invalidate meal plans list
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
};

export const useRegenerateMealPlanDay = (mealPlanId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetDate: string) => {
      const response = await api.post(`/meal-plans/${mealPlanId}/regenerate-day?target_date=${targetDate}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the meal plan to refetch with updated day
      queryClient.invalidateQueries({ queryKey: ['meal-plan', mealPlanId] });
    },
  });
};

export const useSwapMeal = (mealPlanId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mealId, preferences }: { mealId: number; preferences?: MealSwapRequest['preferences'] }) => {
      const response = await api.post(`/meal-plans/${mealPlanId}/meals/${mealId}/swap`, { preferences });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the meal plan to refetch with updated meal
      queryClient.invalidateQueries({ queryKey: ['meal-plan', mealPlanId] });
    },
  });
};

export const useShoppingList = (mealPlanId: number, weekNumber?: number, optimizeLayout: boolean = true) => {
  return useQuery({
    queryKey: ['shopping-list', mealPlanId, weekNumber, optimizeLayout],
    queryFn: async () => {
      const params = new URLSearchParams({
        optimize_layout: optimizeLayout.toString(),
        ...(weekNumber && { week_number: weekNumber.toString() })
      });
      const response = await api.get(`/meal-plans/${mealPlanId}/shopping-list?${params}`);
      return response.data as ShoppingList;
    },
    enabled: !!mealPlanId,
  });
};

export const useNutritionAnalysis = (mealPlanId: number) => {
  return useQuery({
    queryKey: ['nutrition-analysis', mealPlanId],
    queryFn: async () => {
      const response = await api.get(`/meal-plans/${mealPlanId}/nutrition-analysis`);
      return response.data as NutritionAnalysis;
    },
    enabled: !!mealPlanId,
  });
};

export const useSubmitMealPlanFeedback = (mealPlanId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedback: {
      meal_id?: number;
      feedback_type: string;
      overall_rating?: number;
      taste_rating?: number;
      difficulty_rating?: number;
      time_rating?: number;
      cost_rating?: number;
      made_recipe?: boolean;
      would_make_again?: boolean;
      followed_exactly?: boolean;
      comments?: string;
      improvements_suggested?: string;
      substitutions_made?: Record<string, any>;
      issues_encountered?: string[];
    }) => {
      const response = await api.post(`/meal-plans/${mealPlanId}/feedback`, feedback);
      return response.data;
    },
    onSuccess: () => {
      // Optionally invalidate related queries to reflect feedback
      queryClient.invalidateQueries({ queryKey: ['meal-plan', mealPlanId] });
    },
  });
};

export const useMealPlanTemplates = (category?: string, difficulty?: string) => {
  return useQuery({
    queryKey: ['meal-plan-templates', category, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(category && { category }),
        ...(difficulty && { difficulty })
      });
      const response = await api.get(`/meal-plans/templates/?${params}`);
      return response.data;
    },
  });
};

export const useCreateMealPlanFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, customizations }: { templateId: number; customizations?: Record<string, any> }) => {
      const response = await api.post(`/meal-plans/templates/${templateId}/use`, customizations);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate meal plans list to show new plan
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
};

// Utility functions
export const getMealPlanProgress = (mealPlan: MealPlan): number => {
  if (!mealPlan.days || mealPlan.days.length === 0) return 0;
  
  const completedDays = mealPlan.days.filter(day => day.status === 'completed').length;
  return (completedDays / mealPlan.days.length) * 100;
};

export const getMealPlanDuration = (mealPlan: MealPlan): number => {
  const startDate = new Date(mealPlan.start_date);
  const endDate = new Date(mealPlan.end_date);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export const getTotalMealPlanCalories = (mealPlan: MealPlan): number => {
  if (!mealPlan.days) return 0;
  
  return mealPlan.days.reduce((total, day) => {
    return total + day.meals.reduce((dayTotal, meal) => {
      return dayTotal + (meal.recipe?.calories_per_serving || 0) * (meal.servings || 1);
    }, 0);
  }, 0);
};

export const getMealPlanCostEstimate = (mealPlan: MealPlan): number => {
  // Simple estimation based on family size and duration
  const duration = getMealPlanDuration(mealPlan);
  const familySize = mealPlan.family_size || 1;
  const avgCostPerPersonPerDay = 12; // $12 per person per day estimate
  
  return duration * familySize * avgCostPerPersonPerDay;
};