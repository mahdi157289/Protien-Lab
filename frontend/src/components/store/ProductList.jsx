import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import api from '../../config/api';
import { Loader, Search, SlidersHorizontal, Sparkles, Filter, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const CATEGORY_OPTIONS = [
  "Whey",
  "Mass Gainer",
  "Isolate Whey",
  "Vitamines & Minerals",
  "Creatine",
  "Acide Amine",
  "Pre-Workout",
  "Fat Burner",
  "Testobooster",
  "Join-Flex",
  "Fish oil",
  "Carbs",
  "Snacks",
  "Shakers",
  "Accesoires",
];

const INITIAL_FILTERS = {
  search: "",
  sort: "name",
  minPrice: "",
  maxPrice: "",
  categories: [],
  brands: [],
  bestSeller: false,
};

const normalizeValues = (values = []) =>
  values
    .map((value) => value?.toString().toLowerCase().trim())
    .filter(Boolean);

// Custom hook for product filters
const useProductFilters = (initialProducts) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

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

    if (filters.categories && filters.categories.length > 0) {
      const selectedCategories = new Set(normalizeValues(filters.categories));
      filtered = filtered.filter((product) =>
        normalizeValues(product.categories).some((category) => selectedCategories.has(category))
      );
    }

    if (filters.brands && filters.brands.length > 0) {
      const selectedBrands = new Set(normalizeValues(filters.brands));
      filtered = filtered.filter(
        (product) => product.brand && selectedBrands.has(product.brand.toLowerCase().trim())
      );
    }

    if (filters.bestSeller) {
      filtered = filtered.filter(p => p.isBestSeller);
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
    setFilteredProducts,
    setFilters,
  };
};

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Initialize filters
  const {
    filters,
    filteredProducts,
    handleFilterChange,
    applyFilters,
    setFilteredProducts,
    setFilters,
  } = useProductFilters([]);

  const resetFilters = () => {
    setFilters({ ...INITIAL_FILTERS });
    setFilteredProducts(products);
  };

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/users/products');
        const fetchedProducts = response.data.products || [];
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        const brandSet = new Set();
        fetchedProducts.forEach((product) => {
          if (product.brand) {
            brandSet.add(product.brand);
          }
        });
        setAvailableBrands(Array.from(brandSet).sort());
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
      className="min-h-screen px-8 py-10 bg-secondary/50 backdrop-blur-sm"
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="lg:col-span-3 h-max lg:sticky lg:top-24"
        >
          <div className="relative p-6 text-white rounded-2xl bg-gradient-to-br from-dark via-dark to-dark/95 border border-primary/20 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20 relative z-10">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                <span className="bg-gradient-to-r from-accent via-white to-accent bg-clip-text text-transparent">
                  {t('product_search')} & Filters
                </span>
              </h2>
            </div>

            <div className="mb-6 relative z-10">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                {t('product_search')}
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="search"
                  placeholder={t('product_search')}
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 pl-11 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors duration-300 size-5 pointer-events-none" />
              </div>
            </div>

            <div className="mb-6 relative z-10">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                {t('product_sort_name')}
              </label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 cursor-pointer"
              >
                <option value="name">{t('product_sort_name')}</option>
                <option value="price">{t('product_sort_price')}</option>
              </select>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm border border-primary/10 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-green-400" />
                <div className="text-xs font-bold uppercase tracking-wider text-green-400">Categories</div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {CATEGORY_OPTIONS.map((category) => {
                  const isChecked = filters.categories.includes(category);
                  return (
                    <label key={category} className="group flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-all duration-200">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...filters.categories, category]
                              : filters.categories.filter((item) => item !== category);
                            setFilters({ ...filters, categories: next });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded border-2 border-primary/40 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 relative overflow-hidden group-hover:border-primary/70">
                          {isChecked && (
                            <div className="absolute inset-0 bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 bg-dark rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs transition-colors duration-200 ${isChecked ? 'text-green-400 font-semibold' : 'text-green-300 group-hover:text-green-400'}`}>
                        {category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm border border-primary/10 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-green-400" />
                <div className="text-xs font-bold uppercase tracking-wider text-green-400">Brands</div>
              </div>
              {availableBrands.length === 0 ? (
                <div className="text-xs text-green-300/70 italic py-2">
                  {t('no_brands_available') || 'No brands available yet'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {availableBrands.map((brand) => {
                    const isChecked = filters.brands.includes(brand);
                    return (
                      <label key={brand} className="group flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-all duration-200">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...filters.brands, brand]
                                : filters.brands.filter((item) => item !== brand);
                              setFilters({ ...filters, brands: next });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-4 h-4 rounded border-2 border-primary/40 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 relative overflow-hidden group-hover:border-primary/70">
                            {isChecked && (
                              <div className="absolute inset-0 bg-primary flex items-center justify-center">
                                <div className="w-2 h-2 bg-dark rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs transition-colors duration-200 ${isChecked ? 'text-green-400 font-semibold' : 'text-green-300 group-hover:text-green-400'}`}>
                          {brand}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-6 relative z-10">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="minPrice"
                  placeholder={t('product_min_price')}
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder={t('product_max_price')}
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 relative z-10">
              <label className="group flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.bestSeller}
                    onChange={(e) => setFilters({ ...filters, bestSeller: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-200 relative overflow-hidden ${filters.bestSeller ? 'border-primary bg-primary' : 'border-primary/40 group-hover:border-primary/70'}`}>
                    {filters.bestSeller && (
                      <div className="absolute inset-0 bg-primary flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-dark rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-semibold transition-colors duration-200 ${filters.bestSeller ? 'text-green-400' : 'text-green-300 group-hover:text-green-400'}`}>
                  Best Seller Only
                </span>
              </label>
            </div>

            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => applyFilters(products)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-green-600 text-dark font-bold hover:from-green-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/30 transform hover:scale-[1.02]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                <Filter className="w-4 h-4" />
                {t('product_apply_filters')}
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-3 rounded-xl border-2 border-accent/30 text-accent/70 hover:text-accent hover:border-primary/50 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                aria-label="Reset filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="lg:col-span-9"
        >
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center rounded-2xl bg-dark/80 text-accent shadow-lg"
            >
              <p className="text-lg text-accent/80">{t('product_no_products')}</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 mt-4 text-white bg-green-500 rounded-lg hover:bg-green-600"
              >
                {t('product_reset_filters')}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="grid grid-cols-1 gap-12 px-0 sm:grid-cols-2 lg:grid-cols-3"
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
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ProductList;