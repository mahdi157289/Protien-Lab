import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import api from '../../config/api';
import ProductCard from '../store/ProductCard';
import SectionDivider from '../common/SectionDivider';

const OurProduct = () => {
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

  const cards = [...products, ...products].map((p, idx) => ({ ...p, __k: `${p._id || 'p'}-${idx}` }));

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
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-6"
            style={{ width: `${cards.length * 344}px` }}
            initial={{ x: 0 }}
            animate={{ x: `-${(products.length) * 344}px` }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
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


