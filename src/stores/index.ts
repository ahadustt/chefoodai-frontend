// Zustand store configurations
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User, UserPreferences, Recipe } from '@/types';

// User Store - For authentication and user preferences
interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  logout: () => void;
  clearError: () => void;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
            state.error = null;
          }),

        updatePreferences: (preferences) =>
          set((state) => {
            if (state.user) {
              state.user.preferences = {
                ...state.user.preferences,
                ...preferences,
              };
            }
          }),

        logout: () =>
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
          }),

        clearError: () =>
          set((state) => {
            state.error = null;
          }),
      })),
      {
        name: 'user-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'UserStore' }
  )
);

// UI Store - For global UI state (modals, sidebars, themes)
interface UIStore {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  
  // Actions
  setTheme: (theme: UIStore['theme']) => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      immer((set) => ({
        theme: 'system',
        sidebarOpen: false,
        activeModal: null,
        notifications: [],

        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        openModal: (modalId) =>
          set((state) => {
            state.activeModal = modalId;
          }),

        closeModal: () =>
          set((state) => {
            state.activeModal = null;
          }),

        addNotification: (notification) =>
          set((state) => {
            const id = `notification-${Date.now()}`;
            state.notifications.push({ ...notification, id });
            
            // Auto-remove after duration
            if (notification.duration !== 0) {
              setTimeout(() => {
                useUIStore.getState().removeNotification(id);
              }, notification.duration || 5000);
            }
          }),

        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter(
              (n) => n.id !== id
            );
          }),
      })),
      {
        name: 'ui-storage',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: 'UIStore' }
  )
);

// Recipe Store - For local recipe management (favorites, recent, etc.)
interface RecipeStore {
  favoriteRecipes: string[]; // Recipe IDs
  recentRecipes: Recipe[];
  currentRecipe: Recipe | null;
  
  // Actions
  toggleFavorite: (recipeId: string) => void;
  addToRecent: (recipe: Recipe) => void;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  clearRecent: () => void;
}

export const useRecipeStore = create<RecipeStore>()(
  devtools(
    persist(
      immer((set) => ({
        favoriteRecipes: [],
        recentRecipes: [],
        currentRecipe: null,

        toggleFavorite: (recipeId) =>
          set((state) => {
            const index = state.favoriteRecipes.indexOf(recipeId);
            if (index > -1) {
              state.favoriteRecipes.splice(index, 1);
            } else {
              state.favoriteRecipes.push(recipeId);
            }
          }),

        addToRecent: (recipe) =>
          set((state) => {
            // Remove if already exists
            state.recentRecipes = state.recentRecipes.filter(
              (r) => r.id !== recipe.id
            );
            
            // Add to beginning
            state.recentRecipes.unshift(recipe);
            
            // Keep only last 10
            if (state.recentRecipes.length > 10) {
              state.recentRecipes = state.recentRecipes.slice(0, 10);
            }
          }),

        setCurrentRecipe: (recipe) =>
          set((state) => {
            state.currentRecipe = recipe;
          }),

        clearRecent: () =>
          set((state) => {
            state.recentRecipes = [];
          }),
      })),
      {
        name: 'recipe-storage',
      }
    ),
    { name: 'RecipeStore' }
  )
);

// Shopping List Store - For managing shopping lists
interface ShoppingListStore {
  items: ShoppingListItem[];
  
  // Actions
  addItem: (item: Omit<ShoppingListItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  category: string;
  isChecked: boolean;
  addedAt: Date;
  recipeId?: string;
}

export const useShoppingListStore = create<ShoppingListStore>()(
  devtools(
    persist(
      immer((set) => ({
        items: [],

        addItem: (item) =>
          set((state) => {
            const newItem: ShoppingListItem = {
              ...item,
              id: `item-${Date.now()}`,
              addedAt: new Date(),
            };
            state.items.push(newItem);
          }),

        removeItem: (id) =>
          set((state) => {
            state.items = state.items.filter((item) => item.id !== id);
          }),

        toggleItem: (id) =>
          set((state) => {
            const item = state.items.find((i) => i.id === id);
            if (item) {
              item.isChecked = !item.isChecked;
            }
          }),

        updateQuantity: (id, quantity) =>
          set((state) => {
            const item = state.items.find((i) => i.id === id);
            if (item && quantity > 0) {
              item.quantity = quantity;
            }
          }),

        clearChecked: () =>
          set((state) => {
            state.items = state.items.filter((item) => !item.isChecked);
          }),

        clearAll: () =>
          set((state) => {
            state.items = [];
          }),
      })),
      {
        name: 'shopping-list-storage',
      }
    ),
    { name: 'ShoppingListStore' }
  )
);