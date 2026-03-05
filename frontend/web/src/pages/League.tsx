import { leagueData } from '../data/mockData'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const leagueTiers = [
    { name: 'Bronze', range: 'Score < 400', color: '#cd7f32' },
    { name: 'Silver', range: 'Score 400-599', color: '#94a3b8' },
    { name: 'Gold', range: 'Score 600-749', color: '#ffd700' },
    { name: 'Platinum', range: 'Score 750+', color: '#00d4aa' },
]

export default function League() {
    const d = leagueData
    const currentTier = leagueTiers.find(t => t.name === d.league) || leagueTiers[2]

    return (
        <div className="animate-fade-in">
            <div className="page-title">League & Leaderboard</div>
            <div className="page-subtitle">Compete anonymously within your income bracket</div>

            {/* My League status */}
            <div style={{
                background: `linear-gradient(135deg, ${currentTier.color}20, ${currentTier.color}08)`,
                border: `1px solid ${currentTier.color}50`,
                borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 24,
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 56 }}>🏆</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: currentTier.color }}>{d.league} League</div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
                        {[
                            { label: 'Rank', value: `#${d.userRank}` },
                            { label: 'Total Participants', value: d.totalInLeague },
                            { label: 'Weekly Points', value: d.weeklyPoints },
                            { label: 'Percentile', value: `Top ${100 - d.percentile}%` },
                        ].map((s, i) => (
                            <div key={i}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: currentTier.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        🎯 You need to earn <strong style={{ color: 'var(--text-primary)' }}>50 more points</strong> to break into Top 10 and earn a <strong style={{ color: '#ffd700' }}>Vital Elite</strong> badge!
                    </div>
                </div>
            </div>

            {/* League tiers */}
            <div className="section-title">League Tiers</div>
            <div className="grid-4" style={{ marginBottom: 28 }}>
                {leagueTiers.map(tier => (
                    <div key={tier.name} className="card" style={{
                        padding: '16px',
                        border: tier.name === d.league ? `1px solid ${tier.color}60` : '1px solid var(--border)',
                        background: tier.name === d.league ? `${tier.color}10` : 'var(--bg-card)',
                    }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: tier.color, marginBottom: 4 }}>{tier.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tier.range}</div>
                        {tier.name === d.league && (
                            <div style={{ fontSize: 11, color: tier.color, fontWeight: 700, marginTop: 8 }}>← You are here</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Leaderboard */}
            <div className="section-title">This Week's Leaderboard — {d.league} League</div>
            <div className="card" style={{ padding: 0 }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Rank</th><th>Participant</th><th>VitalScore</th><th style={{ textAlign: 'right' }}>Points</th><th style={{ textAlign: 'right' }}>Change</th></tr>
                    </thead>
                    <tbody>
                        {d.leaderboard.map((entry: any, i: number) => (
                            <tr key={i} style={{ background: entry.isUser ? 'rgba(0,212,170,0.05)' : undefined }}>
                                <td>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: entry.rank <= 3 ? '#ffd700' : 'var(--text-secondary)' }}>
                                        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                                    </span>
                                </td>
                                <td style={{ fontWeight: entry.isUser ? 700 : 400, color: entry.isUser ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                                    {entry.name}
                                </td>
                                <td>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{entry.score}</span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{entry.points.toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>
                                    {entry.change > 0 ? <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><TrendingUp size={14} />+{entry.change}</span>
                                        : entry.change < 0 ? <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><TrendingDown size={14} />{entry.change}</span>
                                            : <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Minus size={14} /></span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                    💡 All users shown anonymously within your income bracket for privacy
                </div>
            </div>
        </div>
    )
}
