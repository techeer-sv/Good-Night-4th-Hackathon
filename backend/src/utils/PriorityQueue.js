class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  // 우선순위에 따른 대기열 추가
  enqueue(item, priority = 0) {
    const queueItem = {
      item,
      priority,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };

    // 우선순위가 높을수록 먼저 처리 (VIP > Premium > Normal)
    const priorityMap = { 'vip': 3, 'premium': 2, 'normal': 1 };
    const itemPriority = priorityMap[priority] || 0;

    // 우선순위와 대기 시간을 고려한 정렬
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      const currentPriority = priorityMap[this.queue[i].priority] || 0;
      
      if (itemPriority > currentPriority) {
        this.queue.splice(i, 0, queueItem);
        inserted = true;
        break;
      } else if (itemPriority === currentPriority) {
        // 같은 우선순위인 경우 먼저 온 사람이 우선
        if (queueItem.timestamp < this.queue[i].timestamp) {
          this.queue.splice(i, 0, queueItem);
          inserted = true;
          break;
        }
      }
    }

    if (!inserted) {
      this.queue.push(queueItem);
    }

    return queueItem.id;
  }

  // 대기열에서 제거
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.queue.shift();
  }

  // 대기열 맨 앞 확인
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.queue[0];
  }

  // 대기열이 비어있는지 확인
  isEmpty() {
    return this.queue.length === 0;
  }

  // 대기열 크기
  size() {
    return this.queue.length;
  }

  // 특정 ID로 대기열에서 제거
  removeById(id) {
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      return this.queue.splice(index, 1)[0];
    }
    return null;
  }

  // 사용자 ID로 대기열에서 제거
  removeByUserId(userId) {
    const index = this.queue.findIndex(item => item.item.userId === userId);
    if (index !== -1) {
      return this.queue.splice(index, 1)[0];
    }
    return null;
  }

  // 대기열 상태 확인
  getStatus() {
    return {
      totalWaiting: this.queue.length,
      vipWaiting: this.queue.filter(item => item.priority === 'vip').length,
      premiumWaiting: this.queue.filter(item => item.priority === 'premium').length,
      normalWaiting: this.queue.filter(item => item.priority === 'normal').length,
      estimatedWaitTime: this.estimateWaitTime()
    };
  }

  // 예상 대기 시간 계산
  estimateWaitTime() {
    if (this.isEmpty()) return 0;
    
    // 우선순위별 가중치 적용
    const weights = { 'vip': 0.5, 'premium': 0.8, 'normal': 1.0 };
    let totalWeightedTime = 0;
    
    this.queue.forEach((item, index) => {
      const weight = weights[item.priority] || 1.0;
      totalWeightedTime += (index + 1) * weight;
    });
    
    // 평균 처리 시간 (초 단위)
    const avgProcessingTime = 30;
    return Math.ceil(totalWeightedTime * avgProcessingTime / this.queue.length);
  }

  // 대기열 초기화
  clear() {
    this.queue = [];
  }
}

module.exports = PriorityQueue;
