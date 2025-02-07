import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, ArrowRight, Search, Loader } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, title, children, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
      <div className="relative w-full max-w-md p-6 rounded-lg bg-dark text-accent">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-accent hover:text-primary"
        >
          <X />
        </button>
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        {children}
        {onConfirm && (
          <div className="flex justify-between mt-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded bg-dark text-accent hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-primary text-accent hover:bg-red-600"
            >
              Confirm
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
};

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    descriptionShort: '',
    descriptionFull: '',
    price: '',
    stock: '',
    image: null
  });

  const [filters, setFilters] = useState({
    search: '',
    sort: 'name',
    minPrice: '',
    maxPrice: ''
  });

  const { token } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
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
    };
    fetchProducts();
  }, [token]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    Object.keys(newProduct).forEach(key => {
      formData.append(key, newProduct[key]);
    });

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
      setNewProduct({
        name: '',
        descriptionShort: '',
        descriptionFull: '',
        price: '',
        stock: '',
        image: null
      });
    } catch (error) {
      console.error('Failed to add product', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    Object.keys(currentProduct).forEach(key => {
      if (currentProduct[key] !== null && currentProduct[key] !== undefined) {
        formData.append(key, currentProduct[key]);
      }
    });

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
    <div className="p-6 bg-secondary text-accent">
      <div className="w-full mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <h1 className="mb-4 text-3xl font-bold sm:mb-0">Product Management</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-3 rounded-lg bg-primary text-accent hover:bg-red-600"
            >
              <Plus className="mr-2 size-5" /> Add Product
            </button>
            <button 
              onClick={() => navigate(`/admin/store/orders`)} 
              className="flex items-center px-4 py-3 rounded-lg bg-primary text-accent hover:bg-red-600"
            >
              <ArrowRight className="mr-2 size-5" /> Go to Orders
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 mb-6 rounded-lg shadow-lg bg-dark">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search Products"
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
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>

            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg placeholder-accent/80 bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
            />

            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg placeholder-accent/80 bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
            />

            <button
              onClick={applyFilters}
              className="flex items-center justify-center w-full px-2 py-2 transition-all rounded-md bg-primary text-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map(product => (
            <div 
              key={product._id} 
              className="p-2 shadow-md rounded-xl bg-dark"
            >
              <div className="flex items-center justify-center p-4 rounded-lg bg-secondary">
                <img
                  className="object-contain h-48"
                  src={`${import.meta.env.VITE_IMAGE_URL}/${product.image}`}
                  alt={product.name}
                />
              </div>
              <div className="p-2 mt-2">
                <h2 className="text-xl font-bold text-accent">{product.name}</h2>
                <p className="text-accent/80 line-clamp-2">{product.descriptionShort}</p>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="font-bold text-primary">Rs. {product.price}</span>
                    <p className="text-sm text-accent/80">Stock: {product.stock}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-yellow-500 transition-colors rounded-full hover:bg-yellow-500/10"
                      onClick={() => {
                        setCurrentProduct(product);
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

        {/* Add Product Modal */}
        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Product"
        >
          <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Product Name</label>
              <input 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Enter product name" 
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Product Image</label>
              <input 
                type="file" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent file:hidden"
                onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})}
                required 
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium">Short Description</label>
              <input 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Brief product description" 
                value={newProduct.descriptionShort}
                onChange={(e) => setNewProduct({...newProduct, descriptionShort: e.target.value})}
                required 
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium">Full Description</label>
              <textarea 
                className="w-full h-24 p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Detailed product description"
                value={newProduct.descriptionFull}
                onChange={(e) => setNewProduct({...newProduct, descriptionFull: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input type="number" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Product price" 
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input 
                type="number" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Available quantity" 
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                required 
              />
            </div>
            
            <div className="col-span-2">
              <button 
                type="submit" 
                className="w-full py-3 transition-colors rounded bg-primary text-accent hover:bg-red-600"
              >
                Add Product
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Product Modal */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Product"
        >
          <form onSubmit={handleEditProduct} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Product Name</label>
              <input 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Enter product name" 
                value={currentProduct?.name || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Product Image</label>
              <input 
                type="file" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent file:hidden"
                onChange={(e) => setCurrentProduct({...currentProduct, image: e.target.files[0]})}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium">Short Description</label>
              <input 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Brief product description" 
                value={currentProduct?.descriptionShort || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, descriptionShort: e.target.value})}
                required 
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium">Full Description</label>
              <textarea 
                className="w-full h-24 p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Detailed product description" 
                value={currentProduct?.descriptionFull || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, descriptionFull: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input 
                type="number" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Product price" 
                value={currentProduct?.price || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input 
                type="number" 
                className="w-full p-2 mt-2 border rounded placeholder-accent/60 bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                placeholder="Available quantity" 
                value={currentProduct?.stock || ''}
                onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
                required 
              />
            </div>
            
            <div className="col-span-2">
              <button 
                type="submit" 
                className="w-full py-3 transition-colors rounded bg-primary text-accent hover:bg-red-600"
              >
                Update Product
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
          onConfirm={handleDeleteProduct}
        >
          <p className="text-center">
            Are you sure you want to delete this product?
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default AdminProductManagement;