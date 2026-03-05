import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Shield, Bell, Home, Activity, CreditCard, BarChart2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarGrid from '../components/CalendarGrid';
import { format } from 'date-fns';
import { Icon } from '@iconify-icon/react';

const API_URL = 'http://127.0.0.1:5000/api/subscriptions';

// Mock Exchange Rates to USD base for multi-currency support
const exchangeRatesToUSD = {
    'USD ($)': 1,
    'EUR (€)': 1.08,
    'INR (₹)': 0.012,
    'GBP (£)': 1.26
};

// Formatter for display
const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.substring(0, 3) // e.g., "USD"
    }).format(amount);
};

const SubscriptionManager = ({ onNavigate, isNewSignup }) => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [displayCurrency, setDisplayCurrency] = useState(localStorage.getItem('preferredCurrency') || 'USD ($)');

    // Save currency preference when changed
    useEffect(() => {
        localStorage.setItem('preferredCurrency', displayCurrency);
    }, [displayCurrency]);

    // UI State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summaryView, setSummaryView] = useState('Monthly'); // 'Weekly', 'Monthly', 'Yearly'
    const [detailSummaryView, setDetailSummaryView] = useState('Month'); // Toggle for breakdown
    const [isLoading, setIsLoading] = useState(false);

    // Modal Form State aligned with MongoDB Schema
    const [formData, setFormData] = useState({
        subscriptionName: '',
        amount: '',
        billingDate: '',
        icon: 'netflix',
        color: '#ff0000',
        recurrenceInterval: 1,
        recurrenceType: 'months',
        paymentAccount: '',
        notifyBefore: false,
        currency: 'USD ($)'
    });

    // Fetch subscriptions on mount
    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setSubscriptions(data);
        } catch (error) {
            console.error("Fetch DB error:", error);
        }
    };

    // Handle Calendar Date Click
    const handleDateClick = (date) => {
        setSelectedDate(date);
        setFormData({
            ...formData,
            billingDate: format(date, 'yyyy-MM-dd')
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddSubscription = async (e) => {
        e.preventDefault();
        if (!formData.subscriptionName || !formData.amount || !formData.billingDate) return alert('Name, Amount, and Date are required');

        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const savedSub = await res.json();
                setSubscriptions([...subscriptions, savedSub]);
                setIsModalOpen(false);
                setFormData({
                    subscriptionName: '', amount: '', billingDate: '', icon: 'netflix', color: '#ff0000',
                    recurrenceInterval: 1, recurrenceType: 'months', paymentAccount: '', notifyBefore: false, currency: 'USD ($)'
                });
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add');
            }
        } catch (error) {
            console.error("Add error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSubscriptions(subscriptions.filter(s => s._id !== id));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    // --- Currency Math ---

    // Converts a single subscription's interval cost to its base purely in USD Monthly cost
    const getMonthlyEquivalentInUSD = (sub) => {
        const amt = parseFloat(sub.amount);
        const val = parseInt(sub.recurrenceInterval) || 1;
        const rateToUSD = exchangeRatesToUSD[sub.currency || 'USD ($)'] || 1;

        // 1. Convert to monthly equivalent in original currency
        let monthlyOrig = amt;
        if (sub.recurrenceType === 'months') monthlyOrig = amt / val;
        if (sub.recurrenceType === 'weeks') monthlyOrig = (amt / val) * 4.3333;
        if (sub.recurrenceType === 'years') monthlyOrig = amt / (val * 12);
        if (sub.recurrenceType === 'days') monthlyOrig = (amt / val) * 30.416;

        // 2. Convert to USD
        return monthlyOrig * rateToUSD;
    };

    // Calculate total spend in USD, then convert to the Display Currency selected by user
    const totalMonthlyUSD = subscriptions.reduce((sum, sub) => sum + getMonthlyEquivalentInUSD(sub), 0);
    const displayRateFromUSD = 1 / (exchangeRatesToUSD[displayCurrency] || 1);

    const totalsInDisplayCurrency = {
        Weekly: (totalMonthlyUSD / 4.3333) * displayRateFromUSD,
        Monthly: totalMonthlyUSD * displayRateFromUSD,
        Yearly: (totalMonthlyUSD * 12) * displayRateFromUSD
    };

    // Calculate spend per account mapped to USD, then displayed in target currency
    const computeAccountBreakdown = () => {
        const breakdownUSD = {};
        subscriptions.forEach(sub => {
            const acc = sub.paymentAccount || 'Cash';
            const valUSD = getMonthlyEquivalentInUSD(sub);
            if (!breakdownUSD[acc]) breakdownUSD[acc] = 0;
            breakdownUSD[acc] += valUSD;
        });

        // Convert based on detailSummaryView and target Currency
        const finalBreakdown = {};
        for (let acc in breakdownUSD) {
            let amount = breakdownUSD[acc] * displayRateFromUSD;
            if (detailSummaryView === 'Week') amount /= 4.3333;
            else if (detailSummaryView === 'Year') amount *= 12;
            finalBreakdown[acc] = amount;
        }
        return finalBreakdown;
    };
    const accountBreakdown = computeAccountBreakdown();

    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300`}>

            <div className={`max-w-5xl mx-auto ${isNewSignup ? 'p-8' : 'px-8 pb-8'} pt-8`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {isNewSignup ? 'Add Active Subscriptions' : 'Subscription Manager'}
                    </h1>
                    <div className="flex items-center gap-3">
                        {isNewSignup ? (
                            <button
                                onClick={() => onNavigate('onboarding')}
                                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                            >
                                Next
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => onNavigate('statementUpload')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-colors text-sm font-semibold"
                                >
                                    <Shield size={16} /> Scan Statement
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 border border-[#20c997] text-[#20c997] rounded hover:bg-[#20c997]/10 transition-colors text-sm font-semibold">
                                    <Settings size={16} /> Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-500/50 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors text-sm font-semibold"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className={isDarkMode ? '' : 'text-slate-800'}>
                    {/* Calendar Grid Integration */}
                    <CalendarGrid
                        subscriptions={subscriptions}
                        onDateClick={handleDateClick}
                        currentDate={new Date()}
                    />

                    {subscriptions.length === 0 && (
                        <div className="text-center text-slate-400 py-4 mb-8">
                            <span className="inline-block px-4 py-1 bg-slate-800 rounded-full text-sm">
                                👆 Select a start date on the calendar above to add your first subscription
                            </span>
                        </div>
                    )}

                    {/* Subscriptions List */}
                    {subscriptions.length > 0 && (
                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                                <h2 className="text-2xl font-bold text-white">Subscriptions List</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-400">Sort by:</span>
                                    <select className="bg-[#1c1c1c] border border-slate-700 text-sm text-[#20c997] rounded px-3 py-1 focus:outline-none">
                                        <option>Due Date</option>
                                        <option>Name</option>
                                        <option>Amount</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {subscriptions.sort((a, b) => new Date(a.billingDate) - new Date(b.billingDate)).map(sub => (
                                    <div key={sub._id} className="bg-[#1c1c1c] border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-colors">

                                        <div className="flex items-center gap-4 w-1/3">
                                            <div className="w-10 h-10 rounded bg-[#2a2a2a] flex items-center justify-center text-2xl" style={{ color: sub.color }}>
                                                <Icon icon={sub.icon?.includes(':') ? sub.icon : `mdi:${sub.icon || 'calendar'}`} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">{sub.subscriptionName}</h3>
                                                <p className="text-slate-400 text-xs">{formatCurrency(sub.amount, sub.currency || 'USD')} / {sub.recurrenceInterval} {sub.recurrenceType}</p>
                                            </div>
                                        </div>

                                        <div className="w-1/3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Shield size={14} className="text-blue-400" />
                                                <span className="text-xs font-semibold text-slate-300">{sub.paymentAccount || 'Cash'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {format(new Date(sub.billingDate), 'MMM dd, yyyy')}
                                                </span>
                                                {sub.notifyBefore && (
                                                    <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Bell size={10} /> Notify
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 justify-end w-1/4">
                                            <button className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 transition-colors">Edit</button>
                                            <button
                                                onClick={() => handleDelete(sub._id)}
                                                className="text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white border border-red-500/20 px-3 py-1.5 rounded transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary Totals */}
                    {subscriptions.length > 0 && (
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-white">Summary</h2>
                                <select
                                    value={displayCurrency}
                                    onChange={(e) => setDisplayCurrency(e.target.value)}
                                    className="bg-[#1c1c1c] border border-slate-700 text-[#20c997] font-bold rounded-lg px-3 py-1 focus:outline-none"
                                >
                                    {Object.keys(exchangeRatesToUSD).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-4 justify-center flex-wrap">
                                {['Weekly', 'Monthly', 'Yearly'].map(view => {
                                    const isMonthly = view === 'Monthly';
                                    return (
                                        <div
                                            key={view}
                                            className={`
                                            w-60 p-6 rounded-2xl flex flex-col justify-center items-center transition-all cursor-pointer
                                            ${isMonthly ? 'border-2 border-white bg-[#1c1c1c]' : 'bg-[#1c1c1c] opacity-80 hover:opacity-100'}
                                        `}
                                        >
                                            <h4 className="text-lg font-bold text-white mb-2">{view}</h4>
                                            <p className={`text-3xl font-bold ${isMonthly ? 'text-[#20c997]' : 'text-red-500'}`}>
                                                {formatCurrency(totalsInDisplayCurrency[view], displayCurrency)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Detail Summaries */}
                    {subscriptions.length > 0 && Object.keys(accountBreakdown).length > 0 && (
                        <div className="mb-12">
                            <div className="text-center mb-6 flex justify-center items-center gap-3">
                                <h3 className="text-xl font-bold text-slate-300">Detail Summaries</h3>
                                <button
                                    onClick={() => setDetailSummaryView(v => v === 'Month' ? 'Year' : v === 'Year' ? 'Week' : 'Month')}
                                    className="bg-[#4ebaaa] hover:bg-[#3ca495] text-slate-900 px-3 py-1 text-sm font-bold rounded-md transition-colors"
                                >
                                    {detailSummaryView}
                                </button>
                            </div>

                            <div className="flex gap-4 justify-center flex-wrap">
                                {Object.entries(accountBreakdown).map(([acc, amt]) => (
                                    <div key={acc} className="bg-[#1c1c1c] border border-slate-800 p-4 rounded-xl min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2 text-slate-300">
                                            <Shield size={16} className="text-[#20c997]" />
                                            <span className="font-semibold text-sm">{acc}</span>
                                        </div>
                                        <div className="text-[#20c997] text-lg font-bold">
                                            {formatCurrency(amt, displayCurrency)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Subscription Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="bg-[#1e1e1e] w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
                        >
                            <h2 className="text-3xl font-bold text-white mb-1">Add New Subscription</h2>
                            <p className="text-slate-400 text-sm mb-6">Enter the details of your subscription</p>

                            <form className="space-y-4" onSubmit={handleAddSubscription}>

                                <div>
                                    <label className="text-xs text-slate-300 font-bold mb-1.5 block">Subscription Name</label>
                                    <input
                                        type="text" name="subscriptionName" required
                                        value={formData.subscriptionName} onChange={handleInputChange}
                                        placeholder="Enter subscription name"
                                        className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-300 font-bold mb-1.5 block">Recurring Amount</label>
                                    <input
                                        type="number" name="amount" required step="0.01" min="0"
                                        value={formData.amount} onChange={handleInputChange}
                                        placeholder="Enter amount"
                                        className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-300 font-bold mb-1.5 block">Billing Date</label>
                                    <input
                                        type="date" name="billingDate" required
                                        value={formData.billingDate} onChange={handleInputChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-300 font-bold mb-1.5 block flex items-center gap-1">
                                            Icon <span className="text-teal-500 cursor-help" title="Material Design Icon name (e.g. netflix, spotify, amazon)">?</span>
                                        </label>
                                        <input
                                            type="text" name="icon"
                                            value={formData.icon} onChange={handleInputChange}
                                            placeholder="netflix, spotify..."
                                            className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-300 font-bold mb-1.5 block">Icon Color (Hex)</label>
                                        <input
                                            type="color" name="color"
                                            value={formData.color} onChange={handleInputChange}
                                            className="w-full h-[50px] bg-[#111] border border-slate-700 rounded-lg p-1 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-300 font-bold mb-1.5 block">Recurrence Interval</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number" name="recurrenceInterval" min="1" required
                                            value={formData.recurrenceInterval} onChange={handleInputChange}
                                            className="w-24 bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none"
                                        />
                                        <select
                                            name="recurrenceType"
                                            value={formData.recurrenceType} onChange={handleInputChange}
                                            className="flex-1 bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none"
                                        >
                                            <option value="days">Days</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-300 font-bold mb-1.5 block">Payment Account</label>
                                        <input
                                            type="text" name="paymentAccount"
                                            value={formData.paymentAccount} onChange={handleInputChange}
                                            placeholder="e.g. Chase"
                                            className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-300 font-bold mb-1.5 block">Currency</label>
                                        <select
                                            name="currency"
                                            value={formData.currency} onChange={handleInputChange}
                                            className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:outline-none"
                                        >
                                            <option value="USD ($)">USD ($)</option>
                                            <option value="EUR (€)">EUR (€)</option>
                                            <option value="INR (₹)">INR (₹)</option>
                                            <option value="GBP (£)">GBP (£)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-t border-slate-800/50 my-2">
                                    <label className="text-sm font-bold text-white flex gap-2"><Bell size={18} className="text-yellow-500" /> Notify Before Due Date</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="notifyBefore" className="sr-only peer" checked={formData.notifyBefore} onChange={handleInputChange} />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20c997]"></div>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" disabled={isLoading} className="flex-1 bg-[#20c997] hover:bg-[#1db789] text-black font-bold py-3.5 rounded-lg transition-colors disabled:opacity-50">
                                        {isLoading ? 'Saving...' : 'Add Subscription'}
                                    </button>
                                    <button
                                        type="button" disabled={isLoading}
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-white font-bold py-3.5 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionManager;