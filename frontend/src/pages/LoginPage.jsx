import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from './Layout';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 로그인 로직 구현
    console.log('Login attempt:', formData);
    // 로그인 성공 시 메인 페이지로 이동
    navigate('/');
  };

  return (
    <Layout>
      <div className="flex items-start justify-start min-h-screen ml-48 pt-20">
        <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">로그인</h2>
            <p className="text-gray-300">Good Night에 오신 것을 환영합니다</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                아이디
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
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
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-500/30"
            >
              로그인
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-300 mb-3">아직 계정이 없으신가요?</p>
            <Link 
              to="/signup"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
            >
              회원가입하기
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

export default LoginPage; 