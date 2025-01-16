import { Routes, Route } from "react-router-dom";
import OrderPage from "../components/store/Orders";
import ProductList from "../components/store/ProductList";
import ProtectedRoute from "../components/user/ProtectedRoute";
import AuthModal from "../components/user/AuthModal";
import { useState } from "react";

function Store() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');

  const handleAuthModal = (isOpen, type) => {
    if (type) {
      setAuthType(type);
    }
    setIsAuthModalOpen(isOpen);
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<ProductList />} /> {/* Matches "/store" */}
          <Route path="orders" element={<ProtectedRoute onAuthClick={handleAuthModal}><OrderPage /></ProtectedRoute>} /> {/* Matches "/store/orders" */}
          <Route path="products" element={<ProductList />} /> {/* Matches "/store/products" */}
        </Routes>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => handleAuthModal(false)}
        authType={authType}
      />
    </div>
  );
}

export default Store;
