import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

// Alias pour éviter les conflits
const {
  Home, 
  FileText, 
  Bell, 
  User, 
  LogOut, 
  Building, 
  FileSignature, 
  ChevronRight, 
  Menu, 
  X, 
  ChevronDown, 
  Users, 
  Package, 
  FileCheck, 
  UserPlus, 
  FilePlus, 
  LayoutDashboard, 
  DollarSign, 
  CreditCard,
  PenTool,
  Zap,
  Settings: SettingsIcon,
  BookOpen,
  MessageSquare,
  Wrench,
  Trash2,
  Plus,
  FileSearch,
  CheckSquare
} = Icons;
import { Tab, Notification, ToastMessage } from '../types';
import { Toast } from './ui/Toast';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
  onLogout: () => void;
}

interface MenuItem {
  id: Tab | string;
  label: string;
  icon: React.ElementType;
  path?: string;
  submenu?: MenuItem[];
}

const notifications: Notification[] = [
    { id: '1', type: 'critical', message: 'Loyer novembre en retard', subtext: 'Régularisez avant pénalités', isRead: false },
    { id: '2', type: 'important', message: 'Intervention confirmée', subtext: '22/11 - 14h-16h', isRead: false },
];

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, toasts, removeToast, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['main']);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (tab: Tab | string) => {
    // Trouver l'élément de menu correspondant à l'ID
    const findMenuItem = (items: MenuItem[], id: string): MenuItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.submenu) {
          const found = findMenuItem(item.submenu, id);
          if (found) return found;
        }
      }
      return undefined;
    };

    const menuItem = findMenuItem([...essentialMenuItems, ...plusMenuItems], tab);
    
    if (menuItem && menuItem.path) {
      // Utiliser le chemin complet via onNavigate
      onNavigate(menuItem.path as Tab);
    } else {
      // Fallback à l'ancien comportement
      onNavigate(tab as Tab);
    }
    
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Sections de menu avec liens
  const essentialMenuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      icon: LayoutDashboard,
      path: '/proprietaire/dashboard',
      submenu: []
    },
    { 
      id: 'biens', 
      label: 'Gestion des Biens', 
      icon: Building,
      path: '/proprietaire/biens',
      submenu: [
        { 
          id: 'ajouter-bien', 
          label: 'Ajouter un bien', 
          icon: Home,
          path: '/proprietaire/ajouter-bien'
        },
        { 
          id: 'mes-biens', 
          label: 'Mes biens', 
          icon: Building,
          path: '/proprietaire/mes-biens'
        },
        { 
          id: 'coproprietaires', 
          label: 'Copropriétaires', 
          icon: Users,
          path: '/proprietaire/coproprietaires'
        }
      ]
    },
    { 
      id: 'gestion-locative', 
      label: 'Gestion Locative', 
      icon: FileSignature,
      path: '/proprietaire/gestion-locative',
      submenu: [
        { 
          id: 'nouvelle-location', 
          label: 'Nouvelle location', 
          icon: FilePlus,
          path: '/proprietaire/nouvelle-location'
        },
        { 
          id: 'liste-locations', 
          label: 'Locations en cours', 
          icon: FileText,
          path: '/proprietaire/liste-locations'
        },
        { 
          id: 'ajouter-locataire', 
          label: 'Ajouter un locataire', 
          icon: UserPlus,
          path: '/proprietaire/ajouter-locataire'
        },
        { 
          id: 'locataires', 
          label: 'Liste des locataires', 
          icon: Users,
          path: '/proprietaire/locataires'
        },
        { 
          id: 'quittances', 
          label: 'Quittances', 
          icon: FileText,
          path: '/proprietaire/quittances'
        },
        { 
          id: 'impayes', 
          label: 'Impayés', 
          icon: DollarSign,
          path: '/proprietaire/impayes'
        }
      ]
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: FileText,
      path: '/proprietaire/documents',
      submenu: [
        { 
          id: 'inventaires', 
          label: 'Inventaires', 
          icon: Package,
          path: '/proprietaire/documents/inventaires'
        },
        { 
          id: 'etat-des-lieux', 
          label: 'États des lieux', 
          icon: FileCheck,
          path: '/proprietaire/documents/etats-des-lieux'
        },
        { 
          id: 'baux', 
          label: 'Contrats de bail', 
          icon: FileSignature,
          path: '/proprietaire/documents/baux'
        },
        { 
          id: 'factures', 
          label: 'Factures', 
          icon: FileText,
          path: '/proprietaire/documents/factures'
        },
        { 
          id: 'signature-electronique', 
          label: 'Signature électronique', 
          icon: PenTool,
          path: '/proprietaire/documents/signature-electronique'
        },
        { 
          id: 'modeles-lettres', 
          label: 'Modèles de lettres', 
          icon: FileText,
          path: '/proprietaire/documents/modeles-lettres'
        }
      ]
    },
    { 
      id: 'finances', 
      label: 'Finances', 
      icon: DollarSign,
      path: '/proprietaire/finances',
      submenu: [
        { 
          id: 'finances-overview', 
          label: 'Tableau de bord', 
          icon: DollarSign,
          path: '/proprietaire/finances/tableau-de-bord'
        },
        { 
          id: 'finances-summary', 
          label: 'Bilan financier', 
          icon: FileText,
          path: '/proprietaire/finances/bilan'
        },
        { 
          id: 'finances-loans', 
          label: 'Prêts', 
          icon: CreditCard,
          path: '/proprietaire/finances/prets'
        },
        { 
          id: 'finances-tax', 
          label: 'Déclarations fiscales', 
          icon: FileText,
          path: '/proprietaire/finances/fiscalite'
        }
      ]
    },
  ];

  const plusMenuItems: MenuItem[] = [
    { 
      id: 'notebook', 
      label: 'Carnet', 
      icon: BookOpen,
      submenu: []
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: MessageSquare,
      submenu: []
    },
    { 
      id: 'candidates', 
      label: 'Candidats', 
      icon: Users,
      submenu: []
    },
    { 
      id: 'tools', 
      label: 'Outils', 
      icon: Wrench,
      submenu: [
        { id: 'rent-review', label: 'Révision de loyer', icon: DollarSign },
        { id: 'charge-regularization', label: 'Régularisation charges', icon: CreditCard },
        { id: 'mail-sending', label: 'Envoi de courrier', icon: MessageSquare },
        { id: 'ai-assistant', label: 'Assistant IA BETA', icon: Zap }
      ]
    },
    { 
      id: 'trash', 
      label: 'Corbeille', 
      icon: Trash2,
      submenu: []
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {/* Mobile Menu Overlay (Backdrop) */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between lg:justify-start gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                <Building size={20} />
                </div>
                <div>
                <h1 className="font-bold text-xl text-slate-900 tracking-tight leading-none">GestiLoc</h1>
                <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Espace Propriétaire</span>
                </div>
            </div>
            <button 
                className="lg:hidden text-slate-400" 
                onClick={() => setIsMobileMenuOpen(false)}
                title="Fermer le menu"
                aria-label="Fermer le menu de navigation"
            >
                <X size={24} />
            </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4 custom-scrollbar">
          {/* Section L'ESSENTIEL */}
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-2">L'ESSENTIEL</p>
          {essentialMenuItems.map((item) => {
             const Icon = item.icon;
             const isActive = activeTab === item.id;
             const hasSubmenu = item.submenu && item.submenu.length > 0;
             const isExpanded = expandedMenus.includes(item.id as string);

             return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasSubmenu) {
                      toggleMenu(item.id as string);
                    } else {
                      handleNavigate(item.id as Tab);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-blue-50/80 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>}
                  <div className="flex items-center gap-3.5">
                    <Icon size={20} className={`transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {item.label}
                  </div>
                  {hasSubmenu && (
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <div className="mt-1.5 ml-6 space-y-1 border-l border-slate-200 pl-4">
                    {item.submenu!.map((subitem) => {
                      const SubIcon = subitem.icon;
                      const isSubActive = activeTab === subitem.id;
                      return (
                        <button
                          key={subitem.id}
                          onClick={() => handleNavigate(subitem.id as Tab)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            isSubActive
                              ? 'bg-blue-50/80 text-primary font-medium'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <SubIcon size={16} className={isSubActive ? 'text-primary' : 'text-slate-400'} />
                          {subitem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
             );
          })}

          {/* Section LE PLUS */}
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-6">LE PLUS</p>
          {plusMenuItems.map((item) => {
             const Icon = item.icon;
             const isActive = activeTab === item.id;
             const hasSubmenu = item.submenu && item.submenu.length > 0;
             const isExpanded = expandedMenus.includes(item.id as string);

             return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasSubmenu) {
                      toggleMenu(item.id as string);
                    } else {
                      handleNavigate(item.id as Tab);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-blue-50/80 text-primary shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>}
                  <div className="flex items-center gap-3.5">
                    <Icon size={20} className={`transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {item.label}
                  </div>
                  {hasSubmenu && (
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <div className="mt-1.5 ml-6 space-y-1 border-l border-slate-200 pl-4">
                    {item.submenu!.map((subitem) => {
                      const SubIcon = subitem.icon;
                      const isSubActive = activeTab === subitem.id;
                      return (
                        <button
                          key={subitem.id}
                          onClick={() => handleNavigate(subitem.id as Tab)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            isSubActive
                              ? 'bg-blue-50/80 text-primary font-medium'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <SubIcon size={16} className={isSubActive ? 'text-primary' : 'text-slate-400'} />
                          {subitem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
             );
          })}

          <div className="my-6 border-t border-slate-100 mx-4"></div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-medium rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
              <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
              Déconnexion
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => handleNavigate('profile')}>
                <div className="relative">
                  <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">Jean Dupont</p>
                    <p className="text-xs text-slate-500 truncate">Résidence Les Hortensias</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:flex flex-col min-h-screen w-full transition-all duration-300">
        
        {/* Header */}
        <header className={`sticky top-0 z-30 transition-all duration-200 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-white lg:bg-transparent border-b lg:border-none border-slate-200'}`}>
            <div className="px-4 lg:px-8 py-4 lg:py-5 flex justify-between items-center">
                
                <div className="flex items-center gap-3 lg:hidden">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ouvrir le menu"
                        aria-label="Ouvrir le menu de navigation"
                    >
                        <Menu size={24} />
                    </button>
                    <h2 className="font-bold text-lg text-slate-900">{[...essentialMenuItems, ...plusMenuItems].find(i => i.id === activeTab)?.label}</h2>
                </div>

                <div className="hidden lg:block">
                  <h2 className="text-xl font-bold text-slate-800">{[...essentialMenuItems, ...plusMenuItems].find(i => i.id === activeTab)?.label}</h2>
                </div>

                <div className="flex items-center gap-4 relative">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-600">Bail actif</span>
                    </div>
                    <button 
                        className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
                        onClick={() => setShowNotifications(!showNotifications)}
                        title="Afficher les notifications"
                        aria-label="Afficher les notifications"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                                <button className="text-xs text-primary font-medium hover:underline">Tout marquer lu</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                        <div className="flex gap-3">
                                            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.type === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">{notif.message}</p>
                                                {notif.subtext && <p className="text-xs text-slate-500 mt-0.5">{notif.subtext}</p>}
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

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
        </div>
      </main>
    </div>
  );
};
