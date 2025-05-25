import { useRef, useCallback, useEffect } from 'react';
import { performanceService } from '@/services/performance-service';
import { useCleanup } from '@/lib/cleanup';

interface ChatScrollOptions {
  smoothScroll?: boolean;
  threshold?: number;
  debounceMs?: number;
}

export function useChatScroll(options: ChatScrollOptions = {}) {
  const {
    smoothScroll = true,
    threshold = 100,
    debounceMs = 100,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);
  const debounceTimerRef = useRef<number>();
  const cleanup = useCleanup();

  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    const { scrollHeight, scrollTop, clientHeight } = container;
    return scrollHeight - (scrollTop + clientHeight) <= threshold;
  }, [threshold]);

  const scrollToBottom = useCallback((force = false) => {
    performanceService.startMeasure('chat:scroll');

    const container = containerRef.current;
    if (!container || (!force && !shouldScrollToBottomRef.current)) return;

    isScrollingRef.current = true;

    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smoothScroll ? 'smooth' : 'auto',
      });

      performanceService.endMeasure('chat:scroll', {
        forced: force,
        smooth: smoothScroll,
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, smoothScroll ? 300 : 0);
    });
  }, [smoothScroll]);

  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      shouldScrollToBottomRef.current = isNearBottom();
    }, debounceMs);
  }, [isNearBottom, debounceMs]);

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    cleanup.add(() => container.removeEventListener('scroll', handleScroll));
  }, [handleScroll, cleanup]);

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    scrollToBottom,
    isNearBottom,
    shouldScrollToBottom: shouldScrollToBottomRef.current,
  };
}