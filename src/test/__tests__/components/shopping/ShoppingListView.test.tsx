/**
 * Unit Tests for ShoppingListView Component
 * Tests the shopping list display and interaction functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShoppingListView } from '@/components/shopping/ShoppingListView'

// Mock data
const mockShoppingList = {
  id: '123',
  name: 'Weekly Groceries',
  status: 'active' as const,
  createdAt: '2025-01-16T10:00:00Z',
  updatedAt: '2025-01-16T10:00:00Z',
  completedAt: null,
  mealPlanId: 'meal-plan-123',
  items: [
    {
      id: 'item-1',
      shoppingListId: '123',
      ingredientName: 'tomatoes',
      quantity: 5,
      unit: 'pieces',
      category: 'produce',
      isPurchased: false,
      notes: null,
      createdAt: '2025-01-16T10:00:00Z'
    },
    {
      id: 'item-2',
      shoppingListId: '123',
      ingredientName: 'pasta',
      quantity: 400,
      unit: 'g',
      category: 'pantry',
      isPurchased: true,
      notes: 'Got whole wheat',
      createdAt: '2025-01-16T10:00:00Z'
    },
    {
      id: 'item-3',
      shoppingListId: '123',
      ingredientName: 'olive oil',
      quantity: 2,
      unit: 'tbsp',
      category: 'pantry',
      isPurchased: false,
      notes: null,
      createdAt: '2025-01-16T10:00:00Z'
    }
  ]
}

const mockUpdateItem = vi.fn()
const mockDeleteItem = vi.fn()

// Mock the shopping list API
vi.mock('@/services/shoppingListApi', () => ({
  useUpdateShoppingListItem: () => ({
    mutate: mockUpdateItem,
    isLoading: false
  }),
  useDeleteShoppingListItem: () => ({
    mutate: mockDeleteItem,
    isLoading: false
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

describe('ShoppingListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders shopping list with items', () => {
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
      />
    )

    // Check header
    expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
    expect(screen.getByText('3 items')).toBeInTheDocument()

    // Check items are rendered
    expect(screen.getByText('tomatoes')).toBeInTheDocument()
    expect(screen.getByText('pasta')).toBeInTheDocument()
    expect(screen.getByText('olive oil')).toBeInTheDocument()

    // Check quantities
    expect(screen.getByText('5 pieces')).toBeInTheDocument()
    expect(screen.getByText('400 g')).toBeInTheDocument()
    expect(screen.getByText('2 tbsp')).toBeInTheDocument()
  })

  it('groups items by category', () => {
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
      />
    )

    // Check category headers
    expect(screen.getByText('Produce')).toBeInTheDocument()
    expect(screen.getByText('Pantry')).toBeInTheDocument()

    // Check items are under correct categories
    const produceSection = screen.getByText('Produce').closest('[data-category="produce"]')
    const pantrySection = screen.getByText('Pantry').closest('[data-category="pantry"]')

    expect(produceSection).toContainElement(screen.getByText('tomatoes'))
    expect(pantrySection).toContainElement(screen.getByText('pasta'))
    expect(pantrySection).toContainElement(screen.getByText('olive oil'))
  })

  it('shows purchased items with strikethrough', () => {
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
      />
    )

    const pastaItem = screen.getByText('pasta').closest('[data-testid="shopping-item"]')
    expect(pastaItem).toHaveClass('line-through', 'opacity-60')

    const tomatoItem = screen.getByText('tomatoes').closest('[data-testid="shopping-item"]')
    expect(tomatoItem).not.toHaveClass('line-through')
  })

  it('allows toggling item purchased status', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
      />
    )

    // Find checkbox for tomatoes (not purchased)
    const tomatoCheckbox = screen.getByRole('checkbox', { name: /tomatoes/i })
    expect(tomatoCheckbox).not.toBeChecked()

    // Click to purchase
    await user.click(tomatoCheckbox)

    expect(mockUpdateItem).toHaveBeenCalledWith({
      itemId: 'item-1',
      updates: { isPurchased: true }
    })
  })

  it('displays item notes when present', () => {
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
      />
    )

    expect(screen.getByText('Got whole wheat')).toBeInTheDocument()
  })

  it('shows progress indicator', () => {
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
      />
    )

    // 1 out of 3 items purchased = 33%
    expect(screen.getByText('1 of 3 completed')).toBeInTheDocument()
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '33')
  })

  it('allows editing item quantities', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
        allowEditing={true}
      />
    )

    // Click edit button for tomatoes
    const editButton = screen.getByRole('button', { name: /edit tomatoes/i })
    await user.click(editButton)

    // Should show quantity input
    const quantityInput = screen.getByDisplayValue('5')
    expect(quantityInput).toBeInTheDocument()

    // Change quantity
    await user.clear(quantityInput)
    await user.type(quantityInput, '8')

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(mockUpdateItem).toHaveBeenCalledWith({
      itemId: 'item-1',
      updates: { quantity: 8 }
    })
  })

  it('allows adding notes to items', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
        allowEditing={true}
      />
    )

    // Click add note button for tomatoes
    const addNoteButton = screen.getByRole('button', { name: /add note.*tomatoes/i })
    await user.click(addNoteButton)

    // Should show note input
    const noteInput = screen.getByPlaceholderText(/add note/i)
    expect(noteInput).toBeInTheDocument()

    // Add note
    await user.type(noteInput, 'Get organic ones')

    // Save note
    const saveButton = screen.getByRole('button', { name: /save note/i })
    await user.click(saveButton)

    expect(mockUpdateItem).toHaveBeenCalledWith({
      itemId: 'item-1',
      updates: { notes: 'Get organic ones' }
    })
  })

  it('shows empty state when no items', () => {
    const emptyShoppingList = { ...mockShoppingList, items: [] }
    
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={emptyShoppingList}
        onItemUpdate={mockUpdateItem}
      />
    )

    expect(screen.getByText(/no items in this shopping list/i)).toBeInTheDocument()
    expect(screen.getByText(/add items to get started/i)).toBeInTheDocument()
  })

  it('filters items by search term', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
        showSearch={true}
      />
    )

    // Should show all items initially
    expect(screen.getByText('tomatoes')).toBeInTheDocument()
    expect(screen.getByText('pasta')).toBeInTheDocument()
    expect(screen.getByText('olive oil')).toBeInTheDocument()

    // Search for 'tom'
    const searchInput = screen.getByPlaceholderText(/search items/i)
    await user.type(searchInput, 'tom')

    await waitFor(() => {
      expect(screen.getByText('tomatoes')).toBeInTheDocument()
      expect(screen.queryByText('pasta')).not.toBeInTheDocument()
      expect(screen.queryByText('olive oil')).not.toBeInTheDocument()
    })
  })

  it('filters items by category', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
        showFilters={true}
      />
    )

    // Click category filter
    const categoryFilter = screen.getByRole('button', { name: /filter by category/i })
    await user.click(categoryFilter)

    // Select produce only
    const produceOption = screen.getByRole('option', { name: /produce/i })
    await user.click(produceOption)

    await waitFor(() => {
      expect(screen.getByText('tomatoes')).toBeInTheDocument()
      expect(screen.queryByText('pasta')).not.toBeInTheDocument()
      expect(screen.queryByText('olive oil')).not.toBeInTheDocument()
    })
  })

  it('shows completion celebration when all items purchased', () => {
    const completedList = {
      ...mockShoppingList,
      items: mockShoppingList.items.map(item => ({ ...item, isPurchased: true }))
    }
    
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={completedList}
        onItemUpdate={mockUpdateItem}
      />
    )

    expect(screen.getByText(/shopping complete/i)).toBeInTheDocument()
    expect(screen.getByText(/great job/i)).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
      />
    )

    // Focus first item
    const firstCheckbox = screen.getByRole('checkbox', { name: /tomatoes/i })
    firstCheckbox.focus()

    // Press space to toggle
    await user.keyboard(' ')

    expect(mockUpdateItem).toHaveBeenCalledWith({
      itemId: 'item-1',
      updates: { isPurchased: true }
    })

    // Press tab to move to next item
    await user.keyboard('{Tab}')
    
    const secondCheckbox = screen.getByRole('checkbox', { name: /pasta/i })
    expect(secondCheckbox).toHaveFocus()
  })

  it('handles loading states', () => {
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
        isLoading={true}
      />
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: /loading/i })).toBeInTheDocument()
  })

  it('handles error states', () => {
    renderWithQueryClient(
      <ShoppingListView 
        shoppingList={mockShoppingList}
        onItemUpdate={mockUpdateItem}
        error="Failed to load shopping list"
      />
    )

    expect(screen.getByText(/failed to load shopping list/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
