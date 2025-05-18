import { motion } from 'framer-motion';
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="min-h-screen px-8 py-10 bg-secondary">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mb-8 text-4xl font-bold text-center">
        Supplements
      </motion.h1>
      
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} className="px-4 mb-8 text-center text-accent/80">
        Whether it is to Build muscle, Lose weight or Boost some Extra energy we got you covered with your fitness essentials. Shop all<br /> Supplements here
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="flex flex-col justify-center gap-8 mb-8 sm:flex-row sm:gap-16">
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          className="w-full sm:w-[288px] h-[60px] bg-green-500 hover:bg-green-600 font-bold border-2 border-white rounded-[50px] transition duration-200"
          onClick={() => navigate('/store/products')}
        >
          Products
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          className="w-full sm:w-[288px] h-[60px] border-2 border-green-500 #40ee45 hover:bg-green-500 hover:text-white font-bold rounded-[50px] transition duration-200"
          onClick={() => navigate('/store/orders')}
        >
          Orders
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="container grid grid-cols-1 gap-12 px-4 mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <motion.div key={product._id} whileHover={{ scale: 1.05 }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default ProductList;