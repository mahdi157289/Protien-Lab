import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ArrowRight, Search, Loader, Tag, SlidersHorizontal, Sparkles, Filter } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import OfferForm from './OfferForm';

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmLabel, cancelLabel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-80 overflow-y-auto">
      <div className="relative w-full max-w-4xl p-6 my-8 rounded-lg bg-dark text-accent">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-accent hover:bg-green-600"
        >
          <X />
        </button>
        <h2 className="mb-4 text-xl font-bold font-orbitron">{title}</h2>
        {children}
        {onConfirm && (
          <div className="flex justify-between mt-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded bg-dark text-accent hover:bg-gray-700"
            >
              {cancelLabel || "Cancel"}
            </button>
            <button 
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-primary text-accent hover:bg-green-600"
            >
              {confirmLabel || "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  onConfirm: PropTypes.func,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
};

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    descriptionShort: '',
    descriptionFull: '',
    price: '',
    stock: '',
    images: [],
    categories: [],
    isBestSeller: false,
    flavorsInput: '',
    sizesInput: '',
    benefitsInput: '',
    flavors: [],
    weights: [],
    benefits: [],
    isNew: false,
    fastDelivery: false,
    limitedStockNotice: '',
    brand: ''
  });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    sort: 'name',
    minPrice: '',
    maxPrice: '',
    categories: [],
    brands: [],
    bestSeller: false,
  });

  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchProducts = useCallback(async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setIsLoading(false);
      }
  }, [token]);

  useEffect(() => {
    fetchProducts();
    let bc;
    try {
      bc = new BroadcastChannel('offers');
      bc.onmessage = (ev) => {
        if (ev?.data?.type === 'offers-updated') {
          fetchProducts();
        }
      };
    } catch {}
    return () => { try { bc && bc.close(); } catch {} };
  }, [fetchProducts]);

  // Fetch brands from "Nos Marque" photos using admin endpoint
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        if (!token) {
          console.error('No admin token available');
          setAvailableBrands([]);
          return;
        }
        
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Fetch all photos with high limit to get all brands
        const adminApiUrl = `${API_BASE_URL}/admin/photos?category=${encodeURIComponent('Nos Marque')}&isActive=true&limit=1000`;
        
        const response = await axios.get(adminApiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success && response.data.data) {
          // Extract unique brand names from photos created by admin
          const brands = [...new Set(
            response.data.data
              .filter(photo => photo.brandName && photo.isActive && photo.category === 'Nos Marque')
              .map(photo => photo.brandName)
              .filter(Boolean)
          )].sort();
          
          // If editing and current product's brand is not in list, add it
          const currentBrand = currentProduct?.brand;
          if (currentBrand && !brands.includes(currentBrand)) {
            brands.push(currentBrand);
            brands.sort();
          }
          
          setAvailableBrands(brands);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        // Fallback to empty array if error
        setAvailableBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();

    // Listen for photo updates
    let bc;
    try {
      bc = new BroadcastChannel('photos');
      bc.onmessage = (event) => {
        if (event.data?.type === 'photos-updated') {
          fetchBrands();
        }
      };
    } catch (error) {
      console.error('BroadcastChannel not supported:', error);
    }

    return () => {
      if (bc) {
        bc.close();
      }
    };
  }, [currentProduct?.brand, token]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    newProduct.images.forEach((img) => { if (img) formData.append('images', img); });
    formData.append('name', newProduct.name);
    formData.append('descriptionShort', newProduct.descriptionShort);
    formData.append('descriptionFull', newProduct.descriptionFull);
    formData.append('price', newProduct.price);
    formData.append('stock', newProduct.stock);
    formData.append('categories', JSON.stringify(newProduct.categories));
    formData.append('isBestSeller', newProduct.isBestSeller ? 'true' : 'false');
    formData.append('isNew', newProduct.isNew ? 'true' : 'false');
    formData.append('fastDelivery', newProduct.fastDelivery ? 'true' : 'false');
    formData.append('limitedStockNotice', newProduct.limitedStockNotice);
    const flavors = newProduct.flavors.length
      ? newProduct.flavors
      : newProduct.flavorsInput
        ? newProduct.flavorsInput.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    formData.append('flavors', JSON.stringify(flavors));
    const weights = newProduct.weights.length
      ? newProduct.weights
      : newProduct.sizesInput
        ? newProduct.sizesInput.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    formData.append('weights', JSON.stringify(weights));
    const benefits = newProduct.benefits.length
      ? newProduct.benefits
      : newProduct.benefitsInput
        ? newProduct.benefitsInput.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    formData.append('benefits', JSON.stringify(benefits));
    formData.append('brand', newProduct.brand || '');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/products`, 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        }
      );
      setProducts([...products, response.data]);
      setFilteredProducts([...filteredProducts, response.data]);
      setIsAddModalOpen(false);
      setNewProduct({ name:'', descriptionShort:'', descriptionFull:'', price:'', stock:'', images:[], categories:[], isBestSeller:false, flavorsInput:'', sizesInput:'', benefitsInput:'', flavors:[], weights:[], benefits:[], isNew:false, fastDelivery:false, limitedStockNotice:'', brand:'' });
    } catch (error) {
      console.error('Failed to add product', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.response?.data?.message);
      alert(`Failed to add product: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    // Fields to process (arrays from input strings)
    let categories = currentProduct.categories || [];
    // flavors
    let flavors = currentProduct.flavorsInput
      ? currentProduct.flavorsInput.split(',').map(s => s.trim()).filter(Boolean)
      : currentProduct.flavors || [];
    // weights
    let weights = currentProduct.sizesInput
      ? currentProduct.sizesInput.split(',').map(s => s.trim()).filter(Boolean)
      : currentProduct.weights || [];
    // benefits
    let benefits = currentProduct.benefitsInput
      ? currentProduct.benefitsInput.split(',').map(s => s.trim()).filter(Boolean)
      : currentProduct.benefits || [];

    // Regular & required fields
    formData.append('name', currentProduct.name);
    formData.append('descriptionShort', currentProduct.descriptionShort);
    formData.append('descriptionFull', currentProduct.descriptionFull);
    formData.append('price', currentProduct.price);
    formData.append('stock', currentProduct.stock);
    formData.append('categories', JSON.stringify(categories));
    formData.append('flavors', JSON.stringify(flavors));
    formData.append('weights', JSON.stringify(weights));
    formData.append('benefits', JSON.stringify(benefits));
    formData.append('isBestSeller', currentProduct.isBestSeller ? 'true' : 'false');
    formData.append('isNew', currentProduct.isNew ? 'true' : 'false');
    formData.append('fastDelivery', currentProduct.fastDelivery ? 'true' : 'false');
    formData.append('limitedStockNotice', currentProduct.limitedStockNotice || '');
    formData.append('brand', currentProduct.brand || '');
    // Handle images as before
    if (currentProduct.images?.length) {
      currentProduct.images.forEach(img => { if (img) formData.append('images', img); });
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/products/${currentProduct._id}`, 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        }
      );
      const updatedProducts = products.map(p => p._id === response.data._id ? response.data : p);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to edit product', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setIsLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/products/${productToDelete._id}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const updatedProducts = products.filter(p => p._id !== productToDelete._id);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete product', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const normalizeList = (list) => (list || []).map(v => String(v).toLowerCase().trim());

  const applyFilters = () => {
    let filtered = products;

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
      const selected = new Set(normalizeList(filters.categories));
      filtered = filtered.filter(p => normalizeList(p.categories).some(c => selected.has(c)));
    }

    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(p => p.brand && filters.brands.includes(p.brand));
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 text-black font-source-sans">
      <div className="w-full mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <h1 className="mb-4 text-3xl font-bold sm:mb-0 text-black font-orbitron">{t('admin_products_management_title')}</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-3 rounded-lg bg-primary text-accent hover:bg-green-600"
            >
              <Plus className="mr-2 size-5" /> {t('admin_products_add_product')}
            </button>
            <button 
              onClick={() => setIsOfferModalOpen(true)}
              className="flex items-center px-4 py-3 rounded-lg bg-primary text-accent hover:bg-green-600"
            >
              <Tag className="mr-2 size-5" /> {t('admin_products_create_best_offer')}
            </button>
            <button 
              onClick={() => navigate(`/admin/store/orders`)} 
              className="flex items-center px-4 py-3 rounded-lg bg-primary text-accent hover:bg-green-600"
            >
              <ArrowRight className="mr-2 size-5" /> {t('admin_products_go_to_orders')}
            </button>
          </div>
        </div>

        {/* Filters + Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 h-max sticky top-24">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-dark via-dark to-dark/95 backdrop-blur-xl shadow-2xl border border-primary/20 relative overflow-hidden">
              {/* Decorative glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl"></div>
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20 relative z-10">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  <span className="bg-gradient-to-r from-accent via-white to-accent bg-clip-text text-transparent">
                    {t('admin_products_search_products')} & Filters
                  </span>
                </h2>
              </div>

              {/* Search */}
              <div className="mb-6 relative z-10">
                <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                  {t('admin_products_search_products')}
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="search"
                    placeholder={t('admin_products_search_products')}
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 pl-11 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors duration-300 size-5 pointer-events-none" />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6 relative z-10">
                <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                  {t('admin_products_sort')}
                </label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 cursor-pointer"
                >
                  <option value="name">{t('admin_products_sort_name')}</option>
                  <option value="price">{t('admin_products_sort_price')}</option>
                </select>
              </div>

              {/* Categories */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm border border-primary/10 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <div className="text-xs font-bold uppercase tracking-wider text-green-400">Categories</div>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    'Whey',
                    'Mass Gainer',
                    'Isolate Whey',
                    'Vitamines & Minerals',
                    'Creatine',
                    'Acide Amine',
                    'Pre-Workout',
                    'Fat Burner',
                    'Testobooster',
                    'Join-Flex',
                    'Fish oil',
                    'Carbs',
                    'Snacks',
                    'Shakers',
                    'Accesoires',
                  ].map((c)=> (
                    <label key={c} className="group flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-all duration-200">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(c)}
                          onChange={(e)=>{
                            const next = e.target.checked ? [...filters.categories, c] : filters.categories.filter(x=>x!==c);
                            setFilters({ ...filters, categories: next });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded border-2 border-primary/40 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 relative overflow-hidden group-hover:border-primary/70">
                          {filters.categories.includes(c) && (
                            <div className="absolute inset-0 bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 bg-dark rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs transition-colors duration-200 ${filters.categories.includes(c) ? 'text-green-400 font-semibold' : 'text-green-300 group-hover:text-green-400'}`}>
                        {c}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm border border-primary/10 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-green-400" />
                  <div className="text-xs font-bold uppercase tracking-wider text-green-400">Brands</div>
                </div>
                {loadingBrands ? (
                  <div className="text-xs text-green-300/70 italic py-2">Loading brands...</div>
                ) : availableBrands.length === 0 ? (
                  <div className="text-xs text-green-300/70 italic py-2">No brands available</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {availableBrands.map((brand)=> (
                      <label key={brand} className="group flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-all duration-200">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={(e)=>{
                              const next = e.target.checked ? [...filters.brands, brand] : filters.brands.filter(x=>x!==brand);
                              setFilters({ ...filters, brands: next });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-4 h-4 rounded border-2 border-primary/40 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 relative overflow-hidden group-hover:border-primary/70">
                            {filters.brands.includes(brand) && (
                              <div className="absolute inset-0 bg-primary flex items-center justify-center">
                                <div className="w-2 h-2 bg-dark rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs transition-colors duration-200 ${filters.brands.includes(brand) ? 'text-green-400 font-semibold' : 'text-green-300 group-hover:text-green-400'}`}>
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6 relative z-10">
                <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder={t('admin_products_min_price')}
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder={t('admin_products_max_price')}
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Best Seller */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 relative z-10">
                <label className="group flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.bestSeller}
                      onChange={(e)=> setFilters({ ...filters, bestSeller: e.target.checked })}
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

              {/* Action Buttons */}
              <div className="flex gap-3 relative z-10">
                <button
                  onClick={applyFilters}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-green-600 text-dark font-bold hover:from-green-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/30 transform hover:scale-[1.02]"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  <Filter className="w-4 h-4" />
                  {t('admin_products_search')}
                </button>
                <button
                  onClick={() => {
                    setFilters({
                      search: '',
                      sort: 'name',
                      minPrice: '',
                      maxPrice: '',
                      categories: [],
                      brands: [],
                      bestSeller: false,
                    });
                    setFilteredProducts(products);
                  }}
                  className="px-4 py-3 rounded-xl border-2 border-accent/30 text-accent/70 hover:text-accent hover:border-primary/50 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
        </div>
          </aside>

          {/* Products grid */}
          <div className="lg:col-span-9 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredProducts.map(product => (
            <div 
              key={product._id} 
              className="p-2 shadow-md rounded-xl bg-dark"
            >
              <div className="flex items-center justify-center p-4 rounded-lg bg-secondary">
                <img
                  className="object-contain h-48 w-full bg-black rounded"
                  src={Array.isArray(product.images) && product.images.length > 0 
                        ? `${import.meta.env.VITE_IMAGE_URL}/${(product.images[0]||'').replace(/^\/+/, '')}`
                        : product.image ? `${import.meta.env.VITE_IMAGE_URL}/${(product.image||'').replace(/^\/+/, '')}` : 'https://via.placeholder.com/240x180/272727/40ee45?text=No+Image'}
                  alt={product.name}
                  onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://via.placeholder.com/240x180/272727/40ee45?text=No+Image';}}
                />
              </div>
              <div className="p-2 mt-2">
                <h2 className="text-xl font-bold text-accent">{product.name}</h2>
                <p className="text-accent/80 line-clamp-2">{product.descriptionShort}</p>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="font-bold text-primary">TD. {product.price}</span>
                    <p className="text-sm text-accent/80">{t('admin_products_stock', { stock: product.stock })}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-yellow-500 transition-colors rounded-full hover:bg-yellow-500/10"
                      onClick={() => {
                        setCurrentProduct({
                          ...product,
                          flavorsInput: (product.flavors && product.flavors.length > 0) ? product.flavors.join(', ') : '',
                          sizesInput: (product.weights && product.weights.length > 0) ? product.weights.join(', ') : '',
                          benefitsInput: (product.benefits && product.benefits.length > 0) ? product.benefits.join(', ') : '',
                          isBestSeller: !!product.isBestSeller,
                          isNew: !!product.isNew,
                          fastDelivery: !!product.fastDelivery
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="size-5" />
                    </button>
                    <button 
                      className="p-2 transition-colors rounded-full text-primary hover:bg-primary/10"
                      onClick={() => {
                        setProductToDelete(product);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Add Product Modal */}
        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          title={t('admin_products_add_new_title')}
        >
          <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                {t('admin_products_product_name')}
              </label>
              <input 
                className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder={t('admin_products_product_name')}
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required 
              />
            </div>

            {/* Brand Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                Brand
              </label>
              {loadingBrands ? (
                <div className="w-full px-4 py-3 rounded-xl bg-secondary/50 backdrop-blur-sm border border-accent/20 text-green-300/70 text-center">
                  Loading brands...
                </div>
              ) : availableBrands.length > 0 ? (
                <select
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 cursor-pointer"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                >
                  <option value="">Select a brand</option>
                  {availableBrands.map((brand, index) => (
                    <option key={index} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  placeholder="Enter brand name"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                />
              )}
              {availableBrands.length === 0 && !loadingBrands && (
                <p className="mt-1 text-xs text-green-300/70">
                  No brands found. Add brands in Photo Management (Nos Marque category) first.
                </p>
              )}
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                Images (2–6)
              </label>
              <div className="border-2 border-dashed border-accent/30 rounded-xl p-4 text-center hover:border-primary transition-all duration-300 bg-secondary/20 backdrop-blur-sm">
                <input 
                  type="file" 
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="product-images-upload"
                  onChange={(e) => setNewProduct({ ...newProduct, images: Array.from(e.target.files) })}
                  required 
                />
                <label htmlFor="product-images-upload" className="cursor-pointer">
                  <div className="text-green-300/70">
                    Click to select images (2-6 required)
                  </div>
                </label>
              </div>
              <p className="mt-2 text-xs text-green-300/70">Select between 2 and 6 images.</p>
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                {t('admin_products_short_description')}
              </label>
              <input 
                className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder={t('admin_products_short_description')}
                value={newProduct.descriptionShort}
                onChange={(e) => setNewProduct({...newProduct, descriptionShort: e.target.value})}
                required 
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                {t('admin_products_full_description')}
              </label>
              <textarea 
                className="w-full px-4 py-3 h-24 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                placeholder={t('admin_products_full_description')}
                value={newProduct.descriptionFull}
                onChange={(e) => setNewProduct({...newProduct, descriptionFull: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                {t('admin_products_price')}
              </label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder={t('admin_products_price')}
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                {t('admin_products_available_quantity')}
              </label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder={t('admin_products_available_quantity')}
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                required 
              />
            </div>
            <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-green-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-green-400">Categories</label>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {[
                  ['Whey','Whey'],
                  ['Mass Gainer','Mass Gainer'],
                  ['Isolate Whey','Isolate Whey'],
                  ['Vitamines & Minerals','Vitamines & Minerals'],
                  ['Creatine','Creatine'],
                  ['Acide Amine','Acide Amine'],
                  ['Pre-Workout','Pre-Workout'],
                  ['Fat Burner','Fat Burner'],
                  ['Testobooster','Testobooster'],
                  ['Join-Flex','Join-Flex'],
                  ['Fish oil','Fish oil'],
                  ['Carbs','Carbs'],
                  ['Snacks','Snacks'],
                  ['Shakers','Shakers'],
                  ['Accesoires','Accesoires'],
                ].map(([val,label]) => (
                  <label key={val} className="group flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-all duration-200">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={newProduct.categories.includes(val)} 
                        onChange={(e)=>{
                          const next = e.target.checked ? [...newProduct.categories, val] : newProduct.categories.filter(c=>c!==val);
                          setNewProduct({ ...newProduct, categories: next });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded border-2 border-primary/40 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 relative overflow-hidden group-hover:border-primary/70">
                        {newProduct.categories.includes(val) && (
                          <div className="absolute inset-0 bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 bg-dark rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs transition-colors duration-200 ${newProduct.categories.includes(val) ? 'text-green-400 font-semibold' : 'text-green-300 group-hover:text-green-400'}`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Flavors */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                Flavors (comma separated)
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder="e.g. Vanilla, Chocolate"
                value={newProduct.flavorsInput}
                onChange={(e) => setNewProduct({...newProduct, flavorsInput: e.target.value})}
              />
            </div>
            {/* Weights */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                Weights (comma separated)
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder="e.g. 1kg, 2kg"
                value={newProduct.sizesInput}
                onChange={(e) => setNewProduct({...newProduct, sizesInput: e.target.value})}
              />
            </div>
            {/* Benefits */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                <Tag size={14} className="inline mr-2" />
                Benefits (comma separated)
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder="e.g. Builds Muscle, Fast Absorption"
                value={newProduct.benefitsInput}
                onChange={(e) => setNewProduct({...newProduct, benefitsInput: e.target.value})}
              />
            </div>
            {/* Toggles and Limited Stock Notice */}
            <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20">
              <div className="flex flex-wrap items-center gap-6">
                <label className="group flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={newProduct.isBestSeller} 
                      onChange={(e)=> setNewProduct({...newProduct, isBestSeller: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 relative overflow-hidden ${newProduct.isBestSeller ? 'border-primary bg-primary' : 'border-primary/40 group-hover:border-primary/70'}`}>
                      {newProduct.isBestSeller && (
                        <div className="absolute inset-0 bg-primary flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-dark rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold transition-colors duration-200 ${newProduct.isBestSeller ? 'text-green-400' : 'text-green-300 group-hover:text-green-400'}`}>
                    Best Seller
                  </span>
                </label>
                <label className="group flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={newProduct.isNew} 
                      onChange={(e)=> setNewProduct({...newProduct, isNew: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 relative overflow-hidden ${newProduct.isNew ? 'border-primary bg-primary' : 'border-primary/40 group-hover:border-primary/70'}`}>
                      {newProduct.isNew && (
                        <div className="absolute inset-0 bg-primary flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-dark rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold transition-colors duration-200 ${newProduct.isNew ? 'text-green-400' : 'text-green-300 group-hover:text-green-400'}`}>
                    New
                  </span>
                </label>
                <label className="group flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={newProduct.fastDelivery} 
                      onChange={(e)=> setNewProduct({...newProduct, fastDelivery: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 relative overflow-hidden ${newProduct.fastDelivery ? 'border-primary bg-primary' : 'border-primary/40 group-hover:border-primary/70'}`}>
                      {newProduct.fastDelivery && (
                        <div className="absolute inset-0 bg-primary flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-dark rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold transition-colors duration-200 ${newProduct.fastDelivery ? 'text-green-400' : 'text-green-300 group-hover:text-green-400'}`}>
                    Fast Delivery
                  </span>
                </label>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                  Limited Stock Notice
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  placeholder="e.g. Only 3 left!"
                  value={newProduct.limitedStockNotice}
                  onChange={(e) => setNewProduct({ ...newProduct, limitedStockNotice: e.target.value })}
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <button 
                type="submit" 
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-green-600 text-dark font-bold hover:from-green-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/30 transform hover:scale-[1.02]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {t('admin_products_add')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Create Best Offer Modal */}
        <Modal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          title={t('admin_offers_form_title')}
        >
          <OfferForm
            onSubmit={async ({ offerData, mainPhoto, additionalPhoto }) => {
              try {
                const form = new FormData();
                form.append('category', 'Best Offers');
                form.append('offerData', JSON.stringify(offerData));
                if (mainPhoto) form.append('photos', mainPhoto);
                if (additionalPhoto) form.append('photos', additionalPhoto);
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/photos`, form, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                  }
                });
                setIsOfferModalOpen(false);
                await fetchProducts();
                try {
                  const bc = new BroadcastChannel('offers');
                  bc.postMessage({ type: 'offers-updated' });
                  bc.close();
                } catch {}
              } catch (e) {
                console.error('Failed to create best offer', e);
              }
            }}
            onCancel={() => setIsOfferModalOpen(false)}
            isEditing={false}
          />
        </Modal>

        {/* Edit Product Modal */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          title={t('admin_products_edit_title')}
        >
          <form onSubmit={handleEditProduct} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('admin_products_product_name')}</label>
              <input 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder={t('admin_products_product_name')}
                value={currentProduct?.name || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                required 
              />
            </div>

            {/* Brand Dropdown for Edit */}
            <div>
              <label className="block text-sm font-medium">Brand</label>
              {loadingBrands ? (
                <div className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 text-accent/60 text-center text-sm">
                  Loading brands...
                </div>
              ) : availableBrands.length > 0 ? (
                <select
                  className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent text-accent"
                  value={currentProduct?.brand || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, brand: e.target.value})}
                >
                  <option value="">Select a brand</option>
                  {availableBrands.map((brand, index) => (
                    <option key={index} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                  placeholder="Enter brand name"
                  value={currentProduct?.brand || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, brand: e.target.value})}
                />
              )}
              {availableBrands.length === 0 && !loadingBrands && (
                <p className="mt-1 text-xs text-accent/70">
                  No brands found. Add brands in Photo Management (Nos Marque category) first.
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium">{t('admin_products_product_image')} 1</label>
              <input 
                type="file" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent file:hidden"
                onChange={(e) => {
                  const files = currentProduct.images ? [...currentProduct.images] : [null, null];
                  files[0] = e.target.files[0];
                  setCurrentProduct({ ...currentProduct, images: files });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('admin_products_product_image')} 2</label>
              <input 
                type="file" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent file:hidden"
                onChange={(e) => {
                  const files = currentProduct.images ? [...currentProduct.images] : [null, null];
                  files[1] = e.target.files[0];
                  setCurrentProduct({ ...currentProduct, images: files });
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">{t('admin_products_short_description')}</label>
              <input 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder={t('admin_products_short_description')}
                value={currentProduct?.descriptionShort || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, descriptionShort: e.target.value})}
                required 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">{t('admin_products_full_description')}</label>
              <textarea 
                className="w-full h-24 p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder={t('admin_products_full_description')}
                value={currentProduct?.descriptionFull || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, descriptionFull: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('admin_products_price')}</label>
              <input 
                type="number" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder={t('admin_products_price')}
                value={currentProduct?.price || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('admin_products_available_quantity')}</label>
              <input 
                type="number" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder={t('admin_products_available_quantity')}
                value={currentProduct?.stock || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
                required 
              />
            </div>
            {/* --- NEW FIELDS: Categories, Flavors, Weights, Benefits --- */}
            <div className="col-span-2">
              <label className="block text-sm font-medium">Categories</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  ['Whey','Whey'],
                  ['Mass Gainer','Mass Gainer'],
                  ['Isolate Whey','Isolate Whey'],
                  ['Vitamines & Minerals','Vitamines & Minerals'],
                  ['Creatine','Creatine'],
                  ['Acide Amine','Acide Amine'],
                  ['Pre-Workout','Pre-Workout'],
                  ['Fat Burner','Fat Burner'],
                  ['Testobooster','Testobooster'],
                  ['Join-Flex','Join-Flex'],
                  ['Fish oil','Fish oil'],
                  ['Carbs','Carbs'],
                  ['Snacks','Snacks'],
                  ['Shakers','Shakers'],
                  ['Accesoires','Accesoires'],
                ].map(([val,label]) => (
                  <label key={val} className="flex items-center gap-2">
                    <input type="checkbox" checked={currentProduct?.categories?.includes(val) || false} onChange={(e)=>{
                      const next = e.target.checked ? [...(currentProduct.categories||[]), val] : (currentProduct.categories||[]).filter(c=>c!==val);
                      setCurrentProduct({ ...currentProduct, categories: next });
                    }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Flavors (comma separated)</label>
              <input
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="e.g. Vanilla, Chocolate"
                value={currentProduct?.flavorsInput || (currentProduct?.flavors ? currentProduct.flavors.join(', ') : '')}
                onChange={(e) => setCurrentProduct({...currentProduct, flavorsInput: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Weights (comma separated)</label>
              <input
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="e.g. 1kg, 2kg"
                value={currentProduct?.sizesInput || (currentProduct?.weights ? currentProduct.weights.join(', ') : '')}
                onChange={(e) => setCurrentProduct({...currentProduct, sizesInput: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Benefits (comma separated)</label>
              <input
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="e.g. Builds Muscle, Fast Absorption"
                value={currentProduct?.benefitsInput || (currentProduct?.benefits ? currentProduct.benefits.join(', ') : '')}
                onChange={(e) => setCurrentProduct({...currentProduct, benefitsInput: e.target.value})}
              />
            </div>
            {/* Toggles and Limited Stock Notice in one line */}
            <div className="col-span-2 flex flex-wrap items-center gap-4 my-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={currentProduct?.isBestSeller || false} onChange={(e)=> setCurrentProduct({...currentProduct, isBestSeller: e.target.checked})} />
                <span>Best Selles</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={currentProduct?.isNew || false} onChange={(e)=> setCurrentProduct({...currentProduct, isNew: e.target.checked})} />
                <span>New</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={currentProduct?.fastDelivery || false} onChange={(e)=> setCurrentProduct({...currentProduct, fastDelivery: e.target.checked})} />
                <span>Fast Delivery</span>
              </label>
              <label className="flex items-center gap-2">
                <span>Limited Stock Notice</span>
                <input
                  type="text"
                  className="p-1 my-0.5 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                  placeholder="e.g. Only 3 left!"
                  value={currentProduct?.limitedStockNotice || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, limitedStockNotice: e.target.value })}
                />
              </label>
            </div>
            <div className="col-span-2">
              <button 
                type="submit" 
                className="w-full py-3 transition-colors rounded bg-primary text-accent hover:bg-red-600"
              >
                {t('admin_products_update')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={t('admin_products_confirm_delete_title')}
          onConfirm={handleDeleteProduct}
          confirmLabel={t('admin_products_confirm')}
          cancelLabel={t('admin_products_cancel')}
        >
          <p className="text-center">
            {t('admin_products_confirm_delete_message')}
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default AdminProductManagement;