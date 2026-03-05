import React, { useEffect, useMemo, useState } from "react";
import {
  Menu,
  LogOut,
  Bell,
  User,
  HelpCircle,
} from "lucide-react";
import { Tab, ToastMessage } from '../types';
import { Toast } from './ui/Toast';
import NotificationsModal from './NotificationsModal';
import HelpModal from './HelpModal';
import LogoutModal from './LogoutModal';

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
  icon?: React.ElementType;
  path?: string;
  emoji?: string;
  isLaravel?: boolean;
  isReact?: boolean;
}

type UserData = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar?: string | null;
  name?: string | null;
};

const CONFIG = {
  LARAVEL_URL: 'https://gestiloc-backend.onrender.com',
  REACT_URL:   'https://gestiloc.vercel.app',
  LOGIN_URL:   '/login',
  LOGOUT_URL:  '/logout',
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
  const [user, setUser]                         = useState<UserData | null>(null);
  const [showHelp, setShowHelp]                 = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal]   = useState(false);
  const [notificationCount]                     = useState(3);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const ownerName = useMemo(() => {
    if (!user) return "Co-propriétaire";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.name || user.email || "Co-propriétaire";
  }, [user]);

  const ownerInitials = useMemo(() => {
    if (!user) return "C";
    const a = (user.first_name?.[0] || user.name?.[0] || "").toUpperCase();
    const b = (user.last_name?.[0] || "").toUpperCase();
    return `${a}${b}`.trim() || (user.email?.[0] || "C").toUpperCase();
  }, [user]);

  const getToken = () => {
    let t = localStorage.getItem('token');
    if (t) return t;
    t = new URLSearchParams(window.location.search).get('api_token');
    if (t) { localStorage.setItem('token', t); return t; }
    return sessionStorage.getItem('token');
  };

  const goToLaravel = (path: string) => {
    const token = getToken();
    if (!token) { window.location.href = `${CONFIG.LARAVEL_URL}${CONFIG.LOGIN_URL}`; return; }
    const sep = path.includes('?') ? '&' : '?';
    window.location.href = `${CONFIG.LARAVEL_URL}${path.startsWith('/') ? path : '/'+path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`;
  };

  const handleNavigation = (item: MenuItem) => {
    if (!item.path) return;
    if (item.isLaravel) {
      goToLaravel(item.path);
    } else {
      onNavigate(item.path as Tab);
      setIsMobileMenuOpen(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const menuSections = [
    {
      title: "Menu principal",
      items: [
        { id: 'dashboard', label: 'Tableau de bord', emoji: '📊', path: "/coproprietaire/dashboard", isReact: true },
      ]
    },
    {
      title: "GESTIONS DES BIENS",
      items: [
        { id: "add-property",  label: "Ajouter un bien",  emoji: '➕', path: "/coproprietaire/biens/create", isLaravel: true },
        { id: "my-properties", label: "Mes biens",        emoji: '🏠', path: "/coproprietaire/biens",        isReact: true  },
      ]
    },
    {
      title: "GESTION LOCATIVE",
      items: [
        { id: "new-rental",        label: "Nouvelle location",      emoji: '🔑', path: "/coproprietaire/assign-property/create", isLaravel: true },
        { id: "add-tenant",        label: "Ajouter un locataire",   emoji: '📍', path: "/coproprietaire/tenants/create",          isLaravel: true },
        { id: "tenant-list",       label: "Liste des locataires",   emoji: '📄', path: "/coproprietaire/tenants",                 isLaravel: true },
        { id: "payment-management",label: "Gestion des paiements",  emoji: '📅', path: "/coproprietaire/paiements",               isLaravel: true },
      ]
    },
    {
      title: "DOCUMENTS",
      items: [
        { id: "lease-contracts",    label: "Contrats de bail",              emoji: '📄', path: "/coproprietaire/leases",           isLaravel: true },
        { id: "condition-reports",  label: "Etats de lieux",                emoji: '📄', path: "/coproprietaire/etats-des-lieux",  isLaravel: true },
        { id: "due-notices",        label: "Avis d'échéance",               emoji: '📄', path: "/coproprietaire/notices",          isLaravel: true },
        { id: "rent-receipts",      label: "Quittances de loyers",          emoji: '📄', path: "/coproprietaire/quittances",       isLaravel: true },
        { id: "invoices",           label: "Factures et documents divers",  emoji: '📄', path: "/coproprietaire/factures",         isLaravel: true },
        { id: "document-archiving", label: "Archivage de documents",        emoji: '📄', path: "/coproprietaire/documents",        isReact: true   },
      ]
    },
    {
      title: "REPARATIONS ET TRAVAUX",
      items: [
        { id: "repairs", label: "Réparations et travaux", emoji: '✂️', path: "/coproprietaire/maintenance", isLaravel: true },
      ]
    },
    {
      title: "COMPTABILITE ET STATISTIQUES",
      items: [
        { id: "accounting", label: "Comptabilité et statistiques", emoji: '💼', path: "/coproprietaire/comptabilite", isLaravel: true },
      ]
    },
    {
      title: "GESTION DES COPROPRIÉTAIRES",
      items: [
        { id: "coowner-list",  label: "Liste des gestionnaires",  emoji: '👥', path: "/coproprietaire/gestionnaires",       isLaravel: true },
        { id: "invite-coowner",label: "Inviter un gestionnaire",  emoji: '➕', path: "/coproprietaire/gestionnaires/creer", isLaravel: true },
      ]
    },
    {
      title: "CONFIGURATION",
      items: [
        { id: "settings", label: "Paramètres", emoji: '📜', path: "/coproprietaire/parametres", isReact: true },
      ]
    }
  ];

  const flatMenu = useMemo(() => menuSections.flatMap(s => s.items), []);

  const activeTitle = useMemo(() => {
    const found = flatMenu.find(i => i.path === activeTab || i.id === activeTab);
    return found?.label ?? "Tableau de bord";
  }, [activeTab, flatMenu]);

  /* ── Item de menu — style copié pixel-perfect depuis le Blade ── */
  const renderMenuItem = (item: MenuItem) => {
    const isActive = item.path === activeTab || item.id === activeTab;

    return (
      <button
        key={String(item.id)}
        onClick={() => handleNavigation(item)}
        type="button"
        title={item.label}
        style={{
          /* reset total pour éviter tout héritage Tailwind/global */
          all: 'unset',
          boxSizing: 'border-box',
          /* layout — identique à .menu-item du Blade */
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1rem',
          marginBottom: '0.5rem',
          /* typographie — identique au Blade */
          fontSize: '0.875rem',        // 14 px
          fontWeight: 500,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: 1.4,
          /* forme */
          borderRadius: '1rem',
          border: '1px solid transparent',
          transition: 'all 0.2s',
          cursor: 'pointer',
          /* pas de retour à la ligne */
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          /* couleurs selon état */
          background: isActive
            ? 'linear-gradient(to right, #70AE48, #8BC34A)'
            : 'transparent',
          color: isActive ? '#ffffff' : '#374151',   // gris-700 comme Blade
          boxShadow: isActive
            ? '0 10px 15px -3px rgba(112,174,72,0.3)'
            : 'none',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background   = '#f0f9e6';
            el.style.color        = '#70AE48';
            el.style.borderColor  = '#d4edc9';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background   = 'transparent';
            el.style.color        = '#374151';
            el.style.borderColor  = 'transparent';
          }
        }}
      >
        {/* contenu — identique à .menu-item-content du Blade */}
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          {item.emoji && (
            <span
              role="img"
              aria-label={item.label}
              style={{
                fontSize: '1.1em',
                minWidth: '24px',
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {item.emoji}
            </span>
          )}
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.label}
          </span>
        </span>
      </button>
    );
  };

  /* ── Contenu de la sidebar (réutilisé desktop + mobile) ── */
  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '300px', height: '100%',
      background: 'white',
      borderRight: '1px solid #e5e7eb',
    }}>
      {/* Header vert */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 1.5rem', height: '64px',
        background: '#70AE48',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>GestiLoc</h1>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '1.25rem 1.25rem 0',
        overflowY: 'auto',
        /* masquer la scrollbar */
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      } as React.CSSProperties}>
        <style>{`nav.sidebar-nav-inner::-webkit-scrollbar { display:none; }`}</style>
        {menuSections.map(section => (
          <div key={section.title} style={{ marginBottom: '1.5rem' }}>
            {/* Titre de groupe — identique à .menu-group-title */}
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6b7280',
              marginBottom: '0.75rem',
              paddingLeft: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}>
              {section.title}
            </div>
            <div>{section.items.map(renderMenuItem)}</div>
          </div>
        ))}
      </nav>

      {/* Footer profil */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid #e5e7eb',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '9999px',
            background: 'linear-gradient(to right, #70AE48, #8BC34A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.875rem', fontWeight: 'bold', flexShrink: 0,
          }}>
            {ownerInitials}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontSize: '0.875rem', fontWeight: 600, color: '#111827',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {ownerName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Co-propriétaire</div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Déconnexion"
            style={{
              all: 'unset', boxSizing: 'border-box',
              padding: '0.5rem', borderRadius: '9999px',
              color: '#9ca3af', cursor: 'pointer', flexShrink: 0,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4b5563'; (e.currentTarget as HTMLElement).style.background = '#f3f4f6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9ca3af'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <HelpModal         isOpen={showHelp}          onClose={() => setShowHelp(false)} />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => { await onLogout(); setShowLogoutModal(false); }}
      />

      <div style={{ minHeight: '100vh', background: 'white' }}>
        <div style={{ display: 'flex', height: '100vh' }}>

          {/* ── Sidebar Desktop ── */}
          <aside style={{ display: 'none' }} className="layout-sidebar-desktop">
            <SidebarContent />
          </aside>

          {/* ── Sidebar Mobile overlay ── */}
          {isMobileMenuOpen && (
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          <div style={{
            position: 'fixed', top: 0,
            left: isMobileMenuOpen ? 0 : '-300px',
            height: '100vh', zIndex: 50,
            transition: 'left 0.3s ease',
            boxShadow: isMobileMenuOpen ? '0 0 20px rgba(0,0,0,0.1)' : 'none',
          }}>
            <SidebarContent />
          </div>

          {/* ── Zone principale ── */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'white', minWidth: 0 }}>

            {/* Top bar */}
            <div style={{
              height: '64px', background: '#70AE48',
              display: 'flex', alignItems: 'center',
              padding: '0 1.5rem', flexShrink: 0, zIndex: 10,
            }}>
              {/* Burger mobile */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="layout-mobile-burger"
                style={{
                  display: 'none',
                  padding: '0.625rem',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  borderRadius: '0.5rem', color: 'white', cursor: 'pointer',
                  marginRight: '0.75rem',
                }}
              >
                <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>

              <h1 style={{ flex: 1, fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                {activeTitle}
              </h1>

              {/* Actions top bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Notifications */}
                <button
                  onClick={() => setShowNotifications(true)}
                  style={{
                    all: 'unset', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.625rem 1.25rem', borderRadius: '12px',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.2)', color: 'white',
                    whiteSpace: 'nowrap', position: 'relative',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
                >
                  <Bell style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
                  <span className="layout-topbar-label">Notifications</span>
                  {notificationCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-5px', right: '-5px',
                      background: '#ef4444', color: 'white',
                      fontSize: '0.7rem', fontWeight: 'bold',
                      minWidth: '18px', height: '18px', borderRadius: '9px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px', border: '2px solid white',
                    }}>
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Aide */}
                <button
                  onClick={() => setShowHelp(true)}
                  style={{
                    all: 'unset', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.625rem 1.25rem', borderRadius: '12px',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.2)', color: 'white',
                    whiteSpace: 'nowrap', backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
                >
                  <HelpCircle style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
                  <span className="layout-topbar-label">Aide</span>
                </button>

                {/* Mon compte */}
                <button
                  onClick={() => onNavigate('/coproprietaire/parametres' as Tab)}
                  style={{
                    all: 'unset', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.625rem 1.25rem', borderRadius: '12px',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.2)', color: 'white',
                    whiteSpace: 'nowrap', backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
                >
                  <User style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
                  <span className="layout-topbar-label">Mon compte</span>
                </button>
              </div>
            </div>

            {/* Contenu de la page */}
            <main style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
              <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* Toasts */}
        <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {toasts.map(toast => (
            <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
          ))}
        </div>
      </div>

      {/* CSS utilitaire — responsive uniquement */}
      <style>{`
        @media (min-width: 1024px) {
          .layout-sidebar-desktop { display: flex !important; flex-shrink: 0; }
          .layout-mobile-burger   { display: none !important; }
        }
        @media (max-width: 1023px) {
          .layout-sidebar-desktop { display: none !important; }
          .layout-mobile-burger   { display: flex !important; }
          .layout-topbar-label    { display: none; }
        }
      `}</style>
    </>
  );
};