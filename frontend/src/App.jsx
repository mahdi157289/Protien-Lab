import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { SmokeyProvider, useSmokey } from './contexts/SmokeyContext';
import AdminRoutes from './routes/AdminRoutes';
import UserRoutes from './routes/UserRoutes';
import FloatingActions from './components/common/FloatingActions';
import { Analytics } from "@vercel/analytics/react"
import SmokeyBackground from './components/ui/SmokeyBackground';

function AppContent() {
  const { smokeyOn } = useSmokey();
  
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Show smokey background when enabled */}
      {smokeyOn && <SmokeyBackground backdropBlurAmount="xl" color="#40EE45" />}
      <main className="pt-[129px]" style={{ fontFamily: "'Orbitron', sans-serif", color: smokeyOn ? 'white' : 'black', position: 'relative', zIndex: 1 }} >
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </main>
      <FloatingActions />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <SmokeyProvider>
            <AppContent />
            <Analytics />
          </SmokeyProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
