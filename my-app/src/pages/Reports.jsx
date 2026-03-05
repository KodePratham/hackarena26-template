import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    Calendar,
    DollarSign,
    TrendingUp,
    CreditCard,
    Home,
    Activity,
    BarChart2,
    Sun,
    Moon
} from "lucide-react";

const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#ec4899",
    "#6366f1",
];

/* ---------- Main Component ---------- */
export default function Reports({ onNavigate }) {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [subscriptions, setSubscriptions] = useState([]);

    // Currency Setup
    const preferredCurrency = localStorage.getItem('preferredCurrency') || 'USD ($)';
    const exchangeRatesToUSD = {
        'USD ($)': 1, 'EUR (€)': 1.08, 'INR (₹)': 0.012, 'GBP (£)': 1.26
    };
    const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: preferredCurrency.substring(0, 3),
        minimumFractionDigits: 0,
    }).format(value);

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
                console.error("Fetch DB error:", error);
            }
        };
        fetchSubscriptions();
    }, []);

    // --- Dynamic Calculations ---
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

    // Categories
    const categoryBreakdown = {};
    subscriptions.forEach(sub => {
        let cat = 'Other';
        if (sub.icon === 'netflix' || sub.icon === 'spotify') cat = 'Media/Entertainment';
        else if (sub.icon === 'briefcase' || sub.icon === 'code') cat = 'Productivity';
        else if (sub.icon === 'database' || sub.icon === 'cloud') cat = 'Software/VPS';

        const monthlyTargetCost = getMonthlyEquivalentInUSD(sub) * displayRateFromUSD;
        if (!categoryBreakdown[cat]) categoryBreakdown[cat] = 0;
        categoryBreakdown[cat] += monthlyTargetCost;
    });

    const categoryData = Object.keys(categoryBreakdown).map(k => ({
        name: k,
        value: categoryBreakdown[k],
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

    // Projected Trend Data (Next 6 Months based on monthly equivalent)
    const trendData = [];
    let currentMonthlyCost = subscriptions.reduce((sum, sub) => sum + getMonthlyEquivalentInUSD(sub), 0) * displayRateFromUSD;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date();
    for (let i = 0; i < 6; i++) {
        let monthIndex = (d.getMonth() + i) % 12;
        trendData.push({
            month: monthNames[monthIndex],
            amount: currentMonthlyCost // Simplification: assuming flat recurrent spending 
        });
    }

    // Recent Months Cards data
    const monthCards = [];
    for (let i = 0; i < 4; i++) {
        let pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
        monthCards.push({
            title: `${monthNames[pastDate.getMonth()]} ${pastDate.getFullYear()}`,
            total: currentMonthlyCost,
            avg: currentMonthlyCost / 30, // Rough daily avg
            payments: subscriptions.length
        });
    }
    monthCards.reverse();

    /* ---------- Card Component ---------- */
    const Card = ({ title, total, avg, payments }) => (
        <div className={`border rounded-xl p-5 w-full ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Calendar size={16} />
                {title}
            </div>

            <div className={`mt-4 space-y-3 text-sm flex gap-4 justify-between font-medium`}>
                <div>
                    <div className={`flex gap-2 text-xs mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <DollarSign size={14} /> Total
                    </div>
                    <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrency(total)}
                    </span>
                </div>

                <div>
                    <div className={`flex gap-2 text-xs mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <TrendingUp size={14} /> Daily
                    </div>
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                        {formatCurrency(avg)}
                    </span>
                </div>

                <div>
                    <div className={`flex gap-2 text-xs mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <CreditCard size={14} /> Active
                    </div>
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{payments}</span>
                </div>
            </div>

            <button className={`mt-4 w-full py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                View Details →
            </button>
        </div>
    );

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300`}>

            <div className={`mt-8 max-w-5xl mx-auto px-8 pb-8`}>
                <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Expense Reports</h1>
                <p className="text-gray-400 mb-8">
                    Comprehensive analysis of your subscription expenses
                </p>

                {/* Monthly */}
                <h2 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'border-zinc-800 text-white' : 'border-zinc-200 text-slate-800'}`}>Monthly Overview</h2>
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                    {monthCards.map((mc, idx) => (
                        <Card key={idx} title={mc.title} total={mc.total} avg={mc.avg} payments={mc.payments} />
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-8 mt-12">
                    {/* Line Chart */}
                    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Projected Expense Trend</h3>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Projected monthly spending over the next 6 months
                        </p>

                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="month" stroke="#9ca3af" />
                                <YAxis
                                    stroke={isDarkMode ? "#64748b" : "#94a3b8"}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#cbd5e1', color: isDarkMode ? '#f8fafc' : '#0f172a' }} />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Spending by Category
                        </h3>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Distribution of active subscriptions
                        </p>

                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData.length > 0 ? categoryData : [{ name: "No Subscriptions", value: 1 }]}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={100}
                                    label={(entry) =>
                                        categoryData.length ? `${entry.name}: ${formatCurrency(entry.value)}` : "No Subscriptions"
                                    }
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => categoryData.length ? formatCurrency(value) : ""} contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#cbd5e1', color: isDarkMode ? '#f8fafc' : '#0f172a' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
