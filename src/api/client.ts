import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://chefoodai-backend-mpsrniojta-uc.a.run.app';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 600000, // 10 minutes for complex meal plan generation operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'chefoodai_token';
const REFRESH_TOKEN_KEY = 'chefoodai_refresh_token';

export const tokenManager = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.clearTokens();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    // Let individual API methods handle their own errors instead of showing generic toasts
    return Promise.reject(error);
  }
);

// API types - Updated to match backend expectations
export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_id: string;
  created_at: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface DeleteAccountRequest {
  password: string;
  confirmation: string;
}

export interface UserDataExport {
  profile: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
    updated_at: string;
    organization_name: string;
  };
  preferences: Record<string, string>;
  dietary_restrictions: Array<{
    name: string;
    category: string;
  }>;
  recipes: Array<{
    id: string;
    title: string;
    description: string;
    instructions: string;
    cooking_time: number;
    servings: number;
    cuisine_type: string;
    difficulty_level: string;
    created_at: string;
  }>;
  meal_plans: Array<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
  }>;
  export_date: string;
  export_format_version: string;
}

export interface RecipeGenerateRequest {
  ingredients: string[];
  cuisine?: string;
  difficulty?: string;
  dietary_restrictions?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface CompleteRecipe {
  id: string;
  title: string;
  description: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  difficulty_level: string;
  cuisine_type: string;
  calories_per_serving: number;
  chef_tips: string;
  wine_pairing: string;
  nutrition_highlights: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
  } | null;
  nutrition_info: any;
  image_url: string;
  ingredient_images: Record<string, string>;
  ai_generated: boolean;
  created_at: string;
}

// Recipe API functions
export const recipeApi = {
  getCompleteRecipe: async (recipeId: string): Promise<CompleteRecipe> => {
    const response = await apiClient.get(`/api/v1/recipes/${recipeId}/complete`);
    return response.data;
  }
};