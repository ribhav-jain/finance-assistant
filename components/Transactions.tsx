import React, { useState, useRef } from 'react';
import { Transaction, Category } from '../types';
import { Search, Plus, Upload, Filter, X, Loader2, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { categorizeTransactionAI } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface TransactionsProps {
    transactions: Transaction[];
    addTransaction: (t: Transaction) => void;
    addTransactions: (t: Transaction[]) => void;
    editTransaction: (t: Transaction) => void;
    removeTransaction: (id: string) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction, addTransactions, editTransaction, removeTransaction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filter States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterDateStart, setFilterDateStart] = useState<string>('');
    const [filterDateEnd, setFilterDateEnd] = useState<string>('');

    // Form States
    const [newDesc, setNewDesc] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newType, setNewType] = useState<'income' | 'expense'>('expense');
    const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isProcessing, setIsProcessing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filtered = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'All' || t.category === filterCategory;

        let matchesDate = true;
        if (filterDateStart && t.date < filterDateStart) matchesDate = false;
        if (filterDateEnd && t.date > filterDateEnd) matchesDate = false;

        return matchesSearch && matchesCategory && matchesDate;
    });

    const openAddModal = () => {
        setEditingId(null);
        setNewDesc('');
        setNewAmount('');
        setNewType('expense');
        setNewDate(new Date().toISOString().split('T')[0]);
        setIsModalOpen(true);
    };

    const openEditModal = (t: Transaction) => {
        setEditingId(t.id);
        setNewDesc(t.description);
        setNewAmount(t.amount.toString());
        setNewType(t.type);
        setNewDate(t.date);
        setIsModalOpen(true);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDesc || !newAmount) return;

        setIsProcessing(true);
        const amountVal = parseFloat(newAmount);

        let category = Category.Other;
        if (newType === 'expense') {
            // Only re-categorize if adding new, or if description changed significantly. 
            // For simplicity, we re-categorize if it's a new transaction. 
            // In edit mode, we might want to keep existing unless user clears it, 
            // but since we don't have a category picker in the UI, let's keep it simple.
            // Actually, for edit, let's just use the existing category logic or basic AI if needed.
            // To avoid complexity, we'll re-run categorization for simplicity, 
            // or finding the existing transaction to keep its category if description didn't change.
            const existing = transactions.find(t => t.id === editingId);
            if (existing && existing.description === newDesc) {
                category = existing.category;
            } else {
                category = await categorizeTransactionAI(newDesc, amountVal);
            }
        } else {
            category = Category.Salary;
        }

        const txData: Transaction = {
            id: editingId || uuidv4(),
            date: newDate,
            description: newDesc,
            amount: amountVal,
            type: newType,
            category: category
        };

        if (editingId) {
            editTransaction(txData);
        } else {
            addTransaction(txData);
        }

        setIsProcessing(false);
        setIsModalOpen(false);
        setNewDesc('');
        setNewAmount('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newTxs: Transaction[] = [];

            setIsProcessing(true);

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const parts = line.split(',');
                if (parts.length >= 3) {
                    const description = parts[1]?.trim() || "Unknown";
                    const amount = parseFloat(parts[2]?.trim() || "0");

                    let category = Category.Other;
                    if (i < 6) {
                        category = await categorizeTransactionAI(description, amount);
                    }

                    newTxs.push({
                        id: uuidv4(),
                        date: parts[0]?.trim() || new Date().toISOString().split('T')[0],
                        description: description,
                        amount: Math.abs(amount),
                        type: amount < 0 ? 'expense' : 'income',
                        category: category
                    });
                }
            }

            addTransactions(newTxs);
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Transactions</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your financial history.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center px-3 py-1.5 font-medium transition-colors text-sm rounded-md ${isFilterOpen ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                        <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Collapsible Filter Panel */}
                {isFilterOpen && (
                    <div className="pt-2 pb-1 px-1 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none"
                            >
                                <option value="All">All Categories</option>
                                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filterDateStart}
                                onChange={(e) => setFilterDateStart(e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                            <input
                                type="date"
                                value={filterDateEnd}
                                onChange={(e) => setFilterDateEnd(e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filtered.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{t.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-200">{t.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`text-sm font-semibold ${t.type === 'income'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-slate-900 dark:text-slate-100'
                                            }`}>
                                            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeTransaction(t.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingId ? 'Edit Transaction' : 'Add Transaction'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white text-sm"
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white text-sm"
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="e.g. Grocery Store"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-6 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white text-sm"
                                            value={newAmount}
                                            onChange={e => setNewAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setNewType('expense')}
                                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${newType === 'expense'
                                                    ? 'bg-white dark:bg-slate-950 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-slate-700'
                                                    : 'text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            Expense
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewType('income')}
                                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${newType === 'income'
                                                    ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                                                    : 'text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            Income
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-semibold text-sm flex justify-center items-center"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (editingId ? 'Save Changes' : 'Save Transaction')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;