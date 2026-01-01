
import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect, withRouter, RouteComponentProps } from 'react-router-dom';
import TopNavigation from './components/TopNavigation';
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
import WorkoutSummary from './pages/WorkoutSummary';
import CalendarDiary from './pages/CalendarDiary';
import MyJourney from './pages/MyJourney'; 
import KnowledgeBase from './pages/KnowledgeBase'; 
import Settings from './pages/Settings'; 
import AdminTools from './pages/AdminTools'; 
import ProtectedRoute from './components/ProtectedRoute';
import TimeTravelDebug from './components/TimeTravelDebug';
import ProgressionDebug from './components/ProgressionDebug';

interface LayoutProps extends RouteComponentProps {
  children?: React.ReactNode;
}

const LayoutBase = ({ children, location }: LayoutProps) => {
  const { user } = useAuth();
  
  // App routes where Bottom Nav should appear
  const isAppRoute = ['/dashboard', '/calendar', '/journey', '/knowledge', '/profile'].includes(location.pathname);
  const showBottomNav = user && isAppRoute;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <TopNavigation />
      
      <main className="flex-grow relative">
        {children}
      </main>

      {showBottomNav && <BottomNavigation />}
      <TimeTravelDebug />
      <ProgressionDebug />
    </div>
  );
};

const Layout = withRouter(LayoutBase);

const App: React.FC = () => {
  return (
    <TimeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Switch>
              <Route exact path="/" component={Landing} />
              <Route path="/assessment" component={Assessment} />
              <Route path="/results" component={Results} />
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />

              <Route path="/payment" render={() => (
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              )} />

              <Route path="/dashboard" render={() => (
                <ProtectedRoute requireSubscription={true}>
                  <Dashboard />
                </ProtectedRoute>
              )} />

              <Route path="/calendar" render={() => (
                <ProtectedRoute requireSubscription={true}>
                  <CalendarDiary />
                </ProtectedRoute>
              )} />

              <Route path="/journey" render={() => (
                <ProtectedRoute requireSubscription={true}>
                  <MyJourney />
                </ProtectedRoute>
              )} />

              <Route path="/knowledge" render={() => (
                <ProtectedRoute requireSubscription={true}>
                  <KnowledgeBase />
                </ProtectedRoute>
              )} />

              <Route path="/settings" render={() => (
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              )} />

              <Route path="/admin" render={() => (
                <ProtectedRoute requiredRole="admin">
                  <AdminTools />
                </ProtectedRoute>
              )} />

              <Route path="/workout" render={() => (
                <ProtectedRoute requireSubscription={true}>
                  <WorkoutPlayer />
                </ProtectedRoute>
              )} />

              <Route path="/summary" render={() => (
                <ProtectedRoute requireSubscription={true}>
                  <WorkoutSummary />
                </ProtectedRoute>
              )} />
              
              {/* Legacy redirects */}
              <Redirect from="/plan" to="/calendar" />
              <Redirect from="/progress" to="/journey" />
              <Redirect from="/profile" to="/settings" /> 

            </Switch>
          </Layout>
        </Router>
      </AuthProvider>
    </TimeProvider>
  );
};

export default App;
