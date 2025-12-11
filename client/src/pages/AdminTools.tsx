
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Database, Layout, ShieldAlert } from 'lucide-react';
import DatabaseResetTool from '../components/admin/DatabaseResetTool';
import ImageManagerTool from '../components/admin/ImageManagerTool';
import ProgramBuilderTool from '../components/admin/ProgramBuilderTool';

const AdminTools = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolClick = (toolName: string) => {
    if (toolName === 'Database Reset') {
        setActiveTool('database-reset');
        return;
    }
    if (toolName === 'Bulk Image Uploader') {
        setActiveTool('image-manager');
        return;
    }
    if (toolName === 'Program Builder') {
        setActiveTool('program-builder');
        return;
    }
    alert(`${toolName} feature coming soon.`);
  };

  const renderToolSelection = () => (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <p className="text-slate-600 mb-8">
          Restricted access area. Use these tools with caution as they directly affect the application data and structure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tool 1: Bulk Image Uploader */}
          <button 
            onClick={() => handleToolClick('Bulk Image Uploader')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group"
          >
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Bulk Image Uploader</h3>
            <p className="text-sm text-slate-500">
              Upload exercise images and associate them with Firestore documents efficiently.
            </p>
          </button>

          {/* Tool 2: Program Builder */}
          <button 
            onClick={() => handleToolClick('Program Builder')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left group"
          >
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layout className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Program Builder</h3>
            <p className="text-sm text-slate-500">
              Visual editor to create new exercise levels, phases, and educational modules.
            </p>
          </button>

          {/* Tool 3: Database Reset */}
          <button 
            onClick={() => handleToolClick('Database Reset')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all text-left group"
          >
            <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Database className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Database Reset</h3>
            <p className="text-sm text-slate-500">
              Reset specific collections or re-seed the database with default data.
            </p>
          </button>

        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate('/dashboard')} className="mr-4 p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h1 className="text-xl font-bold text-slate-900">Admin Tools</h1>
        </div>
      </div>

      {activeTool === 'database-reset' ? (
          <DatabaseResetTool onBack={() => setActiveTool(null)} />
      ) : activeTool === 'image-manager' ? (
          <ImageManagerTool onBack={() => setActiveTool(null)} />
      ) : activeTool === 'program-builder' ? (
          <ProgramBuilderTool onBack={() => setActiveTool(null)} />
      ) : (
          renderToolSelection()
      )}
      
    </div>
  );
};

export default AdminTools;
