import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, TrendingUp, User } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/workout') return null;

  const tabs = [
    { id: 'dashboard', label: 'Idag', icon: Home, path: '/dashboard' },
    { id: 'plan', label: 'Min Plan', icon: Calendar, path: '/calendar' }, // Updated path
    { id: 'progress', label: 'Framsteg', icon: TrendingUp, path: '/progress' },
    { id: 'profile', label: 'Profil', icon: User, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-safe z-40">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-16 h-14 space-y-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;