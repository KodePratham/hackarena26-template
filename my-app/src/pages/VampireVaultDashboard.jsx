import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Activity, Droplet, Ghost, ShieldAlert, TrendingDown, Zap, Home, CreditCard, BarChart2, Settings, Moon, Sun, RefreshCw, Calendar, Clock, DollarSign } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const VampireVaultDashboard = ({ onNavigate }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Dynamic Theme Classes
    const bgClass = isDarkMode ? "bg-[#020617]" : "bg-slate-50";
    const textClass = isDarkMode ? "text-slate-100" : "text-slate-900";
    const cardBgClass = isDarkMode ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200 shadow-sm";
    const mutedTextClass = isDarkMode ? "text-slate-400" : "text-slate-500";
    const headerBorderClass = isDarkMode ? "border-slate-800" : "border-slate-200";

    // Existing Data Arrays
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
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>
                        <Home size={16} /> Dashboard
                    </button>
                    <button onClick={() => onNavigate('intelligence')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
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

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">Dashboard</h2>
                        <p className={mutedTextClass}>Overview of your subscription expenses and activity</p>
                    </div>
                    <button className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800 focus:ring-1 focus:ring-slate-500' : 'border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-1 focus:ring-slate-400 shadow-sm'}`}>
                        <RefreshCw size={14} /> Refresh Data
                    </button>
                </div>

                {/* Row 1: Key Metrics Grid (From the image) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`p-6 rounded-2xl border ${cardBgClass} hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-4">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Spending</p>
                            <Calendar size={18} className="text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold mb-1">₹4,850.23</p>
                        <p className={`text-xs ${mutedTextClass}`}>Current month expenses</p>
                    </div>

                    <div className={`p-6 rounded-2xl border ${cardBgClass} hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-4">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Yearly Spending</p>
                            <Calendar size={18} className="text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold mb-1">₹58,202.76</p>
                        <p className={`text-xs ${mutedTextClass}`}>Current year total expenses</p>
                    </div>

                    <div className={`p-6 rounded-2xl border ${cardBgClass} hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-4">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Subscriptions</p>
                            <Clock size={18} className="text-emerald-500" />
                        </div>
                        <p className="text-3xl font-bold mb-1">6</p>
                        <p className={`text-xs ${mutedTextClass}`}>Total services</p>
                    </div>
                </div>

                {/* Row 2: Subscriptions Breakdown (From the image) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Recently Paid */}
                    <div className={`p-6 rounded-2xl border ${cardBgClass} flex flex-col`}>
                        <h3 className="font-bold mb-1">Recently Paid</h3>
                        <p className={`text-xs ${mutedTextClass} mb-6`}>Subscriptions paid in the last 7 days</p>

                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center group">
                                <div>
                                    <p className={`font-bold text-sm group-hover:${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors`}>YouTube</p>
                                    <p className={`text-xs ${mutedTextClass}`}>Premium</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">₹129.00</p>
                                    <p className={`text-[10px] ${mutedTextClass}`}>Paid on: 2024-10-25</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Renewals */}
                    <div className={`p-6 rounded-2xl border ${cardBgClass} flex flex-col`}>
                        <h3 className="font-bold mb-1">Upcoming Renewals</h3>
                        <p className={`text-xs ${mutedTextClass} mb-6`}>Subscriptions renewing in the next 7 days</p>

                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center group">
                                <div>
                                    <p className={`font-bold text-sm group-hover:${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors`}>Spotify</p>
                                    <p className={`text-xs ${mutedTextClass}`}>Family</p>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div>
                                        <p className="font-bold text-sm">₹179.00</p>
                                        <p className={`text-[10px] ${mutedTextClass}`}>📅 2024-10-29</p>
                                    </div>
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">2 days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Spending by Category */}
                    <div className={`p-6 rounded-2xl border ${cardBgClass} flex flex-col`}>
                        <h3 className="font-bold mb-1">Spending by Category</h3>
                        <p className={`text-xs ${mutedTextClass} mb-6`}>Annual breakdown by category</p>

                        <div className="space-y-4 flex-1">
                            {[
                                { name: 'Music Streaming', amount: '₹2,148.00', percent: 40.2 },
                                { name: 'Productivity', amount: '₹999.00', percent: 18.2 },
                                { name: 'Software', amount: '₹899.00', percent: 16.7 },
                                { name: 'Video Streaming', amount: '₹804.00', percent: 16.1 }
                            ].map((cat, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <span className={`font-medium group-hover:${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors`}>{cat.name}</span>
                                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{cat.amount}</span>
                                    </div>
                                    <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} overflow-hidden`}>
                                        <div className={`h-full rounded-full ${isDarkMode ? 'bg-slate-200' : 'bg-slate-800'}`} style={{ width: `${cat.percent}%` }}></div>
                                    </div>
                                    <div className={`text-[10px] text-right mt-1 ${mutedTextClass}`}>{cat.percent}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default VampireVaultDashboard;