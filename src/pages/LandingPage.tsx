import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage as LandingPageView } from './landing-source/LandingPage';
import { Dashboard as LandingDashboard } from './landing-source/Dashboard';
import './landing-source/index.css';

export default function LandingPage() {
  const navigate = useNavigate();
  // Determine initial route based on window.location
  const getInitialRoute = (): 'landing' | 'dashboard' => {
    if (typeof window === 'undefined') return 'landing';
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.includes('/dashboard') || hash.includes('#dashboard')) {
      return 'dashboard';
    }
    return 'landing';
  };

  const [currentRoute, setCurrentRoute] = useState<'landing' | 'dashboard'>(getInitialRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/dashboard') || hash.includes('#dashboard')) {
        setCurrentRoute('dashboard');
      } else {
        setCurrentRoute('landing');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToDashboard = () => {
    navigate('/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentRoute === 'dashboard') {
    return <LandingDashboard onBackToLanding={navigateToLanding} />;
  }

  return <LandingPageView onNavigateToDashboard={navigateToDashboard} />;
}
