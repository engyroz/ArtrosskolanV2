
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { Activity, User, LogOut, Settings, HelpCircle, UserCircle, ShieldAlert, Wrench } from 'lucide-react';

const TopNavigation = () => {
  const { user, userProfile, logout } = useAuth();
  const { toggleDebug, isDebugVisible } = useTime();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Helper to determine mode
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);
  const isWorkoutMode = location.pathname === '/workout';

  if (isWorkoutMode) return null; // Hide in immersive workout player

  const handleLogoClick = () => {
    if (user) {
      // Scenario 1: Logged in -> Refresh Dashboard
      if (location.pathname === '/dashboard') {
        window.location.reload(); 
      } else {
        navigate('/dashboard');
      }
    } else {
      // Scenario 2: Public -> Go to Landing
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16">
        <div className="max-w-md mx-auto px-4 h-full flex justify-between items-start relative items-center">
          
          {/* LEFT: Sender / Logo */}
          <div 
            className="flex items-center cursor-pointer transition-opacity hover:opacity-80" 
            onClick={handleLogoClick}
          >
            <Activity className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-bold text-lg text-slate-900 tracking-tight">Artrosskolan</span>
          </div>

          {/* RIGHT: Contextual Actions */}
          {user ? (
            // LÄGE B: PRIVAT VY (Logged In)
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600">
                    <User className="h-5 w-5" />
                </div>
              </button>

              {/* Profile Overlay Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in z-50">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <p className="font-bold text-slate-900 text-sm truncate">{user.email}</p>
                    <p className="text-xs text-slate-500">Medlem</p>
                  </div>
                  <div className="py-2">
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-3 text-slate-400" /> Inställningar
                    </Link>
                    
                    {userProfile?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <ShieldAlert className="w-4 h-4 mr-3" /> Admin Tools
                      </Link>
                    )}

                    <button 
                      onClick={() => { toggleDebug(); setShowProfileMenu(false); }}
                      className="w-full flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Wrench className={`w-4 h-4 mr-3 ${isDebugVisible ? 'text-blue-600' : 'text-slate-400'}`} /> 
                      {isDebugVisible ? 'Dölj Dev Tools' : 'Visa Dev Tools'}
                    </button>

                    <Link 
                      to="/support" 
                      className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HelpCircle className="w-4 h-4 mr-3 text-slate-400" /> Hjälp & Support
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" /> Logga ut
                    </button>
                  </div>
                </div>
              )}
              
              {/* Backdrop for menu */}
              {showProfileMenu && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                ></div>
              )}
            </div>
          ) : (
            // LÄGE A: OFFENTLIG VY (Visitor)
            <div className="flex items-center gap-3">
              <Link 
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2"
              >
                Logga in
              </Link>
              <Link 
                to="/assessment"
                className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Kom igång
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default TopNavigation;
