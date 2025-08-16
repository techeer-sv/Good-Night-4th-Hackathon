import { useMutation } from '@tanstack/react-query';
import { useInvalidateSession } from './useSessionQuery';

export function useLogoutMutation() {
  const invalidateSession = useInvalidateSession();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Logout failed' }));
        throw new Error(errorData.message || 'Logout failed');
      }
    },
    onSuccess: () => {
      // Invalidate session query to clear user data
      invalidateSession();
    },
  });
}
