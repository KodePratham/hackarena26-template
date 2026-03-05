import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Ghost, ShieldAlert, TrendingDown, Zap, Home, CreditCard, BarChart2, Settings, Moon, Sun, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const VampireIntelligencePage = ({ onNavigate }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

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
            {/* Top Navbar */}
            <header className={`flex justify-between items-center px-8 py-4 border-b ${headerBorderClass} ${isDarkMode ? 'bg-[#020617]' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-600 shadow-red-900/20' : 'bg-slate-900'} rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                        V
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Vampire <span className={isDarkMode ? 'text-red-500' : 'text-slate-500'}>Vault</span></h1>
                </div>

                <nav className="hidden md:flex items-center gap-2">
                    <button onClick={() => onNavigate('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <Home size={16} /> Dashboard
                    </button>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>
                        <Activity size={16} /> Intelligence
                    </button>
                    <button onClick={() => onNavigate('subscriptions')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <CreditCard size={16} /> Subscriptions
                    </button>
                    <button onClick={() => onNavigate('reports')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <BarChart2 size={16} /> Reports
                    </button>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <Settings size={16} /> Settings
                    </button>
                    <div className={`w-px h-5 mx-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`} title="Toggle Dark Mode">
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </nav>
            </header>

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
                        <p className="text-3xl font-bold">03</p>
                        <p className={`${mutedTextClass} text-[10px] mt-2 font-mono uppercase tracking-widest`}>DETECTED VIA PATTERN AI</p>
                    </div>
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'border-indigo-900/40 bg-[#0c1222]' : 'border-indigo-200 bg-indigo-50/50'}`}>
                        <p className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'} text-xs uppercase font-bold mb-1`}>Utility Score</p>
                        <p className={`text-4xl font-bold mt-2 ${!isDarkMode && 'text-indigo-600'}`}>64/100</p>
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

                        <div className="space-y-4">
                            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-[#020617] border-red-900/30' : 'bg-white border-red-200 shadow-sm'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-red-500 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-red-50 border border-red-100'}`}><Ghost size={20} /></div>
                                    <div>
                                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Unknown "SAAS_PROX"</p>
                                        <p className={`text-[10px] ${mutedTextClass}`}>Auto-deducted Feb 26 • ₹299</p>
                                    </div>
                                </div>
                                <button className={`border px-4 py-1.5 rounded text-[10px] font-bold transition-all ${isDarkMode ? 'bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border-red-600/50' : 'bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border-red-200'}`}>SLAY</button>
                            </div>

                            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-[#020617] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-indigo-500 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-indigo-50 border border-indigo-100'}`}><Zap size={20} /></div>
                                    <div>
                                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Netflix Premium</p>
                                        <p className={`text-[10px] ${mutedTextClass}`}>Usage: 2.5 hrs this month (Low Utility)</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-amber-500 font-bold mb-1 tracking-wider uppercase">Recommendation</p>
                                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-[10px] font-bold shadow-sm transition-colors uppercase tracking-wide">Downgrade</button>
                                </div>
                            </div>
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