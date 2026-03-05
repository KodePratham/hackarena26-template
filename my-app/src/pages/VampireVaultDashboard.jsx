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

    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Currency Handling
    const preferredCurrency = localStorage.getItem('preferredCurrency') || 'USD ($)';
    const exchangeRatesToUSD = {
        'USD ($)': 1,
        'EUR (€)': 1.08,
        'INR (₹)': 0.012,
        'GBP (£)': 1.26
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: preferredCurrency.substring(0, 3)
        }).format(amount);
    };

    const fetchSubscriptions = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('http://127.0.0.1:5000/api/subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setSubscriptions(data);
        } catch (error) {
            console.error("Fetch DB error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchSubscriptions();
    }, []);

    const getMonthlyEquivalentInUSD = (sub) => {
        const amt = parseFloat(sub.amount);
        const val = parseInt(sub.recurrenceInterval) || 1;
        const rateToUSD = exchangeRatesToUSD[sub.currency || 'USD ($)'] || 1;

        let monthlyOrig = amt;
        if (sub.recurrenceType === 'months') monthlyOrig = amt / val;
        if (sub.recurrenceType === 'weeks') monthlyOrig = (amt / val) * 4.3333;
        if (sub.recurrenceType === 'years') monthlyOrig = amt / (val * 12);
        if (sub.recurrenceType === 'days') monthlyOrig = (amt / val) * 30.416;
        return monthlyOrig * rateToUSD;
    };

    const displayRateFromUSD = 1 / (exchangeRatesToUSD[preferredCurrency] || 1);
    const monthlySpendingUSD = subscriptions.reduce((sum, sub) => sum + getMonthlyEquivalentInUSD(sub), 0);
    const monthlySpendingTarget = monthlySpendingUSD * displayRateFromUSD;
    const yearlySpendingTarget = monthlySpendingTarget * 12;

    const today = new Date();
    // Sort subscriptions by billing date
    const sortedSubs = [...subscriptions].sort((a, b) => new Date(a.billingDate) - new Date(b.billingDate));

    // Categorize implicitly or fallback
    const categoryBreakdown = {};
    subscriptions.forEach(sub => {
        const cat = sub.icon === 'netflix' || sub.icon === 'spotify' ? 'Media Streaming' :
            sub.icon === 'briefcase' ? 'Productivity' : 'Software/Other';
        const cost = getMonthlyEquivalentInUSD(sub);
        if (!categoryBreakdown[cat]) categoryBreakdown[cat] = 0;
        categoryBreakdown[cat] += cost;
    });

    const categories = Object.keys(categoryBreakdown).map(k => ({
        name: k,
        amount: categoryBreakdown[k] * displayRateFromUSD,
        percent: ((categoryBreakdown[k] / (monthlySpendingUSD || 1)) * 100).toFixed(1)
    })).sort((a, b) => b.amount - a.amount);

    return (
        <div className={`min-h-screen ${bgClass} ${textClass} font-sans transition-colors duration-300`}>
            {/* Main Content Pane */}
            <main className="max-w-7xl mx-auto p-8">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">Dashboard</h2>
                        <p className={mutedTextClass}>Overview of your subscription expenses and activity</p>
                    </div>
                    <button onClick={fetchSubscriptions} className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>

                {/* Row 1: Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`p-6 rounded-2xl border ${cardBgClass} hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-4">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Spending</p>
                            <Calendar size={18} className="text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold mb-1">{formatCurrency(monthlySpendingTarget)}</p>
                        <p className={`text-xs ${mutedTextClass}`}>Current month expenses</p>
                    </div>

                    <div className={`p-6 rounded-2xl border ${cardBgClass} hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-4">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Yearly Spending</p>
                            <Calendar size={18} className="text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold mb-1">{formatCurrency(yearlySpendingTarget)}</p>
                        <p className={`text-xs ${mutedTextClass}`}>Current year total expenses</p>
                    </div>

                    <div className={`p-6 rounded-2xl border ${cardBgClass} hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-4">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Subscriptions</p>
                            <Clock size={18} className="text-emerald-500" />
                        </div>
                        <p className="text-3xl font-bold mb-1">{subscriptions.length}</p>
                        <p className={`text-xs ${mutedTextClass}`}>Total services</p>
                    </div>
                </div>

                {/* Row 2: Subscriptions Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Recently Paid */}
                    <div className={`p-6 rounded-2xl border ${cardBgClass} flex flex-col`}>
                        <h3 className="font-bold mb-1">Subscriptions Queue</h3>
                        <p className={`text-xs ${mutedTextClass} mb-6`}>All active subscriptions logged.</p>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-48 custom-scrollbar pr-2">
                            {sortedSubs.length > 0 ? sortedSubs.map(sub => (
                                <div key={sub._id} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xl" style={{ color: sub.color }}>
                                            <i className={`mdi mdi-${sub.icon || 'calendar'} ${isDarkMode ? '' : 'text-slate-900'}`}></i>
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm group-hover:${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors`}>{sub.subscriptionName}</p>
                                            <p className={`text-xs ${mutedTextClass}`}>{sub.recurrenceInterval} {sub.recurrenceType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{formatCurrency(getMonthlyEquivalentInUSD(sub) * displayRateFromUSD)}</p>
                                        <p className={`text-[10px] ${mutedTextClass}`}>{new Date(sub.billingDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )) : <p className="text-slate-500 text-sm text-center mt-4">No subscriptions found</p>}
                        </div>
                    </div>

                    {/* Upcoming Renewals */}
                    <div className={`p-6 rounded-2xl border ${cardBgClass} flex flex-col`}>
                        <h3 className="font-bold mb-1">Upcoming Renewals</h3>
                        <p className={`text-xs ${mutedTextClass} mb-6`}>Subscriptions renewing in the future</p>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-48 custom-scrollbar pr-2">
                            {sortedSubs.filter(s => new Date(s.billingDate) >= today).slice(0, 5).map(sub => {
                                const daysUntil = Math.max(0, Math.ceil((new Date(sub.billingDate) - today) / (1000 * 60 * 60 * 24)));
                                return (
                                    <div key={sub._id} className="flex justify-between items-center group">
                                        <div>
                                            <p className={`font-bold text-sm group-hover:${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors`}>{sub.subscriptionName}</p>
                                            <p className={`text-xs ${mutedTextClass}`}>{sub.paymentAccount || 'Cash'}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <p className="font-bold text-sm">{formatCurrency(getMonthlyEquivalentInUSD(sub) * displayRateFromUSD)}</p>
                                                <p className={`text-[10px] ${mutedTextClass}`}>📅 {new Date(sub.billingDate).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`${daysUntil <= 3 ? 'bg-red-500' : 'bg-orange-500'} text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1`}>
                                                {daysUntil} days
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                            {sortedSubs.filter(s => new Date(s.billingDate) >= today).length === 0 && (
                                <p className="text-slate-500 text-sm text-center mt-4">No upcoming renewals found</p>
                            )}
                        </div>
                    </div>

                    {/* Spending by Category */}
                    <div className={`p-6 rounded-2xl border ${cardBgClass} flex flex-col`}>
                        <h3 className="font-bold mb-1">Spending by Category</h3>
                        <p className={`text-xs ${mutedTextClass} mb-6`}>Monthly breakdown by category</p>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-48 custom-scrollbar pr-2">
                            {categories.length > 0 ? categories.map((cat, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <span className={`font-medium group-hover:${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors`}>{cat.name}</span>
                                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{formatCurrency(cat.amount)}</span>
                                    </div>
                                    <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} overflow-hidden`}>
                                        <div className={`h-full rounded-full ${isDarkMode ? 'bg-slate-200' : 'bg-slate-800'}`} style={{ width: `${cat.percent}%` }}></div>
                                    </div>
                                    <div className={`text-[10px] text-right mt-1 ${mutedTextClass}`}>{cat.percent}%</div>
                                </div>
                            )) : <p className="text-slate-500 text-sm text-center mt-4">No data to display</p>}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default VampireVaultDashboard;
