import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Zap, DollarSign, Activity, Lock } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500/30">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-6 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        V
                    </div>
                    <span className="text-xl font-bold tracking-wider text-slate-100 uppercase">
                        Vampire Vault
                    </span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => onNavigate('login')}
                        className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => onNavigate('signup')}
                        className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="px-8 py-24 max-w-6xl mx-auto flex flex-col items-center text-center relative">
                {/* Glow effect behind hero */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 mb-8 uppercase tracking-widest font-semibold">
                        <Lock size={12} className="text-teal-400" />
                        Zero-Persistence Protocol Active
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                        Stop the <span className="text-red-500">Silent Drain.</span><br />
                        Slay Your Ghost Subscriptions.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Small recurring payments often go unnoticed. Create a tracker that identifies
                        "ghost" subscriptions by analyzing spending patterns and offers a one-click
                        "remind to cancel" feature.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('signup')}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transform hover:-translate-y-1"
                        >
                            Get Started for Free
                        </button>
                        <button
                            onClick={() => onNavigate('login')}
                            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl font-bold text-lg transition-all"
                        >
                            Sign In to Vault
                        </button>
                    </div>
                </motion.div>

                {/* Money Leaking Animation */}
                <div className="mt-20 w-full max-w-3xl relative h-64 border border-slate-800/50 rounded-3xl bg-slate-900/30 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 z-10" />

                    <div className="flex gap-16 relative z-0">
                        {['Netflix', 'Spotify', 'Adobe'].map((app, i) => (
                            <div key={app} className="relative flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-lg border border-slate-700 z-10">
                                    {app.charAt(0)}
                                </div>

                                {/* Leaking Money Particles */}
                                <motion.div
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: [0, 1, 0], y: [0, 80] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        delay: i * 0.5,
                                        ease: "easeIn"
                                    }}
                                    className="absolute top-16 text-red-500 font-bold flex items-center"
                                >
                                    <DollarSign size={16} />
                                    <span>-$</span>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: [0, 1, 0], y: [0, 60] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        delay: i * 0.5 + 0.3,
                                        ease: "easeIn"
                                    }}
                                    className="absolute top-16 right-0 text-red-500/50 font-bold flex items-center scale-75"
                                >
                                    <DollarSign size={12} />
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-8 z-20 text-center w-full">
                        <p className="text-red-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                            <Activity size={16} />
                            Warning: Active Bleed Detected
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Overview */}
            <section className="px-8 py-20 bg-slate-900 border-t border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Your Financial Arsenal</h2>
                        <p className="text-slate-400">Everything you need to secure your vault and stop the bleeding.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-red-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Ghost Detection</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Connect your accounts (securely) or input usage data to let our AI identify which subscriptions are eating your money without providing value.
                            </p>
                        </div>

                        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Renewal Guard</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Get notified 2-3 days before a free trial ends or a subscription renews. Slay it with a single click right from the notification.
                            </p>
                        </div>

                        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Savings Engine</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Automatically receive recommendations for better plans (e.g., family plans, annual billing) to optimize your current active subscriptions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
