import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import HeartbeatVisualizer from '../components/Dashboard/HeartbeatVisualizer'
<<<<<<< HEAD
import { currentScore, scoreHistory, scoreForecast, spendingBreakdown, recentTransactions, getCategoryColor, currentUser, getBandConfig } from '../data/mockData'
import { TrendingUp, Flame, Zap, ArrowUpRight } from 'lucide-react'
=======
import { currentScore, scoreHistory, scoreForecast, spendingBreakdown, recentTransactions, getCategoryColor, currentUser, getBandConfig, ghostSubscriptions, ghostSummary, smartNudges } from '../data/mockData'
import { TrendingUp, Flame, Zap, ArrowUpRight, Ghost, AlertTriangle, Check, X } from 'lucide-react'
>>>>>>> 663acad6f0533edac3f2dff1c2a5ae88ffde714d

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ fontSize: 14, fontWeight: 600, color: p.color }}>{p.name}: {p.value}</div>
            ))}
        </div>
    )
}

const componentData = [
    { subject: 'Savings', value: 72 },
    { subject: 'Essentials', value: 68 },
    { subject: 'Streak', value: 84 },
    { subject: 'Challenges', value: 90 },
    { subject: 'Debt-Free', value: 60 },
]

export default function Dashboard() {
    const band = getBandConfig(currentScore.score)

    return (
        <div className="animate-fade-in">
            <div className="page-title">Financial Health Dashboard</div>
            <div className="page-subtitle">Good morning, {currentUser.name}! Your score improved +18 this week 🎉</div>

            {/* Heartbeat Hero */}
            <div style={{ marginBottom: 24 }}>
                <HeartbeatVisualizer score={currentScore.score} />
            </div>

            {/* Quick stats row */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Monthly Savings', value: '₹18,500', change: '+12%', icon: '💰', color: 'var(--accent-green)' },
                    { label: 'Streak', value: `${currentUser.streakDays} Days`, change: 'Active', icon: '🔥', color: '#ffc107' },
                    { label: 'VitalPoints', value: currentUser.vitalPoints.toLocaleString(), change: 'This Month', icon: '⚡', color: 'var(--accent-purple)' },
                    { label: 'League Rank', value: '#12', change: 'Gold Tier', icon: '🏆', color: '#ffd700' },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '20px 22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ fontSize: 24 }}>{stat.icon}</div>
                            <span className="stat-chip green" style={{ fontSize: 11 }}>{stat.change}</span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

<<<<<<< HEAD
=======
            {/* Smart Nudge Banner — Pending Categorizations */}
            {smartNudges.length > 0 && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid rgba(255,193,7,0.3)', background: 'rgba(255,193,7,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <AlertTriangle size={18} color="#ffc107" />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#ffc107' }}>Smart Nudge</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{smartNudges.length} pending • +12 XP each</span>
                    </div>
                    {smartNudges.map((nudge, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    {nudge.merchantName} — ₹{nudge.amount.toLocaleString()}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    Suggested: <span style={{ color: '#ffc107', fontWeight: 600 }}>{nudge.suggestedCategory.split('.')[1]}</span>
                                    <span style={{ opacity: 0.5 }}> ({Math.round(nudge.suggestedConfidence * 100)}% conf) • {nudge.timeAgo}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--accent-green)', color: '#0a0f1c', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Check size={12} /> Confirm
                                </button>
                                <button style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}>
                                    Change
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SubVampire — Ghost Subscription Alerts */}
            {ghostSubscriptions.length > 0 && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid rgba(138,43,226,0.25)', background: 'rgba(138,43,226,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: 20 }}>🧛</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#c084fc' }}>SubVampire Alert</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                            Draining ₹{ghostSummary.totalMonthlyWaste}/mo (₹{ghostSummary.totalAnnualWaste.toLocaleString()}/yr)
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                        {ghostSubscriptions.map((ghost, i) => (
                            <div key={i} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{ghost.merchant}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: ghost.ghostScore > 80 ? '#ff4757' : '#ffc107', background: ghost.ghostScore > 80 ? 'rgba(255,71,87,0.12)' : 'rgba(255,193,7,0.12)', padding: '2px 8px', borderRadius: 12 }}>
                                        {ghost.ghostScore}% ghost
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                                    ₹{ghost.monthlyAmount}/mo • Unused for {ghost.lastUsedDaysAgo} days
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button style={{ flex: 1, padding: '6px 0', borderRadius: 6, background: 'linear-gradient(135deg, #c084fc, #8b5cf6)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                        Cancel & Save ₹{ghost.annualWaste.toLocaleString()}/yr
                                    </button>
                                    <button style={{ padding: '6px 10px', borderRadius: 6, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 11, cursor: 'pointer' }}>
                                        I use this
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {ghostSummary.totalSavedThisYear > 0 && (
                        <div style={{ marginTop: 12, padding: '8px 14px', background: 'rgba(0,212,170,0.08)', borderRadius: 8, fontSize: 12, color: 'var(--accent-green)', fontWeight: 500 }}>
                            🎉 You've saved ₹{ghostSummary.totalSavedThisYear.toLocaleString()} this year by killing ghost subscriptions!
                        </div>
                    )}
                </div>
            )}

>>>>>>> 663acad6f0533edac3f2dff1c2a5ae88ffde714d
            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Score History Chart */}
                <div className="card">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={16} color="var(--accent-green)" /> Score History (7 months)
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={scoreHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={band.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={band.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[500, 800]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="score" name="VitalScore" stroke={band.color} strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: band.color, r: 4 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 30-Day Forecast */}
                <div className="card">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} color="var(--accent-purple)" /> 30-Day Forecast
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={scoreForecast} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffc107" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ffc107" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="optimizedGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[700, 820]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="current" name="Current Path" stroke="#ffc107" strokeWidth={2} fill="url(#currentGrad)" strokeDasharray="5 5" />
                            <Area type="monotone" dataKey="optimized" name="If Optimized" stroke="var(--accent-green)" strokeWidth={2} fill="url(#optimizedGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                        💡 Reduce dining out 20% → reach <strong style={{ color: 'var(--accent-green)' }}>795</strong> by Day 30
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Spending Breakdown */}
                <div className="card">
                    <div className="section-title">Spending Breakdown</div>
                    {spendingBreakdown.map((item, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.category}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    ₹{item.amount.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({item.pct}%)</span>
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${item.pct * 2.5}%`, background: item.color }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Score Components Radar */}
                <div className="card">
                    <div className="section-title">Score Components</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={componentData}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <Radar name="Score" dataKey="value" stroke={band.color} fill={band.color} fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions snippet */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div className="section-title" style={{ margin: 0 }}>Recent Transactions</div>
                    <a href="/transactions" style={{ fontSize: 13, color: 'var(--accent-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        View All <ArrowUpRight size={14} />
                    </a>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.slice(0, 5).map(tx => (
                            <tr key={tx.id}>
                                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{tx.date}</td>
                                <td style={{ fontWeight: 500 }}>{tx.description}</td>
                                <td>
                                    <span className="stat-chip" style={{ background: getCategoryColor(tx.category) + '22', color: getCategoryColor(tx.category), fontSize: 11 }}>
                                        {tx.categoryLabel}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: tx.type === 'CREDIT' ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
