'use client';

import { useRouter } from 'next/navigation';
import { useLogoutMutation } from '@/hooks/useLogoutMutation';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'button' | 'link';
}

export function LogoutButton({ 
  className = '', 
  children = 'Logout',
  variant = 'button'
}: LogoutButtonProps) {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // On success, redirect to events page
      router.push('/events');
    } catch (error) {
      console.error('Logout failed:', error);
      // Could add toast notification here in the future
    }
  };

  const baseClasses = `
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
    transition-colors disabled:opacity-50 disabled:cursor-not-allowed
  `.trim();

  if (variant === 'link') {
    return (
      <button
        type="button"
        className={`text-sm text-gray-500 hover:text-gray-700 rounded ${baseClasses} ${className}`}
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        aria-label="Sign out of your account"
      >
        {logoutMutation.isPending ? 'Signing out...' : children}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`
        inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
        rounded-md text-white bg-red-600 hover:bg-red-700 ${baseClasses} ${className}
      `.trim()}
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      aria-label="Sign out of your account"
    >
      {logoutMutation.isPending && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {logoutMutation.isPending ? 'Signing out...' : children}
    </button>
  );
}
