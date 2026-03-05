import React from "react";
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

/* ---------- Rupee Formatter ---------- */
const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(value);

/* ---------- Data ---------- */
const trendData = [
    { month: "Aug", amount: 120 },
    { month: "Sep", amount: 130 },
    { month: "Oct", amount: 180 },
    { month: "Nov", amount: 150 },
    { month: "Dec", amount: 920 },
    { month: "Jan", amount: 170 },
    { month: "Feb", amount: 220 },
    { month: "Mar", amount: 210 },
    { month: "Apr", amount: 950 },
    { month: "May", amount: 230 },
    { month: "Jun", amount: 240 },
    { month: "Jul", amount: 57 },
];

const categoryData = [
    { name: "Music", value: 43500 },
    { name: "Productivity", value: 21500 },
    { name: "Software", value: 19800 },
    { name: "Video", value: 9500 },
    { name: "VPS", value: 4600 },
    { name: "Domain", value: 1100 },
];

const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#ec4899",
    "#6366f1",
];

/* ---------- Card Component ---------- */
const Card = ({ title, total, avg, payments }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full">
        <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar size={16} />
            {title}
        </div>

        <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
                <div className="flex gap-2 text-gray-400">
                    <DollarSign size={16} />
                    Total
                </div>
                <span className="font-semibold text-white">
                    {formatINR(total)}
                </span>
            </div>

            <div className="flex justify-between">
                <div className="flex gap-2 text-gray-400">
                    <TrendingUp size={16} />
                    Daily Avg
                </div>
                <span className="text-white">
                    {formatINR(avg)}
                </span>
            </div>

            <div className="flex justify-between">
                <div className="flex gap-2 text-gray-400">
                    <CreditCard size={16} />
                    Payments
                </div>
                <span className="text-white">{payments}</span>
            </div>
        </div>

        <button className="mt-4 w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm">
            View Details →
        </button>
    </div>
);

/* ---------- Main Component ---------- */
export default function Reports({ onNavigate }) {
    const [isDarkMode, setIsDarkMode] = React.useState(true);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300`}>

            {/* Top Navbar */}
            <header className={`flex justify-between items-center px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#020617]' : 'border-slate-200 bg-white'} mb-8 shadow-sm`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-slate-900'} rounded-lg flex items-center justify-center text-white font-black text-xl`}>
                        V
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Vampire <span className={isDarkMode ? 'text-red-500' : 'text-slate-500'}>Vault</span></h1>
                </div>

                <nav className="hidden md:flex items-center gap-2">
                    <button onClick={() => onNavigate('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <Home size={16} /> Dashboard
                    </button>
                    <button onClick={() => onNavigate('intelligence')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <Activity size={16} /> Intelligence
                    </button>
                    <button onClick={() => onNavigate('subscriptions')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <CreditCard size={16} /> Subscriptions
                    </button>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>
                        <BarChart2 size={16} /> Reports
                    </button>

                    <div className={`w-px h-5 mx-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'}`}></div>

                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`} title="Toggle Dark Mode">
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </nav>
            </header>

            <div className="max-w-5xl mx-auto px-8 pb-8">
                <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Expense Reports</h1>
                <p className="text-gray-400 mb-8">
                    Comprehensive analysis of your subscription expenses
                </p>

                {/* Monthly */}
                <h2 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'border-zinc-800 text-white' : 'border-zinc-200 text-slate-800'}`}>Monthly Expenses</h2>
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                    <Card title="April 2025" total={944.83} avg={31.49} payments={4} />
                    <Card title="May 2025" total={228.5} avg={7.37} payments={3} />
                    <Card title="June 2025" total={228.5} avg={7.62} payments={3} />
                    <Card title="July 2025" total={57.23} avg={1.85} payments={1} />
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-8 mt-12">
                    {/* Line Chart */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-2 text-white">Expense Trends</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Monthly spending over time (Last 12 months)
                        </p>

                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="month" stroke="#9ca3af" />
                                <YAxis
                                    stroke="#9ca3af"
                                    tickFormatter={(value) => formatINR(value)}
                                />
                                <Tooltip formatter={(value) => formatINR(value)} />
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
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-2 text-white">
                            Spending by Category
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Breakdown of expenses by category (Last 12 months)
                        </p>

                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={110}
                                    label={(entry) =>
                                        `${entry.name}: ${formatINR(entry.value)}`
                                    }
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatINR(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
