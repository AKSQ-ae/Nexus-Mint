interface PerformanceMetrics {
  responseTime: number;
  messageCount: number;
  errorCount: number;
  timestamp: Date;
}

class ChatPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private timers: Map<string, number> = new Map();

  startTimer(): string {
    const timerId = crypto.randomUUID();
    this.timers.set(timerId, performance.now());
    return timerId;
  }

  endTimer(timerId: string): number {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      console.warn('ChatPerformanceMonitor: Timer not found:', timerId);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(timerId);
    
    // Log if response is slow
    if (duration > 3000) {
      console.warn('ChatPerformanceMonitor: Slow response detected:', duration + 'ms');
    }

    return duration;
  }

  recordMetrics(responseTime: number, messageCount: number, errorCount = 0) {
    this.metrics.push({
      responseTime,
      messageCount,
      errorCount,
      timestamp: new Date()
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance warnings
    const recentMetrics = this.metrics.slice(-5);
    const avgResponseTime = recentMetrics.reduce((acc, m) => acc + m.responseTime, 0) / recentMetrics.length;
    
    if (avgResponseTime > 2000) {
      console.warn('ChatPerformanceMonitor: Average response time is high:', avgResponseTime + 'ms');
    }

    const recentErrors = recentMetrics.reduce((acc, m) => acc + m.errorCount, 0);
    if (recentErrors > 2) {
      console.warn('ChatPerformanceMonitor: High error rate detected:', recentErrors);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((acc, m) => acc + m.responseTime, 0) / this.metrics.length;
  }

  getErrorRate(): number {
    if (this.metrics.length === 0) return 0;
    const totalErrors = this.metrics.reduce((acc, m) => acc + m.errorCount, 0);
    return totalErrors / this.metrics.length;
  }

  reset() {
    this.metrics = [];
    this.timers.clear();
  }
}

export const performanceMonitor = new ChatPerformanceMonitor();
export default performanceMonitor;
