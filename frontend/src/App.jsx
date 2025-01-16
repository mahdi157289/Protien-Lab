import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminRoutes from './routes/AdminRoutes';
import UserRoutes from './routes/UserRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <div>
            <main className="pt-[73px]">
              <Routes>
                <Route path="/*" element={<UserRoutes />} />
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Routes>
            </main>
          </div>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
