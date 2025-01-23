import { Route, Routes } from 'react-router-dom';
import AdminProductsPage from './AdminProductManagement';
import AdminOrdersPage from './AdminOrderManagement';

function AdminStore() {
  return (
      <Routes>
        <Route path="/" element={<AdminProductsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Routes>
  );
}

export default AdminStore;