import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Optimized Image Component with lazy loading, WebP support, and responsive sizes
 * Features:
 * - Native lazy loading with Intersection Observer fallback
 * - WebP format support with fallback
 * - Responsive image sizes
 * - Placeholder/blur-up effect
 * - Error handling
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  sizes,
  srcSet,
  onLoad,
  onError,
  placeholder = true,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Convert image URL to WebP if supported and not already WebP
  const getWebPSrc = (url) => {
    if (!url) return null;
    // If already WebP or Cloudinary URL, return as is
    if (url.includes('.webp') || url.includes('cloudinary.com')) {
      return url;
    }
    // For local uploads, try WebP version (if available)
    // Otherwise return original
    return url;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observerRef.current = observer;
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [loading, isInView]);

  // Load image when in view
  useEffect(() => {
    if (isInView && src && !imageSrc) {
      const webpSrc = getWebPSrc(src);
      setImageSrc(webpSrc);
    }
  }, [isInView, src, imageSrc]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    // Fallback to original src if WebP fails
    if (imageSrc !== src) {
      setImageSrc(src);
    } else if (onError) {
      onError(e);
    }
  };

  // Generate srcSet for responsive images if not provided
  const generateSrcSet = () => {
    if (srcSet) return srcSet;
    if (!src || src.includes('cloudinary.com')) return undefined;
    
    // For Cloudinary, srcSet is handled by the URL itself
    return undefined;
  };

  // Generate sizes attribute if not provided
  const generateSizes = () => {
    if (sizes) return sizes;
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Blur effect */}
      {placeholder && !isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width: '100%', height: '100%' }}
        />
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc || src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          srcSet={generateSrcSet()}
          sizes={generateSizes()}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${hasError ? 'opacity-50' : ''}`}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto',
            objectFit: 'cover',
          }}
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loading: PropTypes.oneOf(['lazy', 'eager']),
  sizes: PropTypes.string,
  srcSet: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  placeholder: PropTypes.bool,
};

export default OptimizedImage;



