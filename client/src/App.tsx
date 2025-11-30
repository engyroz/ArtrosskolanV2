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
import CalendarDiary from './pages/CalendarDiary';
import MyJourney from './pages/MyJourney'; // Import
import ProtectedRoute from './components/ProtectedRoute';
import TimeTravelDebug from './components/TimeTravelDebug';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAppRoute = ['/dashboard', '/calendar', '/plan', '/journey', '/progress', '/profile', '/workout'].includes(location.pathname);
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
              <Route path="/" element={<Landing />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/results" element={<Results />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              <Route 
                path="/payment" 
                element={<ProtectedRoute><Payment /></ProtectedRoute>} 
              />

              <Route 
                path="/dashboard" 
                element={<ProtectedRoute requireSubscription={true}><Dashboard /></ProtectedRoute>} 
              />

              <Route 
                path="/calendar" 
                element={<ProtectedRoute requireSubscription={true}><CalendarDiary /></ProtectedRoute>} 
              />

              {/* Journey Route */}
              <Route 
                path="/journey" 
                element={<ProtectedRoute requireSubscription={true}><MyJourney /></ProtectedRoute>} 
              />

              <Route 
                path="/workout" 
                element={<ProtectedRoute requireSubscription={true}><WorkoutPlayer /></ProtectedRoute>} 
              />
              
              <Route path="/plan" element={<CalendarDiary />} />
              <Route path="/progress" element={<MyJourney />} /> {/* Redirect old progress link */}
              <Route path="/profile" element={<div className="p-8 text-center">Profil kommer snart...</div>} />

            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </TimeProvider>
  );
};

export default App;