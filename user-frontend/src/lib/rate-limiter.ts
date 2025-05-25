interface RateLimiterOptions {
  maxRequests: number;
  timeWindow: number;
}

export class RateLimiter {
  private lastReset: number;
  private requestCount: number;
  private maxRequests: number;
  private timeWindow: number;

  constructor({ maxRequests, timeWindow }: RateLimiterOptions) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.lastReset = Date.now();
    this.requestCount = 0;
  }

  async throttle(): Promise<void> {
    const now = Date.now();
    if (now - this.lastReset >= this.timeWindow) {
      this.requestCount = 0;
      this.lastReset = now;
    }

    if (this.requestCount >= this.maxRequests) {
      const waitTime = this.timeWindow - (now - this.lastReset);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.throttle();
    }

    this.requestCount++;
  }
}

export const apiRateLimiter = new RateLimiter({
  maxRequests: 50,
  timeWindow: 60000, // 1 minute
});

export const uploadRateLimiter = new RateLimiter({
  maxRequests: 10,
  timeWindow: 60000, // 1 minute
});