import { useState } from 'react'
import { currentUser } from '../data/mockData'
import { Bell, Shield, Database, Link, Power } from 'lucide-react'

export default function Settings() {
    const [notif, setNotif] = useState('Standard')
    const [emergency, setEmergency] = useState(false)

    const bankAccounts = [
        { bank: 'HDFC Bank', accNo: '****4521', status: 'Connected', balance: '₹1,24,500' },
        { bank: 'ICICI Bank', accNo: '****8834', status: 'Connected', balance: '₹38,200' },
    ]

    return (
        <div className="animate-fade-in">
            <div className="page-title">Settings</div>
            <div className="page-subtitle">Manage your account, bank connections, and privacy</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Profile */}
                <div className="card">
                    <div className="section-title">Profile</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-green), var(--accent-purple))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, fontWeight: 800, color: '#000',
                        }}>{currentUser.avatar}</div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>{currentUser.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{currentUser.email}</div>
                        </div>
                    </div>
                    <div className="grid-2">
                        <div><label className="form-label">Display Name</label><input className="form-input" defaultValue={currentUser.name} /></div>
                        <div><label className="form-label">Email</label><input className="form-input" defaultValue={currentUser.email} /></div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <button className="btn btn-primary">Save Changes</button>
                    </div>
                </div>

                {/* Bank Connections */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link size={16} color="var(--accent-blue)" /> Bank Connections
                        </div>
                        <button className="btn btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }}>+ Connect Bank</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {bankAccounts.map((acc, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(77,166,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏦</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{acc.bank} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{acc.accNo}</span></div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Balance: {acc.balance}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className="stat-chip green">● Connected</span>
                                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--accent-red)' }}>Disconnect</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className="card">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Bell size={16} color="var(--accent-purple)" /> Notification Preferences
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {['Essential only', 'Standard', 'Full'].map(level => (
                            <button key={level} onClick={() => setNotif(level)}
                                className={`btn ${notif === level ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, justifyContent: 'center' }}>
                                {level}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>
                        Max 5 notifications per day. Essential: urgent alerts only. Full: daily digest + all alerts.
                    </div>
                </div>

                {/* Emergency Mode */}
                <div className="card" style={{ border: emergency ? '1px solid rgba(255,71,87,0.3)' : '1px solid var(--border)', background: emergency ? 'rgba(255,71,87,0.04)' : 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="section-title" style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8, color: emergency ? 'var(--accent-red)' : undefined }}>
                                <Power size={16} color={emergency ? 'var(--accent-red)' : undefined} /> Emergency Mode
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Re-weights essentials to 80% during financial hardship. VitalScore paused during mode.</div>
                        </div>
                        <button
                            onClick={() => setEmergency(!emergency)}
                            className={`btn ${emergency ? 'btn-danger' : 'btn-secondary'}`}
                            style={{ flexShrink: 0 }}>
                            {emergency ? '🔴 Disable' : '⚡ Enable'}
                        </button>
                    </div>
                </div>

                {/* Data Privacy */}
                <div className="card">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Database size={16} color="var(--text-muted)" /> Data & Privacy
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>📥 Export My Data (JSON)</button>
                        <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>🗑️ Delete Account</button>
                    </div>
                    <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        Data export delivered within 48h. Account deletion permanently removes all data within 30 days.
                        Compliant with DPDP Act 2023, RBI AA Framework, and GDPR.
                    </div>
                </div>

                {/* Security */}
                <div className="card">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Shield size={16} color="var(--accent-green)" /> Security
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>
                        ✅ AES-256 encryption at rest &nbsp;|&nbsp; ✅ TLS 1.3 in transit<br />
                        ✅ Bank connections are read-only — no payments ever initiated<br />
                        ✅ PII tokenized at ingestion — never stored in raw form
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: 13 }}>View Full Privacy Policy</button>
                </div>
            </div>
        </div>
    )
}
