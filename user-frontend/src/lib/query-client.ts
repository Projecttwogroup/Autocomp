import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

function handleError(error: Error) {
  const message = error.message || 'An unexpected error occurred';

  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });

  // Log error to monitoring service in production
  if (import.meta.env.PROD) {
    console.error('Query Error:', error);
    // TODO: Add error reporting service integration
  }
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleError
    }),
    mutationCache: new MutationCache({
      onError: handleError
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30000,
        gcTime: 300000, // 5 minutes
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1
      }
    }
  });
}