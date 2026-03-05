import { useState } from 'react'
import { recentTransactions, getCategoryColor } from '../data/mockData'
import { Search, Plus, Filter } from 'lucide-react'

const categories = ['All', 'Income', 'Essential', 'Discretionary', 'Savings']

export default function Transactions() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('All')
    const [showAdd, setShowAdd] = useState(false)

    const filtered = recentTransactions.filter(tx => {
        const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase()) || tx.merchant.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'All' || tx.category.startsWith(filter)
        return matchSearch && matchFilter
    })

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div className="page-title">Transactions</div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={16} /> Add Manual
                </button>
            </div>
            <div className="page-subtitle">All your linked bank transactions, auto-categorized</div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>
                    <Search size={15} color="var(--text-muted)" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search transactions..."
                        style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, width: '100%', fontFamily: 'inherit' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {categories.map(c => (
                        <button key={c} onClick={() => setFilter(c)} className={`btn ${filter === c ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: 13 }}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Totals row */}
            <div className="grid-3" style={{ marginBottom: 20 }}>
                {[
                    { label: 'Total Income', value: '₹85,000', color: 'var(--accent-green)' },
                    { label: 'Total Spend', value: '₹32,193', color: 'var(--accent-red)' },
                    { label: 'Net Savings', value: '₹52,807', color: 'var(--accent-purple)' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Transaction table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th><th>Merchant</th><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(tx => (
                            <tr key={tx.id}>
                                <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{tx.date}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            background: getCategoryColor(tx.category) + '22',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 13, fontWeight: 700, color: getCategoryColor(tx.category)
                                        }}>
                                            {tx.merchant[0]}
                                        </div>
                                        <span style={{ fontWeight: 500, fontSize: 14 }}>{tx.merchant}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{tx.description}</td>
                                <td>
                                    <span className="stat-chip" style={{ background: getCategoryColor(tx.category) + '22', color: getCategoryColor(tx.category) }}>
                                        {tx.categoryLabel}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'CREDIT' ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Manual Modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Add Manual Transaction</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div><label className="form-label">Description</label><input className="form-input" placeholder="e.g. Coffee shop" /></div>
                            <div className="grid-2">
                                <div><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="0" /></div>
                                <div><label className="form-label">Date</label><input className="form-input" type="date" /></div>
                            </div>
                            <div>
                                <label className="form-label">Category</label>
                                <select className="form-input">
                                    <option>Discretionary.DiningOut</option>
                                    <option>Essential.Groceries</option>
                                    <option>Essential.Bills</option>
                                    <option>Savings.Investment</option>
                                    <option>Discretionary.Entertainment</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button className="btn btn-primary" style={{ flex: 1 }}>Add Transaction</button>
                            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
