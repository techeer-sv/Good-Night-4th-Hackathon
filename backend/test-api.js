const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// 샘플 데이터
const sampleData = {
  userId: 'user1',
  concertId: null, // 첫 번째 공연 ID로 설정
  seatIds: [], // 첫 번째 공연의 첫 번째 좌석 ID로 설정
};

async function testAPI() {
  console.log('🚀 공연 좌석 예매 시스템 API 테스트 시작\n');

  try {
    // 1. 서버 상태 확인
    console.log('1️⃣ 서버 상태 확인...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ 서버 상태:', healthResponse.data.status);
    console.log('⏰ 서버 시작 시간:', new Date(healthResponse.data.uptime * 1000).toLocaleString());
    console.log('');

    // 2. 공연 목록 조회
    console.log('2️⃣ 공연 목록 조회...');
    const concertsResponse = await axios.get(`${BASE_URL}/api/concerts`);
    const concerts = concertsResponse.data.data;
    console.log(`✅ 총 ${concerts.length}개의 공연이 있습니다:`);
    concerts.forEach((concert, index) => {
      console.log(`   ${index + 1}. ${concert.title} - ${concert.artist}`);
      console.log(`      📍 ${concert.venue} | 🎫 ${concert.totalSeats}석 | 💰 ${concert.price.toLocaleString()}원`);
    });
    console.log('');

    // 첫 번째 공연 정보 저장
    if (concerts.length > 0) {
      sampleData.concertId = concerts[0].id;
      console.log(`🎯 테스트용 공연 선택: ${concerts[0].title}\n`);
    }

    // 3. 공연 상세 정보 및 좌석 조회
    if (sampleData.concertId) {
      console.log('3️⃣ 공연 상세 정보 및 좌석 조회...');
      const concertResponse = await axios.get(`${BASE_URL}/api/concerts/${sampleData.concertId}`);
      const concert = concertResponse.data.data;
      console.log(`✅ 공연: ${concert.title}`);
      console.log(`📊 좌석 통계:`, concert.stats);
      
      // 첫 번째 사용 가능한 좌석 ID 저장
      const availableSeats = concert.seats.filter(seat => seat.status === 'available');
      if (availableSeats.length > 0) {
        sampleData.seatIds = [availableSeats[0].id];
        console.log(`🎯 테스트용 좌석 선택: ${availableSeats[0].section}구역 ${availableSeats[0].row}열 ${availableSeats[0].seatNumber}번`);
      }
      console.log('');
    }

    // 4. 좌석 예약 테스트
    if (sampleData.seatIds.length > 0) {
      console.log('4️⃣ 좌석 예약 테스트...');
      const reserveResponse = await axios.post(`${BASE_URL}/api/bookings/reserve`, {
        concertId: sampleData.concertId,
        seatIds: sampleData.seatIds,
        userId: sampleData.userId
      });
      console.log('✅ 예약 성공:', reserveResponse.data.message);
      console.log(`⏰ 만료 시간: ${new Date(reserveResponse.data.data.expiresAt).toLocaleString()}`);
      console.log('');
    }

    // 5. 우선순위 대기열 등록 테스트
    console.log('5️⃣ 우선순위 대기열 등록 테스트...');
    const queueResponse = await axios.post(`${BASE_URL}/api/queue/join`, {
      concertId: sampleData.concertId,
      userId: sampleData.userId,
      priority: 'vip'
    });
    console.log('✅ 대기열 등록 성공:', queueResponse.data.message);
    console.log(`📍 대기열 위치: ${queueResponse.data.data.position}번째`);
    console.log(`⏱️ 예상 대기 시간: ${queueResponse.data.data.estimatedWaitTime}초`);
    console.log('');

    // 6. 대기열 상태 확인
    console.log('6️⃣ 대기열 상태 확인...');
    const queueStatusResponse = await axios.get(`${BASE_URL}/api/queue/status/${sampleData.concertId}`);
    const queueStatus = queueStatusResponse.data.data;
    console.log('✅ 대기열 상태:', queueStatus);
    console.log('');

    // 7. 예매 내역 조회
    console.log('7️⃣ 예매 내역 조회...');
    const bookingsResponse = await axios.get(`${BASE_URL}/api/bookings/user/${sampleData.userId}`);
    const bookings = bookingsResponse.data.data;
    console.log(`✅ 총 ${bookings.length}개의 예매 내역이 있습니다.`);
    console.log('');

    // 8. API 문서 확인
    console.log('8️⃣ API 문서 확인...');
    const docsResponse = await axios.get(`${BASE_URL}/api/docs`);
    console.log('✅ API 문서:', docsResponse.data.message);
    console.log(`📚 총 ${Object.keys(docsResponse.data.endpoints).length}개의 엔드포인트가 있습니다.`);
    console.log('');

    console.log('🎉 모든 API 테스트가 성공적으로 완료되었습니다!');
    console.log('\n🔗 API 문서: http://localhost:3001/api/docs');
    console.log('🔍 헬스 체크: http://localhost:3001/api/health');

  } catch (error) {
    if (error.response) {
      console.error('❌ API 오류:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ 서버 연결 오류: 서버가 실행 중인지 확인해주세요.');
      console.log('💡 서버 실행: npm run dev');
    } else {
      console.error('❌ 오류:', error.message);
    }
  }
}

// 테스트 실행
testAPI();
