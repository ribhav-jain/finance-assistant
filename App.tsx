
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import SmartBudget from './components/SmartBudget';
import SavingGoals from './components/SavingGoals';
import AIInsights from './components/AIInsights';
import AskAI from './components/AskAI';
import Profile from './components/Profile';
import { View, Transaction, Category, Budget, SavingGoal, UserProfile, AppNotification } from './types';
import { Menu, Moon, Sun, Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- DYNAMIC MOCK DATA GENERATOR ---
const generateMockData = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();

  // Generate 7 months of data for a better chart trend
  for (let i = 0; i < 7; i++) {
    const monthOffset = i;
    // Calculate date: 1st of the month for reference
    const dateBase = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const monthStr = dateBase.toISOString().slice(0, 7);

    // 1. Income: Salary with occasional bonuses
    let salaryAmt = 5200;
    let description = 'Tech Solutions Salary';

    // Simulate a bonus 2 months ago and 5 months ago
    if (monthOffset === 2) {
      salaryAmt += 1500;
      description = 'Salary + Q3 Bonus';
    }
    if (monthOffset === 5) {
      salaryAmt += 800;
    }

    transactions.push({
      id: uuidv4(),
      date: `${monthStr}-28`, // Salary typically end of month
      description: description,
      amount: salaryAmt,
      category: Category.Salary,
      type: 'income'
    });

    // 2. Fixed Expenses: Rent
    transactions.push({
      id: uuidv4(),
      date: `${monthStr}-03`,
      description: 'City Luxury Apartments',
      amount: 1600,
      category: Category.Rent,
      type: 'expense'
    });

    // 3. Variable Utilities (Seasonal variance)
    const isWinter = dateBase.getMonth() <= 1 || dateBase.getMonth() >= 10;
    const utilityAmt = isWinter ? 180 + Math.random() * 40 : 120 + Math.random() * 30;

    transactions.push({
      id: uuidv4(),
      date: `${monthStr}-15`,
      description: 'Electric & Internet',
      amount: parseFloat(utilityAmt.toFixed(2)),
      category: Category.Utilities,
      type: 'expense'
    });

    // 4. Frequent Variable Expenses
    const variableExpenses = [
      { desc: 'Whole Foods Market', cat: Category.Food, min: 120, max: 280, count: 3 },
      { desc: 'Shell Station', cat: Category.Travel, min: 40, max: 70, count: 2 },
      { desc: 'Uber', cat: Category.Travel, min: 15, max: 45, count: 3 },
      { desc: 'Netflix', cat: Category.Subscriptions, amount: 15.99, count: 1 },
      { desc: 'Spotify', cat: Category.Subscriptions, amount: 9.99, count: 1 },
      { desc: 'Amazon Purchase', cat: Category.Shopping, min: 25, max: 150, count: 2 },
      { desc: 'Local Bistro', cat: Category.Food, min: 40, max: 90, count: 3 },
      { desc: 'Morning Coffee', cat: Category.Food, min: 5, max: 12, count: 6 },
    ];

    variableExpenses.forEach(exp => {
      const count = exp.count || 1;
      for (let j = 0; j < count; j++) {
        const amount = (exp.amount !== undefined)
          ? exp.amount
          : Math.floor(Math.random() * (exp.max! - exp.min! + 1)) + exp.min!;

        // Randomize day between 1 and 28
        const dayVal = Math.floor(Math.random() * 27) + 1;
        const day = dayVal < 10 ? `0${dayVal}` : dayVal;

        transactions.push({
          id: uuidv4(),
          date: `${monthStr}-${day}`,
          description: exp.desc,
          amount: parseFloat(amount.toFixed(2)),
          category: exp.cat as Category,
          type: 'expense'
        });
      }
    });

    // 5. Specific "Big Ticket" events to create peaks/valleys
    if (monthOffset === 1) {
      transactions.push({
        id: uuidv4(),
        date: `${monthStr}-12`,
        description: 'Flight to NY',
        amount: 450.00,
        category: Category.Travel,
        type: 'expense'
      });
    }
    if (monthOffset === 3) {
      transactions.push({
        id: uuidv4(),
        date: `${monthStr}-22`,
        description: 'Car Service & Repair',
        amount: 750.00,
        category: Category.Other,
        type: 'expense'
      });
    }
    if (monthOffset === 4) {
      transactions.push({
        id: uuidv4(),
        date: `${monthStr}-05`,
        description: 'New iPhone',
        amount: 999.00,
        category: Category.Shopping,
        type: 'expense'
      });
    }
  }

  // Sort descending by date
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const initialBudgets: Budget[] = [
  { category: Category.Food, limit: 700 },
  { category: Category.Rent, limit: 1600 },
  { category: Category.Entertainment, limit: 300 },
  { category: Category.Shopping, limit: 500 },
  { category: Category.Travel, limit: 400 },
];

const initialGoals: SavingGoal[] = [
  { id: '1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 4200, deadline: '2025-06-30' },
  { id: '2', name: 'MacBook Pro', targetAmount: 2500, currentAmount: 1900, deadline: '2024-11-15' },
  { id: '3', name: 'Japan Trip', targetAmount: 6000, currentAmount: 1500, deadline: '2025-09-01' },
];

const initialNotifications: AppNotification[] = [
  { id: '1', title: 'Salary Received', message: 'Your salary of $5,200 has been credited to your account.', type: 'success', read: false, time: '2h ago' },
  { id: '2', title: 'Budget Alert', message: 'You have used 85% of your Dining budget for this month.', type: 'alert', read: false, time: '5h ago' },
  { id: '3', title: 'Goal Reached', message: 'Congratulations! You hit 25% of your Japan Trip savings goal.', type: 'info', read: true, time: '1d ago' },
  { id: '4', title: 'New Feature', message: 'Check out the new AI Insights tab for personalized tips.', type: 'info', read: true, time: '2d ago' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>(generateMockData);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [goals, setGoals] = useState<SavingGoal[]>(initialGoals);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Ribhav Jain',
    email: 'ribhav.jain@example.com',
    memberSince: 'January 2024',
    currency: 'USD'
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Transactions Logic ---
  const addTransaction = (t: Transaction) => setTransactions(prev => [t, ...prev]);

  const addTransactions = (ts: Transaction[]) => setTransactions(prev => [...ts, ...prev]);

  const editTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Budgets Logic ---
  const updateBudget = (cat: Category, limit: number) => {
    setBudgets(prev => prev.map(b => b.category === cat ? { ...b, limit } : b));
  };

  const addBudget = (budget: Budget) => {
    setBudgets(prev => [...prev, budget]);
  };

  const removeBudget = (cat: Category) => {
    setBudgets(prev => prev.filter(b => b.category !== cat));
  };

  // --- Goals Logic ---
  const addGoal = (goal: SavingGoal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (updatedGoal: SavingGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // --- Profile Logic ---
  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const resetData = () => {
    setTransactions(generateMockData());
    setBudgets(initialBudgets);
    setGoals(initialGoals);
    setNotifications(initialNotifications);
    alert('Data has been reset to defaults.');
  };

  // --- Notifications Logic ---
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const deleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Export Logic ---
  const handleExport = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.amount.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `finai_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard
          transactions={transactions}
          budgets={budgets}
          goals={goals}
          isDarkMode={isDarkMode}
          setCurrentView={setCurrentView}
          onExport={handleExport}
        />;
      case View.Transactions: return <Transactions
        transactions={transactions}
        addTransaction={addTransaction}
        addTransactions={addTransactions}
        editTransaction={editTransaction}
        removeTransaction={removeTransaction}
      />;
      case View.SmartBudget:
        return <SmartBudget
          transactions={transactions}
          budgets={budgets}
          updateBudget={updateBudget}
          addBudget={addBudget}
          removeBudget={removeBudget}
        />;
      case View.SavingGoals:
        return <SavingGoals
          goals={goals}
          addGoal={addGoal}
          updateGoal={updateGoal}
          removeGoal={removeGoal}
        />;
      case View.AIInsights: return <AIInsights transactions={transactions} />;
      case View.AskAI: return <AskAI transactions={transactions} />;
      case View.Profile: return <Profile
        profile={userProfile}
        updateProfile={updateProfile}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onResetData={resetData}
      />;
      default: return <Dashboard
        transactions={transactions}
        budgets={budgets}
        goals={goals}
        isDarkMode={isDarkMode}
        setCurrentView={setCurrentView}
        onExport={handleExport}
      />;
    }
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        userProfile={userProfile}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">

        {/* Backdrop for mobile sidebar or notifications */}
        {isNotifOpen && (
          <div
            className="fixed inset-0 z-20 bg-transparent"
            onClick={() => setIsNotifOpen(false)}
          />
        )}

        {/* Solid Header with Border */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-30 sticky top-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden ml-2 flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">FinAI</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 relative">

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-lg transition-colors relative ${isNotifOpen
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-950"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn origin-top-right">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-[24rem] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-12 px-6 text-center">
                      <Bell className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-500 dark:text-slate-400 text-sm">No notifications yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`group relative p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                            }`}
                        >
                          <div className="flex gap-3">
                            <div className={`shrink-0 mt-0.5 ${n.type === 'alert' ? 'text-rose-500' :
                              n.type === 'success' ? 'text-emerald-500' :
                                'text-indigo-500'
                              }`}>
                              {n.type === 'alert' && <AlertTriangle className="w-5 h-5" />}
                              {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
                              {n.type === 'info' && <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-0.5">
                                <h4 className={`text-sm font-semibold truncate pr-6 ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'
                                  }`}>
                                  {n.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          </div>
                          {/* Delete Button (Visible on Hover) */}
                          <button
                            onClick={(e) => deleteNotification(e, n.id)}
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {/* Unread Indicator */}
                          {!n.read && (
                            <div className="absolute top-1/2 right-2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 md:hidden"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center pl-4 border-l border-slate-200 dark:border-slate-800 ml-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <span className="font-bold text-xs text-slate-600 dark:text-slate-300">
                  {userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
