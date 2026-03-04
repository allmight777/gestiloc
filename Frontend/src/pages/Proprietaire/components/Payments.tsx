import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Settings,
  Check,
  AlertTriangle,
  FileText,
  Download,
  Mail,
  Eye,
  BarChart3,
  Loader2,
  RefreshCw,
  Undo2,
  XCircle,
} from "lucide-react";
import { landlordPayments, type Invoice, type CreateInvoicePayload } from "@/services/landlordPayments";
import { leaseService } from "@/services/api";

/* ─── Types ─── */

interface PaymentRow {
  id: number;
  invoiceNumber?: string;
  locataire: string;
  email: string;
  bien: string;
  bienId?: number;
  montant: number;
  echeance: string;
  statut: "paid" | "late" | "pending";
  datePaiement: string | null;
  mode: string;
  leaseId?: number;
}

interface PaymentsProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

/* ─── Helper functions ─── */

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const getStatutFromInvoice = (invoice: Invoice): "paid" | "late" | "pending" => {
  const now = new Date();
  const dueDate = new Date(invoice.due_date);
  
  if (invoice.status === "paid" || invoice.status === "completed") {
    return "paid";
  }
  
  if (dueDate < now) {
    return "late";
  }
  
  return "pending";
};

const transformInvoiceToPaymentRow = (invoice: Invoice): PaymentRow => {
  const statut = getStatutFromInvoice(invoice);
  // L'API retourne la relation 'lease' avec les données imbriquées
  // InvoiceResource retourne: property.address, property.city, tenant.full_name, tenant.email
  const leaseData = invoice.lease;
  const property = leaseData?.property;
  const tenant = leaseData?.tenant;
  
  // Fallback pour le nom du bien: name > address > city > "Bien"
  const bienLabel = property?.name || property?.address || property?.city || "Bien";
  
  // Fallback pour le nom du locataire: full_name > "Locataire"
  const locataireLabel = tenant?.full_name || "Locataire";
  
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    locataire: locataireLabel,
    email: tenant?.email || "-",
    bien: bienLabel,
    bienId: property?.id,
    montant: invoice.amount_total || 0,
    echeance: formatDate(invoice.due_date),
    statut,
    datePaiement: invoice.paid_at ? formatDate(invoice.paid_at) : null,
    mode: invoice.payment_method || "Virement",
    leaseId: invoice.lease_id,
  };
};

/* ─── Mock data - Plus utilisé (données maintenant chargées depuis l'API) ─── */

/*
const mockPayments: PaymentRow[] = [
  {
    id: "1",
    locataire: "Jean Dupont",
    email: "jean@gmail.com",
    bien: "Appartement 12 - Agla Boulevard de la marina",
    montant: "60 000 FCFA",
    echeance: "05 Fév 2026",
    statut: "paid",
    datePaiement: "03 Fév 2026",
    mode: "Virement",
  },
  {
    id: "2",
    locataire: "sophia Amane",
    email: "sophia@gmail.com",
    bien: "Villa moderne - Fidjrossè Rue des Cocotiers",
    montant: "150 000 FCFA",
    echeance: "09 Mai 2026",
    statut: "late",
    datePaiement: "-",
    mode: "Virement",
  },
  {
    id: "3",
    locataire: "Jean Dupont",
    email: "jean@gmail.com",
    bien: "Studio cosy - Centre-ville Avenue Steinmetz",
    montant: "200 000 FCFA",
    echeance: "05 Juin 2026",
    statut: "pending",
    datePaiement: "-",
    mode: "Virement",
  },
];
*/

/* ─── Component ─── */

export const Payments: React.FC<PaymentsProps> = ({ notify }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"actifs" | "archives">("actifs");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [linesPerPage, setLinesPerPage] = useState("100");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [biens, setBiens] = useState<string[]>(["Tous les biens"]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [leases, setLeases] = useState<{id: number; property: {name: string; address: string}; tenant: {full_name: string}}[]>([]);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState('month');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Query pour les statistiques de paiement depuis l'API
  const { data: apiStats, isLoading: statsLoading } = useQuery({
    queryKey: ['paymentStatistics', statsPeriod],
    queryFn: () => landlordPayments.getPaymentStatistics(statsPeriod),
    staleTime: 30000, // 30 secondes
  });

  // Form state for creating invoice
  const [formData, setFormData] = useState<{
    lease_id: number | "";
    type: "rent" | "deposit" | "charge" | "repair";
    due_date: string;
    period_start: string;
    period_end: string;
    amount_total: string;
    payment_method: string;
  }>({
    lease_id: "",
    type: "rent",
    due_date: "",
    period_start: "",
    period_end: "",
    amount_total: "",
    payment_method: "fedapay",
  });

  // Charger les factures depuis l'API
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const invoices = await landlordPayments.listInvoices();
      
      // Transformer les données API en format attendu
      const transformedPayments = invoices.map(transformInvoiceToPaymentRow);
      setPayments(transformedPayments);
      
      // Extraire la liste des biens uniques
      const uniqueBiens = [...new Set(transformedPayments.map(p => p.bien))];
      setBiens(["Tous les biens", ...uniqueBiens]);
      
    } catch (err) {
      console.error("Erreur lors du chargement des factures:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des factures";
      setError(errorMessage);
      notify("Erreur lors du chargement des factures", "error");
    } finally {
      setLoading(false);
    }
  };

  // Charger les leases pour le formulaire de création de facture
  const fetchLeases = async () => {
    try {
      const leasesData = await leaseService.listLeases();
      setLeases(leasesData);
    } catch (err) {
      console.error("Erreur lors du chargement des baux:", err);
      notify("Erreur lors du chargement des baux", "error");
    }
  };

  // Ouvrir le modal de création
  const openCreateModal = () => {
    fetchLeases();
    setShowCreateModal(true);
  };

  // Créer une nouvelle facture
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lease_id || !formData.due_date || !formData.amount_total) {
      notify("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    setCreatingInvoice(true);
    try {
      const payload: CreateInvoicePayload = {
        lease_id: Number(formData.lease_id),
        type: formData.type,
        due_date: formData.due_date,
        period_start: formData.period_start || undefined,
        period_end: formData.period_end || undefined,
        amount_total: parseFloat(formData.amount_total),
        payment_method: formData.payment_method,
      };

      await landlordPayments.createInvoice(payload);
      notify("Facture créée avec succès!", "success");
      setShowCreateModal(false);
      setFormData({
        lease_id: "",
        type: "rent",
        due_date: "",
        period_start: "",
        period_end: "",
        amount_total: "",
        payment_method: "fedapay",
      });
      fetchInvoices(); // Rafraîchir la liste
    } catch (err) {
      console.error("Erreur lors de la création de la facture:", err);
      notify("Erreur lors de la création de la facture", "error");
    } finally {
      setCreatingInvoice(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filtrer les paiements
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.locataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBien =
      filterBien === "Tous les biens" ||
      p.bien === filterBien;
    
    return matchesSearch && matchesBien;
  });

  // Envoyer un rappel de paiement
  const handleSendReminder = async (invoiceId: number) => {
    setActionLoading(`remind-${invoiceId}`);
    try {
      // Note: L'endpoint POST /api/invoices/{id}/remind existe
      // Mais n'est pas exposé dans le service landlordPayments
      // On utilise l'api directement
      const { default: api } = await import("@/services/api");
      await api.post(`/invoices/${invoiceId}/remind`);
      notify("Rappel envoyé avec succès!", "success");
    } catch (err) {
      console.error("Erreur lors de l'envoi du rappel:", err);
      notify("Erreur lors de l'envoi du rappel", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Générer une quittance
  const handleGenerateReceipt = async (invoiceId: number, leaseId: number) => {
    setActionLoading(`receipt-${invoiceId}`);
    try {
      // Utiliser l'API pour générer la quittance PDF
      const { default: api } = await import("@/services/api");
      const response = await api.get(`/rent-receipts/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quittance_${invoiceId}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notify("Quittance générée avec succès!", "success");
    } catch (err) {
      console.error("Erreur lors de la génération de la quittance:", err);
      notify("Erreur lors de la génération de la quittance", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Exporter les factures (CSV)
  const handleExport = async () => {
    setActionLoading("export");
    try {
      // Créer un CSV des factures
      const csvContent = [
        ["N° Facture", "Locataire", "Bien", "Montant", "Échéance", "Statut", "Date Paiement"].join(","),
        ...payments.map(p => [
          p.invoiceNumber || p.id,
          `"${p.locataire}"`,
          `"${p.bien}"`,
          p.montant,
          p.echeance,
          p.statut,
          p.datePaiement || "-"
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `factures_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      notify("Export CSV effectué avec succès!", "success");
    } catch (err) {
      console.error("Erreur lors de l'export:", err);
      notify("Erreur lors de l'export", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Ouvrir le modal de remboursement
  const openRefundModal = (payment: PaymentRow) => {
    setSelectedPayment(payment);
    setRefundReason("");
    setShowRefundModal(true);
  };

  // Ouvrir le modal de rejet
  const openRejectModal = (payment: PaymentRow) => {
    setSelectedPayment(payment);
    setRejectReason("");
    setShowRejectModal(true);
  };

  // Confirmer le remboursement
  const handleRefund = async () => {
    if (!selectedPayment) return;
    
    setActionLoading(`refund-${selectedPayment.id}`);
    try {
      await landlordPayments.refundPayment(selectedPayment.id, refundReason);
      notify("Paiement remboursé avec succès!", "success");
      setShowRefundModal(false);
      fetchInvoices(); // Rafraîchir la liste
    } catch (err) {
      console.error("Erreur lors du remboursement:", err);
      notify("Erreur lors du remboursement", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Confirmer le rejet
  const handleReject = async () => {
    if (!selectedPayment) return;
    
    setActionLoading(`reject-${selectedPayment.id}`);
    try {
      await landlordPayments.rejectPayment(selectedPayment.id, rejectReason);
      notify("Paiement rejeté avec succès!", "success");
      setShowRejectModal(false);
      fetchInvoices(); // Rafraîchir la liste
    } catch (err) {
      console.error("Erreur lors du rejet:", err);
      notify("Erreur lors du rejet", "error");
    } finally {
      setActionLoading(null);
    }
  };
  const stats = {
    totalExpected: apiStats?.total_amount || payments.reduce((sum, p) => sum + p.montant, 0),
    totalReceived: apiStats?.completed_amount || payments.filter(p => p.statut === "paid").reduce((sum, p) => sum + p.montant, 0),
    totalLate: apiStats?.failed_amount || payments.filter(p => p.statut === "late").reduce((sum, p) => sum + p.montant, 0),
    recoveryRate: apiStats?.success_rate || (payments.length > 0 
      ? Math.round((payments.filter(p => p.statut === "paid").length / payments.length) * 100) 
      : 0),
  };

  const statutBadge = (statut: PaymentRow["statut"]) => {
    switch (statut) {
      case "paid":
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 12px", borderRadius: 6,
            background: "#dcfce7", color: "#166534",
            fontSize: "0.72rem", fontWeight: 700,
          }}>
            <Check size={12} /> Payé
          </span>
        );
      case "late":
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 12px", borderRadius: 6,
            background: "#fee2e2", color: "#991b1b",
            fontSize: "0.72rem", fontWeight: 700,
          }}>
            <AlertTriangle size={12} /> En retard
          </span>
        );
      case "pending":
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 12px", borderRadius: 6,
            background: "#fef3c7", color: "#92400e",
            fontSize: "0.72rem", fontWeight: 700,
          }}>
            ⏳ En attente
          </span>
        );
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');

        .pm-page {
          padding: 1.5rem 2.5rem 3rem;
          font-family: 'Manrope', sans-serif;
          color: #1a1a1a;
        }

        /* Header */
        .pm-header {
          margin-bottom: 1.5rem;
        }
        .pm-title {
          font-family: 'Merriweather', serif;
          font-size: 1.55rem;
          font-weight: 900;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }
        .pm-subtitle {
          font-size: 0.82rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0;
          font-style: italic;
        }

        /* Tabs */
        .pm-tabs {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          border-bottom: 1.5px solid #e5e7eb;
          margin-bottom: 1.25rem;
        }
        .pm-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          padding: 8px 0 12px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #9ca3af;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1.5px;
          transition: all 0.15s;
        }
        .pm-tab.active {
          color: #4b8c2a;
          border-bottom-color: #83C757;
        }
        .pm-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          border-radius: 4px;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 0 4px;
        }
        .pm-tab.active .pm-tab-count {
          background: #83C757;
          color: #fff;
        }
        .pm-tab:not(.active) .pm-tab-count {
          background: #e5e7eb;
          color: #6b7280;
        }

        /* Card */
        .pm-card {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
        }

        /* Filter */
        .pm-filter-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: #4b5563;
          letter-spacing: 0.06em;
          margin: 0 0 14px 0;
        }
        .pm-filter-row {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 3rem;
        }
        .pm-filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pm-filter-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #374151;
        }
        .pm-select {
          width: 100%;
          padding: 0.6rem 2.2rem 0.6rem 0.85rem;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          font-size: 0.82rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 500;
          color: #6b7280;
          background: transparent;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          cursor: pointer;
          box-sizing: border-box;
        }

        /* Search */
        .pm-search-row {
          display: flex;
          gap: 12px;
          align-items: stretch;
        }
        .pm-search-wrap {
          flex: 1;
          position: relative;
        }
        .pm-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #83C757;
          pointer-events: none;
        }
        .pm-search-input {
          width: 100%;
          padding: 0.65rem 0.85rem 0.65rem 2.6rem;
          border: 1.5px solid #83C757;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 500;
          color: #83C757;
          background: #fff;
          outline: none;
          box-sizing: border-box;
        }
        .pm-search-input::placeholder { color: #83C757; font-weight: 600; }
        .pm-search-input:focus { box-shadow: 0 0 0 3px rgba(131,199,87,0.12); color: #1a1a1a; }
        .pm-btn-display {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 18px;
          border-radius: 10px;
          border: 1.5px solid #d1d5db;
          background: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pm-btn-display:hover { background: #f9fafb; }

        /* Stats */
        .pm-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 1.25rem;
        }
        .pm-stat {
          background: rgba(237, 237, 237, 1);
          border-radius: 33px;
          padding: 1.4rem 1.5rem;
          border-left-width: 11px;
          border-left-style: solid;
          border-top: none;
          border-right: none;
          border-bottom: none;
        }
        .pm-stat.green { border-left-color: rgba(87, 190, 21, 1); }
        .pm-stat.blue { border-left-color: rgba(0, 132, 255, 1); }
        .pm-stat.red { border-left-color: rgba(255, 81, 81, 1); }
        .pm-stat.orange { border-left-color: rgba(255, 157, 0, 1); }
        .pm-stat-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #6b7280;
          margin: 0 0 10px 0;
        }
        .pm-stat-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }
        .pm-stat-value img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }
        .pm-stat-sub {
          font-size: 0.72rem;
          font-weight: 500;
          color: #9ca3af;
          margin: 0;
        }

        /* Action buttons */
        .pm-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .pm-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }
        .pm-action-btn.green {
          background: #83C757;
          color: #fff;
        }
        .pm-action-btn.green:hover { background: #72b44a; }
        .pm-action-btn.gray {
          background: rgba(232, 232, 232, 1);
          color: #374151;
        }
        .pm-action-btn.gray:hover { background: #d4d4d4; }

        /* Table */
        .pm-table-card {
          background: #fff;
          border: 1.5px solid #d6e4d6;
          border-radius: 14px;
          overflow: hidden;
        }
        .pm-table {
          width: 100%;
          border-collapse: collapse;
        }
        .pm-table thead th {
          text-align: left;
          padding: 12px 14px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        .pm-table tbody td {
          padding: 14px;
          font-size: 0.78rem;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .pm-table tbody tr:last-child td { border-bottom: none; }
        .pm-table tbody tr:hover { background: #fafefe; }

        .pm-action-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 3px;
          color: #9ca3af;
          transition: color 0.15s;
        }
        .pm-action-icon:hover { color: #374151; }

        @media (max-width: 768px) {
          .pm-stats { grid-template-columns: 1fr 1fr; }
          .pm-filter-row { grid-template-columns: 1fr; gap: 1rem; }
        }
      `}</style>

      <div className="pm-page">
        {/* Header */}
        <div className="pm-header">
          <h1 className="pm-title">Gestion des paiements</h1>
          <p className="pm-subtitle">Créez et recevez/confirmez en quelques clics et en toute sécurité</p>
        </div>

        {/* Tabs */}
        <div className="pm-tabs">
          <button
            className={`pm-tab ${activeTab === "actifs" ? "active" : ""}`}
            onClick={() => setActiveTab("actifs")}
          >
            <span>✓</span> Actifs
            <span className="pm-tab-count">{loading ? "..." : payments.length}</span>
          </button>
          <button
            className={`pm-tab ${activeTab === "archives" ? "active" : ""}`}
            onClick={() => setActiveTab("archives")}
          >
            <span>📁</span> Archives
            <span className="pm-tab-count">0</span>
          </button>
        </div>

        {/* Filter */}
        <div className="pm-card">
          <p className="pm-filter-title">FILTRER - UTILISEZ LES OPTIONS CI-DESSOUS</p>
          <div className="pm-filter-row">
            <div className="pm-filter-field">
              <span className="pm-filter-label">Bien</span>
              <select className="pm-select" value={filterBien} onChange={(e) => setFilterBien(e.target.value)}>
                {biens.map((bien) => (
                  <option key={bien} value={bien}>{bien}</option>
                ))}
              </select>
            </div>
            <div className="pm-filter-field">
              <span className="pm-filter-label">Lignes par page</span>
              <select className="pm-select" value={linesPerPage} onChange={(e) => setLinesPerPage(e.target.value)}>
                <option value="25">25 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="pm-card">
          <div className="pm-search-row">
            <div className="pm-search-wrap">
              <Search size={16} className="pm-search-icon" />
              <input
                type="text"
                className="pm-search-input"
                placeholder="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="pm-btn-display" onClick={() => notify('Fonctionnalité d\'affichage en cours de développement', 'info')}>
              <Settings size={15} />
              Affichage
            </button>
          </div>
        </div>

        {/* Stats cards - with API data fallback */}
        <div className="pm-stats">
          <div className="pm-stat green">
            <p className="pm-stat-label">Loyers attendus</p>
            <p className="pm-stat-value">
              <img src="/Ressource_gestiloc/cash.png" alt="cash" />
              {statsLoading ? "..." : `${stats.totalExpected.toLocaleString("fr-FR")} FCFA`}
            </p>
            <p className="pm-stat-sub">{payments.length} paiement{payments.length !== 1 ? "s" : ""} ce mois</p>
          </div>
          <div className="pm-stat blue">
            <p className="pm-stat-label">Loyers reçus</p>
            <p className="pm-stat-value">
              <img src="/Ressource_gestiloc/checklist.png" alt="checklist" />
              {statsLoading ? "..." : `${stats.totalReceived.toLocaleString("fr-FR")} FCFA`}
            </p>
            <p className="pm-stat-sub">{payments.filter(p => p.statut === "paid").length} paiements ce mois</p>
          </div>
          <div className="pm-stat red">
            <p className="pm-stat-label">En retard</p>
            <p className="pm-stat-value">
              <img src="/Ressource_gestiloc/Error.png" alt="error" />
              {statsLoading ? "..." : `${stats.totalLate.toLocaleString("fr-FR")} FCFA`}
            </p>
            <p className="pm-stat-sub">{payments.filter(p => p.statut === "late").length} paiements en retard</p>
          </div>
          <div className="pm-stat orange">
            <p className="pm-stat-label">Taux de recouvrement</p>
            <p className="pm-stat-value">
              <img src="/Ressource_gestiloc/Bar chart.png" alt="chart" />
              {statsLoading ? "..." : `${stats.recoveryRate}%`}
            </p>
            <p className="pm-stat-sub">{payments.filter(p => p.statut === "paid").length}/{payments.length} payés</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pm-actions">
          <button 
            className="pm-action-btn green" 
            onClick={() => navigate('/proprietaire/factures/nouveau')}
            disabled={actionLoading !== null}
          >
            <Plus size={15} />
            Enregistrer un paiement
          </button>
          <button 
            className="pm-action-btn gray" 
            onClick={() => {
              // Envoyer un rappel à toutes les factures en attente/en retard
              const pendingInvoices = payments.filter(p => p.statut !== 'paid');
              if (pendingInvoices.length === 0) {
                notify("Aucune facture en attente de rappel", "info");
                return;
              }
              pendingInvoices.forEach((inv, idx) => {
                setTimeout(() => handleSendReminder(inv.id), idx * 500);
              });
            }}
            disabled={actionLoading !== null || payments.length === 0}
          >
            {actionLoading?.startsWith('remind') ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />}
            Rappels
          </button>
          <button 
            className="pm-action-btn gray" 
            onClick={() => notify("Sélectionnez une facture dans la liste pour générer la quittance", "info")}
            disabled={actionLoading !== null || payments.length === 0}
          >
            <FileText size={15} />
            Quittances
          </button>
          <button 
            className="pm-action-btn gray" 
            onClick={handleExport}
            disabled={actionLoading !== null || payments.length === 0}
          >
            {actionLoading === 'export' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Exporter
          </button>
        </div>

        {/* Table */}
        <div className="pm-table-card">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-3 text-gray-600">Chargement des factures...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
                onClick={fetchInvoices}
              >
                Réessayer
              </button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune facture trouvée</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Aucune facture ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            <table className="pm-table">
            <thead>
              <tr>
                <th>Locataire</th>
                <th>Bien</th>
                <th>Montant</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th>Date de paiement</th>
                <th>Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.locataire}</div>
                      <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{p.email}</div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 180, fontSize: "0.75rem" }}>{p.bien}</td>
                  <td style={{ fontWeight: 700 }}>{p.montant.toLocaleString("fr-FR")} FCFA</td>
                  <td>{p.echeance}</td>
                  <td>{statutBadge(p.statut)}</td>
                  <td>{p.datePaiement}</td>
                  <td>{p.mode}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button 
                        className="pm-action-icon" 
                        title="Voir"
                        onClick={() => navigate(`/proprietaire/factures/${p.id}`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                      <button 
                        className="pm-action-icon" 
                        title="Envoyer un rappel"
                        onClick={() => handleSendReminder(p.id)}
                        disabled={actionLoading === `remind-${p.id}` || p.statut === 'paid'}
                      >
                        {actionLoading === `remind-${p.id}` ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Mail size={14} />
                        )}
                      </button>
                      <button 
                        className="pm-action-icon" 
                        title="Générer quittance"
                        onClick={() => p.leaseId && handleGenerateReceipt(p.id, p.leaseId)}
                        disabled={actionLoading === `receipt-${p.id}` || p.statut !== 'paid'}
                      >
                        {actionLoading === `receipt-${p.id}` ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <FileText size={14} />
                        )}
                      </button>
                      {p.statut === 'paid' && (
                        <button 
                          className="pm-action-icon" 
                          title="Rembourser"
                          onClick={() => openRefundModal(p)}
                          disabled={actionLoading === `refund-${p.id}` || actionLoading === `reject-${p.id}`}
                          style={{ color: '#f59e0b' }}
                        >
                          {actionLoading === `refund-${p.id}` ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Undo2 size={14} />
                          )}
                        </button>
                      )}
                      {p.statut === 'paid' && (
                        <button 
                          className="pm-action-icon" 
                          title="Rejeter"
                          onClick={() => openRejectModal(p)}
                          disabled={actionLoading === `refund-${p.id}` || actionLoading === `reject-${p.id}`}
                          style={{ color: '#ef4444' }}
                        >
                          {actionLoading === `reject-${p.id}` ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <XCircle size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Modal de création de facture */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Nouvelle facture</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#6b7280' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateInvoice}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Bail *
                  </label>
                  <select
                    className="pm-select"
                    value={formData.lease_id}
                    onChange={(e) => setFormData({ ...formData, lease_id: e.target.value ? Number(e.target.value) : "" })}
                    required
                  >
                    <option value="">Sélectionner un bail</option>
                    {leases.map((lease) => (
                      <option key={lease.id} value={lease.id}>
                        {lease.tenant?.full_name} - {lease.property?.name || lease.property?.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Type de facture *
                  </label>
                  <select
                    className="pm-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "rent" | "deposit" | "charge" | "repair" })}
                    required
                  >
                    <option value="rent">Loyer</option>
                    <option value="deposit">Dépôt de garantie</option>
                    <option value="charge">Charge</option>
                    <option value="repair">Réparation</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Date d'échéance *
                    </label>
                    <input
                      type="date"
                      className="pm-select"
                      value={formData.due_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Montant total (FCFA) *
                    </label>
                    <input
                      type="number"
                      className="pm-select"
                      value={formData.amount_total}
                      onChange={(e) => setFormData({ ...formData, amount_total: e.target.value })}
                      placeholder="Ex: 150000"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Période début
                    </label>
                    <input
                      type="date"
                      className="pm-select"
                      value={formData.period_start}
                      onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Période fin
                    </label>
                    <input
                      type="date"
                      className="pm-select"
                      value={formData.period_end}
                      onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Mode de paiement
                  </label>
                  <select
                    className="pm-select"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="fedapay">Fedapay (Paiement en ligne)</option>
                    <option value="virement">Virement bancaire</option>
                    <option value="especes">Espèces</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="pm-action-btn gray"
                    style={{ padding: '10px 20px' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="pm-action-btn green"
                    style={{ padding: '10px 20px' }}
                    disabled={creatingInvoice}
                  >
                    {creatingInvoice ? (
                      <><Loader2 size={15} className="animate-spin" /> Création...</>
                    ) : (
                      <><Plus size={15} /> Créer la facture</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de remboursement */}
        {showRefundModal && selectedPayment && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: '24px',
              width: '90%',
              maxWidth: '450px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                  <Undo2 size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Rembourser le paiement
                </h2>
                <button 
                  onClick={() => setShowRefundModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#6b7280' }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '20px', padding: '12px', background: '#fef3c7', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong>Locataire:</strong> {selectedPayment.locataire}<br />
                  <strong>Montant:</strong> {selectedPayment.montant.toLocaleString("fr-FR")} FCFA
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Motif du remboursement (optionnel)
                </label>
                <textarea
                  className="pm-select"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Entrez le motif du remboursement..."
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="pm-action-btn gray"
                  style={{ padding: '10px 20px' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleRefund}
                  className="pm-action-btn"
                  style={{ padding: '10px 20px', background: '#f59e0b', color: '#fff' }}
                  disabled={actionLoading !== null}
                >
                  {actionLoading !== null ? (
                    <><Loader2 size={15} className="animate-spin" /> Traitement...</>
                  ) : (
                    <><Undo2 size={15} /> Confirmer le remboursement</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de rejet */}
        {showRejectModal && selectedPayment && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: '24px',
              width: '90%',
              maxWidth: '450px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>
                  <XCircle size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Rejeter le paiement
                </h2>
                <button 
                  onClick={() => setShowRejectModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#6b7280' }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '20px', padding: '12px', background: '#fee2e2', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong>Locataire:</strong> {selectedPayment.locataire}<br />
                  <strong>Montant:</strong> {selectedPayment.montant.toLocaleString("fr-FR")} FCFA
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Motif du rejet (optionnel)
                </label>
                <textarea
                  className="pm-select"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Entrez le motif du rejet..."
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="pm-action-btn gray"
                  style={{ padding: '10px 20px' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  className="pm-action-btn"
                  style={{ padding: '10px 20px', background: '#ef4444', color: '#fff' }}
                  disabled={actionLoading !== null}
                >
                  {actionLoading !== null ? (
                    <><Loader2 size={15} className="animate-spin" /> Traitement...</>
                  ) : (
                    <><XCircle size={15} /> Confirmer le rejet</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Payments;
