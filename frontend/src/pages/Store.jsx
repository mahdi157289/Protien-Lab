import { useLocation } from "react-router-dom";
import OrderPage from "../components/store/Orders";
import ProductList from "../components/store/ProductList";
import ProtectedRoute from "../components/user/ProtectedRoute";
import AuthModal from "../components/user/AuthModal";
import { useEffect, useState } from "react";

function Store() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const location = useLocation();

  const handleAuthModal = (isOpen, type) => {
    if (type) {
      setAuthType(type);
    }
    setIsAuthModalOpen(isOpen);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === '1') {
      setAuthType('signup');
      setIsAuthModalOpen(true);
    }
  }, [location.search]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <div className="flex-grow">
        {location.pathname.startsWith('/store/orders') ? (
          <ProtectedRoute onAuthClick={handleAuthModal}>
            <OrderPage />
          </ProtectedRoute>
        ) : (
          <ProductList />
        )}
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
