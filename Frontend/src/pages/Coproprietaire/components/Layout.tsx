import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Building,
  FileSignature,
  FileText,
  Wrench,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";

import { Tab, ToastMessage } from '../types';
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

interface MenuItem {
  id: Tab | string;
  label: string;
  icon: React.ElementType;
  path?: string;
  emoji?: string;
  isLaravel?: boolean;
}

type UserData = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar?: string | null;
};

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  toasts,
  removeToast,
  onLogout,
  isDarkMode,
  toggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Impossible de lire user depuis localStorage", e);
    }
  }, []);

  const ownerName = useMemo(() => {
    if (!user) return "Co-propriétaire";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.email || "Co-propriétaire";
  }, [user]);

  const ownerInitials = useMemo(() => {
    if (!user) return "C";
    const a = (user.first_name?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    const initials = `${a}${b}`.trim();
    return initials || (user.email?.[0] || "C").toUpperCase();
  }, [user]);

  // ✅ FONCTION : Navigation vers Laravel avec token
  const goToLaravelPage = (path: string) => {
    const token = localStorage.getItem("token");
    console.log("Token disponible pour Laravel:", token ? "OUI" : "NON");
    
    if (!token) {
      console.error("Aucun token trouvé pour l'authentification Laravel");
      alert("Session expirée, veuillez vous reconnecter");
      onNavigate('/login' as Tab);
      return;
    }

    const laravelBaseUrl = 'http://localhost:8000';
    let fullPath = path;
    
    if (fullPath.startsWith('/')) {
      fullPath = `${laravelBaseUrl}${fullPath}`;
    }
    
    const separator = fullPath.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    const fullUrl = `${fullPath}${separator}api_token=${encodeURIComponent(token)}&_t=${timestamp}`;
    
    console.log("Redirection vers Laravel:", fullUrl);
    window.location.href = fullUrl;
  };

  // ✅ FONCTION : Navigation unifiée
  const handleNavigation = (path: string, isLaravel = false) => {
    console.log('Navigation vers:', path, 'Laravel:', isLaravel);
    
    if (isLaravel || path.startsWith('/test-laravel')) {
      goToLaravelPage(path);
    } else {
      onNavigate(path as Tab);
    }
    
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Menu selon votre image - Réorganisé exactement comme sur l'image
  const menuSections = [
    {
      title: "Menu principal",
      items: [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          emoji: '📊',
          path: "/coproprietaire/dashboard",
        },
      ]
    },
    {
      title: "GESTIONS DES BIENS",
      items: [
        { 
          id: "add-property", 
          label: "Ajouter un bien", 
          emoji: '+',
          path: "/coproprietaire/biens" // À ajuster selon votre route
        },
        { 
          id: "my-properties", 
          label: "Mes biens", 
          emoji: '🏠',
          path: "/coproprietaire/biens"
        },
      ]
    },
    {
      title: "GESTION LOCATIVE",
      items: [
        { 
          id: "new-rental", 
          label: "Nouvelle location", 
          emoji: '🔑',
          path: "/coproprietaire/baux"
        },
        { 
          id: "add-tenant", 
          label: "Ajouter un locataire", 
          emoji: '📍',
          path: "/coproprietaire/tenants/create",
          isLaravel: true
        },
        { 
          id: "tenant-list", 
          label: "Liste des locataires", 
          emoji: '📄',
          path: "/coproprietaire/tenants",
          isLaravel: true
        },
        { 
          id: "payment-management", 
          label: "Gestion des paiements", 
          emoji: '📅',
          path: "/coproprietaire/quittances",
          isLaravel: true
        },
      ]
    },
    {
      title: "DOCUMENTS",
      items: [
        { 
          id: "lease-contracts", 
          label: "Contrats de bail", 
          emoji: '📄',
          path: "/coproprietaire/leases",
          isLaravel: true
        },
        { 
          id: "condition-reports", 
          label: "Etats de lieux", 
          emoji: '📄',
          path: "/coproprietaire/documents"
        },
        { 
          id: "due-notices", 
          label: "Avis d'échéance", 
          emoji: '📄',
          path: "/coproprietaire/documents"
        },
        { 
          id: "rent-receipts", 
          label: "Quittances de loyers", 
          emoji: '📄',
          path: "/coproprietaire/quittances",
          isLaravel: true
        },
        { 
          id: "invoices", 
          label: "Factures et documents divers", 
          emoji: '📄',
          path: "/coproprietaire/documents"
        },
        { 
          id: "document-archiving", 
          label: "Archivage de documents", 
          emoji: '📄',
          path: "/coproprietaire/documents"
        },
      ]
    },
    {
      title: "REPARATIONS ET TRAVAUX",
      items: [
        { 
          id: "repairs", 
          label: "Réparations et travaux", 
          emoji: '✂️',
          path: "/coproprietaire/maintenance",
          isLaravel: true
        },
      ]
    },
    {
      title: "COMPTABILITE ET STATISTIQUES",
      items: [
        { 
          id: "accounting", 
          label: "Comptabilité et statistiques", 
          emoji: '💼',
          path: "/coproprietaire/finances"
        },
      ]
    },
    {
      title: "CONFIGURATION",
      items: [
        { 
          id: "settings", 
          label: "Paramètres", 
          emoji: '📜',
          path: "/coproprietaire/parametres"
        },
      ]
    }
  ];

  const flatMenu = useMemo(() => {
    const items: MenuItem[] = [];
    menuSections.forEach(section => {
      section.items.forEach(item => {
        items.push(item);
      });
    });
    return items;
  }, []);

  const activeTitle = useMemo(() => {
    const found = flatMenu.find((i) => i.path === activeTab || i.id === activeTab);
    return found?.label ?? "Tableau de bord";
  }, [activeTab, flatMenu]);

  const handleMenuItemClick = (item: MenuItem) => {
    console.log('Click menu:', item.label, 'path:', item.path, 'Laravel?', item.isLaravel);
    
    if (item.path) {
      handleNavigation(item.path, item.isLaravel);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = item.path === activeTab || item.id === activeTab;

    const baseBtn = "w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 group";
    const activeBtn = "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg";
    const idleBtn = "text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100";

    return (
      <button
        key={String(item.id)}
        onClick={() => handleMenuItemClick(item)}
        className={`${baseBtn} ${isActive ? activeBtn : idleBtn} mb-1`}
        type="button"
      >
        <div className="flex items-center gap-3.5">
          {item.emoji ? (
            <span className="text-lg" role="img" aria-label={item.label}>
              {item.emoji}
            </span>
          ) : Icon ? (
            <Icon
              size={20}
              className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"}`}
            />
          ) : null}
          <span className="text-left whitespace-nowrap overflow-hidden text-ellipsis">
            {item.label}
          </span>
        </div>
        {isActive && (
          <ChevronRight
            size={16}
            className="text-white/90 ml-auto"
          />
        )}
      </button>
    );
  };

  return (
    <>
      <style>{`
        body, #root {
          background-color: white !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-white">
        <div className="flex h-screen bg-white">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-[300px] bg-white border-r border-gray-200">
              <div className="flex items-center flex-shrink-0 px-6 h-16 border-b border-gray-200">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  GestiLoc
                </h1>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                {menuSections.map((section) => (
                  <div key={section.title} className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pl-4">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map(renderMenuItem)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {ownerInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{ownerName}</div>
                    <div className="text-xs text-gray-600">Co-propriétaire</div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile sidebar */}
          <div className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? '' : 'pointer-events-none'}`}>
            <div className={`fixed inset-0 bg-gray-600 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)} />
            <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-6">
                  <h1 className="text-xl font-bold text-gray-900">GestiLoc</h1>
                </div>
                <div className="mt-5 px-4">
                  {menuSections.map((section) => (
                    <div key={section.title} className="mb-6">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pl-4">
                        {section.title}
                      </div>
                      <div className="space-y-1">
                        {section.items.map(renderMenuItem)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {ownerInitials}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{ownerName}</div>
                      <div className="text-xs text-gray-600">Co-propriétaire</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col flex-1 overflow-hidden bg-white">
            {/* Top bar */}
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none">
              <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-1 px-6 flex justify-between items-center">
                <div className="flex-1">
                  <div className="max-w-lg">
                    <h1 className="text-2xl font-bold text-gray-900">{activeTitle}</h1>
                  </div>
                </div>
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Page content */}
            <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-6">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Toast container */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};