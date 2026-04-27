import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../config/api';
import { resolveImageUrl } from '../../lib/image';

const HomeProductsScroller = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndex, setScrollIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/products?limit=12');
        if (!mounted) return;
        const list = Array.isArray(res.data.products) ? res.data.products : res.data;
        setProducts(list || []);
      } catch (e) {
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Calculate dimensions
  const CARD_WIDTH = 240;
  const GAP = 24; // gap-6 = 24px
  const SCROLL_DISTANCE = CARD_WIDTH + GAP;
  const maxScrollIndex = products.length > 0 ? Math.max(0, products.length - 1) : 0;

  // Handle scroll navigation
  const handleScrollLeft = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleScrollRight = () => {
    setScrollIndex((prev) => Math.min(maxScrollIndex, prev + 1));
  };

  // Calculate scroll position
  const scrollX = -scrollIndex * SCROLL_DISTANCE;

  const toImg = (p) => {
    const imgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
    const src = imgs[0] || '';
    const resolved = resolveImageUrl(src);
    return resolved || 'https://via.placeholder.com/240x180/ededed/222?text=No+Image';
  };

  return (
    <section className="w-full px-4 py-12 overflow-hidden relative">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">
          <span>Featured </span>
          <span className="text-primary">Products</span>
        </h2>
        <NavLink to="/store" className="text-primary underline">Shop all</NavLink>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden" ref={containerRef}>
          {/* Left Arrow */}
          {scrollIndex > 0 && (
            <button
              onClick={handleScrollLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-dark/80 hover:bg-dark text-accent flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow */}
          {scrollIndex < maxScrollIndex && (
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
            style={{ width: `${products.length * SCROLL_DISTANCE}px` }}
            animate={{ x: scrollX }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
          >
            {products.map((p, idx) => (
              <NavLink key={p._id || `product-${idx}`} to="/store" className="min-w-[240px]">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow hover:shadow-lg transition">
                  <div className="h-40 bg-white flex items-center justify-center">
                    <img src={toImg(p)} alt={p.name} className="object-contain max-h-36 w-full" onError={(e)=>{e.currentTarget.src='https://via.placeholder.com/240x180/ededed/222?text=No+Image';}} />
                  </div>
                  <div className="p-3 bg-dark text-accent">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-primary font-bold">{p.price} TD</div>
                  </div>
                </div>
              </NavLink>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default HomeProductsScroller;


