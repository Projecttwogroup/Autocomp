import { useEffect, useRef } from 'react';
import { performanceService } from '@/services/performance-service';

export interface PerformanceOptions {
  trackMounts?: boolean;
  trackRenders?: boolean;
  metadata?: Record<string, any>;
}

export function usePerformance(
  componentName: string,
  options: PerformanceOptions = {}
) {
  const { trackMounts = true, trackRenders = true, metadata } = options;
  const renderCount = useRef(0);

  useEffect(() => {
    if (trackMounts) {
      performanceService.startMeasure(`${componentName}:mount`, {
        ...metadata,
        mountTime: Date.now(),
      });

      return () => {
        performanceService.endMeasure(`${componentName}:mount`, {
          ...metadata,
          unmountTime: Date.now(),
          totalRenders: renderCount.current,
        });
      };
    }
  }, [componentName, metadata, trackMounts]);

  useEffect(() => {
    if (trackRenders) {
      renderCount.current++;
      const renderMetadata = {
        ...metadata,
        renderCount: renderCount.current,
        renderTime: Date.now(),
      };

      performanceService.startMeasure(`${componentName}:render`, renderMetadata);
      return () => {
        performanceService.endMeasure(`${componentName}:render`, renderMetadata);
      };
    }
  });

  return renderCount.current;
}