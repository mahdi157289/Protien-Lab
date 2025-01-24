import { Routes, Route, Navigate } from 'react-router-dom';
import AdminRegister from '../components/admin/AdminRegister';
import AdminLogin from '../components/admin/AdminLogin';
import AdminProfile from '../components/admin/AdminProfile';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminExercises from '../components/admin/AdminExercises';
import AdminStore from '../components/admin/AdminStore';
import AdminUsers from '../components/admin/AdminUserManagement';
import AdminVictoryWall from '../components/admin/AdminVictoryWall';
import AdminNavbar from '../components/common/AdminNavbar';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import DietPlanManagement from '../components/admin/DietPlanManagement';

const AdminRoutes = () => {
  const { admin } = useAdminAuth();

  return (
    <>
      {admin && <AdminNavbar />}
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="register" element={<AdminRegister />} />
        <Route path="dashboard"element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>}/>
        <Route path="exercises" element={<AdminProtectedRoute><AdminExercises /></AdminProtectedRoute>}/>
        <Route path="diet-plan" element={<AdminProtectedRoute><DietPlanManagement/></AdminProtectedRoute>}/>
        <Route path="store/*" element={<AdminProtectedRoute><AdminStore /></AdminProtectedRoute>}/>
        <Route path="users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>}/>
        <Route path="victory-wall" element={<AdminProtectedRoute><AdminVictoryWall /></AdminProtectedRoute>}/>
        <Route path="profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>}/>
        <Route path="" element={admin ? <Navigate to="dashboard" replace /> : <Navigate to="login" replace />}/>
      </Routes>
    </>
  );
};

export default AdminRoutes;