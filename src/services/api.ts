// API service layer with axios and error handling
import axios, { AxiosError, AxiosResponse } from 'axios';
import type { 
  User, 
  Recipe, 
  MealPlan, 
  AIRequest, 
  AIResponse, 
  ApiResponse,
  RecipeFormData 
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access denied');
    } else if (error.response?.status >= 500) {
      // Server errors - show generic error
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const login = async (credentials: { 
  email: string; 
  password: string; 
}): Promise<User> => {
  const response = await api.post<ApiResponse<{ user: User; token: string }>>(
    '/auth/login', 
    credentials
  );
  
  // Store token for future requests
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
  }
  
  return response.data.user;
};

export const register = async (userData: {
  email: string;
  password: string;
  name: string;
}): Promise<User> => {
  const response = await api.post<ApiResponse<{ user: User; token: string }>>(
    '/auth/register',
    userData
  );
  
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
  }
  
  return response.data.user;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
  localStorage.removeItem('auth_token');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data || null;
  } catch (error) {
    // If token is invalid, clear it
    localStorage.removeItem('auth_token');
    return null;
  }
};

// Recipe API
export const getRecipes = async (params?: {
  page?: number;
  limit?: number;
  cuisine?: string;
  difficulty?: string;
  maxPrepTime?: number;
  tags?: string[];
  search?: string;
}): Promise<ApiResponse<Recipe[]>> => {
  const response = await api.get<ApiResponse<Recipe[]>>('/recipes', { params });
  return response;
};

export const getRecipe = async (id: string): Promise<Recipe> => {
  const response = await api.get<ApiResponse<Recipe>>(`/recipes/${id}`);
  return response.data!;
};

export const createRecipe = async (recipeData: Partial<Recipe>): Promise<Recipe> => {
  const response = await api.post<ApiResponse<Recipe>>('/recipes', recipeData);
  return response.data!;
};

export const updateRecipe = async (
  id: string, 
  recipeData: Partial<Recipe>
): Promise<Recipe> => {
  const response = await api.put<ApiResponse<Recipe>>(`/recipes/${id}`, recipeData);
  return response.data!;
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await api.delete(`/recipes/${id}`);
};

export const searchRecipes = async (query: string, filters?: {
  cuisine?: string;
  difficulty?: string;
  maxPrepTime?: number;
}): Promise<Recipe[]> => {
  const response = await api.get<ApiResponse<Recipe[]>>('/recipes/search', {
    params: { q: query, ...filters }
  });
  return response.data || [];
};

// AI-powered features
export const getAISuggestions = async (request: AIRequest): Promise<AIResponse> => {
  const response = await api.post<AIResponse>('/ai/suggestions', request);
  return response;
};

export const generateRecipe = async (request: AIRequest): Promise<Recipe> => {
  const response = await api.post<ApiResponse<Recipe>>('/api/v1/ai/recipe/generate-optimized', request);
  return response.data!;
};

export const generateMealPlan = async (params: {
  startDate: Date;
  endDate: Date;
  preferences?: Partial<AIRequest['context']>;
}): Promise<MealPlan> => {
  // Use the blazing-fast endpoint that actually stores recipes in the database
  const response = await api.post<ApiResponse<MealPlan>>('/api/v1/meal-plans/blazing-fast', params);
  return response.data!;
};

// Meal Planning API
export const getMealPlans = async (): Promise<MealPlan[]> => {
  const response = await api.get<ApiResponse<MealPlan[]>>('/meal-plans');
  return response.data || [];
};

export const getMealPlan = async (id: string): Promise<MealPlan> => {
  const response = await api.get<ApiResponse<MealPlan>>(`/meal-plans/${id}`);
  return response.data!;
};

export const createMealPlan = async (mealPlan: Partial<MealPlan>): Promise<MealPlan> => {
  const response = await api.post<ApiResponse<MealPlan>>('/meal-plans', mealPlan);
  return response.data!;
};

export const updateMealPlan = async (
  id: string, 
  mealPlan: Partial<MealPlan>
): Promise<MealPlan> => {
  const response = await api.put<ApiResponse<MealPlan>>(`/meal-plans/${id}`, mealPlan);
  return response.data!;
};

export const deleteMealPlan = async (id: string): Promise<void> => {
  await api.delete(`/meal-plans/${id}`);
};

// User preferences API
export const updateUserPreferences = async (
  preferences: Partial<User['preferences']>
): Promise<User> => {
  const response = await api.put<ApiResponse<User>>('/users/preferences', preferences);
  return response.data!;
};

// File upload API
export const uploadImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post<ApiResponse<{ url: string }>>(
    '/upload/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data!;
};

// Analytics API (for performance monitoring)
export const trackEvent = async (event: {
  name: string;
  properties?: Record<string, any>;
}): Promise<void> => {
  try {
    await api.post('/analytics/track', event);
  } catch (error) {
    // Silently fail analytics to not disrupt user experience
    console.warn('Analytics tracking failed:', error);
  }
};

// Health check API
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await api.get<{ status: string; timestamp: string }>('/health');
  return response;
};

// Export configured axios instance for advanced usage
export { api };

// Error handling utilities
export const isApiError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.response?.data?.error?.message || 
           error.response?.data?.message || 
           error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Request cancellation utilities
export const createCancelToken = () => axios.CancelToken.source();

export const isRequestCancelled = (error: unknown): boolean => {
  return axios.isCancel(error);
};