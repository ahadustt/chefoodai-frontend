// Core type definitions for ChefoodAI™

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  subscription: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  dietaryRestrictions: DietaryRestriction[];
  cuisinePreferences: string[];
  allergies: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  servingSize: number;
  mealPlanningEnabled: boolean;
}

export enum DietaryRestriction {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  KETO = 'keto',
  PALEO = 'paleo',
  HALAL = 'halal',
  KOSHER = 'kosher'
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional'
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  nutrition: NutritionInfo;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  isOptional: boolean;
  substitutes?: string[];
}

export interface Instruction {
  id: string;
  stepNumber: number;
  text: string;
  duration?: number; // minutes
  imageUrl?: string;
  tips?: string[];
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  meals: PlannedMeal[];
  shoppingList: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedMeal {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  servings: number;
  notes?: string;
}

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  category: string;
  isChecked: boolean;
  addedAt: Date;
}

export interface AIRequest {
  prompt: string;
  context?: {
    mealType?: string;
    servingSize?: number;
    maxPrepTime?: number;
    ingredients?: string[];
    excludeIngredients?: string[];
  };
}

export interface AIResponse {
  success: boolean;
  data?: {
    recipes?: Recipe[];
    suggestions?: string[];
    mealPlan?: MealPlan;
  };
  error?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Form types
export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Omit<Ingredient, 'id'>[];
  instructions: Omit<Instruction, 'id'>[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Recipe['difficulty'];
  cuisine: string;
  tags: string[];
}

export interface UserPreferencesFormData {
  dietaryRestrictions: DietaryRestriction[];
  cuisinePreferences: string[];
  allergies: string[];
  cookingSkillLevel: UserPreferences['cookingSkillLevel'];
  servingSize: number;
}