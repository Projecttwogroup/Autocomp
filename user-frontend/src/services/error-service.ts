import { performanceService } from './performance-service';
import { eventBus } from '@/lib/event-bus';

interface ErrorMetadata {
  component?: string;
  context?: string;
  userId?: string;
  [key: string]: any;
}

interface ErrorReport {
  error: Error;
  metadata: ErrorMetadata;
  timestamp: Date;
  url: string;
  userAgent: string;
}

class ErrorService {
  private readonly MAX_STORED_ERRORS = 50;
  private errors: ErrorReport[] = [];
  private errorPatterns: Map<string, number> = new Map();
  private readonly ERROR_THRESHOLD = 5;
  private readonly ERROR_WINDOW_MS = 60000; // 1 minute

  constructor() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.addEventListener('error', this.handleGlobalError);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.captureError(event.reason, {
      type: 'unhandled-rejection',
      promise: event.promise,
    });
  };

  private handleGlobalError = (event: ErrorEvent) => {
    this.captureError(event.error, {
      type: 'global-error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  captureError(error: Error | unknown, metadata: ErrorMetadata = {}) {
    performanceService.startMeasure('error:capture');

    const errorReport: ErrorReport = {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: {
        ...metadata,
        timestamp: new Date(),
      },
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.errors.unshift(errorReport);
    if (this.errors.length > this.MAX_STORED_ERRORS) {
      this.errors.pop();
    }

    // Track error patterns
    const errorKey = this.getErrorKey(errorReport);
    const currentCount = this.errorPatterns.get(errorKey) || 0;
    this.errorPatterns.set(errorKey, currentCount + 1);

    // Check for error threshold
    if (this.shouldTriggerErrorAlert(errorKey)) {
      this.handleErrorThresholdExceeded(errorReport);
    }

    // Emit error event
    eventBus.emit('error:captured', errorReport);

    performanceService.endMeasure('error:capture', {
      errorType: errorReport.error.name,
      context: metadata.context,
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error captured:', errorReport);
    }
  }

  private getErrorKey(report: ErrorReport): string {
    return `${report.error.name}:${report.error.message}`;
  }

  private shouldTriggerErrorAlert(errorKey: string): boolean {
    const count = this.errorPatterns.get(errorKey) || 0;
    return count >= this.ERROR_THRESHOLD;
  }

  private handleErrorThresholdExceeded(report: ErrorReport) {
    eventBus.emit('error:threshold-exceeded', {
      error: report.error,
      count: this.errorPatterns.get(this.getErrorKey(report)),
      timestamp: new Date(),
    });

    // Reset the counter after alerting
    this.errorPatterns.delete(this.getErrorKey(report));
  }

  // Periodically clean up error patterns
  private cleanupErrorPatterns() {
    setInterval(() => {
      this.errorPatterns.clear();
    }, this.ERROR_WINDOW_MS);
  }

  getRecentErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
    this.errorPatterns.clear();
  }
}

export const errorService = new ErrorService();