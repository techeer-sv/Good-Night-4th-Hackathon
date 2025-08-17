// User authentication types based on PRD requirements

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  role?: 'USER' | 'ADMIN';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: SessionUser;
  message?: string;
}

export interface AuthError {
  error: string;
  message: string;
}
