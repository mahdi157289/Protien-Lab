import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import api from '../../config/api';
import { Loader, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

// Custom hook for product filters
const useProductFilters = (initialProducts) => {
  const [filters, setFilters] = useState({
    search: '',
    sort: 'name',
    minPrice: '',
    maxPrice: ''
  });

  const [filteredProducts, setFilteredProducts] = useState(initialProducts);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = (products) => {
    let filtered = [...products];

    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    if (filters.sort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    }

    setFilteredProducts(filtered);
    return filtered;
  };

  return {
    filters,
    filteredProducts,
    handleFilterChange,
    applyFilters,
    setFilteredProducts
  };
};

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Initialize filters
  const {
    filters,
    filteredProducts,
    handleFilterChange,
    applyFilters,
    setFilteredProducts
  } = useProductFilters([]);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/users/products');
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products);
    }
  }, [filters, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }} 
      className="min-h-screen px-8 py-10 bg-secondary"
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }} 
        className="mb-8 text-4xl font-bold text-center"
      >
        {t('product_products')}
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.3 }} 
        className="px-4 mb-8 text-center text-accent/80"
      >
        {t('product_products_subtitle')}
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1, delay: 0.5 }} 
        className="flex flex-col justify-center gap-8 mb-8 sm:flex-row sm:gap-16"
      >
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          className="w-full sm:w-[288px] h-[60px] bg-green-500 hover:bg-green-600 font-bold border-2 border-white rounded-[50px] transition duration-200"
          onClick={() => navigate('/store/products')}
        >
          {t('product_products')}
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          className="w-full sm:w-[288px] h-[60px] border-2 border-green-500 #40ee45 hover:bg-green-500 hover:text-white font-bold rounded-[50px] transition duration-200"
          onClick={() => navigate('/store/orders')}
        >
          {t('product_orders')}
        </motion.button>
      </motion.div>

      {/* Filter Section */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.7 }} 
        className="p-4 mb-8 rounded-lg shadow-lg bg-dark"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder={t('product_search')}
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg placeholder-accent/80 bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
            />
            <Search className="absolute right-3 top-3 text-accent/80 size-5" />
          </div>

          <select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg bg-secondary placeholder-accent/80 text-accent border-accent/50 focus:outline-none focus:border-accent"
          >
            <option value="name">{t('product_sort_name')}</option>
            <option value="price">{t('product_sort_price')}</option>
          </select>

          <input
            type="number"
            name="minPrice"
            placeholder={t('product_min_price')}
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg placeholder-accent/80 bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
          />

          <input
            type="number"
            name="maxPrice"
            placeholder={t('product_max_price')}
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg placeholder-accent/80 bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
          />

          <button
            onClick={() => applyFilters(products)}
            className="flex items-center justify-center w-full px-2 py-2 transition-all rounded-md bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {t('product_apply_filters')}
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.8 }} 
        className="container grid grid-cols-1 gap-12 px-4 mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div 
              key={product._id} 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="py-12 text-center"
        >
          <p className="text-lg text-accent/80">{t('product_no_products')}</p>
          <button
            onClick={() => {
              setFilters({
                search: '',
                sort: 'name',
                minPrice: '',
                maxPrice: ''
              });
              setFilteredProducts(products);
            }}
            className="px-4 py-2 mt-4 text-white bg-green-500 rounded-lg hover:bg-green-600"
          >
            {t('product_reset_filters')}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ProductList;