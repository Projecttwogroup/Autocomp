import React, { useEffect, useRef } from 'react';
import { eventBus } from './event-bus';
import { performanceService } from '@/services/performance-service';

type CleanupFunction = () => void;

export class CleanupManager {
  private cleanupFunctions: CleanupFunction[] = [];

  add(cleanup: CleanupFunction) {
    this.cleanupFunctions.push(cleanup);
  }

  runAll() {
    this.cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    this.cleanupFunctions = [];
  }
}

export const appCleanup = new CleanupManager();

// Hook for component-level cleanup
export function useCleanup(): CleanupManager {
  const cleanupManager = useRef<CleanupManager>(new CleanupManager());

  useEffect(() => {
    return () => {
      cleanupManager.current.runAll();
    };
  }, []);

  return cleanupManager.current;
}

// Helper for creating resource cleanup
export function createResourceCleanup<T>(
  resource: T,
  cleanup: (resource: T) => void
): CleanupFunction {
  return () => {
    try {
      cleanup(resource);
    } catch (error) {
      console.error('Error cleaning up resource:', error);
    }
  };
}

// Helper for creating interval cleanup
export function createIntervalCleanup(intervalId: number): CleanupFunction {
  return () => clearInterval(intervalId);
}

// Helper for creating timeout cleanup
export function createTimeoutCleanup(timeoutId: number): CleanupFunction {
  return () => clearTimeout(timeoutId);
}