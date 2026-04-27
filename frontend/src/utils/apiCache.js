/**
 * Simple API Cache Utility
 * Prevents duplicate API calls within a short time window
 * Useful for components that fetch the same data simultaneously
 */

const cache = new Map();
const DEFAULT_TTL = 30000; // 30 seconds default cache time

/**
 * Get cached data or fetch if not cached/expired
 * @param {string} key - Cache key (usually the API URL)
 * @param {Function} fetchFn - Function that returns a Promise with the data
 * @param {number} ttl - Time to live in milliseconds (default: 30000)
 * @returns {Promise} - Cached or fresh data
 */
export const getCachedData = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  const now = Date.now();
  const cached = cache.get(key);

  // Return cached data if still valid AND it's not an empty result
  // Only evaluate emptiness when we actually have a resolved data object
  if (cached && cached.data && (now - cached.timestamp) < ttl) {
    // Don't return cached empty results - always refetch if previous result was empty
    // Check if the cached response indicates an empty array result
    const hasSuccess = Boolean(cached.data?.data?.success);
    const payload = cached.data?.data?.data;
    const isArrayPayload = Array.isArray(payload);
    const isEmpty = hasSuccess && isArrayPayload && payload.length === 0;
    
    if (!isEmpty) {
      return cached.data;
    }
    // If cached result was empty, clear it and fetch fresh
    cache.delete(key);
  }

  // If there's an ongoing request, return its promise
  if (cached && cached.promise) {
    return cached.promise;
  }

  // Create new request
  const promise = fetchFn()
    .then((data) => {
      // Only cache non-empty results
      const hasSuccess = Boolean(data?.data?.success);
      const payload = data?.data?.data;
      const isArrayPayload = Array.isArray(payload);
      const isEmpty = hasSuccess && isArrayPayload && payload.length === 0;
      
      if (!isEmpty) {
        // Cache the result only if it's not empty
        cache.set(key, {
          data,
          timestamp: now,
          promise: null,
        });
      } else {
        // Don't cache empty results - remove from cache if it exists
        cache.delete(key);
      }
      return data;
    })
    .catch((error) => {
      // Remove failed request from cache
      cache.delete(key);
      throw error;
    });

  // Store promise to prevent duplicate requests
  cache.set(key, {
    data: null,
    timestamp: now,
    promise,
  });

  return promise;
};

/**
 * Clear cache for a specific key or all cache
 * @param {string} key - Optional key to clear, if not provided clears all
 */
export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

/**
 * Get cache size (for debugging)
 */
export const getCacheSize = () => cache.size;


