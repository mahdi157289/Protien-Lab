import { useState, useEffect } from 'react';
import {Plus,Pencil,Trash2,X, ArrowRight} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, title, children, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 rounded-lg bg-secondary text-accent">
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
  isOpen: PropTypes.bool.isRequired, // Ensures isOpen is a required boolean
  onClose: PropTypes.func.isRequired, // Ensures onClose is a required function
  title: PropTypes.string, // Ensures title is a string (optional)
  children: PropTypes.node, // Ensures children can be any renderable React node
  onConfirm: PropTypes.func, // Ensures onConfirm is a function (optional)
};
const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
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

  const { token } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    };
    fetchProducts();
  }, [token]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
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
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
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
      setProducts(products.map(p => p._id === response.data._id ? response.data : p));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to edit product', error);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/products/${productToDelete._id}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  return (
    <div className="p-6 bg-secondary text-accent">
      <div className="w-full mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <h1 className="mb-4 text-3xl font-bold sm:mb-0">Product Management</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 rounded bg-primary text-accent hover:bg-red-600"
            >
              <Plus className="mr-2 size-5" /> Add Product
            </button>
            <button 
              onClick={() => navigate('/admin/store/orders')} 
              className="flex items-center px-4 py-2 rounded bg-primary text-accent hover:bg-red-600"
            >
              <ArrowRight className="mr-2 size-5" /> Go to Orders
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <div 
              key={product._id} 
              className="p-4 rounded-lg shadow-md bg-dark"
            >
      <div className="bg-[#29292A] flex justify-center items-center p-4 rounded-[10px]">
        <img
          className="object-contain h-48"
          src={`${import.meta.env.VITE_IMAGE_URL}/${product.image}`}
          alt={product.name}
        />
      </div>
              <div className="mt-4">
                <h2 className="text-xl font-bold text-accent">{product.name}</h2>
                <p className="text-gray-400 line-clamp-2">{product.descriptionShort}</p>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="font-bold text-primary">${product.price}</span>
                    <p className="text-sm text-gray-400">Stock: {product.stock}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-accent hover:text-primary"
                      onClick={() => {
                        setCurrentProduct(product);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="size-5" />
                    </button>
                    <button 
                      className="text-primary hover:text-red-600"
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
          <form onSubmit={handleAddProduct} className="space-y-4">
            <input 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Product Name" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              required 
            />
            <input 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Short Description" 
              value={newProduct.descriptionShort}
              onChange={(e) => setNewProduct({...newProduct, descriptionShort: e.target.value})}
              required 
            />
            <textarea 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Full Description" 
              value={newProduct.descriptionFull}
              onChange={(e) => setNewProduct({...newProduct, descriptionFull: e.target.value})}
              required 
            />
            <input 
              type="number" 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Price" 
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              required 
            />
            <input 
              type="number" 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Stock" 
              value={newProduct.stock}
              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
              required 
            />
            <input 
              type="file" 
              className="w-full px-3 py-2 rounded bg-dark"
              onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})}
              required 
            />
            <button 
              type="submit" 
              className="w-full py-2 rounded bg-primary text-accent hover:bg-red-600"
            >
              Add Product
            </button>
          </form>
        </Modal>

        {/* Edit Product Modal */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Product"
        >
          <form onSubmit={handleEditProduct} className="space-y-4">
            <input 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Product Name" 
              value={currentProduct?.name || ''}
              onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
              required 
            />
            <input 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Short Description" 
              value={currentProduct?.descriptionShort || ''}
              onChange={(e) => setCurrentProduct({...currentProduct, descriptionShort: e.target.value})}
              required 
            />
            <textarea 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Full Description" 
              value={currentProduct?.descriptionFull || ''}
              onChange={(e) => setCurrentProduct({...currentProduct, descriptionFull: e.target.value})}
              required 
            />
            <input 
              type="number" 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Price" 
              value={currentProduct?.price || ''}
              onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
              required 
            />
            <input 
              type="number" 
              className="w-full px-3 py-2 rounded bg-dark"
              placeholder="Stock" 
              value={currentProduct?.stock || ''}
              onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
              required 
            />
            <input 
              type="file" 
              className="w-full px-3 py-2 rounded bg-dark"
              onChange={(e) => setCurrentProduct({...currentProduct, image: e.target.files[0]})}
            />
            <button 
              type="submit" 
              className="w-full py-2 rounded bg-primary text-accent hover:bg-red-600"
            >
              Update Product
            </button>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
          onConfirm={handleDeleteProduct}
        >
          <p>Are you sure you want to delete the Product?</p>
        </Modal>
      </div>
    </div>
  );
};

export default AdminProductManagement;