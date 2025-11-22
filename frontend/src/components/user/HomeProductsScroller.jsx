import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import api from '../../config/api';

const HomeProductsScroller = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Duplicate for seamless scroll
  const items = [...products, ...products].map((p, idx) => ({ ...p, __k: `${p._id || 'p'}-${idx}` }));

  const toImg = (p) => {
    const imgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
    const src = imgs[0] || '';
    return src ? `${import.meta.env.VITE_IMAGE_URL}/${src.replace(/^\/+/, '')}` : 'https://via.placeholder.com/240x180/ededed/222?text=No+Image';
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
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-6"
            style={{ width: `${items.length * 260}px` }}
            initial={{ x: 0 }}
            animate={{ x: `-${(products.length) * 260}px` }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          >
            {items.map((p) => (
              <NavLink key={p.__k} to="/store" className="min-w-[240px]">
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


