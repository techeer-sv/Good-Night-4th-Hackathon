import { useEffect, useRef, useState, useCallback } from 'react';

interface SeatStatus {
  id: string;
  status: string;
  bookedBy: string | null;
  updatedAt: string;
}

interface SeatSyncEvent {
  type: 'connection' | 'seat_update' | 'ping' | 'error';
  message?: string;
  seats?: SeatStatus[];
  concertId?: string;
  timestamp: string;
  error?: string;
}

interface UseSeatSyncOptions {
  concertId: string;
  onSeatUpdate?: (seats: SeatStatus[]) => void;
  onError?: (error: string) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export const useSeatSync = ({
  concertId,
  onSeatUpdate,
  onError
}: UseSeatSyncOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  // ref들을 사용하여 함수와 상태를 안정화
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const lastPingRef = useRef<Date | null>(null);
  
  // 함수들을 ref로 저장하여 안정화
  const connectRef = useRef<() => void>(() => {});
  const disconnectRef = useRef<() => void>(() => {});

  // SSE 연결 생성 함수
  const connect = useCallback(() => {
    // 이미 연결 중이거나 최대 재연결 시도 횟수를 초과한 경우
    if (eventSourceRef.current || reconnectAttemptsRef.current >= maxReconnectAttempts) {
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setConnectionStatus('error');
        console.log('❌ 최대 재연결 시도 횟수 초과');
        return;
      }
      return;
    }

    try {
      setConnectionStatus('connecting');
      console.log('🔗 SSE 연결 시도 중...');
      
      const eventSource = new EventSource(`http://localhost:3001/api/concurrency/seat-sync/${concertId}`);
      eventSourceRef.current = eventSource;

      // 연결 성공
      eventSource.onopen = () => {
        console.log('✅ SSE 연결 성공');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        lastPingRef.current = new Date();
        
        // 연결 성공 후 5초 대기
        setTimeout(() => {
          if (eventSourceRef.current) {
            console.log('🟢 SSE 연결 안정화됨');
          }
        }, 5000);
      };

      // 메시지 수신
      eventSource.onmessage = (event) => {
        try {
          const data: SeatSyncEvent = JSON.parse(event.data);
          console.log('📡 SSE 메시지 수신:', data);

          switch (data.type) {
            case 'connection':
              console.log('✅ SSE 연결 확인:', data.message);
              break;

            case 'ping':
              lastPingRef.current = new Date();
              console.log('💓 SSE ping 수신');
              break;

            case 'seat_update':
              if (data.seats) {
                setLastUpdate(new Date());
                onSeatUpdate?.(data.seats);
                console.log('🔄 좌석 상태 업데이트:', data.seats.length, '개 좌석');
              }
              break;

            case 'error':
              console.error('❌ SSE 오류:', data.error);
              onError?.(data.error || '알 수 없는 오류');
              break;
          }
        } catch (error) {
          console.error('❌ SSE 메시지 파싱 오류:', error);
        }
      };

      // 연결 오류 - 자동 재연결 비활성화
      eventSource.onerror = (error) => {
        console.error('❌ SSE 연결 오류:', error);
        setIsConnected(false);
        setConnectionStatus('error');
        
        // 연결 해제
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        // 자동 재연결 비활성화 - 수동 재연결만 허용
        console.log('❌ 자동 재연결 비활성화됨');
      };

    } catch (error) {
      console.error('❌ SSE 연결 생성 실패:', error);
      setConnectionStatus('error');
    }
  }, [concertId, onSeatUpdate, onError]);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  // 수동 재연결 함수
  const reconnect = useCallback(() => {
    console.log('🔄 수동 재연결 시도');
    disconnect();
    reconnectAttemptsRef.current = 0;
    
    // 15초 후 연결 시도
    setTimeout(() => {
      if (concertId) {
        connect();
      }
    }, 15000);
  }, [concertId, connect, disconnect]);

  // 함수들을 ref에 저장
  connectRef.current = connect;
  disconnectRef.current = disconnect;

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    if (concertId && connectRef.current) {
      connectRef.current();
    }

    return () => {
      if (disconnectRef.current) {
        disconnectRef.current();
      }
    };
  }, [concertId]); // concertId만 의존성으로 사용

  // 특정 좌석의 실시간 상태 확인
  const checkSeatStatus = useCallback(async (seatId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/concurrency/seat-status-realtime/${seatId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ 좌석 상태 확인 실패:', error);
      throw error;
    }
  }, []);

  return {
    isConnected,
    connectionStatus,
    lastUpdate,
    connect,
    disconnect,
    reconnect,
    checkSeatStatus,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts,
    lastPing: lastPingRef.current
  };
};
