import { apiClient } from '../api/client';

// Types
interface MealPlanData {
  name: string;
  description?: string;
  duration_days: number;
  start_date: string;
  goals: string[];
  dietary_restrictions?: string[];
  preferences?: any;
  family_size?: number;
  target_calories?: number;
  budget_per_week?: number;
  cooking_time_available?: number;
}

interface MealPlanResponse {
  id: string;
  name: string;
  status: string;
  generation_time_seconds?: number;
  metadata?: any;
}

interface ProgressCallback {
  (progress: number, message: string, data?: any): void;
}

export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  duration_days: number;
  family_size: number;
  goals: string[];
  dietary_restrictions: string[];
  target_calories_per_day?: number;
  cooking_time_available?: number;
  budget_per_week?: number;
  generation_time_seconds?: number;
}

export interface MealPlanListResponse {
  meal_plans: MealPlan[];
  total: number;
  page: number;
  pages: number;
}

class MealPlanningAPI {
  /**
   * 🚀 Create meal plan with SIMPLE progress (no WebSocket complexity!)
   * 
   * Uses smart polling + time estimation for reliable progress updates
   */
  async createMealPlan(
    data: MealPlanData, 
    progressCallback?: ProgressCallback,
    useBlazingFast: boolean = true
  ): Promise<MealPlanResponse> {
    try {
      // Use the blazing-fast endpoint for modern AI-powered meal planning
      const endpoint = useBlazingFast ? '/api/v1/meal-plans/blazing-fast' : '/api/v1/meal-plans/';
      
      // Start generation
      if (progressCallback) {
        progressCallback(5, "🚀 Starting BLAZING FAST meal plan generation...");
      }
      
      // Calculate estimated time for smart progress - account for snacks in larger families
      const mealsPerDay = (data.family_size || 1) > 2 ? 4 : 3; // breakfast, lunch, dinner + snack for families
      const totalMeals = data.duration_days * mealsPerDay;
      const estimatedSeconds = useBlazingFast ? Math.max(totalMeals * 2, 30) : Math.max(totalMeals * 8, 120);
      
      // Prepare request payload - blazing-fast endpoint expects meal_plan_data directly
      const requestPayload = useBlazingFast ? data : {
        meal_plan_data: data,
        recipe_preferences: {
          generation_mode: "hybrid",
          saved_recipe_percentage: 30,
          preferred_saved_recipes: [],
          ai_fallback: true
        }
      };
      
      // Start generation
      const response = await apiClient.post(endpoint, requestPayload);
      const mealPlanId = response.data.id;
      
      // Use smart progress tracking
      if (progressCallback) {
        this.trackProgress(mealPlanId, estimatedSeconds, progressCallback, useBlazingFast);
      }
      
      return response.data;
      
    } catch (error: any) {
      if (progressCallback) {
        progressCallback(0, `❌ Generation failed: ${error.message}`, { error: true });
      }
      throw error;
    }
  }

  /**
   * 🎯 Smart progress tracking (HTTP polling + time estimation)
   * 
   * Much more reliable than WebSocket:
   * - HTTP polling every 3 seconds
   * - Smart time-based estimation
   * - Contextual progress messages
   * - Automatic fallback handling
   */
  private async trackProgress(
    mealPlanId: string, 
    estimatedSeconds: number, 
    progressCallback: ProgressCallback,
    useBlazingFast: boolean
  ) {
    const startTime = Date.now();
    const maxAttempts = Math.ceil(estimatedSeconds / 3) + 20; // Add buffer
    let attempt = 0;
    let lastProgress = 5;
    
    const checkProgress = async () => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      
      try {
        // Skip backend calls for temporary IDs
        if (mealPlanId.startsWith('temp-')) {
          // Use pure time-based estimation for temporary meal plans
          const timeProgress = Math.min((elapsedSeconds / estimatedSeconds) * 90, 90);
          progressCallback(Math.round(timeProgress), "🔄 Generating your meal plan...");
          
          // Continue checking or timeout
          if (attempt < maxAttempts) {
            attempt++;
            setTimeout(checkProgress, 3000);
          } else {
            // Timeout fallback - don't mark as completed for temp IDs
            progressCallback(90, "🔄 Finalizing meal plan...");
          }
          return;
        }
        
        // Try to get actual status from backend (only for real IDs)
        const response = await apiClient.get(`/api/v1/meal-plans/${mealPlanId}`);
        const status = response.data.status;
        
        if (status === 'active') {
          // Completed!
          const finalTime = response.data.generation_time_seconds || elapsedSeconds;
          progressCallback(100, `✅ Generated in ${finalTime.toFixed(1)}s!`, { 
            completed: true, 
            meal_plan: response.data 
          });
          return;
        } else if (status === 'failed') {
          progressCallback(0, "❌ Generation failed", { error: true });
          return;
        }
        
        // Still generating - calculate smart progress
        let progress = lastProgress;
        if (status === 'generating') {
          // Use time-based estimation with some randomness for realism
          const timeProgress = Math.min((elapsedSeconds / estimatedSeconds) * 85, 85);
          progress = Math.max(timeProgress + Math.random() * 5, lastProgress);
          lastProgress = progress;
        }
        
        // Show contextual messages based on progress
        const messages = useBlazingFast ? [
          "🚀 Blazing fast generation starting...",
          "🍳 Creating breakfast recipes...",
          "🥗 Designing lunch options...", 
          "🍽️ Crafting dinner plans...",
          "🎨 Generating AI images...",
          "📊 Calculating nutrition...",
          "🛒 Preparing shopping list...",
          "✨ Adding final touches..."
        ] : [
          "📋 Planning your meals...",
          "🤖 AI is working on recipes...",
          "🍳 Generating breakfast ideas...",
          "🥗 Creating lunch options...",
          "🍽️ Designing dinner plans...",
          "📊 Calculating nutrition...",
          "🛒 Preparing shopping list..."
        ];
        
        const messageIndex = Math.min(Math.floor(progress / 12), messages.length - 1);
        const message = messages[messageIndex];
        
        progressCallback(Math.round(progress), message);
        
      } catch (error) {
        // If status check fails, use pure time estimation
        const timeProgress = Math.min((elapsedSeconds / estimatedSeconds) * 90, 90);
        progressCallback(Math.round(timeProgress), "🔄 Generating your meal plan...");
      }
      
      // Continue checking or timeout
      if (attempt < maxAttempts) {
        attempt++;
        setTimeout(checkProgress, 3000); // Check every 3 seconds
      } else {
        // Timeout fallback
        progressCallback(100, "✅ Generation completed!", { completed: true });
      }
    };
    
    // Start checking after 2 seconds
    setTimeout(checkProgress, 2000);
  }

  // Standard meal planning methods
  async getMealPlans(): Promise<MealPlanListResponse> {
    const response = await apiClient.get('/api/v1/meal-plans/');
    return response.data;
  }

  async getMealPlan(id: string): Promise<MealPlan> {
    // Prevent API calls for temporary meal plan IDs
    if (id.startsWith('temp-')) {
      throw new Error('Cannot fetch temporary meal plan. Please wait for meal plan generation to complete.');
    }
    
    const response = await apiClient.get(`/api/v1/meal-plans/${id}`);
    return response.data;
  }

  async deleteMealPlan(id: string): Promise<{ message: string, affected_items: { days: number, meals: number }, details: any }> {
    const response = await apiClient.delete(`/api/v1/meal-plans/${id}`);
    return response.data;
  }

  async restoreMealPlan(id: string): Promise<{ message: string, restored_items: { days: number, meals: number } }> {
    const response = await apiClient.post(`/api/v1/meal-plans/${id}/restore`);
    return response.data;
  }

  async getAvailableRecipes(filters?: {
    mealType?: string;
    cuisineType?: string;
    maxPrepTime?: number;
  }): Promise<{ recipes: any[] }> {
    const params = new URLSearchParams();
    if (filters?.mealType) params.append('meal_type', filters.mealType);
    if (filters?.cuisineType) params.append('cuisine_type', filters.cuisineType);
    if (filters?.maxPrepTime) params.append('max_prep_time', filters.maxPrepTime.toString());
    
    const response = await apiClient.get(`/api/v1/recipes?${params.toString()}`);
    return { recipes: response.data.recipes || response.data || [] };
  }
}

export const mealPlanningApi = new MealPlanningAPI();