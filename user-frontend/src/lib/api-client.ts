import { apiRateLimiter, uploadRateLimiter } from './rate-limiter';
import { apiCache } from './cache';

interface ApiError extends Error {
  status?: number;
  data?: any;
}

interface RequestOptions extends Omit<RequestInit, 'cache'> {
  params?: Record<string, string>;
  useCache?: boolean;
  cacheKey?: string;
  useRateLimiter?: boolean;
}

const BASE_URL = '/api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = new Error('API request failed');
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        error.data = await response.text();
      }
      throw error;
    }

    return response.json();
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private getCacheKey(url: string, init?: RequestInit): string {
    return `${init?.method || 'GET'}:${url}:${JSON.stringify(init?.body)}`;
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, useCache = true, cacheKey, useRateLimiter = true, ...init } = options;
    const url = this.buildUrl(endpoint, params);
    const key = cacheKey || this.getCacheKey(url, init);

    if (useCache) {
      const cachedData = apiCache.get(key);
      if (cachedData) {
        return cachedData;
      }
    }

    if (useRateLimiter) {
      await apiRateLimiter.throttle();
    }

    const response = await fetch(url, {
      ...init,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    const data = await this.handleResponse<T>(response);
    
    if (useCache) {
      apiCache.set(key, data);
    }

    return data;
  }

  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { params, useRateLimiter = true, ...init } = options;
    const url = this.buildUrl(endpoint, params);

    if (useRateLimiter) {
      await apiRateLimiter.throttle();
    }

    const response = await fetch(url, {
      ...init,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { params, useRateLimiter = true, ...init } = options;
    const url = this.buildUrl(endpoint, params);

    if (useRateLimiter) {
      await apiRateLimiter.throttle();
    }

    const response = await fetch(url, {
      ...init,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, useRateLimiter = true, ...init } = options;
    const url = this.buildUrl(endpoint, params);

    if (useRateLimiter) {
      await apiRateLimiter.throttle();
    }

    const response = await fetch(url, {
      ...init,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const { params, useRateLimiter = true, ...init } = options;
    const url = this.buildUrl(endpoint, params);

    if (useRateLimiter) {
      await apiRateLimiter.throttle();
    }

    const response = await fetch(url, {
      ...init,
      method: 'POST',
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  clearCache() {
    apiCache.clear();
  }
}