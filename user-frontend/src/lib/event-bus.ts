type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const callbacks = this.events.get(event)!;
    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    };
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  once(event: string, callback: EventCallback): () => void {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper);
      callback(...args);
    };

    return this.on(event, wrapper);
  }

  clear(): void {
    this.events.clear();
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.size ?? 0;
  }
}

export const eventBus = new EventBus();

// React hook for using the event bus
import { useEffect } from 'react';

export function useEventListener(event: string, callback: EventCallback) {
  useEffect(() => {
    const unsubscribe = eventBus.on(event, callback);
    return unsubscribe;
  }, [event, callback]);
}