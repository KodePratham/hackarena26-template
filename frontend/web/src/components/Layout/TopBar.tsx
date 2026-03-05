import { Bell, Search } from 'lucide-react'
import { currentUser, currentScore, getBandConfig } from '../../data/mockData'

export default function TopBar() {
    const band = getBandConfig(currentScore.score)

    return (
        <header style={{
            position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0,
            height: 'var(--topbar-height)',
            background: 'rgba(8,13,26,0.9)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center',
            padding: '0 32px', gap: 16, zIndex: 90,
        }}>
            {/* Search */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '8px 14px', maxWidth: 380,
            }}>
                <Search size={15} color="var(--text-muted)" />
                <input
                    placeholder="Search transactions, challenges..."
                    style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, width: '100%', fontFamily: 'inherit' }}
                />
            </div>

            <div style={{ flex: 1 }} />

            {/* Score badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: `linear-gradient(135deg, ${band.glowColor}, rgba(124,107,255,0.1))`,
                border: `1px solid ${band.color}40`,
                borderRadius: 'var(--radius-sm)', padding: '6px 14px',
            }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>VITALSCORE</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: band.color }}>{currentScore.score}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '2px 6px', background: 'rgba(0,212,170,0.1)', borderRadius: 4, fontWeight: 600 }}>
                    {currentScore.change > 0 ? '+' : ''}{currentScore.change}
                </div>
            </div>

            {/* Notifications */}
            <button style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
                <Bell size={17} color="var(--text-secondary)" />
                <span style={{
                    position: 'absolute', top: 4, right: 4, width: 7, height: 7,
                    background: 'var(--accent-red)', borderRadius: '50%', border: '2px solid var(--bg-primary)'
                }} />
            </button>

            {/* Avatar */}
            <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, ${band.color}, #7c6bff)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#000', cursor: 'pointer',
            }}>
                {currentUser.avatar}
            </div>
        </header>
    )
}
