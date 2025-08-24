import api from './axios';

// 로그인
export const login = async (credentials) => {
  try {
    const response = await api.post('/users/signin', credentials);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || '로그인에 실패했습니다.';
    throw new Error(message);
  }
};

// 회원가입
export const signup = async (userData) => {
  try {
    const response = await api.post('/users/signup', userData);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || '회원가입에 실패했습니다.';
    throw new Error(message);
  }
};

// 로그아웃
export const logout = async () => {
  try {
    const response = await api.post('/users/logout');
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || '로그아웃에 실패했습니다.';
    throw new Error(message);
  }
}; 