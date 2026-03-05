import { mySquad } from '../data/mockData'
import { Users, TrendingUp, Clock, DollarSign } from 'lucide-react'

export default function Squads() {
    const sq = mySquad
    const seasonProgress = Math.round(((sq.seasonDays - sq.seasonDaysLeft) / sq.seasonDays) * 100)
    const poolProgress = Math.round((sq.currentPoolSize / sq.targetPoolSize) * 100)

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div className="page-title">Squads</div>
                <button className="btn btn-primary"><Users size={15} /> Create Squad</button>
            </div>
            <div className="page-subtitle">Pool savings with friends — earn DeFi yield together</div>

            {/* My squad card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(124,107,255,0.1), rgba(0,212,170,0.05))',
                border: '1px solid rgba(124,107,255,0.3)',
                borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{sq.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{sq.description}</div>
                    </div>
                    <span className="badge badge-elite">Active Season</span>
                </div>

                <div className="grid-4" style={{ marginBottom: 20 }}>
                    {[
                        { icon: <DollarSign size={16} />, label: 'Pool Size', value: `₹${sq.currentPoolSize.toLocaleString()}`, color: 'var(--accent-green)' },
                        { icon: <TrendingUp size={16} />, label: 'APY (Aave V3)', value: `${sq.currentAPY}%`, color: 'var(--accent-purple)' },
                        { icon: <DollarSign size={16} />, label: 'Est. Yield', value: `₹${sq.estimatedYield.toLocaleString()}`, color: '#ffc107' },
                        { icon: <Clock size={16} />, label: 'Days Left', value: `${sq.seasonDaysLeft}d`, color: 'var(--accent-blue)' },
                    ].map((s, i) => (
                        <div key={i} className="card" style={{ padding: '14px 18px' }}>
                            <div style={{ color: s.color, marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Pool progress */}
                <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>Pool Progress</span><span>₹{sq.currentPoolSize.toLocaleString()} / ₹{sq.targetPoolSize.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 10 }}>
                        <div className="progress-fill" style={{ width: `${poolProgress}%`, background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-green))' }} />
                    </div>
                </div>

                {/* Season progress */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>Season Progress ({sq.seasonDays - sq.seasonDaysLeft}/{sq.seasonDays} days)</span><span>{seasonProgress}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: `${seasonProgress}%`, background: 'var(--accent-green)' }} />
                    </div>
                </div>
            </div>

            {/* Members */}
            <div className="section-title">Members ({sq.totalMembers})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {sq.members.map((m, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', width: 24 }}>#{i + 1}</div>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-green))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800, color: '#000', flexShrink: 0,
                        }}>{m.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{m.name}</div>
                            <div className="progress-bar" style={{ height: 5 }}>
                                <div className="progress-fill" style={{ width: `${m.progress}%`, background: m.progress === 100 ? 'var(--accent-green)' : 'var(--accent-purple)' }} />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-green)' }}>₹{m.contribution.toLocaleString()}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔥 {m.streak}-day streak</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* DeFi Info */}
            <div style={{
                background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.2)',
                borderRadius: 'var(--radius-lg)', padding: 20,
            }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏦 DeFi Yield Strategy</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Currently routing pool funds to <strong style={{ color: 'var(--accent-green)' }}>Aave V3</strong> on Algorand, earning <strong style={{ color: 'var(--accent-green)' }}>{sq.currentAPY}% APY</strong>.
                    Protocol audited within 12 months. Yield distributed based on VitalScore improvement at season end.
                    100% principal returned to all members regardless of yield.
                </div>
            </div>
        </div>
    )
}
