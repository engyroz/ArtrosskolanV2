import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jointParam = searchParams.get('joint');

  // 1. Redirect if logged in
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Optional: Show loading spinner while auth check completes
  if (loading) {
      return <div className="min-h-screen bg-white"></div>;
  }

  // Dynamic Content based on Joint
  const getContent = () => {
    switch (jointParam) {
      case 'knee': return { title: 'Slipp din knäsmärta på 6 veckor', sub: 'Vetenskapligt bevisad metod för knäartros.' };
      case 'hip': return { title: 'Få tillbaka rörligheten i höften', sub: 'Minska stelhet och smärta utan operation.' };
      case 'shoulder': return { title: 'Bli fri från din axelsmärta', sub: 'Stärk din axel och sov bättre om nätterna.' };
      default: return { title: 'Ta kontroll över din ledhälsa', sub: 'Digital behandling för artros och ledsmärta.' };
    }
  };

  const content = getContent();

  const startAssessment = () => {
    navigate(jointParam ? `/assessment?joint=${jointParam}` : '/assessment');
  };

  return (
    <div className="bg-white">
      {/* Hero - Adjusted padding for fixed header */}
      <div className="relative isolate px-6 pt-10 lg:px-8">
        <div className="mx-auto max-w-2xl py-20 sm:py-32 lg:py-40 text-center">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-600 ring-1 ring-slate-900/10 hover:ring-slate-900/20">
              Evidensbaserad behandling • <a href="#" className="font-semibold text-blue-600">Läs mer <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6">
            {content.title}
          </h1>
          <p className="text-lg leading-8 text-slate-600 mb-10">
            {content.sub} Gör som 1200 andra och skapa din personliga rehabplan idag. Helt gratis analys.
          </p>
          <div className="flex items-center justify-center gap-x-6">
            <button
              onClick={startAssessment}
              className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-500 transition-all flex items-center transform hover:scale-105"
            >
              Gör smärt-testet <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-center text-lg font-semibold leading-8 text-slate-900 mb-10">
            Tryggt, Säkert & Medicinskt
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 leading-7 text-slate-600">
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm">
                <ShieldCheck className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="font-bold text-slate-900">Medicinsk Klass 1</h3>
                <p>Registrerad medicinteknisk produkt.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm">
                <Activity className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="font-bold text-slate-900">Individanpassat</h3>
                <p>AI-driven analys av dina besvär.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl mb-4">⭐</div>
                <h3 className="font-bold text-slate-900">4.8/5 i Betyg</h3>
                <p>Baserat på 300+ omdömen.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;