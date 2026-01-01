
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Lock, Calendar, ChevronDown, ArrowRight, Activity } from 'lucide-react';
import { getAssessmentFromStorage } from '../utils/assessmentEngine';
import { contentConfig } from '../utils/contentConfig';
import { AssessmentData } from '../types';

const Results = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AssessmentData | null>(null);

  useEffect(() => {
    const stored = getAssessmentFromStorage();
    if (!stored) {
        navigate('/'); // Redirect if no assessment found
    } else {
        setData(stored);
    }
  }, [navigate]);

  if (!data || !data.programConfig) return null;

  const level = data.programConfig.level;
  const joint = data.joint;
  // Fallback to text if missing
  const diagnosis = (contentConfig.diagnosisTexts as any)[level] || { title: `Fas ${level}`, body: "Individuell plan." };
  const focus = (contentConfig.focusTexts as any)[joint] || "styrka och rörlighet";
  const activityProfile = data.activityLevel || 'minimal';
  const activityText = (contentConfig.activityTexts as any)[activityProfile] || "Daglig aktivitet.";

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. THE HOOK */}
      <div className="bg-slate-900 text-white pt-20 pb-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-green-500/30">
                <CheckCircle className="w-4 h-4 mr-2" /> Analys Klar
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-tight">
                Din analys är klar. Här är din väg tillbaka.
            </h1>
            <p className="text-xl text-slate-300">
                Vi har tagit fram en skräddarsydd plan för ditt <span className="text-white font-bold">{joint}</span> baserat på din smärtprofil och dina mål.
            </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20">
        
        {/* 2. THE DIAGNOSIS CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 mb-12 border-b-8 border-blue-600">
            <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Din Startpunkt</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold text-sm">Nivå {level}</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{diagnosis.title}</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
                {diagnosis.body}
            </p>
        </div>

        {/* 3. THE TIMELINE */}
        <div className="mb-16">
            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center">Din Prognos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-slate-300"></div>
                    <h4 className="font-bold text-slate-900 mb-2">Vecka 1 (Nu)</h4>
                    <p className="text-sm text-slate-600">Vi väcker musklerna med {focus}. Målet är att bryta smärtcirkeln.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-400"></div>
                    <h4 className="font-bold text-slate-900 mb-2">Vecka 4</h4>
                    <p className="text-sm text-slate-600">Du känner dig starkare och tryggare i vardagen. Smärtan vid belastning minskar.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-slate-900">Mål Uppnått</h4>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">MÅL</span>
                    </div>
                    <p className="text-sm text-slate-600">Att {data.goal ? data.goal.toLowerCase() : 'nå dina mål'} utan att hindras av leden.</p>
                </div>
            </div>
        </div>

        {/* 4. THE SNEAK PEEK (Teaser) */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-12 relative overflow-hidden">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Din Vecka 1</h3>
            
            <div className="space-y-4 opacity-100 mb-8">
                <div className="bg-white p-4 rounded-lg flex items-center gap-4 border border-slate-200">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">Daglig Rehab</h4>
                        <p className="text-sm text-slate-500">3 specifika övningar för {focus}.</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg flex items-center gap-4 border border-slate-200">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">Aktivitet</h4>
                        <p className="text-sm text-slate-500">{activityText}</p>
                    </div>
                </div>
            </div>

            {/* Blurred Bottom */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
            <div className="space-y-4 opacity-50 blur-[2px]">
                <div className="bg-white p-4 rounded-lg border border-slate-200 h-16"></div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 h-16"></div>
            </div>
        </div>

        {/* 5. CTA */}
        <div className="text-center pb-24">
            <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-xl font-bold text-xl shadow-xl hover:bg-blue-700 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center mx-auto"
            >
                Starta min plan & spara konto <ArrowRight className="ml-3 h-6 w-6" />
            </button>
            <p className="mt-4 text-slate-500 text-sm">Ingen betalning krävs för att registrera konto.</p>
        </div>

      </div>
    </div>
  );
};

export default Results;
