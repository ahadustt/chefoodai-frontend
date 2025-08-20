import { apiClient, Recipe, RecipeGenerateRequest } from './client';

export const recipesAPI = {
  generate: async (data: RecipeGenerateRequest): Promise<Recipe> => {
    const response = await apiClient.post('/api/v1/ai/recipe/generate-optimized', data);
    return response.data;
  },

  getAll: async (skip = 0, limit = 10) => {
    const response = await apiClient.get('/api/v1/recipes', {
      params: { skip, limit }
    });
    return response.data;
  },

  getById: async (id: string): Promise<Recipe> => {
    const response = await apiClient.get(`/api/v1/recipes/${id}`);
    return response.data;
  },
};