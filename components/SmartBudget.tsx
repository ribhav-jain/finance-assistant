import React, { useState } from 'react';
import { Transaction, Category, Budget } from '../types';
import { PieChart, Plus, X, Pencil, Trash2 } from 'lucide-react';

interface SmartBudgetProps {
    transactions: Transaction[];
    budgets: Budget[];
    updateBudget: (category: Category, limit: number) => void;
    addBudget: (budget: Budget) => void;
    removeBudget: (category: Category) => void;
}

const SmartBudget: React.FC<SmartBudgetProps> = ({ transactions, budgets, updateBudget, addBudget, removeBudget }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<Category>(Category.Food);
    const [limitInput, setLimitInput] = useState('');

    const getSpent = (cat: Category) => {
        return transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setLimitInput('');
        const available = Object.values(Category).filter(c => !budgets.some(b => b.category === c));
        if (available.length > 0) setSelectedCategory(available[0]);
        setIsModalOpen(true);
    };

    const openEditModal = (budget: Budget) => {
        setEditingCategory(budget.category);
        setSelectedCategory(budget.category);
        setLimitInput(budget.limit.toString());
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const limit = parseFloat(limitInput);
        if (isNaN(limit) || limit <= 0) return;

        if (editingCategory) {
            updateBudget(editingCategory, limit);
        } else {
            addBudget({ category: selectedCategory, limit });
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (editingCategory) {
            removeBudget(editingCategory);
            setIsModalOpen(false);
        }
    };

    const availableCategories = Object.values(Category).filter(
        cat => !budgets.some(b => b.category === cat) || cat === editingCategory
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Budgets</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage spending limits and track your progress.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Budget
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {budgets.map((budget) => {
                    const spent = getSpent(budget.category);
                    const percentage = Math.min(100, (spent / budget.limit) * 100);
                    const isOver = spent > budget.limit;
                    const isNear = percentage > 80 && !isOver;

                    let colorClass = "bg-emerald-500";
                    let badgeClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";

                    if (isOver) {
                        colorClass = "bg-rose-500";
                        badgeClass = "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400";
                    } else if (isNear) {
                        colorClass = "bg-amber-500";
                        badgeClass = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
                    }

                    return (
                        <div
                            key={budget.category}
                            className="group bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-600 transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{budget.category}</h3>
                                        <p className="text-xs font-medium text-slate-500">Monthly Limit</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openEditModal(budget)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="text-xl font-bold text-slate-900 dark:text-white">${spent.toLocaleString()}</span>
                                        <span className="text-xs text-slate-500 font-medium ml-1">/ ${budget.limit.toLocaleString()}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeClass}`}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs font-medium pt-3 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">Remaining</span>
                                <span className={`${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {isOver ? '-' : ''}${Math.abs(budget.limit - spent).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )
                })}

                {/* Add New Placeholder Card */}
                <button
                    onClick={openAddModal}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all min-h-[180px]"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">Add New Category</span>
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingCategory ? 'Edit Budget' : 'New Budget'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                                {editingCategory ? (
                                    <input
                                        type="text"
                                        value={editingCategory}
                                        disabled
                                        className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 text-sm font-medium cursor-not-allowed"
                                    />
                                ) : (
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value as Category)}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white text-sm font-medium"
                                    >
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Limit</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full pl-6 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white text-sm font-medium"
                                        value={limitInput}
                                        onChange={e => setLimitInput(e.target.value)}
                                        placeholder="e.g. 500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {editingCategory && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="flex-1 py-2.5 text-rose-600 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg font-semibold text-sm transition-colors flex justify-center items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className={`flex-[2] py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-semibold text-sm flex justify-center items-center ${!editingCategory ? 'w-full' : ''}`}
                                >
                                    {editingCategory ? 'Save Changes' : 'Create Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartBudget;