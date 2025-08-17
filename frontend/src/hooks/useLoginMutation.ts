import { useMutation } from '@tanstack/react-query';
import { LoginCredentials, AuthResponse } from '@/types/auth';
import { useInvalidateSession } from '@/hooks/useSessionQuery';

export function useLoginMutation() {
  const invalidateSession = useInvalidateSession();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate session query to refetch user data
      invalidateSession();
    },
  });
}
