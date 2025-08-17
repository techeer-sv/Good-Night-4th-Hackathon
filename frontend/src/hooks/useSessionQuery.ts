import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { SessionUser } from '@/types/auth';

export function useSessionQuery() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => apiFetch<SessionUser>('/api/me'),
    staleTime: 60_000,
  });
}

export function useInvalidateSession() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['session'] });
}
