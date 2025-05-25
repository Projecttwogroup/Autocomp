import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Common navigation paths that should be prefetched
const prefetchPaths: Record<string, string[]> = {
  '/': ['/tickets', '/contact', '/profile'],
  '/tickets': ['/submit', '/contact'],
  '/submit': ['/tickets', '/contact'],
  '/contact': ['/tickets', '/submit'],
};

// Resource hints for key routes
const resourceHints: Record<string, string[]> = {
  '/tickets': ['/api/tickets', '/api/users'],
  '/contact': ['/api/chat', '/api/agents'],
  '/profile': ['/api/user', '/api/settings'],
};

export function useRoutePrefetch() {
  const { pathname } = useLocation();

  const prefetchRoute = useCallback((path: string) => {
    const script = document.createElement('link');
    script.rel = 'prefetch';
    script.as = 'script';
    script.href = path;
    document.head.appendChild(script);
  }, []);

  const prefetchApi = useCallback((path: string) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = path;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    // Prefetch related route chunks
    const routesToPrefetch = prefetchPaths[pathname] || [];
    routesToPrefetch.forEach(route => {
      try {
        // Using dynamic import to trigger webpack's prefetch
        const prefetchChunk = () => {
          const path = route === '/' ? 'HomePage' : route.slice(1);
          import(`@/pages/${path}`).catch(() => {
            // Silently fail - this is just prefetching
          });
        };
        
        // Delay prefetching to not block the main route
        setTimeout(prefetchChunk, 1000);
      } catch (error) {
        // Ignore prefetch errors
      }
    });

    // Prefetch API endpoints
    const apisToPrefetch = resourceHints[pathname] || [];
    apisToPrefetch.forEach(api => {
      try {
        prefetchApi(api);
      } catch (error) {
        // Ignore prefetch errors
      }
    });

    // Cleanup function to remove unused prefetch hints
    return () => {
      document.querySelectorAll('link[rel="prefetch"]').forEach(element => {
        if (!routesToPrefetch.some(route => element.getAttribute('href')?.includes(route))) {
          element.remove();
        }
      });
    };
  }, [pathname, prefetchApi]);
}