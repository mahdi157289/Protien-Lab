import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../config/api';
import ProductCard from '../store/ProductCard';
import SectionDivider from '../common/SectionDivider';
import { SkeletonProductCard } from '../common/Skeletons';
import { getCachedData } from '../../utils/apiCache';

const OurProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const containerRef = useRef(null);
  const currentXRef = useRef(0);
  const [pausedByHover, setPausedByHover] = useState(false);
  const x = useMotionValue(0);

  useEffect(() => {
    const unsub = x.on('change', (v) => {
      currentXRef.current = v;
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [x]);

  useAnimationFrame((t, delta) => {
    if (!autoScrollPaused && products.length > 0) {
      const dist = products.length * SCROLL_DISTANCE;
      const speed = dist / 80;
      const next = x.get() - speed * (delta / 1000);
      if (next <= -dist) {
        x.set(next + dist);
      } else {
        x.set(next);
      }
    }
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCachedData('/users/products?limit=12', () => api.get('/users/products?limit=12'), 30000);
        if (!mounted) return;
        const list = Array.isArray(res.data.products) ? res.data.products : res.data;
        setProducts(list || []);
      } catch {
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const cards = [...products, ...products].map((p, idx) => ({ ...p, __k: `${p._id || 'p'}-${idx}` }));

  // Calculate dimensions
  const CARD_WIDTH = 320;
  const GAP = 24; // gap-6 = 24px
  const SCROLL_DISTANCE = CARD_WIDTH + GAP;
  const maxScrollIndex = products.length > 0 ? Math.max(0, products.length - 1) : 0;

  // Handle scroll navigation - pause auto-scroll when manually navigating
  const getNearestIndexFromX = () => {
    const idx = Math.round(-currentXRef.current / SCROLL_DISTANCE);
    return Math.min(Math.max(idx, 0), maxScrollIndex);
  };

  const handleScrollLeft = () => {
    const base = pausedByHover ? getNearestIndexFromX() : scrollIndex;
    const next = Math.max(0, base - 1);
    setAutoScrollPaused(true);
    setPausedByHover(pausedByHover);
    setScrollIndex(next);
    x.set(-next * SCROLL_DISTANCE);
    clearTimeout(window.autoScrollResumeTimeout);
    if (!pausedByHover) {
      window.autoScrollResumeTimeout = setTimeout(() => setAutoScrollPaused(false), 5000);
    }
  };

  const handleScrollRight = () => {
    const base = pausedByHover ? getNearestIndexFromX() : scrollIndex;
    const next = Math.min(maxScrollIndex, base + 1);
    setAutoScrollPaused(true);
    setPausedByHover(pausedByHover);
    setScrollIndex(next);
    x.set(-next * SCROLL_DISTANCE);
    clearTimeout(window.autoScrollResumeTimeout);
    if (!pausedByHover) {
      window.autoScrollResumeTimeout = setTimeout(() => setAutoScrollPaused(false), 5000);
    }
  };

  const scrollX = -scrollIndex * SCROLL_DISTANCE;

  useEffect(() => {
    if (autoScrollPaused && !pausedByHover) {
      x.set(scrollX);
    }
  }, [scrollX, autoScrollPaused, pausedByHover, x]);

  return (
    <section className="w-full px-4 py-12 overflow-hidden relative">
      <div className="mb-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          <span>Our </span>
          <span className="text-primary">Product</span>
        </h2>
        <SectionDivider className="mb-4" />
        <div className="mt-2">
          <NavLink to="/store" className="text-primary underline">Shop all</NavLink>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
          {[...Array(6)].map((_, idx) => (
            <SkeletonProductCard key={`ourproduct-skel-${idx}`} />
          ))}
        </div>
      ) : (
        <div
          className="relative w-full overflow-hidden"
          ref={containerRef}
          onMouseEnter={() => {
            setPausedByHover(true);
            setAutoScrollPaused(true);
          }}
          onMouseLeave={() => {
            setPausedByHover(false);
            setAutoScrollPaused(false);
          }}
        >
          {/* Left Arrow */}
          {(() => {
            const baseIdx = pausedByHover ? getNearestIndexFromX() : scrollIndex;
            return (autoScrollPaused || baseIdx > 0);
          })() && (
              <button
                onClick={handleScrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-dark/80 hover:bg-dark text-accent flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} />
              </button>
            )}

          {/* Right Arrow */}
          {(() => {
            const baseIdx = pausedByHover ? getNearestIndexFromX() : scrollIndex;
            return (autoScrollPaused || baseIdx < maxScrollIndex);
          })() && (
              <button
                onClick={handleScrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-dark/80 hover:bg-dark text-accent flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight size={24} />
              </button>
            )}

          <motion.div
            className="flex gap-6"
            style={{ width: `${cards.length * SCROLL_DISTANCE}px`, x }}
            drag="x"
            dragElastic={0.05}
            dragMomentum={false}
            onDragStart={() => {
              setAutoScrollPaused(true);
              setPausedByHover(false);
            }}
            onDragEnd={(e, info) => {
              const threshold = SCROLL_DISTANCE / 4;
              if (info.offset.x > threshold) {
                setScrollIndex((prev) => {
                  const base = pausedByHover ? getNearestIndexFromX() : prev;
                  const next = Math.max(0, base - 1);
                  x.set(-next * SCROLL_DISTANCE);
                  return next;
                });
              } else if (info.offset.x < -threshold) {
                setScrollIndex((prev) => {
                  const base = pausedByHover ? getNearestIndexFromX() : prev;
                  const next = Math.min(maxScrollIndex, base + 1);
                  x.set(-next * SCROLL_DISTANCE);
                  return next;
                });
              }
              clearTimeout(window.autoScrollResumeTimeout);
              window.autoScrollResumeTimeout = setTimeout(() => setAutoScrollPaused(false), 5000);
            }}
          >
            {cards.map((p) => (
              <div key={p.__k} className="min-w-[320px]">
                <ProductCard product={p} />
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default OurProduct;
