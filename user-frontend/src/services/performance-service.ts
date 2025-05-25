import { eventBus } from '@/lib/event-bus';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ResourceMetric {
  name: string;
  size: number;
  duration: number;
  type: string;
}

interface PerformanceMeasure {
  name: string;
  startTime: number;
  metadata?: Record<string, any>;
}

interface PerformanceEntry {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  success: boolean;
  metadata?: Record<string, any>;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private marks = new Map<string, number>();
  private measures = new Map<string, PerformanceMeasure>();
  private readonly MAX_METRICS = 100;
  private readonly MAX_ENTRIES = 1000;

  private readonly PERFORMANCE_THRESHOLDS: Record<string, number> = {
    'chat:message:send': 1000,
    'chat:message:receive': 500,
    'signalr:connection': 3000,
    'signalr:reconnection': 5000,
    default: 1000,
  };

  startMeasure(name: string, metadata?: Record<string, any>) {
    this.marks.set(name, performance.now());
    this.measures.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  endMeasure(name: string, metadata?: Record<string, any>): PerformanceEntry | undefined {
    const startMark = this.marks.get(name);
    const measure = this.measures.get(name);

    if (!startMark || !measure) {
      console.warn(`No start mark found for measurement: ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - measure.startTime;

    const entry: PerformanceEntry = {
      name,
      duration,
      startTime: measure.startTime,
      endTime,
      success: true,
      metadata: {
        ...measure.metadata,
        ...metadata,
      },
    };

    this.addEntry(entry);
    this.marks.delete(name);
    this.measures.delete(name);

    const threshold = this.PERFORMANCE_THRESHOLDS[name] ?? this.PERFORMANCE_THRESHOLDS.default;
    if (duration > threshold) {
      this.handlePerformanceIssue(entry);
    }

    return entry;
  }

  private addEntry(entry: PerformanceEntry) {
    this.metrics.push({
      name: entry.name,
      duration: entry.duration,
      timestamp: Date.now(),
      metadata: entry.metadata,
    });

    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    eventBus.emit('performance:metric', entry);
  }

  private handlePerformanceIssue(entry: PerformanceEntry) {
    console.warn('Performance issue detected:', {
      ...entry,
      threshold: this.PERFORMANCE_THRESHOLDS[entry.name] ?? this.PERFORMANCE_THRESHOLDS.default,
    });

    eventBus.emit('performance:issue', entry);
  }
}

export const performanceService = new PerformanceService();