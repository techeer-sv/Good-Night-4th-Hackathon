import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { getUserReservations } from '../api/shows';
import { useAuth } from '../contexts/AuthContext';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isLoggedIn } = useAuth();

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

  // 예약 상태에 따른 스타일 반환
  const getStatusStyle = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-600/80 text-green-100';
      case 'PENDING':
        return 'bg-yellow-600/80 text-yellow-100';
      case 'CANCELLED':
        return 'bg-red-600/80 text-red-100';
      default:
        return 'bg-gray-600/80 text-gray-100';
    }
  };

  // 예약 상태 한글 변환
  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return '결제완료';
      case 'PENDING':
        return '결제대기';
      case 'CANCELLED':
        return '취소됨';
      default:
        return status;
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      // 로그인하지 않은 경우 처리
      if (!isLoggedIn || !user) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const result = await getUserReservations(user.id);
        if (result.success) {
          setReservations(result.data);
        } else {
          setError('예매내역을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError(err.message || '예매내역을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [isLoggedIn, user]);

  // 로그인하지 않은 경우
  if (!isLoggedIn || !user) {
    return (
      <Layout>
        <div className="flex items-start justify-start min-h-screen ml-48 pt-20">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-6">로그인이 필요합니다.</div>
            <Link 
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-start justify-start min-h-screen ml-48 pt-20">
          <div className="text-center">
            <div className="text-white text-xl">예매내역을 불러오는 중...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-start justify-start min-h-screen ml-48 pt-20">
          <div className="text-center">
            <div className="text-red-400 text-xl">{error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-start justify-start min-h-screen ml-48 pt-20">
        <div className="w-full max-w-6xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              🎫 예매내역
            </h1>
            <p className="text-gray-300 text-lg">내가 예매한 공연들을 확인해보세요</p>
          </div>

          {/* Reservations List */}
          {reservations.length > 0 ? (
            <div className="space-y-6">
              {reservations.map((reservation) => (
                <div 
                  key={reservation.reservationId}
                  className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 hover:bg-black/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-2xl font-bold text-white">
                        {reservation.showTitle}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      예약번호: {reservation.reservationId}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">공연 시간</div>
                      <div className="text-white font-semibold">
                        {formatDateTime(reservation.startsAt)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">예약자명</div>
                      <div className="text-white font-semibold">
                        {reservation.reserverName || '미입력'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">연락처</div>
                      <div className="text-white font-semibold">
                        {reservation.reserverPhone || '미입력'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">좌석 정보</div>
                      <div className="text-white font-semibold">
                        {reservation.seatNo}번 (ID: {reservation.performanceSeatId})
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-gray-400 text-sm">
                      예약일시: {formatDateTime(reservation.reservedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-300 text-2xl mb-4">아직 예매한 공연이 없습니다</div>
              <p className="text-gray-400 text-lg mb-8">첫 번째 공연을 예매해보세요!</p>
              <Link 
                to="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-300 text-lg"
              >
                공연 목록 보기
              </Link>
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link 
              to="/"
              className="text-gray-400 hover:text-white text-lg transition-colors duration-300"
            >
              ← 메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReservationsPage; 