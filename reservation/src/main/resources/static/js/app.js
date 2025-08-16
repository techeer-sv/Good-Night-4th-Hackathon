// 좌석 예약 시스템 메인 애플리케이션 로직
class SeatReservationApp {
    constructor() {
        this.currentSessionId = null;
        this.selectedSeatId = null;
        this.lockedSeats = new Set();
        this.init();
    }

    init() {
        this.initializeSeats();
        this.updateStatus();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 세션 생성 버튼
        const createSessionBtn = document.getElementById('createSessionBtn');
        if (createSessionBtn) {
            createSessionBtn.addEventListener('click', () => this.createSession());
        }

        // 세션 삭제 버튼
        const clearSessionBtn = document.getElementById('clearSessionBtn');
        if (clearSessionBtn) {
            clearSessionBtn.addEventListener('click', () => this.clearSession());
        }
    }

    initializeSeats() {
        const seatsGrid = document.getElementById('seatsGrid');
        if (!seatsGrid) return;

        seatsGrid.innerHTML = '';

        // 8x8 좌석 그리드 생성
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const seatId = (row - 1) * 8 + col;
                const seat = document.createElement('div');
                seat.className = 'seat available';
                seat.textContent = seatId;
                seat.dataset.seatId = seatId;
                seat.addEventListener('click', () => this.handleSeatClick(seatId));
                seatsGrid.appendChild(seat);
            }
        }
    }

    async createSession() {
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentSessionId = data.sessionId;
                this.showSessionInfo();
                this.showMessage('새로운 세션이 생성되었습니다!', 'success');
            } else {
                this.showMessage('세션 생성에 실패했습니다.', 'error');
            }
        } catch (error) {
            this.showMessage('서버 연결 오류: ' + error.message, 'error');
        }
    }

    showSessionInfo() {
        const sessionInfo = document.getElementById('sessionInfo');
        const noSession = document.getElementById('noSession');
        const currentSessionId = document.getElementById('currentSessionId');

        if (sessionInfo && noSession && currentSessionId) {
            noSession.style.display = 'none';
            sessionInfo.style.display = 'block';
            currentSessionId.textContent = this.currentSessionId;
        }
    }

    async clearSession() {
        if (this.selectedSeatId) {
            await this.unlockSeat(this.selectedSeatId);
        }
        
        this.currentSessionId = null;
        this.selectedSeatId = null;
        
        const sessionInfo = document.getElementById('sessionInfo');
        const noSession = document.getElementById('noSession');
        
        if (sessionInfo && noSession) {
            noSession.style.display = 'block';
            sessionInfo.style.display = 'none';
        }
        
        this.showMessage('세션이 삭제되었습니다.', 'info');
        this.updateSeatsDisplay();
    }

    async handleSeatClick(seatId) {
        if (!this.currentSessionId) {
            this.showMessage('먼저 세션을 생성해주세요.', 'error');
            return;
        }

        const seat = document.querySelector(`[data-seat-id="${seatId}"]`);
        if (!seat) return;
        
        if (seat.classList.contains('locked')) {
            this.showMessage('이미 잠긴 좌석입니다.', 'error');
            return;
        }

        if (seat.classList.contains('selected')) {
            // 선택된 좌석 해제
            await this.unlockSeat(seatId);
        } else {
            // 좌석 선택
            await this.lockSeat(seatId);
        }
    }

    async lockSeat(seatId) {
        try {
            const response = await fetch(`/api/seats/${seatId}/lock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    seatId: seatId,
                    sessionId: this.currentSessionId
                })
            });

            if (response.ok) {
                this.selectedSeatId = seatId;
                this.lockedSeats.add(seatId);
                this.showMessage(`좌석 ${seatId}이(가) 성공적으로 잠금 처리되었습니다!`, 'success');
                this.updateSeatsDisplay();
                this.updateStatus();
            } else {
                const errorData = await response.json();
                this.showMessage(errorData.error || '좌석 잠금에 실패했습니다.', 'error');
            }
        } catch (error) {
            this.showMessage('서버 연결 오류: ' + error.message, 'error');
        }
    }

    async unlockSeat(seatId) {
        try {
            const response = await fetch(`/api/seats/${seatId}/lock?sessionId=${this.currentSessionId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (this.selectedSeatId === seatId) {
                    this.selectedSeatId = null;
                }
                this.lockedSeats.delete(seatId);
                this.showMessage(`좌석 ${seatId}의 잠금이 해제되었습니다.`, 'info');
                this.updateSeatsDisplay();
                this.updateStatus();
            } else {
                const errorData = await response.json();
                this.showMessage(errorData.error || '좌석 잠금 해제에 실패했습니다.', 'error');
            }
        } catch (error) {
            this.showMessage('서버 연결 오류: ' + error.message, 'error');
        }
    }

    updateSeatsDisplay() {
        const seats = document.querySelectorAll('.seat');
        seats.forEach(seat => {
            const seatId = parseInt(seat.dataset.seatId);
            seat.className = 'seat';
            
            if (seatId === this.selectedSeatId) {
                seat.classList.add('selected');
            } else if (this.lockedSeats.has(seatId)) {
                seat.classList.add('locked');
            } else {
                seat.classList.add('available');
            }
        });
    }

    updateStatus() {
        const statusList = document.getElementById('statusList');
        if (!statusList) return;

        statusList.innerHTML = '';

        // 현재 세션 정보
        if (this.currentSessionId) {
            this.addStatusItem('현재 세션', this.currentSessionId);
            this.addStatusItem('선택된 좌석', this.selectedSeatId ? this.selectedSeatId : '없음');
        } else {
            this.addStatusItem('현재 세션', '없음');
            this.addStatusItem('선택된 좌석', '없음');
        }

        // 잠긴 좌석 수
        this.addStatusItem('잠긴 좌석 수', this.lockedSeats.size);
    }

    addStatusItem(label, value) {
        const statusList = document.getElementById('statusList');
        if (!statusList) return;

        const item = document.createElement('div');
        item.className = 'status-item';
        item.innerHTML = `
            <span><strong>${label}:</strong></span>
            <span>${value}</span>
        `;
        statusList.appendChild(item);
    }

    showMessage(text, type) {
        const messageArea = document.getElementById('messageArea');
        if (!messageArea) return;

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        messageArea.appendChild(message);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', function() {
    window.seatApp = new SeatReservationApp();
});
