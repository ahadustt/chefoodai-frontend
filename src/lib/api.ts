/**
 * ChefoodAI™ API Client
 * Axios-based API client with authentication, error handling, and interceptors
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { apiClient } from '@/api/client'

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://chefoodai-backend-1074761757006.us-central1.run.app'
  : '' // Use relative URLs in development to leverage Vite proxy

const AI_SERVICE_URL = 'https://chefoodai-ai-service-mpsrniojta-uc.a.run.app'

const API_TIMEOUT = 60000 // 60 seconds for AI calls

// Extend AxiosRequestConfig to include metadata
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: { startTime: Date }
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'chefoodai_token'
  private static readonly REFRESH_TOKEN_KEY = 'chefoodai_refresh_token'
  private static readonly USER_KEY = 'chefoodai_user'

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
  }

  static getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY)
    if (!user || user === 'undefined' || user === 'null') {
      return null
    }
    try {
      return JSON.parse(user)
    } catch (error) {
      console.warn('Failed to parse user data from localStorage:', error)
      // Clear invalid data
      localStorage.removeItem(this.USER_KEY)
      return null
    }
  }

  static setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  static cleanupInvalidTokens(): void {
    // Clean up any corrupted localStorage data
    const keys = [this.TOKEN_KEY, this.REFRESH_TOKEN_KEY, this.USER_KEY]
    keys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value === 'undefined' || value === 'null') {
        localStorage.removeItem(key)
      }
    })
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }
}

// Error types
export interface APIError {
  message: string
  code?: string
  status?: number
  details?: any
}

// API Response types
export interface APIResponse<T = any> {
  data: T
  message?: string
  status: 'success' | 'error'
  meta?: {
    total?: number
    page?: number
    limit?: number
    has_next?: boolean
    has_prev?: boolean
  }
}

// User types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  organization_id: string
  avatar_url?: string
  dietary_preferences?: string[]
  favorite_cuisines?: string[]
  cooking_skill_level?: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
  subscription_plan?: string
}

export interface LoginRequest {
  email: string
  password: string
  remember_me?: boolean
}

// Update the RegisterRequest interface to match backend expectations
export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  password: string
  organization_name?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

// Recipe types (enhanced from previous)
export interface RecipeRequest {
  ingredients?: string[]
  dietary_restrictions?: string[]
  cuisine_type?: string
  cooking_time?: number
  servings?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
  description?: string
  user_preferences?: {
    spice_level?: 'mild' | 'medium' | 'hot'
    cooking_method?: string[]
    allergens_to_avoid?: string[]
  }
  include_images?: boolean
  generate_ingredient_images?: boolean
}

export interface Recipe {
  id?: string
  title: string
  description: string
  ingredients: string[] | Array<{name: string, quantity?: number, preparation_notes?: string}>
  instructions: string[] | Array<{step_number: number, instruction: string, time_minutes?: number}>
  prep_time: number
  cook_time: number
  servings: number
  difficulty: string
  cuisine_type: string
  meal_type?: string
  tags?: string[]
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber?: number
    sugar?: number
  }
  ai_generated: boolean
  fallback_used: boolean
  image_url?: string
  ingredient_images?: Record<string, string>
  chef_tips?: string[] | string
}

export interface SavedRecipe extends Recipe {
  saved_at: string
  personal_notes?: string
  modifications?: string[]
  times_cooked?: number
  last_cooked?: string
}

export interface GenerateRecipeResponse {
  success: boolean
  recipe?: Recipe
  error?: string
  ai_generated: boolean
  fallback_used: boolean
}

// Use the imported apiClient from api/client.ts instead of creating our own

// Authentication API
export class AuthAPI {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials)
    const authData = response.data
    
    TokenManager.setToken(authData.access_token)
    TokenManager.setRefreshToken(authData.refresh_token)
    TokenManager.setUser(authData.user)
    
    return authData
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', userData)
    const authData = response.data
    
    TokenManager.setToken(authData.access_token)
    TokenManager.setRefreshToken(authData.refresh_token)
    TokenManager.setUser(authData.user)
    
    return authData
  }

  static async logout(): Promise<void> {
    try {
      // Backend doesn't have logout endpoint yet, so just clear tokens
      // await apiClient.post('/api/v1/auth/logout')
      console.log('Logging out user - clearing local tokens')
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      TokenManager.clearTokens()
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/v1/auth/forgot-password', { email })
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/api/v1/auth/reset-password', { token, password })
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<APIResponse<User>>('/api/v1/users/me')
      const user = response.data.data || response.data
      TokenManager.setUser(user)
      return user
    } catch (error: any) {
      // Suppress console errors for 404 since we handle this gracefully in AuthContext
      if (error?.response?.status === 404) {
        throw { 
          message: 'User endpoint not available', 
          status: 404, 
          code: 'USER_ENDPOINT_NOT_FOUND',
          details: { endpoint: '/users/me' }
        }
      }
      throw error
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken
    })
    
    const authData = response.data
    TokenManager.setToken(authData.access_token)
    TokenManager.setRefreshToken(authData.refresh_token)
    TokenManager.setUser(authData.user)
    
    return authData
  }
}

// User API
export class UserAPI {
  static async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<APIResponse<User>>('/api/v1/users/profile', userData)
    const user = response.data.data || response.data
    TokenManager.setUser(user)
    return user
  }

  static async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<APIResponse<{ avatar_url: string }>>(
      '/api/v1/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data.data || response.data
  }

  static async updatePreferences(preferences: {
    dietary_preferences?: string[]
    favorite_cuisines?: string[]
    cooking_skill_level?: string
  }): Promise<User> {
    const response = await apiClient.put<APIResponse<User>>(
      '/api/v1/users/preferences',
      preferences
    )
    const user = response.data.data || response.data
    TokenManager.setUser(user)
    return user
  }
}

// Recipe API (Enhanced)
export class RecipeAPI {
    // AI Recipe Generation (existing functionality)
  static async generateRecipe(request: RecipeRequest): Promise<GenerateRecipeResponse> {
    try {
      // Transform the structured request into a prompt that the AI service expects
      const prompt = RecipeAPI.buildRecipePrompt(request)
      
      // Build the request payload with image options
      const requestPayload = {
        prompt,
        include_images: request.include_images || false,
        generate_ingredient_images: request.generate_ingredient_images || false,
      }
      
      console.log('🎨 API sending request with image options:', requestPayload)
      
      // Use the optimized Redis-cached endpoint for best performance
      const response = await apiClient.post<GenerateRecipeResponse>('/api/v1/ai/recipe/generate-optimized', requestPayload)
      
      // Handle the response based on whether it's from AI service or backend
      if (response.data.success) {
        return response.data
      } else {
        // Handle any other backend response
        return response.data
      }
        
      return response.data
    } catch (error) {
      console.error('Error generating recipe:', error)
      
      // If main backend fails, provide helpful guidance
      if (axios.isAxiosError(error)) {
        // Check if it's a CORS error or 422 backend integration issue
        if (error.response?.status === 422 || error.message.includes('CORS')) {
          return {
            success: false,
            error: "AI service is available but requires backend integration for CORS support. Please contact the development team to enable the AI recipe generation feature.",
            ai_generated: false,
            fallback_used: true,
          }
        }
        
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message
        
        return {
          success: false,
          error: errorMessage,
          ai_generated: false,
          fallback_used: false,
        }
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
        ai_generated: false,
        fallback_used: false,
      }
    }
  }

  // Helper method to build a natural language prompt from structured request
  static buildRecipePrompt(request: RecipeRequest): string {
    const parts: string[] = []
    
    // Start with description if provided
    if (request.description && request.description.trim()) {
      parts.push(request.description.trim())
    } else {
      parts.push("Create a recipe")
    }
    
    // Add meal type
    if (request.meal_type) {
      parts.push(`for ${request.meal_type}`)
    }
    
    // Add cuisine type
    if (request.cuisine_type && request.cuisine_type.trim()) {
      parts.push(`in ${request.cuisine_type} style`)
    }
    
    // Add dietary restrictions
    if (request.dietary_restrictions && request.dietary_restrictions.length > 0) {
      parts.push(`that is ${request.dietary_restrictions.join(' and ')}`)
    }
    
    // Add servings
    if (request.servings && request.servings > 1) {
      parts.push(`for ${request.servings} people`)
    }
    
    // Add cooking time constraint
    if (request.cooking_time && request.cooking_time > 0) {
      parts.push(`that takes about ${request.cooking_time} minutes to cook`)
    }
    
    // Add difficulty
    if (request.difficulty) {
      parts.push(`with ${request.difficulty} difficulty level`)
    }
    
    // Add specific ingredients if provided
    if (request.ingredients && request.ingredients.length > 0) {
      parts.push(`using ingredients like: ${request.ingredients.join(', ')}`)
    }
    
    return parts.join(' ')
  }

  static async tryAIServiceWithFallback(prompt: string, include_images?: boolean, generate_ingredient_images?: boolean): Promise<AxiosResponse<GenerateRecipeResponse>> {
    try {
      // Build the request payload with image options
      const requestPayload = {
        prompt,
        include_images: include_images || false,
        generate_ingredient_images: generate_ingredient_images || false,
      }
      
      // Try the AI service directly for highest quality
      const aiResponse = await axios.post<GenerateRecipeResponse>(
        `${AI_SERVICE_URL}/api/v1/generate-recipe`, 
        requestPayload,
        { timeout: 30000 }
      )
      return aiResponse
    } catch (error) {
      // Fallback to optimized backend endpoint if AI service fails
      console.log('AI service unavailable, using optimized backend fallback')
      return await apiClient.post<GenerateRecipeResponse>('/api/v1/ai/recipe/generate-optimized', { 
        prompt,
        include_images: include_images || false,
        generate_ingredient_images: generate_ingredient_images || false,
      })
    }
  }

  // Recipe Management
  static async getRecipes(params?: {
    page?: number
    limit?: number
    search?: string
    cuisine_type?: string
    difficulty?: string
    meal_type?: string
    dietary_restrictions?: string[]
    max_cooking_time?: number
    tags?: string[]
    sort_by?: 'created_at' | 'rating' | 'cook_time' | 'difficulty'
    sort_order?: 'asc' | 'desc'
  }): Promise<APIResponse<Recipe[]>> {
    const response = await apiClient.get<APIResponse<Recipe[]>>('/api/v1/recipes', { params })
    return response.data
  }

  static async getRecipe(id: string): Promise<Recipe> {
    const response = await apiClient.get<APIResponse<Recipe>>(`/api/v1/recipes/${id}`)
    return response.data.data || response.data
  }

  static async saveRecipe(recipe: Recipe, personalNotes?: string): Promise<SavedRecipe> {
    const response = await apiClient.post<SavedRecipe>('/api/v1/recipes', {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prep_time_minutes: recipe.prep_time, // Fixed field name
      cook_time_minutes: recipe.cook_time, // Fixed field name
      servings: recipe.servings,
      cuisine_type: recipe.cuisine_type,
      dietary_restrictions: recipe.tags || [],
      difficulty_level: recipe.difficulty, // Fixed field name
      image_url: recipe.image_url,
      ingredient_images: recipe.ingredient_images
      // Removed fields not supported by production backend:
      // meal_type, ai_generated, fallback_used
    })
    return {
      ...response.data,
      saved_at: response.data.created_at || new Date().toISOString(),
      personal_notes: personalNotes,
      times_cooked: 0
    }
  }

  static async getSavedRecipes(params?: {
    page?: number
    limit?: number
    search?: string
    cuisine_type?: string
    tags?: string[]
  }): Promise<APIResponse<SavedRecipe[]>> {
    try {
      const skip = ((params?.page || 1) - 1) * (params?.limit || 10)
      const queryParams = {
        skip,
        limit: params?.limit || 10,
        ...(params?.search && { search: params.search }),
        ...(params?.cuisine_type && { cuisine_type: params.cuisine_type })
      }
      
      const response = await apiClient.get<SavedRecipe[]>('/api/v1/recipes', { params: queryParams })
      
      // Transform backend response to match frontend expectations
      const recipes = Array.isArray(response.data) ? response.data : []
      const savedRecipes: SavedRecipe[] = recipes.map(recipe => ({
        ...recipe,
        saved_at: recipe.created_at || new Date().toISOString(),
        times_cooked: 0
      }))
      
      return {
        data: savedRecipes,
        status: 'success',
        meta: {
          total: savedRecipes.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
          has_next: savedRecipes.length === (params?.limit || 10),
          has_prev: (params?.page || 1) > 1
        }
      }
    } catch (error) {
      console.warn('getSavedRecipes: API error:', error)
      return {
        data: [],
        status: 'error',
        meta: { total: 0, page: 1, limit: 10, has_next: false, has_prev: false }
      }
    }
  }

  static async updateSavedRecipe(id: string, updates: {
    personal_notes?: string
    modifications?: string[]
    rating?: number
  }): Promise<SavedRecipe> {
    const response = await apiClient.put<SavedRecipe>(`/api/v1/recipes/${id}`, updates)
    return response.data
  }

  static async deleteSavedRecipe(id: string): Promise<{
    message: string,
    impact_summary?: {
      affected_meal_plans: string[],
      removed_meals_count: number,
      meal_plans_updated: number
    }
  }> {
    try {
      // Try to convert string ID to number if it looks like a number
      let recipeId = id;
      if (/^\d+$/.test(id)) {
        // If it's a numeric string, use it as is
        recipeId = id;
      } else if (id.includes('-')) {
        // If it's a UUID, we might need different handling
        console.warn('⚠️ Attempting to delete UUID-format recipe ID:', id);
        recipeId = id;
      }
      
      console.log('🔥 Deleting recipe with enhanced meal plan updates:', recipeId);
      
      // Use the enhanced deletion endpoint that handles meal plan updates
      try {
        const response = await apiClient.delete(
          `/api/v1/meal-plans/recipes/${recipeId}/with-meal-plan-updates`
        );
        
        if (response.data.impact_summary?.removed_meals_count > 0) {
          console.log(`📊 Enhanced deletion impact:`, {
            affected_meal_plans: response.data.impact_summary.affected_meal_plans,
            removed_meals: response.data.impact_summary.removed_meals_count,
            updated_plans: response.data.impact_summary.meal_plans_updated
          });
        }
        
        return response.data;
        
      } catch (enhancedError) {
        console.warn('⚠️ Enhanced deletion failed, falling back to standard deletion:', enhancedError);
        
        // Fallback to standard recipe deletion
        await apiClient.delete(`/api/v1/recipes/${recipeId}`);
        console.log('✅ Recipe deleted successfully (standard method)');
        
        return {
          message: 'Recipe deleted successfully',
          impact_summary: {
            affected_meal_plans: [],
            removed_meals_count: 0,
            meal_plans_updated: 0
          }
        };
      }
      
    } catch (error: any) {
      console.error('❌ Delete API call failed:', {
        id,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  // Alias for backward compatibility
  static async deleteRecipe(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/recipes/${id}`)
  }

  static async favoriteRecipe(id: string): Promise<void> {
    await apiClient.post(`/api/v1/recipes/${id}/favorite`)
  }

  static async unfavoriteRecipe(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/recipes/${id}/favorite`)
  }

  static async getFavorites(params?: { page?: number; limit?: number }): Promise<APIResponse<Recipe[]>> {
    try {
      // The backend doesn't have a /favorites endpoint yet, so provide mock data
      const skip = (params?.page || 1 - 1) * (params?.limit || 10)
      const queryParams = {
        skip,
        limit: params?.limit || 10
      }
      
      // Try to get recipes from the main endpoint
      const response = await apiClient.get<Recipe[]>('/api/v1/recipes', { params: queryParams })
      
      // For now, return empty data with proper structure
      return {
        data: [],
        status: 'success',
        meta: {
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          has_next: false,
          has_prev: false
        }
      }
    } catch (error) {
      console.warn('getFavorites: Using fallback data due to API error:', error)
      return {
        data: [],
        status: 'success',
        meta: { total: 0, page: 1, limit: 10, has_next: false, has_prev: false }
      }
    }
  }

  static async rateRecipe(id: string, rating: number): Promise<void> {
    await apiClient.post(`/api/v1/recipes/${id}/rate`, { rating })
  }

  static async markAsCooked(id: string): Promise<void> {
    await apiClient.post(`/api/v1/recipes/saved/${id}/cooked`)
  }
}

// Health check (existing functionality)
export const checkBackendHealth = async (): Promise<{ status: string; ai_connected: boolean }> => {
  try {
    const response = await apiClient.get('/health')
    // Mock AI connection as true for now since WebSocket is disabled
    const healthData = response.data
    return {
      status: healthData.status || 'healthy',
      ai_connected: true  // Mock as connected for UI
    }
  } catch (error) {
    console.error('Backend health check failed:', error)
    return { status: 'error', ai_connected: false }
  }
}

// Utility functions
export const isAuthenticated = (): boolean => {
  const token = TokenManager.getToken()
  return token !== null && !TokenManager.isTokenExpired(token)
}

export const getCurrentUser = (): User | null => {
  return TokenManager.getUser()
}

export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = TokenManager.getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Backward compatibility exports
export const generateRecipe = RecipeAPI.generateRecipe
export { TokenManager }

export default apiClient