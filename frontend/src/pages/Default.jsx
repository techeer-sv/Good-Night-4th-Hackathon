import React, { useState, useEffect } from 'react';
import { getShows, getShowPerformances, getPerformanceSeats, createReservation } from '../api/shows';

const Default = () => {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedShow, setSelectedShow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [performances, setPerformances] = useState([]);
  const [loadingPerformances, setLoadingPerformances] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [seatsModal, setSeatsModal] = useState(false);
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [reservationModal, setReservationModal] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    reserverName: '',
    reserverPhone: ''
  });
  const [loadingReservation, setLoadingReservation] = useState(false);

  // 공연 제목에 맞는 이미지 반환 함수
  const getShowImage = (title) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('jazz')) {
      return 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=600&fit=crop'; // 재즈 공연 이미지
    } else if (lowerTitle.includes('rock')) {
      return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop'; // 록 공연 이미지
    } else if (lowerTitle.includes('classic') || lowerTitle.includes('strings')) {
      return 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop'; // 클래식/현악 공연 이미지
    } else if (lowerTitle.includes('pop')) {
      return 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop'; // 팝 공연 이미지
    } else if (lowerTitle.includes('dance')) {
      return 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=600&fit=crop'; // 댄스 공연 이미지
    } else if (lowerTitle.includes('theater') || lowerTitle.includes('drama')) {
      return 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=600&fit=crop'; // 연극 공연 이미지
    } else if (lowerTitle.includes('musical')) {
      return 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=600&fit=crop'; // 뮤지컬 공연 이미지
    } else if (lowerTitle.includes('concert')) {
      return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop'; // 일반 콘서트 이미지
    } else {
      return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop'; // 기본 공연 이미지
    }
  };

  // 날짜 포맷팅 함수
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 예매하기 버튼 클릭 핸들러
  const handleBookingClick = async (show) => {
    setSelectedShow(show);
    setShowModal(true);
    setLoadingPerformances(true);
    setPerformances([]);

    try {
      const result = await getShowPerformances(show.id);
      if (result.success) {
        setPerformances(result.data);
      } else {
        setError('공연 시간을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '공연 시간을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingPerformances(false);
    }
  };

  // 공연 시간 클릭 핸들러
  const handlePerformanceClick = async (performance) => {
    setSelectedPerformance(performance);
    setSeatsModal(true);
    setLoadingSeats(true);
    setSeats([]);
    setSelectedSeat(null);

    try {
      const result = await getPerformanceSeats(performance.id);
      if (result.success) {
        setSeats(result.data);
      } else {
        setError('좌석 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '좌석 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingSeats(false);
    }
  };

  // 좌석 클릭 핸들러
  const handleSeatClick = (seat) => {
    if (seat.status === 'AVAILABLE') {
      setSelectedSeat(seat);
    }
  };

  // 예약하기 버튼 클릭 핸들러
  const handleReservationClick = () => {
    setReservationModal(true);
    setReservationForm({ reserverName: '', reserverPhone: '' });
  };

  // 예약 폼 입력 핸들러
  const handleReservationInputChange = (e) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 예약 제출 핸들러
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    
    if (!reservationForm.reserverName.trim() || !reservationForm.reserverPhone.trim()) {
      setError('예약자 이름과 전화번호를 모두 입력해주세요.');
      return;
    }

    setLoadingReservation(true);
    setError('');

    try {
      const reservationData = {
        performanceSeatId: selectedSeat.performanceSeatId,
        reserverName: reservationForm.reserverName.trim(),
        reserverPhone: reservationForm.reserverPhone.trim()
      };

      const result = await createReservation(reservationData);
      if (result.success) {
        // 예약 성공 시 모든 모달 닫기
        setReservationModal(false);
        setSeatsModal(false);
        setShowModal(false);
        setSelectedShow(null);
        setSelectedPerformance(null);
        setSelectedSeat(null);
        setPerformances([]);
        setSeats([]);
        setReservationForm({ reserverName: '', reserverPhone: '' });
        
        // 성공 메시지 표시 (간단한 alert 사용)
        alert('예약이 완료되었습니다!');
      } else {
        setError('예약에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '예약 중 오류가 발생했습니다.');
    } finally {
      setLoadingReservation(false);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShow(null);
    setPerformances([]);
    setError('');
  };

  // 좌석 모달 닫기
  const handleCloseSeatsModal = () => {
    setSeatsModal(false);
    setSelectedPerformance(null);
    setSeats([]);
    setSelectedSeat(null);
    setError('');
  };

  // 예약 모달 닫기
  const handleCloseReservationModal = () => {
    setReservationModal(false);
    setReservationForm({ reserverName: '', reserverPhone: '' });
    setError('');
  };

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await getShows();
        if (result.success) {
          setShows(result.data);
        } else {
          setError('공연 목록을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError(err.message || '공연 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShows();
  }, []);

  if (isLoading) {
    return (
      <div className="-ml-1">
        <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
          🎭 공연 목록
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">공연 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="-ml-1">
        <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
          🎭 공연 목록
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="-ml-1">
      <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
        🎭 공연 목록
      </h1>
      
      {/* Poster Grid */}
      <div className="grid grid-cols-3 gap-8 max-w-4xl">
        {shows.map((show) => (
          <div 
            key={show.id}
            className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden hover:bg-black/50 transition-all duration-300 hover:scale-105"
          >
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              <img 
                src={getShowImage(show.title)} 
                alt={show.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이미지로 대체
                  e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-white font-semibold text-lg mb-2">{show.title}</h3>
              <button 
                onClick={() => handleBookingClick(show)}
                className="w-full bg-blue-600/80 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors"
              >
                예매하기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 공연 시간 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl transition-colors z-10"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="text-center pt-8 pb-6 px-8 border-b border-white/10">
              <h2 className="text-4xl font-bold text-white mb-3">{selectedShow?.title}</h2>
              <p className="text-gray-300 text-lg">공연 시간을 선택하세요</p>
            </div>

            {/* Performances List */}
            <div className="p-8">
              {loadingPerformances ? (
                <div className="text-center py-12">
                  <div className="text-white text-xl">공연 시간을 불러오는 중...</div>
                </div>
              ) : performances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {performances.map((performance) => (
                    <div 
                      key={performance.id}
                      onClick={() => handlePerformanceClick(performance)}
                      className="bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer hover:scale-105 hover:border-blue-400/50 group"
                    >
                      <div className="text-center">
                        <div className="text-white font-bold text-2xl mb-2">
                          {formatDateTime(performance.startsAt)}
                        </div>
                        <div className="text-blue-300 text-sm font-medium group-hover:text-blue-200 transition-colors">
                          선택하기
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-300 text-xl">예정된 공연이 없습니다.</div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="text-center pb-8 px-8 border-t border-white/10 pt-6">
              <button 
                onClick={handleCloseModal}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-300 text-lg"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 좌석 선택 모달 */}
      {seatsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={handleCloseSeatsModal}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl transition-colors z-10"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="text-center pt-8 pb-6 px-8 border-b border-white/10">
              <h2 className="text-4xl font-bold text-white mb-3">{selectedShow?.title}</h2>
              <p className="text-gray-300 text-lg mb-2">{formatDateTime(selectedPerformance?.startsAt)}</p>
              <p className="text-gray-400 text-base">좌석을 선택하세요</p>
            </div>

            {/* Seats Grid */}
            <div className="p-8">
              {loadingSeats ? (
                <div className="text-center py-12">
                  <div className="text-white text-xl">좌석 정보를 불러오는 중...</div>
                </div>
              ) : seats.length > 0 ? (
                <div className="space-y-6">
                  {/* 3x3 좌석 그리드 */}
                  <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                    {seats.map((seat) => (
                      <div
                        key={seat.performanceSeatId}
                        onClick={() => handleSeatClick(seat)}
                        className={`
                          aspect-square rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-300 text-white font-bold text-lg
                          ${seat.status === 'AVAILABLE' 
                            ? 'bg-green-600/80 border-green-400 hover:bg-green-500 hover:scale-110 hover:border-green-300' 
                            : 'bg-red-600/80 border-red-400 cursor-not-allowed opacity-70'
                          }
                          ${selectedSeat?.performanceSeatId === seat.performanceSeatId ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
                        `}
                      >
                        {seat.seatNo}
                      </div>
                    ))}
                  </div>

                  {/* 좌석 상태 설명 */}
                  <div className="flex justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-600/80 border border-green-400 rounded"></div>
                      <span className="text-green-300">예매 가능</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-600/80 border border-red-400 rounded"></div>
                      <span className="text-red-300">매진</span>
                    </div>
                  </div>

                  {/* 선택된 좌석 정보 */}
                  {selectedSeat && (
                    <div className="text-center py-4 bg-blue-600/20 border border-blue-400/30 rounded-lg">
                      <div className="text-blue-300 text-lg">선택된 좌석</div>
                      <div className="text-white font-bold text-2xl">{selectedSeat.seatNo}번</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-300 text-xl">좌석 정보가 없습니다.</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="text-center pb-8 px-8 border-t border-white/10 pt-6">
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={handleCloseSeatsModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-300 text-lg"
                >
                  뒤로가기
                </button>
                {selectedSeat && (
                  <button 
                    onClick={handleReservationClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-300 text-lg"
                  >
                    예약하기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 예약 정보 입력 모달 */}
      {reservationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-md w-full">
            {/* Close Button */}
            <button 
              onClick={handleCloseReservationModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="text-center pt-8 pb-6 px-8 border-b border-white/10">
              <h2 className="text-3xl font-bold text-white mb-2">예약 정보 입력</h2>
              <p className="text-gray-300">예약자 정보를 입력해주세요</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-8 mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Reservation Form */}
            <form onSubmit={handleReservationSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  예약자 이름
                </label>
                <input
                  type="text"
                  name="reserverName"
                  value={reservationForm.reserverName}
                  onChange={handleReservationInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="예약자 이름을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="reserverPhone"
                  value={reservationForm.reserverPhone}
                  onChange={handleReservationInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="01012345678"
                  required
                />
              </div>

              {/* 예약 정보 요약 */}
              <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="text-white/80 text-sm mb-2">예약 정보</div>
                <div className="text-white text-sm space-y-1">
                  <div>공연: {selectedShow?.title}</div>
                  <div>시간: {formatDateTime(selectedPerformance?.startsAt)}</div>
                  <div>좌석: {selectedSeat?.seatNo}번</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingReservation}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300"
              >
                {loadingReservation ? '예약 중...' : '예약 완료'}
              </button>
            </form>

            {/* Close Button */}
            <div className="text-center pb-8 px-8">
              <button 
                onClick={handleCloseReservationModal}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Default; 