import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Loader2, Send, FileText, X, Plus, Trash2, ChevronDown, Search, ArrowLeft, History } from "lucide-react";
import { noticeService } from "../../../services/noticeService";
import tenantApi, { TenantLease } from "../services/tenantApi";
import { Card } from "./ui/Card";

type NoticeStatus = "pending" | "confirmed" | "cancelled";
const isoToday = () => new Date().toISOString().slice(0, 10);

const badge = (s: NoticeStatus) => {
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold";
  if (s === "confirmed") return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  if (s === "cancelled") return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  return `${base} border-amber-200 bg-amber-50 text-amber-800`;
};

type ApiErr = {
  response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
  request?: unknown;
  message?: string;
};

function looksTechnical(msg?: string) {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("sql") ||
    m.includes("exception") ||
    m.includes("stack") ||
    m.includes("trace") ||
    m.includes("undefined") ||
    m.includes("vendor/") ||
    m.includes("laravel") ||
    m.includes("symfony")
  );
}

function normalizeApiError(err: ApiErr, fallback: string) {
  if (err?.request && !err?.response) return "Le serveur ne répond pas. Vérifie ta connexion puis réessaie.";

  const status = err?.response?.status;

  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessaie dans quelques instants.";

  const backendMsg = err?.response?.data?.message?.trim();
  if (backendMsg && !looksTechnical(backendMsg)) return backendMsg;

  return fallback;
}

type FormErrors = Partial<{
  leaseId: string;
  endDate: string;
  reason: string;
  notes: string;
}>;

// Types pour le nouveau formulaire
interface PreavisFormData {
  typeLocation: string;
  dateDepart: string;
  dateEnvoi: string;
  commentaires: string;
  nouvelleAdresse: string;
  motifDepart: string;
}

export default function TenantPreavisPage({
  notify,
}: {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [leases, setLeases] = useState<TenantLease[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // View states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showOldPage, setShowOldPage] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Nouveau formulaire state
  const [formData, setFormData] = useState<PreavisFormData>({
    typeLocation: '',
    dateDepart: '',
    dateEnvoi: '',
    commentaires: '',
    nouvelleAdresse: '',
    motifDepart: '',
  });

  // Ancien form
  const [leaseId, setLeaseId] = useState<number | "">("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // ✅ client-side errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // ✅ refs focus
  const leaseRef = useRef<HTMLSelectElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  const reasonRef = useRef<HTMLTextAreaElement | null>(null);

  const inputBase =
    "w-full rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 " +
    "border border-blue-200 px-4 py-3 text-sm font-semibold shadow-sm " +
    "focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400";

  const errorText = "text-xs text-rose-700 font-bold mt-2";

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!leaseId) errs.leaseId = "Choisis un bail.";
    if (!endDate) errs.endDate = "Choisis une date de sortie.";
    else if (endDate < isoToday()) errs.endDate = "La date de sortie doit être au minimum aujourd'hui.";

    if (!reason.trim()) errs.reason = "Ajoute une raison.";
    else if (reason.trim().length < 5) errs.reason = "La raison doit contenir au moins 5 caractères.";

    if (notes.trim() && notes.trim().length < 3) errs.notes = "Notes trop courtes (au moins 3 caractères).";

    return errs;
  };

  const focusFirstError = (errs: FormErrors) => {
    if (errs.leaseId) leaseRef.current?.focus();
    else if (errs.endDate) endDateRef.current?.focus();
    else if (errs.reason) reasonRef.current?.focus();
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const l = await tenantApi.getLeases();
      setLeases(l);

      const n = await noticeService.list();
      setNotices(Array.isArray(n) ? n : []);

      if (l?.[0]?.id) setLeaseId(l[0].id);
    } catch (e: any) {
      const err = e as ApiErr;
      console.error("fetchAll error:", err);

      const msg = normalizeApiError(err, "Impossible de charger les préavis.");
      setError(msg);
      notify?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await fetchAll();
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLease = useMemo(() => {
    if (!leaseId) return null;
    return leases.find((x) => Number(x.id) === Number(leaseId)) || null;
  }, [leases, leaseId]);

  const propertyLine = useMemo(() => {
    const p = selectedLease?.property;
    if (!p) return "—";
    return [p.address, p.city].filter(Boolean).join(" • ");
  }, [selectedLease]);

  const handleSubmit = async () => {
    setError(null);

    const errs = validate();
    setFormErrors(errs);

    if (Object.keys(errs).length > 0) {
      const msg = Object.values(errs)[0] || "Vérifie le formulaire.";
      setError(msg);
      notify?.(msg, "error");
      focusFirstError(errs);
      return;
    }

    setBusy(true);
    try {
      await noticeService.create({
        lease_id: Number(leaseId),
        end_date: endDate,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });

      notify?.("Demande de préavis envoyée au propriétaire", "success");

      setEndDate("");
      setReason("");
      setNotes("");
      setFormErrors({});

      await fetchAll();
    } catch (e: any) {
      const err = e as ApiErr;
      console.error("create notice error:", err);

      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const be = err.response.data.errors;
        const mapped: FormErrors = {};

        if (be.lease_id) mapped.leaseId = be.lease_id?.[0] || "Bail invalide.";
        if (be.end_date) mapped.endDate = be.end_date?.[0] || "Date de sortie invalide.";
        if (be.reason) mapped.reason = be.reason?.[0] || "Raison invalide.";
        if (be.notes) mapped.notes = be.notes?.[0] || "Notes invalides.";

        setFormErrors((p) => ({ ...p, ...mapped }));

        const msg = "Certains champs sont invalides. Vérifie le formulaire.";
        setError(msg);
        notify?.(msg, "error");
        focusFirstError(mapped);
        setBusy(false);
        return;
      }

      const msg = normalizeApiError(err, "Erreur lors de l'envoi.");
      setError(msg);
      notify?.(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const cancelMyNotice = async (id: number) => {
    setBusy(true);
    try {
      await noticeService.update(id, { status: "cancelled" });
      await fetchAll();
      notify?.("Préavis annulé", "success");
    } catch (e: any) {
      const err = e as ApiErr;
      console.error("cancel notice error:", err);

      const msg = normalizeApiError(err, "Impossible d'annuler.");
      notify?.(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  // Nouveau formulaire handlers
  const handleNewSubmit = async () => {
    if (!formData.motifDepart) {
      notify?.("Veuillez sélectionner un motif de départ", "error");
      return;
    }
    if (!formData.dateDepart) {
      notify?.("Veuillez sélectionner une date de départ", "error");
      return;
    }

    setBusy(true);
    try {
      await noticeService.create({
        lease_id: leases[0]?.id || 1,
        end_date: formData.dateDepart,
        reason: formData.motifDepart,
        notes: formData.commentaires || undefined,
      });

      notify?.("Préavis créé avec succès", "success");
      setShowCreateForm(false);
      setFormData({
        typeLocation: '',
        dateDepart: '',
        dateEnvoi: '',
        commentaires: '',
        nouvelleAdresse: '',
        motifDepart: '',
      });
      await fetchAll();
    } catch (e: any) {
      notify?.("Erreur lors de la création du préavis", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    try {
      // Try to cancel via API first
      await noticeService.update(id, { status: "cancelled" });
      setNotices(prev => prev.filter(n => n.id !== id));
      notify?.("Préavis supprimé", "success");
    } catch (e) {
      // If API fails, delete locally
      setNotices(prev => prev.filter(n => n.id !== id));
      notify?.("Préavis supprimé (local)", "success");
    }
  };

  // Empty state illustration
  const EmptyStateIllustration = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <circle cx="100" cy="80" r="60" fill="#FFF5F5"/>
        <circle cx="70" cy="60" r="8" fill="#FFB6B6"/>
        <circle cx="130" cy="50" r="6" fill="#FFD6D6"/>
        <circle cx="140" cy="90" r="4" fill="#FFE6E6"/>
        <rect x="85" y="40" width="30" height="40" rx="4" fill="#7CB342" opacity="0.8"/>
        <rect x="80" y="50" width="40" height="30" rx="3" fill="#8BC34A"/>
        <rect x="90" y="45" width="20" height="25" rx="2" fill="#AED581"/>
        <circle cx="100" cy="100" r="25" fill="#FFCCBC" opacity="0.6"/>
        <path d="M85 95 Q100 85 115 95" stroke="#8D6E63" strokeWidth="2" fill="none"/>
        <circle cx="92" cy="90" r="3" fill="#5D4037"/>
        <circle cx="108" cy="90" r="3" fill="#5D4037"/>
        <ellipse cx="100" cy="98" rx="4" ry="3" fill="#5D4037"/>
        <rect x="75" y="110" width="12" height="25" rx="6" fill="#FFCCBC"/>
        <rect x="113" y="110" width="12" height="25" rx="6" fill="#FFCCBC"/>
        <rect x="70" y="100" width="15" height="20" rx="7" fill="#FFAB91"/>
        <rect x="115" y="100" width="15" height="20" rx="7" fill="#FFAB91"/>
        <path d="M60 70 Q55 60 65 55" stroke="#8BC34A" strokeWidth="2" fill="none"/>
        <circle cx="65" cy="55" r="3" fill="#8BC34A"/>
        <path d="M140 75 Q145 65 135 60" stroke="#8BC34A" strokeWidth="2" fill="none"/>
        <circle cx="135" cy="60" r="3" fill="#8BC34A"/>
      </svg>
      <button
        onClick={() => setShowCreateForm(true)}
        className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
        style={{ background: 'rgba(82, 157, 33, 1)' }}
      >
        Ajouter un préavis
      </button>
    </div>
  );

  // List view
  const ListView = () => (
    <div className="space-y-4">
      {/* Top buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Old page button */}
        <button
          onClick={() => setShowOldPage(true)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <History size={16} />
          Voir l'ancienne page
        </button>

        {/* New preavis button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
          style={{ background: 'rgba(82, 157, 33, 1)' }}
        >
          <Plus size={18} />
          Ajouter un préavis
        </button>
      </div>

      {/* Filter Card */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Filtre</h3>
        
        <div className="flex flex-col gap-3">
          {/* Items per page dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowItemsDropdown(!showItemsDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-gray-700 bg-white hover:border-gray-400 transition-colors text-sm"
              style={{ borderColor: 'rgba(82, 157, 33, 0.5)' }}
            >
              <span className="text-gray-400">{itemsPerPage} lignes</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            {showItemsDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {['10', '25', '50', '100'].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setItemsPerPage(n); setShowItemsDropdown(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                  >
                    {n} lignes
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ borderColor: 'rgba(82, 157, 33, 0.5)' }}
            />
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Nom</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Date de départ du préavis</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Date d'envoi du préavis</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Motif du départ</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyStateIllustration />
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {selectedLease?.property?.address || 'Location'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{propertyLine}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {notice.end_date ? String(notice.end_date).slice(0, 10) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {notice.notice_date ? String(notice.notice_date).slice(0, 10) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{notice.reason || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} className="text-gray-500 hover:text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with checkbox */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
          <input type="checkbox" className="rounded border-gray-300" />
          <span className="text-sm text-gray-700">Tout</span>
        </div>
      </Card>
    </div>
  );

  // Create form view
  const CreateFormView = () => (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowCreateForm(false)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
      </div>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau préavis</h1>
        <p className="text-sm text-gray-600">Remplissez ce formulaire pour notifier officiellement votre départ.</p>
      </div>

      {/* Information Card */}
      <Card className="p-4 border-l-4 border-l-orange-300 bg-orange-50">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Informations</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Délai de préavis légal :</strong><br/>
          Pour une location vide : 3 mois de préavis.<br/>
          Pour une location meublée : 1 mois de préavis.<br/>
          Dans certains cas (mutation professionnelle, perte d'emploi, etc.), le délai peut être réduit à 1 mois.
        </p>
      </Card>

      {/* CREATE FORM */}
      <Card className="p-6">
        <div className="space-y-6 max-w-2xl">
          {/* Type de location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de location</label>
            <select
              value={formData.typeLocation}
              onChange={(e) => setFormData({ ...formData, typeLocation: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="">Sélectionner</option>
              <option value="vide">Location vide</option>
              <option value="meublee">Location meublée</option>
            </select>
          </div>

          {/* Date de départ souhaitée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de départ souhaitée</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.dateDepart}
                onChange={(e) => setFormData({ ...formData, dateDepart: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                placeholder="jj/mm/aaaa"
              />
            </div>
          </div>

          {/* Date d'envoi du préavis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'envoi du préavis</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.dateEnvoi}
                onChange={(e) => setFormData({ ...formData, dateEnvoi: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                placeholder="jj/mm/aaaa"
              />
            </div>
          </div>

          {/* Motif du départ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif du départ</label>
            <select
              value={formData.motifDepart}
              onChange={(e) => setFormData({ ...formData, motifDepart: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="">Sélectionnez...</option>
              <option value="mutation">Mutation professionnelle</option>
              <option value="perte_emploi">Perte d'emploi</option>
              <option value="achat">Achat d'un logement</option>
              <option value="rapprochement">Rapprochement familial</option>
              <option value="sante">Raison de santé</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Commentaires additionnels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires additionnels</label>
            <textarea
              value={formData.commentaires}
              onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 min-h-[100px]"
              placeholder="Ajouter un commentaire..."
            />
          </div>

          {/* Nouvelle adresse postale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouvelle adresse postale</label>
            <input
              type="text"
              value={formData.nouvelleAdresse}
              onChange={(e) => setFormData({ ...formData, nouvelleAdresse: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              placeholder="Nouvelle adresse..."
            />
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              × Annuler
            </button>
            <button
              onClick={handleNewSubmit}
              disabled={busy}
              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-60"
              style={{ background: 'rgba(82, 157, 33, 1)' }}
            >
              {busy ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Ancienne page view
  const OldPageView = () => (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Préavis (Ancienne version)</h1>
          <p className="mt-1 text-sm font-semibold text-gray-600">
            Ancienne page de gestion des préavis.
          </p>
        </div>
        <button
          onClick={() => setShowOldPage(false)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} />
          Retour à la nouvelle page
        </button>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-800 font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Bail</div>
            <select
              ref={leaseRef}
              value={leaseId}
              onChange={(e) => {
                setLeaseId(e.target.value ? Number(e.target.value) : "");
                if (formErrors.leaseId) setFormErrors((p) => ({ ...p, leaseId: undefined }));
              }}
              className={`${inputBase} mt-2`}
            >
              {leases.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.property?.address} — {l.property?.city}
                </option>
              ))}
            </select>
            {formErrors.leaseId ? <div className={errorText}>{formErrors.leaseId}</div> : null}

            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-xs font-extrabold tracking-wide text-blue-700 uppercase">Bien concerné</div>
              <div className="mt-1 text-sm font-extrabold text-gray-900">{propertyLine}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Date de sortie</div>
            <div className="mt-2 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar size={18} />
              </div>
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                min={isoToday()}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (formErrors.endDate) setFormErrors((p) => ({ ...p, endDate: undefined }));
                }}
                className={`${inputBase} pl-12`}
              />
            </div>
            {formErrors.endDate ? <div className={errorText}>{formErrors.endDate}</div> : null}

            <div className="mt-4">
              <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Raison</div>
              <textarea
                ref={reasonRef}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (formErrors.reason) setFormErrors((p) => ({ ...p, reason: undefined }));
                }}
                className={`${inputBase} mt-2 min-h-[110px] resize-none`}
                placeholder="Ex : Mutation pro, changement de ville, achat immobilier…"
              />
              {formErrors.reason ? <div className={errorText}>{formErrors.reason}</div> : null}
            </div>

            <div className="mt-4">
              <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Notes (optionnel)</div>
              <input
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (formErrors.notes) setFormErrors((p) => ({ ...p, notes: undefined }));
                }}
                className={`${inputBase} mt-2`}
                placeholder="Ex : dispo visites le samedi, remise des clés…"
              />
              {formErrors.notes ? <div className={errorText}>{formErrors.notes}</div> : null}
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={handleSubmit}
              className="
                mt-4 w-full rounded-2xl bg-blue-600 text-white
                px-4 py-3 text-sm font-extrabold
                hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition inline-flex items-center justify-center gap-2
              "
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Envoyer la demande
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="rounded-3xl border border-blue-200 bg-white shadow-sm">
        <div className="border-b border-blue-100 px-6 py-4">
          <div className="text-lg font-extrabold text-gray-900 inline-flex items-center gap-2">
            <FileText size={18} className="text-blue-700" />
            Historique
          </div>
          <div className="text-sm font-semibold text-gray-600">Tes préavis et leur statut.</div>
        </div>

        {notices.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-600 font-semibold">
            Aucun préavis pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-blue-100">
            {notices.map((n: any) => (
              <div key={n.id} className="px-6 py-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm md:text-base font-extrabold text-gray-900 truncate">
                        {n.reason}
                      </div>
                      <span className={badge(n.status)}>{n.status}</span>
                      {n.type ? (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-700">
                          {n.type === "tenant" ? "Demande locataire" : "Préavis bailleur"}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 text-sm font-semibold text-gray-600">
                      Notice: {String(n.notice_date).slice(0, 10)} • Sortie:{" "}
                      <span className="text-gray-900 font-extrabold">
                        {String(n.end_date).slice(0, 10)}
                      </span>
                    </div>

                    <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-gray-800 whitespace-pre-line">
                      {n.notes ? n.notes : <span className="text-gray-500">Aucune note</span>}
                    </div>
                  </div>

                  {n.status === "pending" ? (
                    <button
                      disabled={busy}
                      onClick={() => cancelMyNotice(n.id)}
                      className="
                        mt-2 md:mt-0 inline-flex items-center gap-2
                        rounded-2xl border border-rose-200 bg-rose-50
                        px-4 py-3 text-sm font-extrabold text-rose-700
                        hover:bg-rose-100 disabled:opacity-60
                      "
                      type="button"
                    >
                      <X size={18} /> Annuler
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-700 font-bold">
          <Loader2 className="animate-spin" /> Chargement…
        </div>
      </div>
    );
  }

  if (showOldPage) {
    return <OldPageView />;
  }

  if (showCreateForm) {
    return <CreateFormView />;
  }

  return <ListView />;
}
