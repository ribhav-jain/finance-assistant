
import React from 'react';
import { View, UserProfile } from '../types';
import { LayoutDashboard, CreditCard, PieChart, Target, Lightbulb, MessageSquare, Wallet, X } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userProfile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen, userProfile }) => {
  const menuItems = [
    { id: View.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.Transactions, label: 'Transactions', icon: CreditCard },
    { id: View.SmartBudget, label: 'Smart Budget', icon: PieChart },
    { id: View.SavingGoals, label: 'Saving Goals', icon: Target },
    { id: View.AIInsights, label: 'AI Insights', icon: Lightbulb },
    { id: View.AskAI, label: 'Ask AI', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">FinAI</span>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Profile/Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setCurrentView(View.Profile);
              setIsOpen(false);
            }}
            className={`w-full flex items-center p-2 rounded-lg transition-colors text-left ${currentView === View.Profile
                ? 'bg-indigo-50 dark:bg-indigo-900/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
              {userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{userProfile.email}</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
