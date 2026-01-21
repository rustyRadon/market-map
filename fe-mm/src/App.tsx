import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore.ts';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Home from './pages/Home.tsx';
import ProfileSettings from './pages/ProfileSettings.tsx';
import MainLayout from './layouts/MainLayout.tsx';

// Wrapper to protect routes that require login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, isInitialLoading, setInitialLoading } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [setInitialLoading]);

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center z-[9999]">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-blue-600/20 rounded-full" />
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
        <div className="mt-8 text-blue-500 animate-pulse font-bold tracking-[0.4em] text-2xl">
          MARKET MAP
        </div>
        <div className="mt-4 text-slate-600 text-[10px] uppercase tracking-[0.2em]">
          Syncing Market Indices...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />} 
        />
        
        {/* App Routes */}
        <Route 
          path="/*" 
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/settings/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;