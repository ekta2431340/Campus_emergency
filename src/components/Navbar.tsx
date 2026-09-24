import React from 'react';
import { User, UserRole } from '../types';
import { ShieldAlert, Download, Cpu, BookOpen, Users, Radio, Activity } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  usersList: User[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  usersList,
  activeTab,
  onTabChange,
  onDownloadZip,
  isDownloading,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-900/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <button
            onClick={() => onTabChange(currentUser.role === 'Admin' ? 'admin' : currentUser.role === 'Responder' ? 'responder' : 'student')}
            className="text-left font-bold text-base sm:text-lg tracking-tight hover:text-rose-400 transition-colors"
          >
            Campus Emergency AI
          </button>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-mono pl-2 border-l border-slate-700">
            BCA Capstone
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => onTabChange('student')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Student SOS</span>
          </button>

          <button
            onClick={() => onTabChange('admin')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => onTabChange('responder')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'responder'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Tactical Units</span>
          </button>

          <button
            onClick={() => onTabChange('playground')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'playground'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI Laboratory</span>
          </button>

          <button
            onClick={() => onTabChange('docs')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Viva & Docs</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Demo Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher */}
          <div className="relative group">
            <select
              aria-label="Active Demo Role"
              value={currentUser.id}
              onChange={(e) => {
                const u = usersList.find((usr) => usr.id === Number(e.target.value));
                if (u) {
                  onSwitchUser(u);
                  if (u.role === 'Admin') onTabChange('admin');
                  else if (u.role === 'Responder') onTabChange('responder');
                  else onTabChange('student');
                }
              }}
              className="bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.role}: {u.name.split(' ')[0]} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Download Zip CTA */}
          <button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm shadow-rose-900/40"
            title="Download complete standalone Python Flask project ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span> Python ZIP
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-slate-900 px-2 py-1.5 text-xs">
        <button
          onClick={() => onTabChange('student')}
          className={`px-2 py-1 rounded ${activeTab === 'student' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
        >
          SOS
        </button>
        <button
          onClick={() => onTabChange('admin')}
          className={`px-2 py-1 rounded ${activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          Admin
        </button>
        <button
          onClick={() => onTabChange('responder')}
          className={`px-2 py-1 rounded ${activeTab === 'responder' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Responder
        </button>
        <button
          onClick={() => onTabChange('playground')}
          className={`px-2 py-1 rounded ${activeTab === 'playground' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          AI Lab
        </button>
        <button
          onClick={() => onTabChange('docs')}
          className={`px-2 py-1 rounded ${activeTab === 'docs' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Viva Guide
        </button>
      </div>
    </header>
  );
};
