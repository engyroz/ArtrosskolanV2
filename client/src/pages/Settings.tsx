import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Inställningar</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                {user?.email?.[0].toUpperCase()}
            </div>
            <div>
                <h2 className="font-bold text-slate-900 text-lg">Min Profil</h2>
                <p className="text-slate-500 text-sm">{user?.email}</p>
                <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Premium Medlem</span>
            </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button className="w-full flex items-center p-4 hover:bg-slate-50 border-b border-slate-100">
                <User className="h-5 w-5 text-slate-400 mr-4" />
                <span className="flex-1 text-left font-medium text-slate-700">Personuppgifter</span>
            </button>
            <button className="w-full flex items-center p-4 hover:bg-slate-50 border-b border-slate-100">
                <Bell className="h-5 w-5 text-slate-400 mr-4" />
                <span className="flex-1 text-left font-medium text-slate-700">Notiser</span>
            </button>
            <button className="w-full flex items-center p-4 hover:bg-slate-50 border-b border-slate-100">
                <Shield className="h-5 w-5 text-slate-400 mr-4" />
                <span className="flex-1 text-left font-medium text-slate-700">Säkerhet & Sekretess</span>
            </button>
        </div>

        <button 
            onClick={handleLogout}
            className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
            <LogOut className="h-5 w-5" /> Logga ut
        </button>

        <p className="text-center text-xs text-slate-400 mt-8">Version 1.0.0</p>

      </div>
    </div>
  );
};

export default Settings;