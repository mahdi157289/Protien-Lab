import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Override browser's default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => {
      // Use multiple methods to ensure absolute top position
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
    };

    // Immediate execution
    scrollToTop();

    // Small delay for async rendering content completion
    const timer = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
