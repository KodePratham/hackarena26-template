import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Ghost, ShieldAlert, TrendingDown, Zap, Home, CreditCard, BarChart2, Settings, Moon, Sun, Activity, Info } from 'lucide-react';
import { Icon } from '@iconify-icon/react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const VampireIntelligencePage = ({ onNavigate }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user subscriptions for Utility Scoring
    useEffect(() => {
        const fetchSubscriptions = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('http://127.0.0.1:5000/api/subscriptions', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setSubscriptions(data);
            } catch (error) {
                console.error("Fetch subscriptions error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    // Utility Score Algorithm
    const calculateUtility = (usageDays, category, isOptimalPlan) => {
        let score = 0;

        // 1. Usage Weight (50%)
        if (usageDays > 20) score += 50;
        else if (usageDays > 5) score += 25;

        // 2. Category Weight (30%)
        const essentialCategories = ['Productivity', 'Software', 'VPS'];
        if (essentialCategories.includes(category)) score += 30;
        else score += 15;

        // 3. Plan Weight (20%)
        if (isOptimalPlan) score += 20;
        else score += 10;

        return score; // Result is out of 100
    };

    // Calculate dynamic scores for each subscription
    // Using deterministic mock data (based on name length) for Usage/Plan until backend provides it
    const evaluatedSubscriptions = subscriptions.map(sub => {
        const charCount = sub.subscriptionName.length || 0;
        const mockUsageDays = (charCount * 3) % 31; // 0 to 30 days
        const mockIsOptimal = charCount % 2 === 0;

        // Categorize based on icon/name
        let category = 'Entertainment';
        if (sub.icon === 'briefcase' || sub.icon === 'code') category = 'Productivity';
        if (sub.icon === 'database' || sub.icon === 'cloud') category = 'VPS';

        const score = calculateUtility(mockUsageDays, category, mockIsOptimal);

        return { ...sub, score, mockUsageDays, category };
    }).sort((a, b) => a.score - b.score); // Sort lowest utility (highest threat) first

    // Read processed ghosts
    const [detectedGhosts, setDetectedGhosts] = useState([]);
    useEffect(() => {
        const fetchGhosts = () => {
            const stored = JSON.parse(localStorage.getItem('detectedGhosts') || '[]');
            setDetectedGhosts(stored);
        };
        fetchGhosts();
        window.addEventListener('storage', fetchGhosts);
        return () => window.removeEventListener('storage', fetchGhosts);
    }, []);

    const averageUtility = evaluatedSubscriptions.length > 0
        ? Math.round(evaluatedSubscriptions.reduce((acc, sub) => acc + sub.score, 0) / evaluatedSubscriptions.length)
        : 0;

    const ghostThreatsCount = detectedGhosts.length > 0 ? detectedGhosts.length : evaluatedSubscriptions.filter(s => s.score < 50).length;

    // Dynamic Theme Classes
    const bgClass = isDarkMode ? "bg-[#020617]" : "bg-slate-50";
    const textClass = isDarkMode ? "text-slate-100" : "text-slate-900";
    const cardBgClass = isDarkMode ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200 shadow-sm";
    const mutedTextClass = isDarkMode ? "text-slate-400" : "text-slate-500";
    const headerBorderClass = isDarkMode ? "border-slate-800" : "border-slate-200";

    // Data
    const data = [3200, 4100, 3800, 4500, 4200, 4850];
    const chartData = {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [{
            label: 'Monthly Bleed (₹)',
            data: data,
            fill: true,
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            borderColor: '#ef4444',
            tension: 0.4,
        }]
    };

    return (
        <div className={`min-h-screen ${bgClass} ${textClass} font-sans transition-colors duration-300`}>
            {/* Main Content Pane */}
            <main className="max-w-7xl mx-auto p-8">

                {/* Intelligence Header */}
                <div className="mb-6 flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold">Vampire Intelligence</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>AI POWERED</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className={`p-6 rounded-2xl border ${cardBgClass}`}>
                        <p className={`${mutedTextClass} text-xs uppercase font-bold mb-1`}>Total Monthly Burn</p>
                        <p className="text-3xl font-bold">₹4,850</p>
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><TrendingDown size={12} className="rotate-180" /> +12% from last month</p>
                    </div>
                    <div className={`p-6 rounded-2xl border ${cardBgClass}`}>
                        <p className={`${mutedTextClass} text-xs uppercase font-bold mb-1`}>
                            Leaky Bucket Ratio
                        </p>
                        <p className="text-3xl font-bold">12.5%</p>
                        <p className="text-[10px] mt-2 text-red-500">
                            Portion of Income lost to Subscriptions
                        </p>
                    </div>
                    <div className={`p-6 rounded-2xl border ${cardBgClass}`}>
                        <p className={`${isDarkMode ? 'text-amber-500' : 'text-amber-600'} text-xs uppercase font-bold mb-1`}>Ghost Threats</p>
                        <p className="text-3xl font-bold">{ghostThreatsCount < 10 ? `0${ghostThreatsCount}` : ghostThreatsCount}</p>
                        <p className={`${mutedTextClass} text-[10px] mt-2 font-mono uppercase tracking-widest`}>DETECTED VIA PATTERN AI</p>
                    </div>
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'border-indigo-900/40 bg-[#0c1222]' : 'border-indigo-200 bg-indigo-50/50'} relative overflow-hidden`}>
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl opacity-20 ${averageUtility >= 80 ? 'bg-green-500' : averageUtility >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                        <p className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'} text-xs uppercase font-bold mb-1`}>Avg Utility Score</p>
                        <p className={`text-4xl font-bold mt-2 ${!isDarkMode && 'text-indigo-600'}`}>
                            {averageUtility}<span className="text-lg text-slate-500">/100</span>
                        </p>
                        <p className={`${isDarkMode ? 'text-slate-500' : 'text-indigo-400'} text-[10px] mt-2`}>Overall Spend Efficiency</p>
                    </div>
                </div>

                {/* Charts & Intelligence Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Trend Chart */}
                    <div className={`p-6 rounded-3xl border ${cardBgClass}`}>
                        <h3 className={`text-sm font-bold mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Wallet Bleed Trend</h3>
                        <div className="h-64">
                            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }, x: { grid: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } } } }} />
                        </div>
                    </div>

                    {/* Intelligence Center */}
                    <div className={`p-6 rounded-3xl border ${cardBgClass}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <ShieldAlert size={16} className="text-red-500" /> Detected Vampires
                            </h3>
                            <span className={`text-[10px] px-2 py-1 rounded font-bold tracking-widest ${isDarkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-100 text-red-600'}`}>AI SCAN COMPLETED</span>
                        </div>

                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {/* NEW: Detected CSV Ghosts override the mock data */}
                            {detectedGhosts.map(ghost => (
                                <div key={ghost.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-[#020617] border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : 'bg-red-50 border-red-200 shadow-sm'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-red-500 font-bold ${isDarkMode ? 'bg-red-950/50 border border-red-900/50' : 'bg-red-100 border border-red-200'}`}>
                                            <Ghost size={20} className="animate-pulse" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                                                {ghost.name}
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-500 border border-red-500/30 uppercase tracking-widest">
                                                    CSV DETECTED
                                                </span>
                                            </p>
                                            <p className={`text-[10px] ${isDarkMode ? 'text-red-400/70' : 'text-red-600/70'}`}>
                                                Found in bank statement • {ghost.amount ? `~$${ghost.amount}` : 'Amount Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        const updated = detectedGhosts.filter(g => g.id !== ghost.id);
                                        setDetectedGhosts(updated);
                                        localStorage.setItem('detectedGhosts', JSON.stringify(updated));
                                    }} className={`border px-4 py-1.5 rounded text-[10px] font-bold transition-all ${isDarkMode ? 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border-red-600/50' : 'bg-red-100 hover:bg-red-500 text-red-700 hover:text-white border-red-300'}`}>SLAY</button>
                                </div>
                            ))}

                            {/* OLD: If no real statement uploaded, show Subscriptions scored < 50 + scored items */}
                            {detectedGhosts.length === 0 && evaluatedSubscriptions.length > 0 ? evaluatedSubscriptions.map(sub => (
                                <div key={sub._id} className={`flex items-center justify-between p-4 rounded-xl border ${sub.score < 50 ? (isDarkMode ? 'bg-[#020617] border-red-900/30' : 'bg-white border-red-200 shadow-sm') :
                                    sub.score < 80 ? (isDarkMode ? 'bg-[#020617] border-amber-900/30' : 'bg-white border-amber-200 shadow-sm') :
                                        (isDarkMode ? 'bg-[#020617] border-slate-800' : 'bg-white border-slate-200 shadow-sm')
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${sub.score < 50 ? 'text-red-500 bg-red-500/10' :
                                            sub.score < 80 ? 'text-amber-500 bg-amber-500/10' :
                                                'text-green-500 bg-green-500/10'
                                            }`} style={{ color: sub.score >= 80 ? sub.color : undefined }}>
                                            <Icon icon={`mdi:${sub.icon || 'calendar'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {sub.subscriptionName}
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${sub.score < 50 ? 'bg-red-500/20 text-red-500' :
                                                    sub.score < 80 ? 'bg-amber-500/20 text-amber-500' :
                                                        'bg-green-500/20 text-green-500'
                                                    }`}>
                                                    {sub.score < 50 ? 'CRITICAL / LOW' : sub.score < 80 ? 'MEDIUM UTILITY' : 'HIGH UTILITY'}
                                                </span>
                                            </p>
                                            <p className={`text-[10px] ${mutedTextClass}`}>
                                                Score: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{sub.score}/100</strong> • Usage: {sub.mockUsageDays} days/mo • Category: {sub.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {sub.score < 50 ? (
                                            <button className={`border px-4 py-1.5 rounded text-[10px] font-bold transition-all ${isDarkMode ? 'bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border-red-600/50' : 'bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border-red-200'}`}>SLAY</button>
                                        ) : sub.score < 80 ? (
                                            <div>
                                                <p className="text-[9px] text-amber-500 font-bold mb-1 tracking-wider uppercase">Recommendation</p>
                                                <button className="bg-amber-600/20 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/30 px-3 py-1 rounded text-[10px] font-bold transition-colors uppercase tracking-wide">Downgrade</button>
                                            </div>
                                        ) : (
                                            <div className="text-green-500 flex items-center justify-end gap-1 text-xs font-bold">
                                                <Zap size={14} /> OPTIMIZED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : detectedGhosts.length === 0 && (
                                <div className="text-center py-8">
                                    <ShieldAlert size={32} className="mx-auto text-slate-600 mb-3 opacity-50" />
                                    <p className="text-slate-400 text-sm">No subscriptions to analyze.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Savings Engine Footer */}
                <div className={`mt-8 p-6 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-gradient-to-r from-indigo-900/20 to-transparent border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full text-indigo-500 ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}><TrendingDown size={24} /></div>
                        <div>
                            <p className={`text-sm font-bold underline underline-offset-4 mb-0.5 uppercase tracking-wide ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Savings Alert</p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Switch Spotify to the <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Family Plan</span>. You share a household with 2 other users. Save ₹120/mo.</p>
                        </div>
                    </div>
                    <button className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg uppercase tracking-wide ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}>Apply Optimization</button>
                </div>

            </main>
        </div>
    );
};

export default VampireIntelligencePage;