import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, Budget, SavingGoal, View } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, CreditCard, ArrowRight, WalletCards, Target, Download, Plus, Wallet } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingGoal[];
  isDarkMode: boolean;
  setCurrentView: (view: View) => void;
  onExport?: () => void;
}

const COLORS = ['#4f46e5', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Internal CountUp Component for number animation
const CountUp = ({ end, duration = 1500, prefix = '', suffix = '', decimals = 0 }: { end: number, duration?: number, prefix?: string, suffix?: string, decimals?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Easing function for smooth deceleration (easeOutExpo)
      const easeVal = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCount(easeVal * end);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg border shadow-xl backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-white/90 border-slate-200 text-slate-800'
        }`}>
        <p className="font-medium text-xs mb-2 opacity-70">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }} />
            <span className="capitalize font-medium">{entry.name}:</span>
            <span className="font-bold font-mono">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets, goals, isDarkMode, setCurrentView, onExport }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    return { income, expense, balance, savingsRate };
  }, [transactions]);

  const budgetHealth = useMemo(() => {
    const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const trackedExpenses = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear &&
          t.type === 'expense' &&
          budgets.some(b => b.category === t.category);
      })
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      used: trackedExpenses,
      limit: totalLimit,
      percentage: totalLimit > 0 ? Math.min(100, (trackedExpenses / totalLimit) * 100) : 0
    };
  }, [transactions, budgets]);

  const topGoal = goals[0];
  const goalProgress = topGoal ? Math.min(100, (topGoal.currentAmount / topGoal.targetAmount) * 100) : 0;

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const timeData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const grouped: Record<string, any> = {};
    sorted.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!grouped[month]) grouped[month] = { name: month, income: 0, expense: 0 };
      if (t.type === 'income') grouped[month].income += t.amount;
      else grouped[month].expense += t.amount;
    });
    return Object.values(grouped);
  }, [transactions]);

  const kpis = [
    {
      label: 'Total Balance',
      amount: metrics.balance,
      icon: Wallet,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      trend: '+12%',
      trendUp: true,
      primary: true
    },
    {
      label: 'Monthly Income',
      amount: metrics.income / 7,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      trend: '+5%',
      trendUp: true
    },
    {
      label: 'Monthly Expenses',
      amount: metrics.expense / 7,
      icon: CreditCard,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      trend: '-2%',
      trendUp: false
    },
    {
      label: 'Savings Rate',
      amount: metrics.savingsRate,
      isPercent: true,
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      trend: '+1.5%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back, here's your financial overview.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="group flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 shadow-sm hover:shadow"
          >
            <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-lg group ${kpi.primary
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-transparent shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0, animationDelay: `${idx * 100}ms` }}
            >
              {/* Background decorations for primary card */}
              {kpi.primary && (
                <>
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                </>
              )}

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-xl transition-transform duration-300 group-hover:scale-110 ${kpi.primary
                      ? 'bg-white/20 text-white backdrop-blur-sm'
                      : `${kpi.bg} ${kpi.color}`
                    }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center backdrop-blur-sm ${kpi.primary
                      ? 'bg-white/20 text-white'
                      : (kpi.trendUp
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400')
                    }`}>
                    {kpi.trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {kpi.trend}
                  </span>
                </div>
                <div>
                  <p className={`text-sm font-medium ${kpi.primary ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>{kpi.label}</p>
                  <h3 className={`text-2xl font-bold mt-1 tracking-tight ${kpi.primary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    <CountUp
                      end={kpi.amount}
                      prefix={kpi.isPercent ? '' : '$'}
                      suffix={kpi.isPercent ? '%' : ''}
                      decimals={kpi.isPercent ? 1 : 0}
                    />
                  </h3>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mid Section: Budget Health & Top Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Budget Health Card */}
        <div
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900"
          style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0, animationDelay: '300ms' }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <WalletCards className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Budget Health</h3>
            </div>
            <button
              onClick={() => setCurrentView(View.SmartBudget)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            >
              Manage
            </button>
          </div>

          {budgetHealth.limit > 0 ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Monthly Budget Usage</p>
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    $<CountUp end={budgetHealth.used} />
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">/ ${budgetHealth.limit.toLocaleString()}</span>
                </div>
                <span className={`text-xs font-bold ${budgetHealth.percentage > 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {budgetHealth.percentage.toFixed(0)}%
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mb-4 p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) ${budgetHealth.percentage > 100 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                    }`}
                  style={{ width: mounted ? `${Math.min(budgetHealth.percentage, 100)}%` : '0%' }}
                />
              </div>

              <div className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 ${budgetHealth.percentage > 100
                  ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                  : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                }`}>
                {budgetHealth.percentage > 100 ? <ArrowDownRight className="w-4 h-4 shrink-0" /> : <ArrowUpRight className="w-4 h-4 shrink-0" />}
                {budgetHealth.percentage > 100
                  ? `You've exceeded your budget by $${(budgetHealth.used - budgetHealth.limit).toLocaleString()}.`
                  : "You are within all your set budgets. Great job!"
                }
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">No budgets set yet</p>
              <button
                onClick={() => setCurrentView(View.SmartBudget)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Create your first budget
              </button>
            </div>
          )}
        </div>

        {/* Top Goal Card */}
        {topGoal ? (
          <div
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-900"
            style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0, animationDelay: '400ms' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Goal</h3>
              </div>
              <button
                onClick={() => setCurrentView(View.SavingGoals)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              >
                View All
              </button>
            </div>

            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{topGoal.name}</h4>
                <p className="text-xs text-slate-400 mt-1">Target: {new Date(topGoal.deadline).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  $<CountUp end={topGoal.currentAmount} />
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">of ${topGoal.targetAmount.toLocaleString()}</div>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mb-3 p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) relative overflow-hidden"
                style={{ width: mounted ? `${goalProgress}%` : '0%' }}
              >
                {/* Shimmer effect inside bar */}
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12"></div>
              </div>
            </div>

            <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              {goalProgress.toFixed(1)}% Completed
            </p>
          </div>
        ) : (
          <div
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg"
            style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0, animationDelay: '400ms' }}
          >
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full mb-3">
              <Target className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 font-medium text-sm">No savings goals yet.</p>
            <button onClick={() => setCurrentView(View.SavingGoals)} className="text-indigo-600 text-xs font-bold mt-2 hover:underline">Create one</button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Main Chart */}
        <div
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700"
          style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0, animationDelay: '500ms' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cash Flow</h3>
            <div className="flex space-x-3">
              <span className="flex items-center text-xs font-medium text-slate-500 cursor-pointer hover:opacity-75 transition-opacity">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span> Income
              </span>
              <span className="flex items-center text-xs font-medium text-slate-500 cursor-pointer hover:opacity-75 transition-opacity">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 shadow-[0_0_6px_rgba(244,63,94,0.5)]"></span> Expense
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                <Tooltip
                  content={<CustomTooltip isDarkMode={isDarkMode} />}
                  cursor={{ stroke: isDarkMode ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700"
          style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0, animationDelay: '600ms' }}
        >
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Top Spending</h3>
          <div className="h-48 w-full relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke={isDarkMode ? '#0f172a' : '#fff'}
                  strokeWidth={3}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {categoryData.length}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Cats</span>
            </div>
          </div>
          <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex justify-between items-center text-xs group cursor-default">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-2 transition-transform group-hover:scale-125" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-800 dark:text-white">${cat.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setCurrentView(View.Transactions)}
            className="mt-4 w-full py-2.5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl font-semibold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all active:scale-95"
          >
            View All Transactions <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;