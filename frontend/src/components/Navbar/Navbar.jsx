import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({
    name: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isLoggedIn, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (isLoggedIn) {
      handleLogout();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setLoginForm({ name: '', password: '' });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value || '' // undefined 방지
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login({
        name: loginForm.name,
        password: loginForm.password
      });
      if (result.success) {
        setShowLoginModal(false);
        setLoginForm({ name: '', password: '' });
        navigate('/'); // 메인 페이지로 이동
      } else {
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        navigate('/'); // 메인 페이지로 이동
      }
    } catch {
      console.error('로그아웃 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <div className="text-right">
        <span 
          className="text-white text-2xl font-bold hover:text-blue-200 cursor-pointer transition-all duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
          onClick={handleLoginClick}
        >
          {isLoggedIn ? '로그아웃' : '로그인'}
        </span>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">로그인</h2>
              <p className="text-gray-300">Good Night에 오신 것을 환영합니다</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  아이디
                </label>
                <input
                  type="text"
                  name="name"
                  value={loginForm.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            {/* Signup Link */}
            <div className="text-center mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-300 mb-3">아직 계정이 없으신가요?</p>
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/signup');
                }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
              >
                회원가입하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
