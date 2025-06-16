import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminRoutes from './routes/AdminRoutes';
import UserRoutes from './routes/UserRoutes';
import { Analytics } from "@vercel/analytics/react"


function App() {
  
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <div>
            <main className="pt-[73px]" style={{ fontFamily: "'Orbitron', sans-serif" , color: 'white' }} >
              <Routes>
                <Route path="/*" element={<UserRoutes />} />
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Routes>
            </main>
          </div>
          <Analytics />
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
