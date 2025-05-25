interface CacheOptions {
  maxAge?: number; // milliseconds
  maxSize?: number; // number of items
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class Cache<T = any> {
  private store = new Map<string, CacheEntry<T>>();
  private maxAge: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100;
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxSize) {
      // Remove oldest entry when cache is full
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    const isExpired = Date.now() - entry.timestamp > this.maxAge;
    if (isExpired) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.store.delete(key);
      }
    }
  }
}

// Create cache instances for different use cases
export const apiCache = new Cache<any>({ maxAge: 5 * 60 * 1000 }); // 5 minutes
export const imageCache = new Cache<string>({ maxAge: 30 * 60 * 1000 }); // 30 minutes
export const userCache = new Cache({ maxAge: 15 * 60 * 1000 }); // 15 minutes