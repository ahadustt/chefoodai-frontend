/**
 * ChefoodAI™ React Hooks for AI Services
 * Custom hooks for interacting with premium AI features
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api'

// Types
interface RecipeGenerationRequest {
  prompt: string
  dietary_restrictions?: string[]
  preferences?: {
    cuisine_type?: string
    difficulty?: string
    servings?: number
    prep_time_max?: number
    cooking_skill?: string
    budget_level?: string
    available_equipment?: string[]
  }
}

interface MealPlanRequest {
  days: number
  dietary_restrictions?: string[]
  health_goals?: string[]
  family_size?: number
  budget_per_week?: number
  cooking_time_available?: number
  preferences?: Record<string, any>
}

interface ImageAnalysisRequest {
  file: File
  dietary_restrictions?: string
  analysis_focus?: string
}

interface CookingGuidanceRequest {
  recipe_id?: string
  current_step: number
  question: string
  recipe_data?: Record<string, any>
}

// AI Recipe Generation Hook
export function useAIRecipeGeneration() {
  const queryClient = useQueryClient()

  const generateRecipe = useMutation({
    mutationFn: async (request: RecipeGenerationRequest) => {
      const response = await apiClient.post('/api/v1/ai/recipe/generate-optimized', request)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch recipe-related queries
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] })
      
      toast.success('Recipe generated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail?.error || 'Failed to generate recipe'
      toast.error(message)
    }
  })

  const validateRecipeSafety = useMutation({
    mutationFn: async ({ 
      recipe_content, 
      dietary_restrictions 
    }: { 
      recipe_content: string
      dietary_restrictions?: string[] 
    }) => {
      const response = await apiClient.post('/ai/validate-recipe-safety', {
        recipe_content,
        dietary_restrictions
      })
      return response.data
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail?.error || 'Safety validation failed'
      toast.error(message)
    }
  })

  return {
    generateRecipe: generateRecipe.mutateAsync,
    isGenerating: generateRecipe.isPending,
    generationError: generateRecipe.error,
    validateRecipeSafety: validateRecipeSafety.mutateAsync,
    isValidating: validateRecipeSafety.isPending
  }
}

// AI Image Analysis Hook
export function useAIImageAnalysis() {
  const analyzeImage = useMutation({
    mutationFn: async (request: ImageAnalysisRequest) => {
      const formData = new FormData()
      formData.append('file', request.file)
      if (request.dietary_restrictions) {
        formData.append('dietary_restrictions', request.dietary_restrictions)
      }
      if (request.analysis_focus) {
        formData.append('analysis_focus', request.analysis_focus)
      }

      const response = await apiClient.post('/ai/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Image analyzed successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail?.error || 'Failed to analyze image'
      toast.error(message)
    }
  })

  return {
    analyzeImage: analyzeImage.mutateAsync,
    isAnalyzing: analyzeImage.isPending,
    analysisError: analyzeImage.error,
    analysisResult: analyzeImage.data
  }
}

// AI Meal Planning Hook
export function useAIMealPlanning() {
  const queryClient = useQueryClient()

  const generateMealPlan = useMutation({
    mutationFn: async (request: MealPlanRequest) => {
      const response = await apiClient.post('/ai/generate-meal-plan', request)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] })
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] })
      
      toast.success('Meal plan generated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail?.error || 'Failed to generate meal plan'
      toast.error(message)
    }
  })

  return {
    generateMealPlan: generateMealPlan.mutateAsync,
    isGenerating: generateMealPlan.isPending,
    generationError: generateMealPlan.error,
    mealPlan: generateMealPlan.data
  }
}

// AI Cooking Guidance Hook
export function useAICookingGuidance() {
  const getGuidance = useMutation({
    mutationFn: async (request: CookingGuidanceRequest) => {
      const response = await apiClient.post('/ai/cooking-guidance', request)
      return response.data
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail?.error || 'Failed to get cooking guidance'
      toast.error(message)
    }
  })

  return {
    getGuidance: getGuidance.mutateAsync,
    isGettingGuidance: getGuidance.isPending,
    guidanceError: getGuidance.error
  }
}

// AI Usage Analytics Hook
export function useAIUsageAnalytics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-usage-analytics'],
    queryFn: async () => {
      const response = await apiClient.get('/ai/usage-analytics')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    usage: data?.usage,
    costPrediction: data?.cost_prediction,
    savingsReport: data?.savings_report,
    optimizationTips: data?.optimization_tips,
    isLoading,
    error,
    refetch
  }
}

// AI Service Health Hook
export function useAIServiceHealth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ai-service-health'],
    queryFn: async () => {
      const response = await apiClient.get('/ai/health')
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: 1000
  })

  return {
    status: data?.status,
    modelsAvailable: data?.models_available,
    features: data?.features,
    costOptimization: data?.cost_optimization,
    cacheEnabled: data?.cache_enabled,
    isLoading,
    error,
    isHealthy: data?.status === 'healthy'
  }
}

// Real-time Cooking Guidance Stream Hook
export function useRealTimeCookingGuidance() {
  const [isConnected, setIsConnected] = React.useState(false)
  const [guidance, setGuidance] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)

  const startGuidanceStream = React.useCallback(async (request: CookingGuidanceRequest) => {
    try {
      setIsConnected(true)
      setError(null)
      setGuidance('')

      const response = await fetch('/api/v1/ai/cooking-guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error('Failed to start guidance stream')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsConnected(false)
              return
            }
            
            setGuidance(prev => prev + data)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsConnected(false)
    }
  }, [])

  const stopGuidanceStream = React.useCallback(() => {
    setIsConnected(false)
  }, [])

  return {
    startGuidanceStream,
    stopGuidanceStream,
    guidance,
    isConnected,
    error
  }
}

// Batch Recipe Generation Hook
export function useBatchRecipeGeneration() {
  const queryClient = useQueryClient()

  const generateBatchRecipes = useMutation({
    mutationFn: async (requests: RecipeGenerationRequest[]) => {
      const promises = requests.map(request => 
        apiClient.post('/ai/generate-recipe', request)
      )
      
      const responses = await Promise.allSettled(promises)
      
      return responses.map((response, index) => ({
        index,
        success: response.status === 'fulfilled',
        data: response.status === 'fulfilled' ? response.value.data : null,
        error: response.status === 'rejected' ? response.reason : null
      }))
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length
      const totalCount = results.length
      
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] })
      
      if (successCount === totalCount) {
        toast.success(`All ${totalCount} recipes generated successfully!`)
      } else {
        toast.success(`${successCount}/${totalCount} recipes generated successfully`)
        if (successCount < totalCount) {
          toast.error(`${totalCount - successCount} recipes failed to generate`)
        }
      }
    },
    onError: () => {
      toast.error('Batch recipe generation failed')
    }
  })

  return {
    generateBatchRecipes: generateBatchRecipes.mutateAsync,
    isGenerating: generateBatchRecipes.isPending,
    batchResults: generateBatchRecipes.data
  }
}

// AI Feature Availability Hook
export function useAIFeatures() {
  const { data: healthData } = useAIServiceHealth()
  const { usage } = useAIUsageAnalytics()
  
  const features = React.useMemo(() => {
    const baseFeatures = {
      recipeGeneration: healthData?.features?.recipe_generation || false,
      imageAnalysis: healthData?.features?.image_analysis || false,
      mealPlanning: healthData?.features?.meal_planning || false,
      cookingGuidance: healthData?.features?.cooking_guidance || false,
      safetyValidation: healthData?.features?.safety_validation || false
    }

    // Check usage limits
    const hasRemainingQuota = usage?.daily?.remaining > 0
    
    return {
      ...baseFeatures,
      available: hasRemainingQuota,
      quotaExceeded: !hasRemainingQuota,
      usage
    }
  }, [healthData, usage])

  return features
}