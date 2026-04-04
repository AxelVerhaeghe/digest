import { QueryCache, QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient singleton.
 *
 * Used by both the React `<QueryClientProvider>` and by TanStack DB
 * collections (which need a QueryClient reference at module scope).
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error(error);
    },
  }),
});
