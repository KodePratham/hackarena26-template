import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Building, Briefcase, GraduationCap, DollarSign, Edit } from 'lucide-react';
import { Icon } from '@iconify-icon/react';

const API_URL = 'http://127.0.0.1:5000/api/auth/profile';
const SUBS_API_URL = 'http://127.0.0.1:5000/api/subscriptions';

const ProfilePage = ({ onNavigate }) => {
    const [user, setUser] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const preferredCurrency = localStorage.getItem('preferredCurrency') || 'USD ($)';
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: preferredCurrency.substring(0, 3)
        }).format(amount);
    };

    useEffect(() => {
        fetchProfile();
        fetchSubscriptions();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setUser(data);
        } catch (error) {
            console.error("Fetch profile error:", error);
        }
    };

    const fetchSubscriptions = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(SUBS_API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setSubscriptions(data);
        } catch (error) {
            console.error("Fetch subscriptions error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading profile data...</div>;

    const uniqueIcons = Array.from(new Set(subscriptions.map(s => s.icon || 'calendar'))).map(iconName => {
        return subscriptions.find(s => s.icon === iconName);
    });

    return (
        <div className="max-w-4xl mx-auto p-8 font-sans">
            <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Slayer Profile</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Core Identity */}
                <div className="md:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1c1c1c] rounded-2xl p-6 border border-slate-800 text-center"
                    >
                        <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <UserIcon size={40} className="text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{user?.name || 'Unknown Slayer'}</h2>
                        <p className="text-slate-400 text-sm mb-4">{user?.email}</p>

                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-full border border-red-500/20">
                            Zero-Persistence Active
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-[#1c1c1c] rounded-2xl p-6 border border-slate-800"
                    >
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Primary Bank</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                <Building size={18} />
                            </div>
                            <div>
                                <p className="text-white font-bold">{user?.bankName || 'Not configured'}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Financial Profile & Subscriptions */}
                <div className="md:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-[#1c1c1c] rounded-2xl p-6 border border-slate-800"
                    >
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-lg font-bold text-white">Financial Profile</h3>
                            <button onClick={() => onNavigate('onboarding')} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                <Edit size={14} /> Edit
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Current Role</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                                        {user?.userType === 'student' ? <GraduationCap size={20} /> : <Briefcase size={20} />}
                                    </div>
                                    <p className="text-white font-bold text-lg capitalize">{user?.userType || 'Unassigned'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">
                                    {user?.userType === 'professional' ? 'Monthly Salary' : 'Monthly Expense'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400">
                                        <DollarSign size={20} />
                                    </div>
                                    <p className="text-white font-bold text-xl">{formatCurrency(user?.financialAmount || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="bg-[#1c1c1c] rounded-2xl p-6 border border-slate-800"
                    >
                        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4 mb-6">Subscriptions Owned</h3>

                        {uniqueIcons.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {uniqueIcons.map((sub, i) => (
                                    <div
                                        key={i}
                                        className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl hover:scale-110 transition-transform cursor-pointer"
                                        style={{ color: sub.color || '#fff' }}
                                        title={sub.subscriptionName}
                                    >
                                        <Icon icon={sub.icon?.includes(':') ? sub.icon : `mdi:${sub.icon || 'calendar'}`} />
                                    </div>
                                ))}
                                <button
                                    onClick={() => onNavigate('subscriptions')}
                                    className="w-16 h-16 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 flex items-center justify-center transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-slate-400 mb-4">No subscriptions added yet.</p>
                                <button
                                    onClick={() => onNavigate('subscriptions')}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                                >
                                    Add Subscriptions
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
