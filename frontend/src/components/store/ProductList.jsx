import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard'; // Import ProductCard component
import products from '../../assets/Product1'; // Import product data

function ProductList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#29292A] py-10 px-8">
      <h1 className="text-center text-4xl font-bold text-white mb-8">Supplements</h1>
      <p className="text-center text-gray-400 mb-8 px-4">
        Whether it is to Build muscle, Lose weight or Boost some Extra energy we got you covered with your fitness essentials. Shop all
        <br /> Supplements here
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 mb-8">
        <button
          className="w-full sm:w-[288px] h-[60px] bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-white rounded-[50px] transition duration-200"
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

      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            title={product.title}
            price={product.price}
            description={product.description}
            features={product.features}
            

          />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
