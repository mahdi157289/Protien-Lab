import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import AdminNavbar from '../components/common/AdminNavbar';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

// Lazy load admin routes for code splitting
const AdminRegister = lazy(() => import('../components/admin/AdminRegister'));
const AdminLogin = lazy(() => import('../components/admin/AdminLogin'));
const AdminProfile = lazy(() => import('../components/admin/AdminProfile'));
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const AdminStore = lazy(() => import('../components/admin/AdminStore'));
const AdminUsers = lazy(() => import('../components/admin/AdminUserManagement'));
const DietPlanManagement = lazy(() => import('../components/admin/DietPlanManagement'));
const AdminFeedbackPage = lazy(() => import('../components/admin/AdminFeedbackPage'));
const PhotoManagement = lazy(() => import('../components/admin/PhotoManagement'));

// Loading component
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const AdminRoutes = () => {
  const { admin } = useAdminAuth();

  return (
    <>
      {admin && <AdminNavbar />}
      {admin && <div className="h-24" />}
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="login" element={<AdminLogin />} />
          <Route path="register" element={<AdminRegister />} />
          <Route path="dashboard"element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>}/>
          <Route path="diet-plan" element={<AdminProtectedRoute><DietPlanManagement/></AdminProtectedRoute>}/>
          <Route path="store/*" element={<AdminProtectedRoute><AdminStore /></AdminProtectedRoute>}/>
          <Route path="users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>}/>
          <Route path="feedback" element={<AdminProtectedRoute><AdminFeedbackPage /></AdminProtectedRoute>}/>
          <Route path="photos" element={<AdminProtectedRoute><PhotoManagement /></AdminProtectedRoute>}/>
          <Route path="profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>}/>
          <Route path="" element={admin ? <Navigate to="dashboard" replace /> : <Navigate to="login" replace />}/>
        </Routes>
      </Suspense>
    </>
  );
};

export default AdminRoutes;