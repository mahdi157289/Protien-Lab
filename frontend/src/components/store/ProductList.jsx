import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import api from '../../config/api';
import { Loader } from "lucide-react";


function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/users/products');
        setProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-10 bg-secondary">
      <h1 className="mb-8 text-4xl font-bold text-center">Supplements</h1>
      <p className="px-4 mb-8 text-center text-accent/80">
        Whether it is to Build muscle, Lose weight or Boost some Extra energy we got you covered with your fitness essentials. Shop all
        <br /> Supplements here
      </p>

      <div className="flex flex-col justify-center gap-8 mb-8 sm:flex-row sm:gap-16">
        <button
          className="w-full sm:w-[288px] h-[60px] bg-red-500 hover:bg-red-600  font-bold border-2 border-white rounded-[50px] transition duration-200"
          onClick={() => navigate('/store/products')} // Navigate to ProductList
        >
          Products
        </button>
        <button
          className="w-full sm:w-[288px] h-[60px] border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-[50px] transition duration-200"
          onClick={() => navigate('/store/orders')} // Navigate to Orders
        >
          Orders
        </button>
      </div>

      <div className="container grid grid-cols-1 gap-12 px-4 mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductList;