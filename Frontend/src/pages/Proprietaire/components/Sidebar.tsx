import React from 'react';
import { LayoutDashboard, Building, Users, Wallet, FileText, Wrench, Settings, LogOut, X, ChevronRight, ChevronDown, CreditCard, MessageSquare, Bell, Menu, Briefcase, Package, FileCheck, DollarSign, BookOpen, PenTool, Zap, Trash2, Plus, UserPlus, FilePlus } from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

interface MenuItem {
  id: Tab | string;
  label: string;
  icon: React.ElementType;
  submenu?: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate, isOpen, setIsOpen, onLogout }) => {
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['main']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const essentialMenuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Tableau de Bord Propriétaire', 
      icon: Briefcase,
      submenu: []
    },
    { 
      id: 'properties', 
      label: 'Biens', 
      icon: Building,
      submenu: [
        { id: 'add-property', label: 'Ajouter un bien', icon: Plus }, 
        { id: 'my-properties', label: 'Mes biens', icon: Building },
        { id: 'properties-lots', label: 'Lots', icon: Building },
        { id: 'properties-buildings', label: 'Immeubles', icon: Building }
      ]
    },
    { 
      id: 'tenants', 
      label: 'Locataires', 
      icon: Users,
      submenu: [
        { id: 'add-tenant', label: 'Ajouter un locataire', icon: UserPlus },
        { id: 'list-tenants', label: 'Liste des locataires', icon: Users }
      ]
    },
    { 
      id: 'rentals', 
      label: 'Locations', 
      icon: FileText,
      submenu: [
        { id: 'new-rental', label: 'Nouvelle location', icon: FilePlus },
        { id: 'list-rentals', label: 'Liste des locations', icon: FileText }
      ]
    },
    { 
      id: 'inventory', 
      label: 'Inventaires', 
      icon: Package,
      submenu: []
    },
    { 
      id: 'inspection', 
      label: 'Etat des lieux', 
      icon: FileCheck,
      submenu: []
    },
    { 
      id: 'finances', 
      label: 'Finances', 
      icon: DollarSign,
      submenu: [
        { id: 'finances-overview', label: 'Finances', icon: DollarSign },
        { id: 'finances-loans', label: 'Prêts', icon: CreditCard },
        { id: 'finances-summary', label: 'Bilan', icon: FileText },
        { id: 'finances-tax', label: 'Déclarations fiscales', icon: FileText }
      ]
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: FileText,
      submenu: [
        { id: 'my-documents', label: 'Mes documents', icon: FileText },
        { id: 'e-signature', label: 'Signature électronique', icon: PenTool },
        { id: 'letter-templates', label: 'Modèles de lettres', icon: FileText },
        { id: 'onboarding', label: 'Démarrer l\'utilisation', icon: Zap }
      ]
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary-dark dark:text-slate-100 tracking-tight leading-tight whitespace-nowrap">GestiLoc</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-slate-600"
            title="Fermer le menu"
            aria-label="Fermer le menu de navigation"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
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
                      onNavigate(item.id as Tab);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                    ${isActive 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-primary dark:text-primary-light' : 'text-slate-400 dark:text-slate-500'} />
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
                          onClick={() => {
                            onNavigate(subitem.id as Tab);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            isSubActive
                              ? 'bg-blue-50/80 text-primary font-medium'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                          title={subitem.label}
                          aria-label={subitem.label}
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

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Administration</p>
            
            {/* Bureau */}
            <button 
              onClick={() => {
                onNavigate('settings' as Tab);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
              ${(activeTab as string) === 'settings' 
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Bureau"
              aria-label="Bureau"
            >
              <Briefcase size={20} className={(activeTab as string) === 'settings' ? 'text-primary dark:text-primary-light' : 'text-slate-400 dark:text-slate-500'} />
              Bureau
            </button>

            {/* Paramètres */}
            <button 
              onClick={() => {
                onNavigate('profile' as Tab);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
              ${(activeTab as string) === 'profile' 
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Paramètres"
              aria-label="Paramètres"
            >
              <Settings size={20} className={(activeTab as string) === 'profile' ? 'text-primary dark:text-primary-light' : 'text-slate-400 dark:text-slate-500'} />
              Paramètres
            </button>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <img 
              src="https://picsum.photos/100/100" 
              alt="Utilisateur" 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">Propriétaire</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Mon compte</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Déconnexion"
              aria-label="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
