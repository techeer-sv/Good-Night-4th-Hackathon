import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from './Layout';
import { signup } from '../api/auth';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || '' // undefined 방지
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signup(formData);
      if (result.success) {
        console.log('회원가입 성공:', result.data);
        // 회원가입 성공 시 로그인 페이지로 이동
        navigate('/login');
      } else {
        setError(result.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-start justify-start min-h-screen ml-48 pt-20">
        <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">회원가입</h2>
            <p className="text-gray-300">Good Night의 새로운 멤버가 되어보세요</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                아이디
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-500/30"
            >
              {isLoading ? '회원가입 중...' : '회원가입'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-300 mb-3">이미 계정이 있으신가요?</p>
            <Link 
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
            >
              로그인하기
            </Link>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link 
              to="/"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              ← 메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage; 