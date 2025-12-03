import React, { useState, useEffect } from 'react';
import { Home, CreditCard, MessageSquare, Wrench, FileText, Bell, User, LogOut, Building, FileSignature, ChevronRight, Menu, X, Moon, Sun } from 'lucide-react';
import { Tab, Notification, ToastMessage } from '../types';
import { Toast } from './ui/Toast';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const notifications: Notification[] = [
    { id: '1', type: 'critical', message: 'Loyer novembre en retard', subtext: 'Régularisez avant pénalités', isRead: false },
    { id: '2', type: 'important', message: 'Intervention confirmée', subtext: '22/11 - 14h-16h', isRead: false },
];

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, toasts, removeToast, onLogout, isDarkMode, toggleTheme }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (tab: Tab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'messages', label: 'Messagerie', icon: MessageSquare, badge: 3 },
    { id: 'interventions', label: 'Incidents', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'lease', label: 'Mon Bail', icon: FileSignature },
    { id: 'property', label: 'Le Bien', icon: Building },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-white flex font-sans text-black transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none z-0"></div>

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar - Floating Design */}
      <aside className={`
        fixed lg:static top-4 bottom-4 left-4 z-50 w-72 
        bg-white border border-blue-200 
        shadow-xl lg:shadow-lg rounded-3xl
        transform transition-all duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0 lg:ml-4 lg:my-4'}
      `}>
        <div className="p-8 flex items-center justify-between lg:justify-start gap-3 border-b border-blue-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <Building size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="font-bold text-xl text-black tracking-tight leading-none">Espace</h1>
                  <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase">Locataire</span>
                </div>
            </div>
            <button className="lg:hidden text-gray-400" onClick={() => setIsMobileMenuOpen(false)} aria-label="Fermer le menu">
                <X size={24} />
            </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-2 custom-scrollbar">
          {menuItems.map((item) => {
             const Icon = item.icon;
             const isActive = activeTab === item.id;
             return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as Tab)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                  {item.label}
                </div>
                {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                        {item.badge}
                    </span>
                )}
              </button>
             );
          })}

          <div className="my-4 mx-4 border-t border-blue-100"></div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-medium rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
              <LogOut size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
              Déconnexion
          </button>
        </nav>

        {/* User & Theme Footer */}
        <div className="p-4 mt-auto border-t border-blue-100">
            {/* Theme Toggle - Disabled for light theme only */}
            <div className="bg-blue-50 p-1 rounded-xl flex mb-4 border border-blue-200">
                <button 
                    disabled={true}
                    className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold bg-white shadow text-blue-600 cursor-default"
                >
                    <Sun size={14} className="mr-2"/> Light
                </button>
                <button 
                    disabled={true}
                    className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold text-gray-400 cursor-default"
                >
                    <Moon size={14} className="mr-2"/> Dark
                </button>
            </div>

            <div className="bg-blue-50 p-3 rounded-2xl flex items-center gap-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => handleNavigate('profile')}>
                <div className="relative">
                  <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold text-black truncate">Jean Dupont</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 truncate">Locataire</p>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen w-full lg:w-[calc(100%-20rem)] transition-all duration-300 relative z-10 bg-white">
        
        {/* Header */}
        <header className={`sticky top-0 z-30 transition-all duration-200 ${scrolled ? 'bg-white shadow-sm border-b border-blue-100' : 'border-b border-blue-100'}`}>
            <div className="px-4 lg:px-8 py-4 lg:py-6 flex justify-between items-center">
                
                <div className="flex items-center gap-3 lg:hidden">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-600 hover:bg-blue-50 rounded-xl transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu size={24} />
                    </button>
                    <h2 className="font-bold text-lg text-black">{menuItems.find(i => i.id === activeTab)?.label}</h2>
                </div>

                <div className="hidden lg:block">
                  <h2 className="text-2xl font-bold text-black tracking-tight">{menuItems.find(i => i.id === activeTab)?.label}</h2>
                </div>

                <div className="flex items-center gap-4 relative">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-gray-700">Bail actif</span>
                    </div>
                    
                    <button 
                        className="relative p-2.5 bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition-all shadow-sm hover:shadow-md focus:outline-none border border-blue-200"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Afficher les notifications"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-16 w-80 bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden animate-zoom-in ring-1 ring-black/5">
                            <div className="p-4 border-b border-blue-100 bg-blue-50 flex justify-between items-center">
                                <h3 className="font-bold text-sm text-black">Notifications</h3>
                                <button className="text-xs text-blue-600 font-medium hover:underline">Tout marquer lu</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="p-4 border-b border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer relative group">
                                        <div className="flex gap-3">
                                            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.type === 'critical' ? 'bg-red-500 shadow-lg shadow-red-500/40' : 'bg-blue-600 shadow-lg shadow-blue-600/40'}`}></div>
                                            <div>
                                                <p className="text-sm font-medium text-black group-hover:text-blue-600 transition-colors">{notif.message}</p>
                                                {notif.subtext && <p className="text-xs text-gray-600 mt-0.5">{notif.subtext}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        <div className="px-4 md:px-8 pb-8 max-w-7xl mx-auto w-full">
            {children}
        </div>
      </main>
    </div>
  );
};