import React, { useState } from 'react';
import { Settings, ChevronDown, Calendar as CalIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubscriptionManager = () => {
    const [selectedDate, setSelectedDate] = useState(25);
    const [summaryView, setSummaryView] = useState('Monthly'); // 'Weekly', 'Monthly', 'Yearly'
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock subscriptions data based on dates
    const subscriptions = [
        { id: 1, name: 'Amazon', amount: 20, date: 10, icon: 'amazon' },
        { id: 2, name: 'Netflix', amount: 15, date: 25, icon: 'netflix' },
    ];

    // Generate days for a mock month (e.g., October 2024 from the image)
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    // Add padding for starting day of the month (Tuesday in the image)
    const padDays = Array.from({ length: 2 }, (_, i) => null);
    const calendarGrid = [...padDays, ...days];

    // Summaries based on view
    const summaries = {
        Weekly: { spend: 9.50, active: 1 },
        Monthly: { spend: 35.00, active: 2 },
        Yearly: { spend: 420.00, active: 2 }
    };

    const handleDateClick = (day) => {
        if (day) {
            setSelectedDate(day);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#111111] text-slate-200 font-sans p-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Subscription Manager</h1>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-[#20c997] text-[#20c997] rounded hover:bg-[#20c997]/10 transition-colors text-sm font-semibold">
                            <Settings size={16} /> Settings
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                window.location.reload();
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-500/50 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors text-sm font-semibold"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-sm font-bold text-slate-300">{day}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-12">
                    {calendarGrid.map((day, idx) => {
                        const hasSub = day ? subscriptions.find(s => s.date === day) : false;
                        const isSelected = day === selectedDate;

                        return (
                            <div
                                key={idx}
                                onClick={() => handleDateClick(day)}
                                className={`
                  h-24 rounded-xl p-3 relative cursor-pointer transition-all
                  ${!day ? 'bg-transparent cursor-default' : 'bg-[#1c1c1c] hover:bg-[#252525]'}
                  ${isSelected ? 'ring-2 ring-purple-500 bg-[#2d233c]' : ''}
                `}
                            >
                                {day && (
                                    <>
                                        <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                            {day}
                                        </span>
                                        {hasSub && (
                                            <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#20c997] shadow-[0_0_10px_rgba(32,201,151,0.5)]" />
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Summary Toggle */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-white mb-6">Summary</h2>
                    <div className="inline-flex bg-[#1c1c1c] p-1 rounded-xl">
                        {['Weekly', 'Monthly', 'Yearly'].map(view => (
                            <button
                                key={view}
                                onClick={() => setSummaryView(view)}
                                className={`
                  px-8 py-3 rounded-lg font-bold text-sm transition-all
                  ${summaryView === view
                                        ? 'bg-[#2a2a2a] text-white border border-slate-600 shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'}
                `}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Summaries */}
                <div className="text-center mb-8 flex justify-center items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-300">Detail Summaries</h3>
                    <span className="bg-[#4ebaaa] text-slate-900 px-3 py-1 text-sm font-bold rounded-md">
                        {summaryView}
                    </span>
                </div>

                <div className="flex gap-6 justify-center">
                    <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-slate-800 flex-1 max-w-xs text-center">
                        <p className="text-slate-400 font-semibold mb-2 text-sm uppercase tracking-wider">Total Spend</p>
                        <p className="text-3xl font-bold text-white">${summaries[summaryView].spend.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-slate-800 flex-1 max-w-xs text-center">
                        <p className="text-slate-400 font-semibold mb-2 text-sm uppercase tracking-wider">Active Subs</p>
                        <p className="text-3xl font-bold text-[#20c997]">{summaries[summaryView].active}</p>
                    </div>
                </div>

            </div>

            {/* Add Subscription Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1e1e1e] w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <h2 className="text-2xl font-bold text-white mb-2">Add New Subscription</h2>
                            <p className="text-slate-400 text-sm mb-6">Enter the details of your subscription</p>

                            <form className="space-y-4">

                                <div>
                                    <label className="text-sm text-slate-300 font-medium mb-1 block">Subscription Name</label>
                                    <input type="text" defaultValue="Amazon" className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors" />
                                </div>

                                <div>
                                    <label className="text-sm text-slate-300 font-medium mb-1 block">Recurring Amount</label>
                                    <div className="relative">
                                        <input type="number" defaultValue="20" className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors pr-10" />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-slate-500">
                                            <ChevronDown size={14} className="rotate-180" />
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-slate-300 font-medium mb-1 block">Billing Date</label>
                                    <div className="bg-[#111] border border-slate-700 rounded-lg p-3 inline-flex text-white font-medium text-sm">
                                        {new Date(2024, 9, selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-slate-300 font-medium mb-1 block">Icon</label>
                                    <div className="relative">
                                        <input type="text" defaultValue="amazon" className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#20c997] text-xl">a</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-slate-300 font-medium mb-1 block">Recurrence Interval</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-24">
                                            <input type="number" defaultValue="1" className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:outline-none pr-8" />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col text-slate-500">
                                                <ChevronDown size={12} className="rotate-180" />
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                        <div className="relative flex-1">
                                            <select className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:outline-none appearance-none">
                                                <option>Months</option>
                                                <option>Weeks</option>
                                                <option>Years</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-slate-300 font-medium mb-1 block">Payment Account</label>
                                    <input type="text" defaultValue="Bank of America" className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:border-[#20c997] focus:outline-none transition-colors" />
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <label className="text-sm text-slate-300 font-medium min-w-[80px]">Autopay</label>
                                    <div className="w-10 h-5 bg-[#20c997] rounded-full relative cursor-pointer">
                                        <div className="w-4 h-4 rounded-full bg-white absolute right-0.5 top-0.5 shadow-sm"></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-2 pb-2 border-b border-slate-800">
                                    <label className="text-sm text-slate-300 font-medium min-w-[80px]">Notify</label>
                                    <div className="w-10 h-5 bg-[#20c997] rounded-full relative cursor-pointer">
                                        <div className="w-4 h-4 rounded-full bg-white absolute right-0.5 top-0.5 shadow-sm"></div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="text-sm text-slate-300 font-medium mb-1 block">Currency</label>
                                    <div className="relative">
                                        <select className="w-full bg-[#111] border border-slate-700 rounded-lg p-3 text-white focus:outline-none appearance-none">
                                            <option>USD ($)</option>
                                            <option>EUR (€)</option>
                                            <option>INR (₹)</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button type="button" className="flex-1 bg-[#20c997] hover:bg-[#1db789] text-black font-bold py-3 rounded-lg transition-colors">
                                        Add Subscription
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-white font-bold py-3 rounded-lg border border-slate-700 transition-colors"
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
