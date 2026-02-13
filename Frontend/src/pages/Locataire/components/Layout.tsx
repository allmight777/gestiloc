import React, { useState, useEffect } from 'react';
import {
  Home,
  Key,
  FileText,
  Folder,
  Wrench,
  CheckSquare,
  StickyNote,
  FileSignature,
  CreditCard,
  Settings,
  Menu,
  X,
  Bell,
  MessageCircle,
  ArrowLeft,
  LogOut,
  Building,
  ChevronRight,
  Sparkles,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { Tab, Notification, ToastMessage } from '../types';
import { Toast } from './ui/Toast';
import { Landlord } from './Landlord';

interface UserData {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  roles: string[];
  default_role: string | null;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
  onLogout: () => void;
  user: UserData | null;
  notify: (message: string, type: 'success' | 'error' | 'info') => void;

  // ✅ AJOUTE ÇA
  isDarkMode: boolean;
  toggleTheme: () => void;
}


const notifications: Notification[] = [
  { id: '1', type: 'critical', message: 'Loyer novembre en retard', subtext: 'Régularisez avant pénalités', isRead: false },
  { id: '2', type: 'important', message: 'Intervention confirmée', subtext: '22/11 - 14h-16h', isRead: false },
];

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  toasts,
  removeToast,
  onLogout,
  user,
  notify,
  isDarkMode,
  toggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('app-scroll-container');
    if (!el) return;

    const handleScroll = () => setScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (tab: Tab) => {
    // Toujours naviguer vers l'onglet demandé
    if (activeTab !== tab) {
      onNavigate(tab);
    }
    setIsMobileMenuOpen(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: string) => {
    // Synchroniser avec activeTab si c'est un onglet valide
    const validTabIds = ['home', 'location', 'landlord', 'receipts', 'documents', 'interventions', 'tasks', 'notes', 'notice', 'payments', 'settings', 'profile'];
    if (validTabIds.includes(page)) {
      onNavigate(page as Tab);
    }
    setIsMobileMenuOpen(false);
    const el = document.getElementById('app-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Menu complet avec tous les items pour l'indicateur
  const menuItems = [
    { id: 'home', label: 'Tableau de bord', icon: Home },
    { id: 'location', label: 'Ma location', icon: Key },
    { id: 'landlord', label: 'Mon propriétaire', icon: Building },
    { id: 'receipts', label: 'Mes quittances', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'interventions', label: 'Mes interventions', icon: Wrench },
    { id: 'tasks', label: 'Mes tâches', icon: CheckSquare },
    { id: 'notes', label: 'Mes notes', icon: StickyNote },
    { id: 'notice', label: 'Préavis', icon: FileSignature },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const userInitials =
    user
      ? (`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() ||
          user.email?.[0]?.toUpperCase() ||
          'U')
      : 'U';

  const userLabel =
    user
      ? user.first_name || user.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user.email
      : 'Utilisateur';

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* HEADER - Full width */}
      <header className="px-4 sm:px-6 py-3 fixed top-0 left-0 right-0 z-[100] h-[60px]" style={{ background: 'rgba(82, 157, 33, 0.82)' }}>
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-3">
            {activeTab !== 'home' && (
              <button 
                onClick={() => handleNavigate('home')}
                className="p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Retour au tableau de bord"
              >
                <ArrowLeft size={24} className="text-white" />
              </button>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} className="text-white" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Gestiloc</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="hidden sm:inline text-sm">Notifications</span>
            </button>
            
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              onClick={() => setShowHelp(!showHelp)}
              aria-label="Aide"
            >
              <HelpCircle size={18} />
              <span className="hidden sm:inline text-sm">Aide</span>
            </button>
            
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              onClick={() => handlePageChange('profile')}
              aria-label="Mon compte"
            >
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-xs font-bold">{userInitials}</span>
              </div>
              <span className="hidden sm:inline text-sm">Mon compte</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop - HORS du conteneur relative */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR - HORS du conteneur relative */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[280px] z-[100]
          bg-white shadow-2xl
          flex flex-col
          transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64 lg:top-[60px] lg:h-[calc(100vh-60px)] lg:shadow-none lg:border-r lg:border-gray-200 lg:z-40'}
        `}
      >
        {/* Mobile Header with Close */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200" style={{ background: 'rgba(82, 157, 33, 0.82)' }}>
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={24} className="text-white" />
          </button>
        </div>
        {/* Menu exact comme sur l'image */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // Logique simplifiée : actif si l'onglet correspond
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#529D21]/20 to-[#F5A623]/20 text-[#529D21] font-semibold border-l-4 border-[#529D21] shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[#529D21]' : 'text-gray-500'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
                      <ChevronRight size={16} className="text-[#529D21]" />
                    </div>
                  )}
                </button>
              );
            })}
            
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div
            onClick={() => handleNavigate('profile')}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userLabel}</p>
              <p className="text-xs text-gray-500">Locataire</p>
            </div>
          </div>

          <button
            onClick={() => {
              handleNavigate('home');
              window.location.href = '/login';
            }}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className="flex flex-1 h-[calc(100vh-60px)] relative pt-[60px]">
        {/* Toasts */}
        <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col ml-0 lg:ml-64 h-full overflow-hidden z-0 relative">
          {/* Content */}
          <div id="app-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 scroll-smooth">
            {activeTab === 'landlord' ? (
              <Landlord notify={notify} />
            ) : (
              <div className="p-4 sm:p-6 pt-6 sm:pt-8 max-w-7xl mx-auto">
                {children}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {/* Notification items */}
            <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Loyer novembre en retard</p>
                  <p className="text-sm text-gray-600 mt-1">Régularisez avant pénalités</p>
                  <p className="text-xs text-gray-400 mt-2">Il y a 2 heures</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Intervention confirmée</p>
                  <p className="text-sm text-gray-600 mt-1">22/11 - 14h-16h</p>
                  <p className="text-xs text-gray-400 mt-2">Il y a 1 jour</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouvelle quittance disponible</p>
                  <p className="text-sm text-gray-600 mt-1">Quittance d'octobre 2024</p>
                  <p className="text-xs text-gray-400 mt-2">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}

      {/* Help Dropdown */}
      {showHelp && (
        <div className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Aide</h3>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Guide de démarrage</p>
                  <p className="text-sm text-gray-600 mt-1">Apprenez les bases de GestiLoc</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Centre d'aide complet</p>
                  <p className="text-sm text-gray-600 mt-1">Accédez à tous nos guides</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Contactez le support</p>
                  <p className="text-sm text-gray-600 mt-1">Notre équipe est là pour vous aider</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={() => {
                setShowHelp(false);
                window.location.href = '/help';
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Voir toute l'aide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
