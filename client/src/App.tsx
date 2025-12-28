
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar'; // Legacy, keeping for reference if needed but unused in new layout
import TopNavigation from './components/TopNavigation'; // NEW GLOBAL HEADER
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
import WorkoutSummary from './pages/WorkoutSummary'; // New Page
import CalendarDiary from './pages/CalendarDiary';
import MyJourney from './pages/MyJourney'; 
import KnowledgeBase from './pages/KnowledgeBase'; 
import Settings from './pages/Settings'; 
import AdminTools from './pages/AdminTools'; 
import ProtectedRoute from './components/ProtectedRoute';
import TimeTravelDebug from './components/TimeTravelDebug';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // App routes where Bottom Nav should appear
  const isAppRoute = ['/dashboard', '/calendar', '/journey', '/knowledge', '/profile'].includes(location.pathname);
  const showBottomNav = user && isAppRoute;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Global Header replaces Navbar */}
      <TopNavigation />
      
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

              <Route path="/payment" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute requireSubscription={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/calendar" element={
                <ProtectedRoute requireSubscription={true}>
                  <CalendarDiary />
                </ProtectedRoute>
              } />

              <Route path="/journey" element={
                <ProtectedRoute requireSubscription={true}>
                  <MyJourney />
                </ProtectedRoute>
              } />

              <Route path="/knowledge" element={
                <ProtectedRoute requireSubscription={true}>
                  <KnowledgeBase />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTools />
                </ProtectedRoute>
              } />

              <Route path="/workout" element={
                <ProtectedRoute requireSubscription={true}>
                  <WorkoutPlayer />
                </ProtectedRoute>
              } />

              <Route path="/summary" element={
                <ProtectedRoute requireSubscription={true}>
                  <WorkoutSummary />
                </ProtectedRoute>
              } />
              
              {/* Legacy redirects */}
              <Route path="/plan" element={<CalendarDiary />} />
              <Route path="/progress" element={<MyJourney />} /> 
              <Route path="/profile" element={<Settings />} /> 

            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </TimeProvider>
  );
};

export default App;