import { Routes, Route } from "react-router-dom";
import OrderPage from "../components/store/Orders";
import ProductList from "../components/store/ProductList";
import Footer from "../components/common/Footer";

function Store() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<ProductList />} /> {/* Matches "/store" */}
          <Route path="orders" element={<OrderPage />} /> {/* Matches "/store/orders" */}
          <Route path="products" element={<ProductList />} /> {/* Matches "/store/products" */}
        </Routes>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Store;
