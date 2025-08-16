'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { SessionUser } from '@/types/auth';

export function useSessionQuery() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        return await apiFetch<SessionUser>('/api/me');
      } catch (error) {
        // Return null for 401/403 errors (not authenticated)
        if (error instanceof Error && error.message.includes('401') || error instanceof Error && error.message.includes('403')) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 60_000, // 1 minute
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useInvalidateSession() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['session'] });
  };
}
