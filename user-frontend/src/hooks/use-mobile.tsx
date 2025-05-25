import { useState, useEffect, useCallback, useRef } from 'react';

interface TouchSwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [touchSupported, setTouchSupported] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkMobile();
    setTouchSupported('ontouchstart' in window);

    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const useSwipe = useCallback(({ onSwipeLeft, onSwipeRight, threshold = 50 }: TouchSwipeConfig) => {
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const onTouchStart = (e: TouchEvent) => {
      setTouchStart(e.touches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart) return;

      const currentTouch = e.touches[0].clientX;
      const diff = touchStart - currentTouch;

      // Check if swipe is significant enough
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
        setTouchStart(null);
      }
    };

    const onTouchEnd = () => {
      setTouchStart(null);
    };

    useEffect(() => {
      if (!touchSupported) return;

      document.addEventListener('touchstart', onTouchStart);
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);

      return () => {
        document.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };
    }, [onSwipeLeft, onSwipeRight, threshold, touchStart]);
  }, [touchSupported]);

  const usePullToRefresh = useCallback((onRefresh: () => Promise<void>) => {
    const [refreshing, setRefreshing] = useState(false);
    const pullStartY = useRef(0);
    const pullMoveY = useRef(0);
    const distanceThreshold = 60;
    const resistanceFactor = 0.5;

    useEffect(() => {
      if (!touchSupported || !isMobile) return;

      const handleTouchStart = (e: TouchEvent) => {
        const { scrollTop } = document.documentElement;
        if (scrollTop <= 0) {
          pullStartY.current = e.touches[0].clientY;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (pullStartY.current === 0) return;

        pullMoveY.current = e.touches[0].clientY;
        const pullDistance = (pullMoveY.current - pullStartY.current) * resistanceFactor;

        if (pullDistance > 0 && pullDistance < distanceThreshold) {
          e.preventDefault();
          // Apply pull effect here
        }
      };

      const handleTouchEnd = async () => {
        const pullDistance = (pullMoveY.current - pullStartY.current) * resistanceFactor;

        if (pullDistance > distanceThreshold) {
          setRefreshing(true);
          await onRefresh();
          setRefreshing(false);
        }

        pullStartY.current = 0;
        pullMoveY.current = 0;
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }, [touchSupported, isMobile, onRefresh]);

    return refreshing;
  }, [touchSupported, isMobile]);

  return {
    isMobile,
    isLandscape,
    touchSupported,
    useSwipe,
    usePullToRefresh,
  };
}
