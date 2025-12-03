import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Payments } from './components/Payments';
import { Messages } from './components/Messages';
import { Interventions } from './components/Interventions';
import { Documents } from './components/Documents';
import { Property } from './components/Property';
import { Lease } from './components/Lease';
import { Profile } from './components/Profile';
import { Tab, ToastMessage } from './types';
import { Toaster } from '@/components/ui/toaster';

// Wrapper pour gérer la navigation et les états partagés
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Récupère l'onglet actif à partir de l'URL
  const getActiveTab = useCallback((): Tab => {
    // Nettoyer le chemin en supprimant les slashes et en prenant le dernier segment non vide
    const segments = location.pathname.split('/').filter(segment => segment);
    const locataireIndex = segments.indexOf('locataire');
    const lastSegment = locataireIndex >= 0 && locataireIndex < segments.length - 1 
      ? segments[locataireIndex + 1] 
      : 'home';
    
    // Vérifier si le segment correspond à un onglet valide
    const validTabs: Tab[] = ['home', 'payments', 'messages', 'interventions', 'documents', 'lease', 'property', 'profile'];
    return validTabs.includes(lastSegment as Tab) ? lastSegment as Tab : 'home';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState<Tab>(getActiveTab());
  
  // Met à jour l'onglet actif quand l'URL change
  useEffect(() => {
    const newActiveTab = getActiveTab();
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }
  }, [getActiveTab, activeTab]);
  
  // Gestionnaire de navigation qui met à jour l'URL
  const handleNavigation = useCallback((tab: Tab) => {
    navigate(`/locataire/${tab}`);
  }, [navigate]);
  
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Toast System
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = () => {
    notify("Déconnexion en cours...", "info");
    setTimeout(() => {
        navigate('/locataire/home');
        notify("Vous êtes maintenant déconnecté (Simulation)", "success");
    }, 1000);
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onNavigate={handleNavigation} 
      toasts={toasts} 
      removeToast={removeToast}
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
    >
      <Routes>
        <Route index element={<Dashboard onNavigate={handleNavigation} notify={notify} />} />
        <Route path="home" element={<Dashboard onNavigate={handleNavigation} notify={notify} />} />
        <Route path="payments" element={<Payments notify={notify} />} />
        <Route path="messages" element={<Messages notify={notify} />} />
        <Route path="interventions" element={<Interventions notify={notify} />} />
        <Route path="documents" element={<Documents notify={notify} />} />
        <Route path="lease" element={<Lease notify={notify} />} />
        <Route path="property" element={<Property notify={notify} />} />
        <Route path="profile" element={<Profile notify={notify} onLogout={handleLogout} />} />
        {/* Redirection pour les routes inconnues vers la page d'accueil */}
        <Route path="*" element={<Navigate to="home" replace />} />
      </Routes>
    </Layout>
  );
};

// Le composant AppContent gère déjà le routage interne
const App: React.FC = () => {
  return <AppContent />;
};

export default App;