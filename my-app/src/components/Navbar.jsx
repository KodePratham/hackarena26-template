import React, { useState } from 'react';
import { Home, Activity, CreditCard, BarChart2, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';

const Navbar = ({ onNavigate, currentRoute }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    const navLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'intelligence', label: 'Intelligence', icon: Activity },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
        { id: 'profile', label: 'Profile', icon: UserIcon }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    return (
        <header className={`flex justify-between items-center px-8 py-4 border-b transition-colors duration-300 ${isDarkMode ? 'bg-[#020617] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-600 shadow-red-900/20' : 'bg-slate-900'} rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                    V
                </div>
                <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Vampire <span className={isDarkMode ? 'text-red-500' : 'text-slate-500'}>Vault</span>
                </h1>
            </div>

            <nav className="hidden md:flex items-center gap-2">
                {navLinks.map((link) => {
                    const isActive = currentRoute === link.id;
                    const Icon = link.icon;

                    return (
                        <button
                            key={link.id}
                            onClick={() => onNavigate(link.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? (isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white')
                                : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                                }`}
                        >
                            <Icon size={16} /> {link.label}
                        </button>
                    );
                })}


                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors ml-1"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </nav>
        </header>
    );
};

export default Navbar;
