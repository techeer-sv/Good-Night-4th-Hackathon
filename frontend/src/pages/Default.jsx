import React from 'react';

const Default = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-lg">
        🎭 공연 목록
      </h1>
      
      {/* Poster Grid */}
      <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Poster 1 */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden hover:bg-black/50 transition-all duration-300 hover:scale-105">
          <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
          <div className="p-4">
            <h3 className="text-white font-semibold text-lg mb-2">공연 제목 1</h3>
            <p className="text-gray-300 text-sm mb-3">2024.01.15 - 2024.01.20</p>
            <p className="text-gray-400 text-sm mb-4">공연장명</p>
            <button className="w-full bg-blue-600/80 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors">
              예매하기
            </button>
          </div>
        </div>

        {/* Poster 2 */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden hover:bg-black/50 transition-all duration-300 hover:scale-105">
          <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-4xl">🎭</span>
          </div>
          <div className="p-4">
            <h3 className="text-white font-semibold text-lg mb-2">공연 제목 2</h3>
            <p className="text-gray-300 text-sm mb-3">2024.01.22 - 2024.01.27</p>
            <p className="text-gray-400 text-sm mb-4">공연장명</p>
            <button className="w-full bg-blue-600/80 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors">
              예매하기
            </button>
          </div>
        </div>

        {/* Poster 3 */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden hover:bg-black/50 transition-all duration-300 hover:scale-105">
          <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-4xl">🎪</span>
          </div>
          <div className="p-4">
            <h3 className="text-white font-semibold text-lg mb-2">공연 제목 3</h3>
            <p className="text-gray-300 text-sm mb-3">2024.01.29 - 2024.02.03</p>
            <p className="text-gray-400 text-sm mb-4">공연장명</p>
            <button className="w-full bg-blue-600/80 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors">
              예매하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Default; 