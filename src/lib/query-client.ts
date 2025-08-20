// React Query client configuration
import { QueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/stores';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Network-first strategy with background refetch
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        // Global error handling for mutations
        const addNotification = useUIStore.getState().addNotification;
        
        const message = 
          error?.response?.data?.error?.message || 
          error?.message || 
          'An unexpected error occurred';
          
        addNotification({
          type: 'error',
          title: 'Error',
          message,
        });
      },
    },
  },
});