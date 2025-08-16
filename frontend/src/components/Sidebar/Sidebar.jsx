import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="h-full p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Good Night</h2>
        <p className="text-gray-200 text-sm drop-shadow-md">공연 예매 플랫폼</p>
      </div>
      
      <nav className="space-y-2">
        <Link 
          to="/" 
          className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 backdrop-blur-sm ${
            isActive('/') 
              ? 'bg-white/20 text-white' 
              : 'text-gray-200 hover:bg-white/20 hover:text-white'
          }`}
        >
          <span className="mr-3">🏠</span>
          홈
        </Link>
        <Link 
          to="/reservations" 
          className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 backdrop-blur-sm ${
            isActive('/reservations') 
              ? 'bg-white/20 text-white' 
              : 'text-gray-200 hover:bg-white/20 hover:text-white'
          }`}
        >
          <span className="mr-3">🎫</span>
          예매 내역
        </Link>
        <a href="#" className="flex items-center px-4 py-3 text-gray-200 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm">
          <span className="mr-3">⚙️</span>
          설정
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
