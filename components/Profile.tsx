
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Shield, Moon, Sun, Trash2, Check, LogOut, CreditCard, Save } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  updateProfile: (p: UserProfile) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onResetData: () => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, updateProfile, isDarkMode, toggleTheme, onResetData }) => {
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              {formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{formData.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{formData.email}</p>
            <div className="mt-4 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-900/30">
              Premium Plan
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark Mode</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-2 space-y-6">

          {/* Personal Info Form */}
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Personal Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Preferred Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${isSaved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-100 dark:border-rose-900/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-rose-100 dark:border-rose-900/20 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Data Management</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Resetting your data will delete all transactions, budgets, and goals, reverting the app to its initial state with sample data. This action cannot be undone.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                    onResetData();
                  }
                }}
                className="flex items-center px-4 py-2 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Data
              </button>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button className="flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
