/**
 * Unit Tests for ShoppingListGenerator Component
 * Tests the shopping list generation from meal plans
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShoppingListGenerator } from '@/components/shopping/ShoppingListGenerator'

// Mock data
const mockMealPlan = {
  id: 'meal-plan-123',
  name: 'Healthy 7-Day Quest',
  durationDays: 7,
  targetCalories: 2000,
  status: 'active' as const,
  createdAt: '2025-01-16T10:00:00Z',
  meals: [
    {
      id: 'meal-1',
      recipeId: 'recipe-1',
      recipeTitle: 'Vegetarian Pasta',
      mealType: 'dinner',
      day: 1,
      servings: 4
    },
    {
      id: 'meal-2', 
      recipeId: 'recipe-2',
      recipeTitle: 'Garden Salad',
      mealType: 'lunch',
      day: 2,
      servings: 2
    }
  ]
}

const mockGenerateShoppingList = vi.fn()
const mockMealPlans = [mockMealPlan]

// Mock the APIs
vi.mock('@/services/shoppingListApi', () => ({
  useGenerateShoppingList: () => ({
    mutate: mockGenerateShoppingList,
    isLoading: false,
    error: null
  })
}))

vi.mock('@/services/mealPlanningApi', () => ({
  useMealPlans: () => ({
    data: mockMealPlans,
    isLoading: false,
    error: null
  })
}))

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('ShoppingListGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders meal plan selection', () => {
    renderWithQueryClient(<ShoppingListGenerator />)

    expect(screen.getByText(/generate shopping list/i)).toBeInTheDocument()
    expect(screen.getByText(/select a meal plan/i)).toBeInTheDocument()
    
    // Should show available meal plans
    expect(screen.getByText('Healthy 7-Day Quest')).toBeInTheDocument()
    expect(screen.getByText('7 days')).toBeInTheDocument()
    expect(screen.getByText('2 meals')).toBeInTheDocument()
  })

  it('allows selecting a meal plan', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    expect(mealPlanCard).toHaveClass('selected', 'border-blue-500')
  })

  it('shows generation options when meal plan selected', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    // Should show options
    expect(screen.getByText(/generation options/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/shopping list name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ai enhancement/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/optimization level/i)).toBeInTheDocument()
  })

  it('generates shopping list with default options', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    // Click generate button
    const generateButton = screen.getByRole('button', { name: /generate shopping list/i })
    await user.click(generateButton)

    expect(mockGenerateShoppingList).toHaveBeenCalledWith({
      mealPlanId: 'meal-plan-123',
      name: 'Healthy 7-Day Quest Shopping List',
      useAiEnhancement: true,
      optimizationLevel: 'standard'
    })
  })

  it('generates shopping list with custom options', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    // Customize options
    const nameInput = screen.getByLabelText(/shopping list name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Custom Weekly List')

    const aiToggle = screen.getByLabelText(/ai enhancement/i)
    await user.click(aiToggle) // Turn off AI

    const optimizationSelect = screen.getByLabelText(/optimization level/i)
    await user.selectOptions(optimizationSelect, 'basic')

    // Generate
    const generateButton = screen.getByRole('button', { name: /generate shopping list/i })
    await user.click(generateButton)

    expect(mockGenerateShoppingList).toHaveBeenCalledWith({
      mealPlanId: 'meal-plan-123',
      name: 'Custom Weekly List',
      useAiEnhancement: false,
      optimizationLevel: 'basic'
    })
  })

  it('shows AI enhancement benefits', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    // AI enhancement should be enabled by default and show benefits
    expect(screen.getByText(/95%\+ categorization accuracy/i)).toBeInTheDocument()
    expect(screen.getByText(/smart ingredient cleaning/i)).toBeInTheDocument()
    expect(screen.getByText(/quantity optimization/i)).toBeInTheDocument()
  })

  it('shows optimization level descriptions', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    const optimizationSelect = screen.getByLabelText(/optimization level/i)
    
    // Should show standard as default for premium user
    expect(optimizationSelect).toHaveValue('standard')
    
    // Check descriptions
    expect(screen.getByText(/balanced performance and cost/i)).toBeInTheDocument()
  })

  it('shows meal plan preview', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    // Should show meal preview
    expect(screen.getByText(/meal plan preview/i)).toBeInTheDocument()
    expect(screen.getByText('Vegetarian Pasta')).toBeInTheDocument()
    expect(screen.getByText('Garden Salad')).toBeInTheDocument()
    expect(screen.getByText('Day 1 • Dinner')).toBeInTheDocument()
    expect(screen.getByText('Day 2 • Lunch')).toBeInTheDocument()
  })

  it('handles generation loading state', async () => {
    const user = userEvent.setup()
    
    // Mock loading state
    vi.mocked(mockGenerateShoppingList).mockImplementation(() => {
      // Simulate loading
    })
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan and generate
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    const generateButton = screen.getByRole('button', { name: /generate shopping list/i })
    await user.click(generateButton)

    // Should show loading state
    expect(screen.getByText(/generating/i)).toBeInTheDocument()
    expect(generateButton).toBeDisabled()
  })

  it('shows generation progress for AI enhancement', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    // Generate with AI
    const generateButton = screen.getByRole('button', { name: /generate shopping list/i })
    await user.click(generateButton)

    // Should show AI progress steps
    await waitFor(() => {
      expect(screen.getByText(/extracting ingredients/i)).toBeInTheDocument()
    })
  })

  it('handles generation errors', () => {
    // Mock error state
    vi.mock('@/services/shoppingListApi', () => ({
      useGenerateShoppingList: () => ({
        mutate: mockGenerateShoppingList,
        isLoading: false,
        error: { message: 'Failed to generate shopping list' }
      })
    }))
    
    renderWithQueryClient(<ShoppingListGenerator />)

    expect(screen.getByText(/failed to generate shopping list/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('shows empty state when no meal plans', () => {
    // Mock empty meal plans
    vi.mock('@/services/mealPlanningApi', () => ({
      useMealPlans: () => ({
        data: [],
        isLoading: false,
        error: null
      })
    }))
    
    renderWithQueryClient(<ShoppingListGenerator />)

    expect(screen.getByText(/no meal plans found/i)).toBeInTheDocument()
    expect(screen.getByText(/create a meal plan first/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create meal plan/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    // Clear name field
    const nameInput = screen.getByLabelText(/shopping list name/i)
    await user.clear(nameInput)

    // Try to generate
    const generateButton = screen.getByRole('button', { name: /generate shopping list/i })
    await user.click(generateButton)

    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(mockGenerateShoppingList).not.toHaveBeenCalled()
  })

  it('shows dietary compliance information', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Select meal plan
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    await user.click(mealPlanCard!)

    // Should show dietary info
    expect(screen.getByText(/dietary restrictions/i)).toBeInTheDocument()
    expect(screen.getByText(/vegetarian/i)).toBeInTheDocument()
    expect(screen.getByText(/all recipes will comply/i)).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(<ShoppingListGenerator />)

    // Tab to first meal plan
    await user.keyboard('{Tab}')
    
    const mealPlanCard = screen.getByText('Healthy 7-Day Quest').closest('[data-testid="meal-plan-card"]')
    expect(mealPlanCard).toHaveFocus()

    // Enter to select
    await user.keyboard('{Enter}')
    expect(mealPlanCard).toHaveClass('selected')

    // Tab to generate button
    await user.keyboard('{Tab}{Tab}{Tab}{Tab}') // Skip through options
    
    const generateButton = screen.getByRole('button', { name: /generate shopping list/i })
    expect(generateButton).toHaveFocus()

    // Enter to generate
    await user.keyboard('{Enter}')
    expect(mockGenerateShoppingList).toHaveBeenCalled()
  })
})
