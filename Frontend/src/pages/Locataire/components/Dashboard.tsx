import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Wrench,
  ClipboardList,
  File,
  Key,
  DollarSign,
  Settings,
  Bell,
  HelpCircle,
  User,
  Home,
  ChevronRight,
  Eye,
  X,
  MessageCircle,
  Building,
} from "lucide-react";

import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { Tab } from "../types";
import { PaymentModal } from "./PaymentModal";

import { 
  mockTenantApi, 
  TenantLease, 
  TenantIncident,
  mockRentReceiptService, 
  RentReceipt,
  mockInvoiceService, 
  TenantInvoice,
  mockNoticeService 
} from "@/services";

// ---------- helpers ----------
const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const prevMonthKey = (ym: string) => {
  const [yS, mS] = ym.split("-");
  const y = Number(yS);
  const m = Number(mS);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() - 1);
  return monthKey(d);
};

const money = (v: unknown): number => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0;
  return Number.isFinite(n) ? n : 0;
};

const fmtMoney = (n: number, currency = "FCFA") =>
  `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;

const safeDate = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

interface DashboardProps {
  activeTab?: string;
  notify: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigate?: (tab: Tab) => void;
}

interface UserData {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  roles: string[];
  default_role: string | null;
}

interface Notice {
  id: string | number;
  notice_date?: string;
  status?: string;
  [key: string]: unknown;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTab = 'home', notify, onNavigate }) => {
  // Récupérer les données utilisateur depuis localStorage
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur:', error);
      }
    }
  }, []);

  const [leases, setLeases] = useState<TenantLease[]>([]);
  const [lease, setLease] = useState<TenantLease | null>(null);
  const [receipts, setReceipts] = useState<RentReceipt[]>([]);
  const [invoices, setInvoices] = useState<TenantInvoice[]>([]);
  const [incidents, setIncidents] = useState<TenantIncident[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [errLeases, setErrLeases] = useState<string | null>(null);
  const [errReceipts, setErrReceipts] = useState<string | null>(null);
  const [errInvoices, setErrInvoices] = useState<string | null>(null);
  const [errIncidents, setErrIncidents] = useState<string | null>(null);
  const [errNotices, setErrNotices] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentYM = useMemo(() => monthKey(new Date()), []);
  const ytdStartYM = useMemo(() => `${new Date().getFullYear()}-01`, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setErrLeases(null);
      setErrReceipts(null);
      setErrInvoices(null);
      setErrIncidents(null);
      setErrNotices(null);

      // Lancer toutes les requêtes en parallèle puis traiter les résultats
      const promises = {
        leases: mockTenantApi.getLeases(),
        receipts: mockRentReceiptService.list({ type: "independent" }),
        invoices: mockInvoiceService.list(),
        incidents: mockTenantApi.getIncidents(),
        notices: mockNoticeService.list(),
      } as const;

      const entries = Object.entries(promises) as [keyof typeof promises, Promise<unknown>][];

      const results = await Promise.allSettled(entries.map(([, p]) => p));

      if (cancelled) return;

      // Associer résultats dans l'ordre
      for (let i = 0; i < entries.length; i++) {
        const key = entries[i][0];
        const res = results[i];
        try {
          if (res.status === "fulfilled") {
            const value = res.value;
            switch (key) {
              case "leases": {
                const ls = Array.isArray(value) ? value : [];
                const activeLease =
                  ls.find((l: TenantLease) => String(l.status).toLowerCase() === "active") || ls[0] || null;
                setLease(activeLease);
                break;
              }
              case "receipts": {
                setReceipts(Array.isArray(value) ? value : []);
                break;
              }
              case "invoices": {
                setInvoices(Array.isArray(value) ? value : []);
                break;
              }
              case "incidents": {
                setIncidents(Array.isArray(value) ? value : []);
                break;
              }
              case "notices": {
                setNotices(Array.isArray(value) ? value : []);
                break;
              }
              default:
                break;
            }
          } else {
            // rejected
            const e = res.reason;
            switch (key) {
              case "leases":
                console.error("[DASH] getLeases", e?.response?.data || e);
                setErrLeases(e?.response?.data?.message || "Erreur lors du chargement du bail.");
                setLease(null);
                break;
              case "receipts":
                console.error("[DASH] receipts", e?.response?.data || e);
                setErrReceipts(e?.response?.data?.message || "Erreur lors du chargement des quittances.");
                setReceipts([]);
                break;
              case "invoices":
                console.error("[DASH] invoices", e?.response?.data || e);
                setErrInvoices(e?.response?.data?.message || "Erreur lors du chargement des factures.");
                setInvoices([]);
                break;
              case "incidents":
                console.error("[DASH] incidents", e?.response?.data || e);
                setErrIncidents(e?.response?.data?.message || "Erreur lors du chargement des incidents.");
                setIncidents([]);
                break;
              case "notices":
                console.error("[DASH] notices", e?.response?.data || e);
                setErrNotices(e?.response?.data?.message || "Erreur lors du chargement des préavis.");
                setNotices([]);
                break;
              default:
                break;
            }
          }
        } catch (err) {
          console.error("[DASH] processing result", err);
        }
      }

      if (!cancelled) setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- derived stats ----------
  const rentMonthly = useMemo(() => (lease ? money(lease.rent_amount) : 0), [lease]);
  const chargesMonthly = useMemo(() => (lease ? money(lease.charges_amount) : 0), [lease]);
  const totalMonthly = useMemo(() => rentMonthly + chargesMonthly, [rentMonthly, chargesMonthly]);

  const receiptsSorted = useMemo(() => {
    const arr = [...receipts];
    arr.sort((a, b) => {
      const da = safeDate(a.issued_date || "")?.getTime() ?? 0;
      const db = safeDate(b.issued_date || "")?.getTime() ?? 0;
      if (db !== da) return db - da;
      const ma = (a.paid_month || "").localeCompare(a.paid_month || "");
      const mb = (b.paid_month || "").localeCompare(b.paid_month || "");
      return mb - ma;
    });
    return arr;
  }, [receipts]);

  const lastReceipt = useMemo(() => receiptsSorted[0] || null, [receiptsSorted]);

  const monthsPaidSet = useMemo(() => {
    const s = new Set<string>();
    receipts.forEach((r) => {
      if (r.paid_month) s.add(r.paid_month);
    });
    return s;
  }, [receipts]);

  // À jour si quittance existe pour le mois courant
  const isUpToDate = useMemo(() => monthsPaidSet.has(currentYM), [monthsPaidSet, currentYM]);

  // Streak : mois consécutifs en partant du dernier mois dispo
  const paidStreak = useMemo(() => {
    if (monthsPaidSet.size === 0) return 0;

    // start = mois courant si présent sinon dernier mois du set
    let start = currentYM;
    if (!monthsPaidSet.has(start)) {
      const all = Array.from(monthsPaidSet).sort(); // asc
      start = all[all.length - 1];
    }

    let streak = 0;
    let cur = start;
    while (monthsPaidSet.has(cur)) {
      streak++;
      cur = prevMonthKey(cur);
      if (streak > 120) break;
    }
    return streak;
  }, [monthsPaidSet, currentYM]);

  const receiptsYTD = useMemo(() => {
    return receipts.filter((r) => (r.paid_month || "") >= ytdStartYM);
  }, [receipts, ytdStartYM]);

  const totalPaidYTD = useMemo(() => {
    return receiptsYTD.reduce((sum, r) => {
      const a = r.amount_paid != null ? money(r.amount_paid) : totalMonthly;
      return sum + a;
    }, 0);
  }, [receiptsYTD, totalMonthly]);

  const avgPaid = useMemo(() => {
    if (!receipts.length) return 0;
    const sum = receipts.reduce(
      (acc, r) => acc + (r.amount_paid != null ? money(r.amount_paid) : totalMonthly),
      0
    );
    return sum / receipts.length;
  }, [receipts, totalMonthly]);

  const openIncidents = useMemo(
    () => incidents.filter((i) => i.status === "open").length,
    [incidents]
  );
  const inProgressIncidents = useMemo(
    () => incidents.filter((i) => i.status === "in_progress").length,
    [incidents]
  );

  const pendingNotices = useMemo(
    () => notices.filter((n: Notice) => String(n.status) === "pending").length,
    [notices]
  );

  const hasAnyError = errLeases || errReceipts || errIncidents || errNotices;

  // Afficher le contenu selon l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        // Contenu du tableau de bord principal - Refait selon le design Figma
        return (
          <>
            {/* Welcome Card - Exact comme la maquette Figma */}
            <div className="bg-gradient-to-r from-[#529D21] to-[#7CB342] rounded-2xl shadow-lg p-6 mb-6 relative overflow-hidden">
              <div className="flex justify-between items-start md:items-center gap-6">
                <div className="z-10 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Bienvenue sur Gestiloc !
                  </h1>
                  <p className="text-white/90 text-sm md:text-base max-w-md leading-relaxed">
                    Retrouvez ici toutes les informations de location. Gérez vos quittances, contactez votre propriétaire et suivez l'état de votre logement en toute simplicité.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src="/Ressource_gestiloc/hand.png" 
                    alt="Welcome" 
                    className="w-24 h-24 md:w-32 md:h-32 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions - Cards Layout */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              <button onClick={() => onNavigate?.('receipts')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Mes_quittances.png" alt="Mes quittances" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Mes quittances</span>
              </button>

              <button onClick={() => onNavigate?.('interventions')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Tools.png" alt="Nouvelle intervention" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle intervention</span>
              </button>

              <button onClick={() => onNavigate?.('tasks')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Nouvelles_taches.png" alt="Nouvelle tâche" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle tâche</span>
              </button>

              <button onClick={() => onNavigate?.('notes')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Edit Property.png" alt="Nouvelle note" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle note</span>
              </button>

              <button onClick={() => onNavigate?.('documents')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <img src="/Ressource_gestiloc/Document In Folder.png" alt="Nouveau document" className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouveau document</span>
              </button>
            </div>

            {/* Stats Grid - 2x2 layout comme Figma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Locations Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Locations</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-6">
                  <img src="/Ressource_gestiloc/Key Security.png" alt="Locations" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-5xl font-bold text-gray-900">1</p>
                    <p className="text-sm text-gray-600 mt-1">Location</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('location')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Loyers en retard Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Loyers en retard</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-6">
                  <img src="/Ressource_gestiloc/Dollar Bag.png" alt="Loyers" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-5xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600 mt-1">Loyers en retard</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('payments')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Interventions Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Interventions</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-4">
                  <img src="/Ressource_gestiloc/Tools.png" alt="Interventions" className="w-16 h-16 object-contain" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">{openIncidents}</p>
                      <p className="text-xs text-gray-600 mt-1">Querelle</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En retard</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En cours</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('interventions')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Tâches Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Tâches</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-4">
                  <img src="/Ressource_gestiloc/Inspection.png" alt="Tâches" className="w-16 h-16 object-contain" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">Querelle</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En retard</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('tasks')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      case 'location':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ma Location</h2>
            {lease && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">{lease.property?.name || 'Détails du logement'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium">{lease.property?.address || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loyer mensuel</p>
                    <p className="font-medium">{fmtMoney(totalMonthly)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-medium">{lease.start_date || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-medium">{lease.end_date || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'landlord':
        return (
          <div className="space-y-6">
            <p className="text-gray-500">Ce contenu a été déplacé vers le composant Landlord.</p>
          </div>
        );
      case 'receipts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Quittances</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Historique des quittances</h3>
                {receipts.length > 0 ? (
                  <div className="space-y-3">
                    {receipts.map((receipt) => (
                      <div key={receipt.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">Mois: {receipt.paid_month}</p>
                          <p className="text-sm text-gray-500">Payé le: {receipt.payment_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{fmtMoney(receipt.amount_paid)}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            receipt.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {receipt.status === 'paid' ? 'Payé' : 'En attente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune quittance disponible</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Mes Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-medium">Contrat de location</h4>
                  <p className="text-sm text-gray-500">PDF • 2.3 MB</p>
                </div>
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <FileText className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-medium">Quittances de loyer</h4>
                  <p className="text-sm text-gray-500">PDF • 1.1 MB</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'interventions':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Interventions</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Historique des interventions</h3>
              {incidents.length > 0 ? (
                <div className="space-y-3">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{incident.title}</p>
                        <p className="text-sm text-gray-500">{incident.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        incident.status === 'open' ? 'bg-red-100 text-red-800' : 
                        incident.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.status === 'open' ? 'Ouvert' : 
                         incident.status === 'in_progress' ? 'En cours' : 
                         'Résolu'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune intervention en cours</p>
              )}
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Tâches</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Liste des tâches</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="flex-1">Signer le contrat de location</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">En attente</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="flex-1 line-through text-gray-500">Fournir les documents justificatifs</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Terminé</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'notes':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Notes</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Notes personnelles</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Important : Date de paiement</p>
                  <p className="text-sm text-gray-600">Le loyer doit être payé avant le 5 de chaque mois</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Contact propriétaire</p>
                  <p className="text-sm text-gray-600">Email: contact@proprietaire.fr - Tel: 01 23 45 67 89</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'notice':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Préavis</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Gestion du préavis</h3>
              {notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div key={notice.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Préavis de départ</p>
                        <p className="text-sm text-gray-500">Date: {notice.notice_date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        notice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {notice.status === 'pending' ? 'En attente' : 'Confirmé'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : ( 
                <p className="text-gray-500">Aucun préavis en cours</p>
              )}
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paiements</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Historique des paiements</h3>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{invoice.type === 'rent' ? 'Loyer mensuel' : 'Facture'}</p>
                        <p className="text-sm text-gray-500">Échéance: {invoice.due_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{fmtMoney(invoice.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status === 'paid' ? 'Payé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun paiement en cours</p>
              )}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Préférences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Notifications par email</span>
                  <button className="w-12 h-6 bg-green-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mode sombre</span>
                  <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        // Par défaut, afficher le tableau de bord - Même contenu que le cas 'home'
        return (
          <>
            {/* Welcome Card - Exact comme la maquette Figma */}
            <div className="bg-gradient-to-r from-[#529D21] to-[#7CB342] rounded-2xl shadow-lg p-6 mb-6 relative overflow-hidden">
              <div className="flex justify-between items-start md:items-center gap-6">
                <div className="z-10 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Bienvenue sur Gestiloc !
                  </h1>
                  <p className="text-white/90 text-sm md:text-base max-w-md leading-relaxed">
                    Retrouvez ici toutes les informations de location. Gérez vos quittances, contactez votre propriétaire et suivez l'état de votre logement en toute simplicité.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src="/Ressource_gestiloc/hand.png" 
                    alt="Welcome" 
                    className="w-24 h-24 md:w-32 md:h-32 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions - Reviewed per Figma Spec */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <button onClick={() => onNavigate?.('receipts')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{ 
                    width: '74px', 
                    height: '70px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 251, 244, 1)', 
                    border: '3px solid rgba(255, 177, 51, 1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Mes_quittances.png" alt="Mes quittances" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Mes quittances</span>
              </button>

              <button onClick={() => onNavigate?.('interventions')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{ 
                    width: '74px', 
                    height: '70px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 251, 244, 1)', 
                    border: '3px solid rgba(255, 177, 51, 1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Tools.png" alt="Nouvelle intervention" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle intervention</span>
              </button>

              <button onClick={() => onNavigate?.('tasks')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{ 
                    width: '74px', 
                    height: '70px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 251, 244, 1)', 
                    border: '3px solid rgba(255, 177, 51, 1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Nouvelles_taches.png" alt="Nouvelle tâche" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle tâche</span>
              </button>

              <button onClick={() => onNavigate?.('property')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{ 
                    width: '74px', 
                    height: '70px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 251, 244, 1)', 
                    border: '3px solid rgba(255, 177, 51, 1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Edit Property.png" alt="Nouvelle note" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouvelle note</span>
              </button>

              <button onClick={() => onNavigate?.('documents')} className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:shadow-lg" style={{ width: '193px', height: '168px', borderRadius: '20px', background: 'rgba(255, 255, 255, 1)', boxShadow: '0px 0px 6.8px 0px rgba(131, 199, 87, 1)' }}>
                <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
                  <div style={{ 
                    width: '74px', 
                    height: '70px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 251, 244, 1)', 
                    border: '3px solid rgba(255, 177, 51, 1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}></div>
                  <img src="/Ressource_gestiloc/Document In Folder.png" alt="Nouveau document" className="w-12 h-12 object-contain relative z-10" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center px-2">Nouveau document</span>
              </button>
            </div>

            {/* Stats Grid - 2x2 layout comme Figma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Locations Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Locations</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-6">
                  <img src="/Ressource_gestiloc/Key Security.png" alt="Locations" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-5xl font-bold text-gray-900">1</p>
                    <p className="text-sm text-gray-600 mt-1">Location</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('location')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Loyers en retard Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Loyers en retard</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-6">
                  <img src="/Ressource_gestiloc/Dollar Bag.png" alt="Loyers" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="text-5xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600 mt-1">Loyers en retard</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('payments')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Interventions Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Interventions</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-4">
                  <img src="/Ressource_gestiloc/Tools.png" alt="Interventions" className="w-16 h-16 object-contain" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">{openIncidents}</p>
                      <p className="text-xs text-gray-600 mt-1">Querelle</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En retard</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En cours</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('interventions')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>

              {/* Tâches Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#FFB84D] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Tâches</h3>
                  <img src="/Ressource_gestiloc/parametre_loc.png" alt="Paramètres" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-end gap-4">
                  <img src="/Ressource_gestiloc/Inspection.png" alt="Tâches" className="w-16 h-16 object-contain" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">Querelle</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-600 mt-1">En retard</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={() => onNavigate?.('tasks')} className="text-xs font-medium text-[#6F00FF] hover:text-[#5500DD] transition-colors duration-200 cursor-pointer">
                    Tout afficher
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  // Forcer le rechargement quand l'onglet change
  React.useEffect(() => {
    if (activeTab === 'home') {
      // Forcer le rafraîchissement des données quand on revient au tableau de bord
      const timer = setTimeout(() => {
        // Le contenu sera re-rendu automatiquement
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // ---------- UI ----------
  if (loading && activeTab !== 'home') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-3xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-56 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalMonthly || 0}
        notify={notify}
      />

      {hasAnyError ? (
        <div className="mt-20 mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-800 font-bold relative z-0">
          Certaines données n'ont pas pu être chargées (le dashboard reste utilisable).
          <div className="mt-2 text-sm font-semibold">
            {errLeases ? <div>• Bail: {errLeases}</div> : null}
            {errReceipts ? <div>• Quittances: {errReceipts}</div> : null}            {errInvoices ? <div>• Factures: {errInvoices}</div> : null}            {errIncidents ? <div>• Incidents: {errIncidents}</div> : null}
            {errNotices ? <div>• Préavis: {errNotices}</div> : null}
          </div>
        </div>
      ) : null}

      {renderContent()}
    </>
  );
};
