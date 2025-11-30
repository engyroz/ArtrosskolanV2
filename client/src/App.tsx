import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TimeProvider } from './contexts/TimeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import WorkoutPlayer from './pages/WorkoutPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import TimeTravelDebug from './components/TimeTravelDebug';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAppRoute = ['/dashboard', '/plan', '/progress', '/profile', '/workout'].includes(location.pathname);
  const showBottomNav = user && isAppRoute;
  const showTopNav = !showBottomNav; 

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {showTopNav && <Navbar />}
      
      <main className="flex-grow relative">
        {children}
      </main>

      {showBottomNav && <BottomNavigation />}
      <TimeTravelDebug />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TimeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Funnel */}
              <Route path="/" element={<Landing />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/results" element={<Results />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* Protected App */}
              <Route 
                path="/payment" 
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireSubscription={true}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/workout" 
                element={
                  <ProtectedRoute requireSubscription={true}>
                    <WorkoutPlayer />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/plan" element={<div className="p-8 text-center">Kalender kommer snart...</div>} />
              <Route path="/progress" element={<div className="p-8 text-center">Statistik kommer snart...</div>} />
              <Route path="/profile" element={<div className="p-8 text-center">Profil kommer snart...</div>} />

            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </TimeProvider>
  );
};

export default App;