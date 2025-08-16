import React from 'react';

const Sidebar = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Good Night</h2>
        <p className="text-gray-200 text-sm drop-shadow-md">공연 예매 플랫폼</p>
      </div>
      
      <nav className="space-y-2">
        <a href="#" className="flex items-center px-4 py-3 text-gray-200 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm">
          <span className="mr-3">🏠</span>
          홈
        </a>
        <a href="#" className="flex items-center px-4 py-3 text-gray-200 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm">
          <span className="mr-3">🎭</span>
          공연 목록
        </a>
        <a href="#" className="flex items-center px-4 py-3 text-gray-200 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm">
          <span className="mr-3">🎫</span>
          예매 내역
        </a>
        <a href="#" className="flex items-center px-4 py-3 text-gray-200 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm">
          <span className="mr-3">⚙️</span>
          설정
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
