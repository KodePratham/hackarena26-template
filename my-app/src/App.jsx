import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SubscriptionManager from './pages/SubscriptionManager';

import VampireVaultDashboard from './pages/VampireVaultDashboard';
import VampireIntelligencePage from './pages/VampireIntelligencePage';
import OnboardingQuestionnaire from './pages/OnboardingQuestionnaire';
import Reports from './pages/Reports';

function App() {
  const [currentRoute, setCurrentRoute] = useState('landing'); // 'landing', 'login', 'signup', 'dashboard'
  const [isNewSignup, setIsNewSignup] = useState(false);

  // useEffect(() => {
  //   // Check if user is already logged in
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     setCurrentRoute('dashboard');
  //   }
  // }, []);

  const navigate = (route) => {
    if (route === 'dashboard') {
      setIsNewSignup(false);
    }
    setCurrentRoute(route);
  };

  const handleLoginSuccess = () => {
    setCurrentRoute('dashboard');
  };

  const handleSignupSuccess = () => {
    setIsNewSignup(true);
    setCurrentRoute('subscriptions');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-red-500/30">
      {currentRoute === 'landing' && <LandingPage onNavigate={navigate} />}
      {currentRoute === 'login' && <AuthPage initialMode="login" onLoginSuccess={handleLoginSuccess} />}
      {currentRoute === 'signup' && <AuthPage initialMode="signup" onLoginSuccess={handleLoginSuccess} onSignupSuccess={handleSignupSuccess} />}
      {currentRoute === 'dashboard' && <VampireVaultDashboard onNavigate={navigate} />}
      {currentRoute === 'intelligence' && <VampireIntelligencePage onNavigate={navigate} />}
      {currentRoute === 'subscriptions' && <SubscriptionManager onNavigate={navigate} isNewSignup={isNewSignup} />}
      {currentRoute === 'onboarding' && <OnboardingQuestionnaire onNavigate={navigate} />}
      {currentRoute === 'reports' && <Reports onNavigate={navigate} />}
    </div>
  );
}

export default App;