import React, { useState, useEffect } from 'react';
import { Transaction, Insight } from '../types';
import { generateFinanceInsights } from '../services/geminiService';
import { Sparkles, AlertTriangle, CheckCircle, Info, RefreshCw, Zap } from 'lucide-react';

interface AIInsightsProps {
    transactions: Transaction[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ transactions }) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const fetchInsights = async () => {
        setLoading(true);
        const result = await generateFinanceInsights(transactions);
        setInsights(result);
        setLoading(false);
        setHasLoaded(true);
    };

    useEffect(() => {
        if (!hasLoaded && transactions.length > 0) {
            fetchInsights();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasLoaded, transactions]);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                        AI Insights
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Smart analysis powered by AI models</p>
                </div>
                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {insights.map((insight, idx) => (
                        <div key={idx} className={`relative p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start space-x-5 overflow-hidden`}>

                            {/* Solid accent bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${insight.type === 'alert' ? 'bg-rose-500' :
                                insight.type === 'success' ? 'bg-emerald-500' :
                                    'bg-indigo-500'
                                }`}></div>

                            <div className={`mt-0.5 ${insight.type === 'alert' ? 'text-rose-500' :
                                insight.type === 'success' ? 'text-emerald-500' :
                                    'text-indigo-500'
                                }`}>
                                {insight.type === 'alert' && <AlertTriangle className="w-6 h-6" />}
                                {insight.type === 'success' && <CheckCircle className="w-6 h-6" />}
                                {insight.type === 'info' && <Zap className="w-6 h-6" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center mb-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{insight.title}</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                    {insight.description}
                                </p>
                            </div>
                        </div>
                    ))}
                    {insights.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                <Sparkles className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Generate your first insights to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIInsights;