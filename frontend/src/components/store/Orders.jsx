import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import productImage from "../../assets/images/store/1.png";

// This is temporary dataset
function OrderPage() {
  // Initialize orders state with default order data
  const [orders, setOrders] = useState([
    {
      orderId: "00123",
      date: "December 6, 2024",
      product: {
        title: "GOLD STANDARD 100% WHEY™",
        quantity: 2,
        price: "35000",
        image: productImage,
        deliveryMode: "Cash on Delivery",
      },
    },
  ]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#29292A] py-10 px-8">
      {/* Page Heading */}
      <h1 className="text-center text-4xl font-bold text-white mb-8">Supplements</h1>
      <p className="text-center text-gray-400 mb-8 px-4">
        Whether it is to Build muscle, Lose weight, or Boost some Extra energy, we got you covered with your fitness essentials. Shop all
        <br /> Supplements here.
      </p>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 mb-8">
        <button
          className="w-full sm:w-[288px] h-[60px] border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-[50px] transition duration-200"
          onClick={() => navigate("/store/products")}
        >
          Products
        </button>

        <button className="w-full sm:w-[288px] h-[60px] bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-white rounded-[50px] transition duration-200">
          Orders
        </button>
      </div>

      {/* Orders Section (aligned to left and with specific size) */}
      {orders.length === 0 ? (
        <div className="w-[500px] ml-0 bg-[#1C1C1C] text-white rounded-lg p-6 shadow-lg">
          <p className="text-center text-xl font-semibold text-gray-400">
            No orders placed yet.
          </p>
        </div>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="w-[500px] ml-0 bg-[#1C1C1C] text-white rounded-lg p-6 shadow-lg mb-6">
            <div className="flex justify-between items-center border-b border-gray-600 pb-4 mb-4">
              <h2 className="text-red-500 font-bold">Order #{order.orderId}</h2>
              <p className="text-sm text-gray-400">Placed on: {order.date}</p>
            </div>

            <div className="flex gap-6">
              {/* Product Image */}
              <div className="flex justify-center items-center bg-[#29292A] w-[150px] h-[150px] p-2 rounded-lg">
                <img
                  src={order.product.image}
                  alt="Product"
                  className="w-[120px] h-[120px] object-contain"
                />
              </div>

              {/* Product Details */}
              <div>
                <h3 className="text-lg font-bold mb-2">{order.product.title}</h3>
                <p className="text-sm mb-1">Quantity: {order.product.quantity}</p>
                <p className="text-xl font-semibold text-red-500 mb-1">Rs. {order.product.price}</p>
                <p className="text-sm text-gray-400">{order.product.deliveryMode}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderPage;
