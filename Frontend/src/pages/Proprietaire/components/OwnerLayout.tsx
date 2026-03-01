import React, { useEffect, useMemo, useState } from "react";
import {
  Building,
  LayoutDashboard,
  Home,
  Users,
  FileSignature,
  FileText,
  UserPlus,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  BarChart3,
  List,
  Wallet,
  ClipboardList,
  AlertTriangle,
  FolderOpen,
  Archive,
  Wrench,
  Calculator,
  Settings,
  HelpCircle,
  Check,
} from "lucide-react";

import { Tab, Notification, ToastMessage } from "../types";
import { Toast } from "./ui/Toast";
import { landlordNotificationsService, LandlordNotification } from "../../../services/api";

interface OwnerLayoutProps {
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

type UserData = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  roles?: string[];
  default_role?: string | null;
};

// Design System Colors
const COLORS = {
  primary: "#6DBE45",
  primaryHover: "#5aa53a",
  background: "#f5f7f4",
  sidebar: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
};



export const OwnerLayout: React.FC<OwnerLayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  toasts,
  removeToast,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [notifications, setNotifications] = useState<LandlordNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Impossible de lire user depuis localStorage", e);
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await landlordNotificationsService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await landlordNotificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await landlordNotificationsService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const ownerName = useMemo(() => {
    if (!user) return "Propriétaire";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.email || "Propriétaire";
  }, [user]);

  const ownerInitials = useMemo(() => {
    if (!user) return "P";
    const a = (user.first_name?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    const initials = `${a}${b}`.trim();
    return initials || (user.email?.[0] || "P").toUpperCase();
  }, [user]);

  // Menu sidebar exact
  const menuSections = [
    {
      title: "TABLEAU DE BORD",
      items: [
        { id: "dashboard", label: "Tableau de bord", icon: BarChart3, path: "/proprietaire/dashboard" },
        { id: "notifications", label: "Notifications", icon: Bell, path: "/proprietaire/notifications" },
      ],
    },
    {
      title: "GESTION DES BIENS",
      items: [
        { id: "ajouter-bien", label: "Ajouter un bien", icon: Plus, path: "/proprietaire/ajouter-bien" },
        { id: "mes-biens", label: "Mes biens", icon: Home, path: "/proprietaire/mes-biens" },
      ],
    },
    {
      title: "GESTION LOCATIVE",
      items: [
        { id: "nouvelle-location", label: "Nouvelle location", icon: FileSignature, path: "/proprietaire/nouvelle-location" },
        { id: "ajouter-locataire", label: "Ajouter locataire", icon: UserPlus, path: "/proprietaire/ajouter-locataire" },
        { id: "locataires", label: "Liste locataires", icon: List, path: "/proprietaire/locataires" },
        { id: "paiements", label: "Gestion paiements", icon: Wallet, path: "/proprietaire/paiements" },
      ],
    },
    {
      title: "DOCUMENTS",
      items: [
        { id: "baux", label: "Contrats bails", icon: FileText, path: "/proprietaire/baux" },
        { id: "etats-lieux", label: "États lieux", icon: ClipboardList, path: "/proprietaire/etats-lieux" },
        { id: "avis-echeance", label: "Avis échéance", icon: AlertTriangle, path: "/proprietaire/avis-echeance" },
        { id: "quittances", label: "Quittances", icon: FileText, path: "/proprietaire/quittances" },
        { id: "factures", label: "Factures", icon: FolderOpen, path: "/proprietaire/factures" },
        { id: "archives", label: "Archivage", icon: Archive, path: "/proprietaire/archives" },
      ],
    },
    {
      title: "RÉPARATIONS ET TRAVAUX",
      items: [
        { id: "reparations", label: "Réparations travaux", icon: Wrench, path: "/proprietaire/reparations" },
      ],
    },
    {
      title: "COMPTABILITÉ",
      items: [
        { id: "comptabilite", label: "Comptabilité statistiques", icon: Calculator, path: "/proprietaire/comptabilite" },
      ],
    },
    {
      title: "PARAMÈTRES",
      items: [
        { id: "parametres", label: "Paramètres", icon: Settings, path: "/proprietaire/parametres" },
      ],
    },
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

  const handleNavigate = (tab: Tab | string) => {
    const menuItem = flatMenu.find((i) => i.id === tab || i.path === tab);
    if (menuItem?.path) onNavigate(menuItem.path as Tab);
    else onNavigate(tab as Tab);

    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowHelp(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex font-sans text-[#1f2937]" style={{ backgroundColor: COLORS.background }}>
      {/* Custom Scrollbar */}
      <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(107,114,128,.7) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(107,114,128,.4);
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(107,114,128,.6);
        }
      `}</style>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - 280px width */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-[280px]
          bg-white border-r border-[#e5e7eb]
          transform transition-all duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header - Minimal for mobile */}
        <div 
          className="h-16 px-6 flex items-center justify-between border-b border-[#e5e7eb] lg:hidden"
          style={{ backgroundColor: COLORS.primary }}
        >
          <div className="flex items-center gap-3">
            <Building size={20} strokeWidth={2.5} className="text-white" />
            <h1 className="font-bold text-lg text-white leading-none">GestiLoc</h1>
          </div>

          <button
            className="text-white/80 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fermer le menu"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-5">
              <h3 className="px-3 text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || activeTab === item.path;
                  return (
                    <button
                      key={String(item.id)}
                      onClick={() => handleNavigate(item.path ?? item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? "text-white shadow-md"
                          : "text-[#1f2937] hover:bg-[#f5f7f4]"
                      }`}
                      style={isActive ? { backgroundColor: COLORS.primary } : {}}
                      type="button"
                    >
                      <Icon
                        size={18}
                        className={`flex-shrink-0 ${isActive ? "text-white" : "text-[#6b7280]"}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="my-4 mx-3 border-t border-[#e5e7eb]" />

          {/* User Card */}
          <div className="px-3">
            <div
              className="p-3 rounded-xl flex items-center gap-3 border border-[#e5e7eb] hover:border-[#6DBE45] hover:bg-[#f5f7f4] transition-all cursor-pointer"
              onClick={() => handleNavigate("/proprietaire/profile")}
              role="button"
            >
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {ownerInitials}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-[#1f2937] truncate">{ownerName}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Propriétaire</p>
              </div>
              <ChevronRight size={16} className="text-[#6b7280]" />
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-3 text-sm font-medium rounded-lg text-[#6b7280] hover:bg-red-50 hover:text-red-600 transition-colors"
            type="button"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 lg:ml-[280px]">
        {/* Header - Fixed green */}
        <header
          className="sticky top-0 z-30 h-16 px-6 flex justify-between items-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Ouvrir le menu"
              type="button"
            >
              <Menu size={24} />
            </button>
            {/* Logo dans le header */}
            <div className="flex items-center gap-2">
              <Building size={22} strokeWidth={2.5} className="text-white" />
              <h2 className="text-xl font-semibold text-white">Gestiloc</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Afficher les notifications"
                type="button"
              >
                <Bell size={20} />
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-[#e5e7eb] overflow-hidden">
                  <div className="p-4 border-b border-[#e5e7eb] flex justify-between items-center bg-[#f5f7f4]">
                    <h3 className="font-semibold text-sm text-[#1f2937]">Notifications</h3>
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-[#6DBE45] font-medium hover:underline" 
                      type="button"
                    >
                      Tout marquer lu
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-4 text-center text-sm text-[#6b7280]">
                        Chargement...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-[#6b7280]">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          className={`p-4 border-b border-[#e5e7eb] hover:bg-[#f5f7f4] transition-colors cursor-pointer ${
                            !notif.is_read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                                notif.type === 'error' || notif.type === 'warning' ? "bg-red-500" : "bg-[#6DBE45]"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#1f2937]">{notif.title}</p>
                              <p className="text-xs text-[#6b7280] mt-0.5">{notif.message}</p>
                              {notif.subtext && (
                                <p className="text-xs text-[#9ca3af] mt-1">{notif.subtext}</p>
                              )}
                              {!notif.is_read && (
                                <span className="inline-flex items-center gap-1 mt-1 text-xs text-[#6DBE45]">
                                  <Check size={10} /> Nouveau
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <button 
                      className="w-full px-4 py-3 text-sm font-medium text-[#6DBE45] hover:bg-[#f5f7f4]"
                      onClick={() => handleNavigate('/proprietaire/notifications')}
                      type="button"
                    >
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <button
              className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setShowHelp(!showHelp)}
              aria-label="Afficher l'aide"
              type="button"
            >
              <HelpCircle size={20} />
            </button>

            {showHelp && (
              <div className="absolute right-6 top-16 w-80 bg-white rounded-xl shadow-xl border border-[#e5e7eb] overflow-hidden">
                <div className="p-4 border-b border-[#e5e7eb] flex justify-between items-center bg-[#f5f7f4]">
                  <h3 className="font-semibold text-sm text-[#1f2937]">Aide</h3>
                  <button 
                    onClick={() => setShowHelp(false)}
                    className="text-xs text-[#6b7280] hover:text-[#1f2937]" 
                    type="button"
                  >
                    Fermer
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 border-b border-[#e5e7eb] hover:bg-[#f5f7f4] cursor-pointer">
                    <p className="text-sm font-medium text-[#1f2937]">Guide de démarrage</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">Apprenez les bases de GestiLoc</p>
                  </div>
                  <div className="p-4 border-b border-[#e5e7eb] hover:bg-[#f5f7f4] cursor-pointer">
                    <p className="text-sm font-medium text-[#1f2937]">Centre d'aide complet</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">Accédez à tous nos guides</p>
                  </div>
                  <button className="w-full px-4 py-3 text-sm font-medium text-[#6DBE45] hover:bg-[#f5f7f4]" type="button">
                    Voir toute l'aide
                  </button>
                </div>
              </div>
            )}

            {/* Mon compte */}
            <button
              className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={() => handleNavigate("/proprietaire/profile")}
              aria-label="Mon compte"
              type="button"
            >
              <div 
                className="w-8 h-8 rounded-full bg-white text-[#6DBE45] flex items-center justify-center font-bold text-sm"
              >
                {ownerInitials}
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
};
