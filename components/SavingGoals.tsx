import React, { useState } from 'react';
import { SavingGoal } from '../types';
import { Trophy, Clock, Plus, Target, X, Pencil, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SavingGoalsProps {
    goals: SavingGoal[];
    addGoal: (goal: SavingGoal) => void;
    updateGoal: (goal: SavingGoal) => void;
    removeGoal: (id: string) => void;
}

const SavingGoals: React.FC<SavingGoalsProps> = ({ goals, addGoal, updateGoal, removeGoal }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');

    const openAddModal = () => {
        setEditingId(null);
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setDeadline('');
        setIsModalOpen(true);
    };

    const openEditModal = (goal: SavingGoal) => {
        setEditingId(goal.id);
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setCurrentAmount(goal.currentAmount.toString());
        setDeadline(goal.deadline);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const target = parseFloat(targetAmount);
        const current = parseFloat(currentAmount);

        if (!name || isNaN(target) || isNaN(current) || !deadline) return;

        if (editingId) {
            updateGoal({
                id: editingId,
                name,
                targetAmount: target,
                currentAmount: current,
                deadline
            });
        } else {
            addGoal({
                id: uuidv4(),
                name,
                targetAmount: target,
                currentAmount: current,
                deadline
            });
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (editingId) {
            removeGoal(editingId);
            setIsModalOpen(false);
        }
    };

    const calculateDaysLeft = (dateString: string) => {
        const today = new Date();
        const target = new Date(dateString);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Savings Goals</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Visualize your dreams and track your progress.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Goal
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {goals.map((goal) => {
                    const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    const daysLeft = calculateDaysLeft(goal.deadline);

                    return (
                        <div key={goal.id} className="group bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-600 transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{goal.name}</h3>
                                            <p className="text-xs font-medium text-slate-500">Target: ${goal.targetAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openEditModal(goal)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${goal.currentAmount.toLocaleString()}</span>
                                        <span className="text-xs font-bold text-slate-500">{percentage.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs font-medium pt-3 border-t border-slate-100 dark:border-slate-800 mt-1">
                                <div className="flex items-center text-slate-500 dark:text-slate-400">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    {daysLeft} days left
                                </div>
                                <span className="text-slate-500">
                                    ${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Add New Placeholder */}
                <button
                    onClick={openAddModal}
                    className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all min-h-[200px]"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">Create New Goal</span>
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
                                {editingId ? 'Edit Goal' : 'New Savings Goal'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Goal Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white text-sm font-medium"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Dream Vacation"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white text-sm font-medium"
                                        value={targetAmount}
                                        onChange={e => setTargetAmount(e.target.value)}
                                        placeholder="10000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Saved ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white text-sm font-medium"
                                        value={currentAmount}
                                        onChange={e => setCurrentAmount(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white text-sm font-medium"
                                    value={deadline}
                                    onChange={e => setDeadline(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                {editingId && (
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
                                    className={`flex-[2] py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-semibold text-sm flex justify-center items-center ${!editingId ? 'w-full' : ''}`}
                                >
                                    {editingId ? 'Save Changes' : 'Create Goal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingGoals;