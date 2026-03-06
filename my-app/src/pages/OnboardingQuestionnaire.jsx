import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, GraduationCap, Building, DollarSign } from 'lucide-react';

const OnboardingQuestionnaire = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        userType: '', // 'professional' or 'student'
        financialAmount: '', // salary or expenses
        bankName: ''
    });

    const handleSelectType = (type) => {
        setFormData({ ...formData, userType: type });
        setStep(2);
    };

    const handleNext = async () => {
        if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            // Save to backend
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await fetch('http://127.0.0.1:5000/api/auth/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            userType: formData.userType,
                            financialAmount: Number(formData.financialAmount),
                            bankName: formData.bankName
                        })
                    });
                } catch (error) {
                    console.error("Failed to save onboarding data:", error);
                }
            }
            // Finish onboarding and go to statement upload
            onNavigate('statementUpload');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100 selection:bg-red-500/30 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-red-600 rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] mb-6">
                        V
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Let's Personalize Your Vault</h1>
                    <p className="text-slate-400">Help us calibrate the intelligence engine for your profile.</p>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                        <motion.div
                            className="h-full bg-red-500"
                            initial={{ width: '33%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-6 text-center">Which best describes you?</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleSelectType('professional')}
                                    className="p-6 rounded-2xl border-2 border-slate-800 hover:border-red-500 hover:bg-slate-800/50 transition-all text-center group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-red-500/20 mx-auto flex items-center justify-center mb-4 transition-colors">
                                        <Briefcase size={28} className="text-slate-400 group-hover:text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Working Professional</h3>
                                    <p className="text-sm text-slate-400">Employed and earning a regular salary</p>
                                </button>

                                <button
                                    onClick={() => handleSelectType('student')}
                                    className="p-6 rounded-2xl border-2 border-slate-800 hover:border-red-500 hover:bg-slate-800/50 transition-all text-center group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-red-500/20 mx-auto flex items-center justify-center mb-4 transition-colors">
                                        <GraduationCap size={28} className="text-slate-400 group-hover:text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Student</h3>
                                    <p className="text-sm text-slate-400">Managing allowance and academic expenses</p>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-6 text-center">
                                {formData.userType === 'professional' ? 'What is your current monthly salary?' : 'What are your average monthly expenses?'}
                            </h2>
                            <div className="max-w-md mx-auto">
                                <div className="relative">
                                    <DollarSign size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="number"
                                        placeholder={formData.userType === 'professional' ? 'e.g., 5000' : 'e.g., 800'}
                                        value={formData.financialAmount}
                                        onChange={(e) => setFormData({ ...formData, financialAmount: e.target.value })}
                                        className="w-full bg-slate-950 border-2 border-slate-800 focus:border-red-500 rounded-2xl py-4 pl-12 pr-4 text-2xl font-bold text-white focus:outline-none transition-colors"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.financialAmount}
                                    className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-6 text-center">Where do you bank?</h2>
                            <div className="max-w-md mx-auto">
                                <div className="relative">
                                    <Building size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="e.g., Chase, Wells Fargo, local bank..."
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        className="w-full bg-slate-950 border-2 border-slate-800 focus:border-red-500 rounded-2xl py-4 pl-12 pr-4 text-lg text-white focus:outline-none transition-colors"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.bankName}
                                    className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2"
                                >
                                    Complete Setup <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingQuestionnaire;
