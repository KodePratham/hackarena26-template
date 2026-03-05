import { useState } from 'react'
import { nftData } from '../data/mockData'
import { Shield, Share2, CheckCircle, ExternalLink } from 'lucide-react'

export default function NFT() {
    const [shareVisible, setShareVisible] = useState(false)
    const nft = nftData

    return (
        <div className="animate-fade-in">
            <div className="page-title">Soul-Bound NFT</div>
            <div className="page-subtitle">Your financial identity on the Algorand blockchain — permanently yours, never transferable</div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* NFT Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #0e1628, #1a1040)',
                    borderRadius: 'var(--radius-xl)', padding: 32,
                    border: '1px solid transparent',
                    backgroundClip: 'padding-box',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Animated gradient border via box-shadow */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, rgba(0,212,170,0.3), rgba(124,107,255,0.3), rgba(0,212,170,0.1))',
                        borderRadius: 'var(--radius-xl)',
                        zIndex: -1, margin: -1,
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <Shield size={24} color="var(--accent-green)" />
                        <div style={{ fontSize: 16, fontWeight: 800 }}>VitalScore SBT</div>
                        <span className="badge badge-elite">Soul-Bound</span>
                    </div>

                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{
                            width: 100, height: 100, margin: '0 auto 16px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-green), var(--accent-purple))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 40,
                            boxShadow: '0 0 40px rgba(0,212,170,0.4)',
                        }}>⚡</div>
                        <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--accent-green)', letterSpacing: -1 }}>742</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>Vital Strong</div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Asset ID</span>
                            <a href={`https://testnet.algoexplorer.io/asset/${nft.assetId}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)', fontFamily: 'monospace', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {nft.assetId} <ExternalLink size={10} />
                            </a>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--text-muted)' }}>IPFS Hash</span>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 11 }}>
                                {nft.ipfsHash.substring(0, 20)}…
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Transfer</span>
                            <span style={{ color: 'var(--accent-red)' }}>🔒 Restricted</span>
                        </div>
                    </div>

                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }} onClick={() => setShareVisible(true)}>
                        <Share2 size={15} /> Generate Verification Link
                    </button>
                </div>

                {/* Badges */}
                <div>
                    <div className="section-title">Earned Badges</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                        {nft.badges.map(badge => (
                            <div key={badge.id} className="card" style={{ textAlign: 'center', padding: '18px 16px' }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>{badge.icon}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{badge.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Earned {badge.earnedAt}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Snapshots Timeline */}
            <div className="section-title">Monthly Score Snapshots (On-Chain)</div>
            <div className="card" style={{ padding: 0 }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Month</th><th>VitalScore</th><th>Band</th><th>Trajectory</th><th style={{ textAlign: 'right' }}>On-Chain</th></tr>
                    </thead>
                    <tbody>
                        {[...nft.monthlySnapshots].reverse().map((snap, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 500 }}>{snap.month}</td>
                                <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{snap.score}</td>
                                <td><span className="stat-chip green">{snap.band}</span></td>
                                <td>
                                    <span className="stat-chip" style={{ background: 'rgba(0,212,170,0.1)', color: 'var(--accent-green)' }}>
                                        {snap.trajectory === 'IMPROVING' ? '↑ Improving' : '→ Stable'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <CheckCircle size={14} color="var(--accent-green)" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Verification link modal */}
            {shareVisible && (
                <div className="modal-overlay" onClick={() => setShareVisible(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Share Verification Link</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                            Let employers or partners verify your financial health anonymously — no raw data exposed.
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'monospace', color: 'var(--accent-green)', wordBreak: 'break-all', marginBottom: 16 }}>
                            https://vitalscore.finance/verify/vs_jwt_7f8a9b...3c4d_30d
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                            Link shows: Score history, trajectory, badges. Never: Raw transactions or PII. Expires in 30 days.
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-primary" style={{ flex: 1 }}>📋 Copy Link</button>
                            <button className="btn btn-danger">Revoke</button>
                            <button className="btn btn-secondary" onClick={() => setShareVisible(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
