import React, { createContext, useContext, useState } from 'react';
import { login, logout } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const result = await login(credentials);
      if (result.success) {
        setIsLoggedIn(true);
        // 백엔드 응답에서 사용자 정보 추출
        if (result.data) {
          // 백엔드 응답 구조에 따라 사용자 정보 설정
          // 예: { userId: 1, username: "string" } 또는 { id: 1, name: "string" }
          const userData = {
            id: result.data.userId || result.data.id || 1,
            username: result.data.username || result.data.name || credentials.name
          };
          setUser(userData);
          console.log('사용자 정보 설정:', userData); // 디버깅용
        } else {
          // 응답 데이터가 없는 경우 기본값 설정
          setUser({ id: 1, username: credentials.name });
        }
        return { success: true };
      } else {
        return { success: false, error: result.message || '로그인에 실패했습니다.' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setIsLoggedIn(false);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoggedIn,
    isLoading,
    user,
    setUser,
    login: handleLogin,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 