interface ApiError {
  response?: {
    data?: {
      error?: string;
      retryable?: boolean;
    };
    status?: number;
  };
}

export const extractErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError;
  return apiError.response?.data?.error || 'An unknown error occurred';
};

export const isRetryableError = (error: unknown): boolean => {
  const apiError = error as ApiError;
  return apiError.response?.data?.retryable || apiError.response?.status === 409 || false;
};