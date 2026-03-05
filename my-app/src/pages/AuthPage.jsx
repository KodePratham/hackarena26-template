import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Phone, Calendar, ArrowRight, CheckCircle } from 'lucide-react';

const AuthPage = ({ initialMode = 'login', onLoginSuccess, onSignupSuccess }) => {
    const [mode, setMode] = useState(initialMode); // 'login', 'signup', 'otp'
    const [formData, setFormData] = useState({
        name: '', email: '', dob: '', password: '', confirmPassword: '', mobile: '', otp: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // We use 127.0.0.1 instead of localhost to prevent IPv6 resolution issues on Mac
    const API_URL = 'http://127.0.0.1:5000/api/auth';

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    dob: formData.dob,
                    password: formData.password,
                    mobile: formData.mobile
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setMode('otp'); // Move to OTP verification
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: formData.otp })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Successfully verified, go to signup success destination
            alert('Verification successful!');
            if (data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
            }
            if (onSignupSuccess) {
                onSignupSuccess();
            } else {
                setMode('login');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Store token and redirect
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLoginSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 selection:bg-red-500/30">

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
            >

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] mb-4">
                        <Shield size={24} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                        {mode === 'login' ? 'Access the Vault' : mode === 'signup' ? 'Join Vampire Vault' : 'Verify Identity'}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {mode === 'login' ? 'Secure read-only environment' : mode === 'signup' ? 'Stop the silent drain today' : `Enter the OTP sent to your console`}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm flex items-center gap-2">
                        <Shield size={16} /> {error}
                    </div>
                )}

                {/* LOGIN FORM */}
                {mode === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="vault@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Master Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Authenticating...' : 'Enter Vault'} <ArrowRight size={18} />
                        </button>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-slate-500">Don't have an account? </span>
                            <button
                                type="button"
                                onClick={() => setMode('signup')}
                                className="text-red-400 font-bold hover:text-red-300 transition-colors"
                            >
                                Sign Up
                            </button>
                        </div>

                        <div className="text-xs text-center text-slate-500 mt-8 pt-4 border-t border-slate-800/50">
                            By proceeding, you agree to our <span className="text-slate-400 hover:text-white cursor-pointer transition-colors underline decoration-slate-600">Privacy Policy</span>.
                            <br /><br />
                            <span className="flex items-center justify-center gap-1 text-teal-500/80">
                                <Shield size={12} /> Zero-Persistence and Read-Only protocol active.
                            </span>
                        </div>
                    </form>
                )}

                {/* SIGNUP FORM */}
                {mode === 'signup' && (
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                        <div>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text" name="name" placeholder="Full Name" required
                                    value={formData.name} onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email" name="email" placeholder="Email Address" required
                                    value={formData.email} onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="tel" name="mobile" placeholder="Mobile Number" required
                                    value={formData.mobile} onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text" name="dob" placeholder="DOB (Optional)"
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text' }}
                                    value={formData.dob} onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-500 focus:text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password" name="password" placeholder="Password" required
                                    value={formData.password} onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password" name="confirmPassword" placeholder="Confirm" required
                                    value={formData.confirmPassword} onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-6 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Create Vault'}
                        </button>

                        {/* Google Optional */}
                        <button
                            type="button"
                            className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all mt-3 flex items-center justify-center gap-2"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="mt-4 text-center text-sm">
                            <span className="text-slate-500">Already a slayer? </span>
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className="text-red-400 font-bold hover:text-red-300 transition-colors"
                            >
                                Log In
                            </button>
                        </div>
                    </form>
                )}

                {/* OTP FORM */}
                {mode === 'otp' && (
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                            <p className="text-sm text-slate-300 mb-2">We've generated an OTP for <span className="text-white font-bold">{formData.email}</span>.</p>
                            <p className="text-xs text-red-400 font-semibold border border-red-900/50 bg-red-500/10 p-2 rounded">(Check the backend terminal console for the OTP code)</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block text-center">Enter 4-Digit OTP</label>
                            <input
                                type="text"
                                name="otp"
                                maxLength="4"
                                value={formData.otp}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 text-center text-3xl tracking-[1em] text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Verifying...' : 'Verify Identity'} <CheckCircle size={18} />
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setMode('signup')}
                                className="text-xs text-slate-500 hover:text-white transition-colors"
                            >
                                Change Email Address
                            </button>
                        </div>
                    </form>
                )}

            </motion.div>
        </div>
    );
};

export default AuthPage;
