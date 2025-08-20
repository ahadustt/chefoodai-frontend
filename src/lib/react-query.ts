// React Query configuration and custom hooks
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import type { Recipe, User, MealPlan, AIRequest, AIResponse, ApiResponse } from '@/types';
import * as api from '@/services/api';

// Query Keys
export const queryKeys = {
  all: ['chefoodai'] as const,
  auth: () => [...queryKeys.all, 'auth'] as const,
  user: () => [...queryKeys.auth(), 'user'] as const,
  recipes: () => [...queryKeys.all, 'recipes'] as const,
  recipe: (id: string) => [...queryKeys.recipes(), id] as const,
  recipesByCategory: (category: string) => [...queryKeys.recipes(), 'category', category] as const,
  recipeSearch: (query: string) => [...queryKeys.recipes(), 'search', query] as const,
  mealPlans: () => [...queryKeys.all, 'mealPlans'] as const,
  mealPlan: (id: string) => [...queryKeys.mealPlans(), id] as const,
  ai: () => [...queryKeys.all, 'ai'] as const,
  aiSuggestions: (context: AIRequest['context']) => [...queryKeys.ai(), 'suggestions', context] as const,
};

// Custom hooks for authentication
export const useCurrentUser = (options?: UseQueryOptions<User | null>) => {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: api.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useLogin = (
  options?: UseMutationOptions<User, Error, { email: string; password: string }>
) => {
  return useMutation({
    mutationFn: api.login,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user(), user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth() });
    },
    ...options,
  });
};

export const useLogout = (options?: UseMutationOptions<void, Error, void>) => {
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.user(), null);
      queryClient.removeQueries();
    },
    ...options,
  });
};

// Recipe hooks with caching strategies
export const useRecipes = (
  filters?: {
    cuisine?: string;
    difficulty?: string;
    maxPrepTime?: number;
    tags?: string[];
  },
  options?: UseInfiniteQueryOptions<ApiResponse<Recipe[]>>
) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.recipes(), filters],
    queryFn: ({ pageParam = 1 }) => api.getRecipes({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page = 1, limit = 20, total = 0 } = lastPage.meta;
      return page * limit < total ? page + 1 : undefined;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useRecipe = (id: string, options?: UseQueryOptions<Recipe>) => {
  return useQuery({
    queryKey: queryKeys.recipe(id),
    queryFn: () => api.getRecipe(id),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!id,
    ...options,
  });
};

export const useCreateRecipe = (
  options?: UseMutationOptions<Recipe, Error, Partial<Recipe>>
) => {
  return useMutation({
    mutationFn: api.createRecipe,
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes() });
      queryClient.setQueryData(queryKeys.recipe(recipe.id), recipe);
    },
    ...options,
  });
};

export const useUpdateRecipe = (
  options?: UseMutationOptions<Recipe, Error, { id: string; data: Partial<Recipe> }>
) => {
  return useMutation({
    mutationFn: ({ id, data }) => api.updateRecipe(id, data),
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes() });
      queryClient.setQueryData(queryKeys.recipe(recipe.id), recipe);
    },
    ...options,
  });
};

export const useDeleteRecipe = (
  options?: UseMutationOptions<void, Error, string>
) => {
  return useMutation({
    mutationFn: api.deleteRecipe,
    onSuccess: (_, recipeId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes() });
      queryClient.removeQueries({ queryKey: queryKeys.recipe(recipeId) });
    },
    ...options,
  });
};

// AI-powered features
export const useAIRecipeSuggestions = (
  request: AIRequest,
  options?: UseQueryOptions<AIResponse>
) => {
  return useQuery({
    queryKey: queryKeys.aiSuggestions(request.context),
    queryFn: () => api.getAISuggestions(request),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!request.prompt,
    ...options,
  });
};

export const useGenerateRecipe = (
  options?: UseMutationOptions<Recipe, Error, AIRequest>
) => {
  return useMutation({
    mutationFn: api.generateRecipe,
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes() });
      queryClient.setQueryData(queryKeys.recipe(recipe.id), recipe);
    },
    ...options,
  });
};

// Meal planning hooks
export const useMealPlans = (
  options?: UseQueryOptions<MealPlan[]>
) => {
  return useQuery({
    queryKey: queryKeys.mealPlans(),
    queryFn: api.getMealPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useMealPlan = (
  id: string,
  options?: UseQueryOptions<MealPlan>
) => {
  return useQuery({
    queryKey: queryKeys.mealPlan(id),
    queryFn: () => api.getMealPlan(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!id,
    ...options,
  });
};

export const useCreateMealPlan = (
  options?: UseMutationOptions<MealPlan, Error, Partial<MealPlan>>
) => {
  return useMutation({
    mutationFn: api.createMealPlan,
    onSuccess: (mealPlan) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans() });
      queryClient.setQueryData(queryKeys.mealPlan(mealPlan.id), mealPlan);
    },
    ...options,
  });
};

export const useGenerateMealPlan = (
  options?: UseMutationOptions<MealPlan, Error, {
    startDate: Date;
    endDate: Date;
    preferences?: Partial<AIRequest['context']>;
  }>
) => {
  return useMutation({
    mutationFn: api.generateMealPlan,
    onSuccess: (mealPlan) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans() });
      queryClient.setQueryData(queryKeys.mealPlan(mealPlan.id), mealPlan);
    },
    ...options,
  });
};

// Optimistic updates example
export const useToggleFavorite = (
  options?: UseMutationOptions<void, Error, { recipeId: string; isFavorite: boolean }>
) => {
  return useMutation({
    mutationFn: ({ recipeId, isFavorite }) => 
      api.updateRecipe(recipeId, { isFavorite }),
    onMutate: async ({ recipeId, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.recipe(recipeId) });
      
      // Snapshot previous value
      const previousRecipe = queryClient.getQueryData<Recipe>(queryKeys.recipe(recipeId));
      
      // Optimistically update
      if (previousRecipe) {
        queryClient.setQueryData(queryKeys.recipe(recipeId), {
          ...previousRecipe,
          isFavorite,
        });
      }
      
      return { previousRecipe };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRecipe) {
        queryClient.setQueryData(
          queryKeys.recipe(variables.recipeId),
          context.previousRecipe
        );
      }
    },
    onSettled: (_, __, { recipeId }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.recipe(recipeId) });
    },
    ...options,
  });
};

// Prefetching utilities
export const prefetchRecipe = async (id: string) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.recipe(id),
    queryFn: () => api.getRecipe(id),
    staleTime: 15 * 60 * 1000,
  });
};

export const prefetchRecipes = async (filters?: Parameters<typeof useRecipes>[0]) => {
  await queryClient.prefetchInfiniteQuery({
    queryKey: [...queryKeys.recipes(), filters],
    queryFn: ({ pageParam = 1 }) => api.getRecipes({ ...filters, page: pageParam }),
    staleTime: 10 * 60 * 1000,
    pages: 1,
  });
};