import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, RefreshCw, Save, X, Pencil } from "lucide-react";
import { leaseService, noticeService } from "@/services/api";

type NoticeStatus = "pending" | "confirmed" | "cancelled";
type LeaseLite = any;

type Notice = {
  id: number;
  property_id: number;
  landlord_id: number;
  tenant_id: number;
  type: "landlord" | "tenant";
  reason: string;
  notice_date: string;
  end_date: string;
  status: NoticeStatus;
  notes?: string | null;
  created_at: string;

  property?: { id: number; address: string; city?: string | null };
  tenant?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
};

const isoToday = () => new Date().toISOString().slice(0, 10);

const statusLabel = (s: NoticeStatus) => {
  if (s === "pending") return "En attente";
  if (s === "confirmed") return "Confirmé";
  return "Annulé";
};

const statusBadgeClasses = (s: NoticeStatus) => {
  if (s === "confirmed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

export const PreavisList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [leases, setLeases] = useState<LeaseLite[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | "">("");
  const [releaseDate, setReleaseDate] = useState<string>(isoToday());
  const [notes, setNotes] = useState<string>("");

  // Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<NoticeStatus>("pending");
  const [editNotes, setEditNotes] = useState<string>("");

  const selectedLease = useMemo(() => {
    if (!selectedLeaseId) return null;
    return leases.find((l: any) => Number(l.id) === Number(selectedLeaseId)) || null;
  }, [selectedLeaseId, leases]);

  const computedPropertyId = useMemo(() => {
    return selectedLease?.property_id ?? selectedLease?.property?.id ?? null;
  }, [selectedLease]);

  const tenantLabel = useMemo(() => {
    const t = selectedLease?.tenant;
    if (!t) return "—";
    const name = `${t.first_name || ""} ${t.last_name || ""}`.trim();
    return name || t.email || "Locataire";
  }, [selectedLease]);

  const propertyLabel = useMemo(() => {
    const p = selectedLease?.property;
    if (!p) return "—";
    const city = p.city ? `, ${p.city}` : "";
    return `${p.address || "Sans adresse"}${city}`;
  }, [selectedLease]);

  const computedReason = useMemo(() => {
    const address = selectedLease?.property?.address || "Logement";
    const city = selectedLease?.property?.city ? ` (${selectedLease.property.city})` : "";
    return `Préavis de libération du logement${city} – ${address}`;
  }, [selectedLease]);

  const fetchAll = async () => {
    try {
      setError(null);
      setLoading(true);

      const [leasesRes, noticesRes] = await Promise.all([
        leaseService.listLeases(),
        noticeService.list(),
      ]);

      setLeases(Array.isArray(leasesRes) ? leasesRes : []);
      setNotices(Array.isArray(noticesRes) ? (noticesRes as any) : []);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetCreate = () => {
    setSelectedLeaseId("");
    setReleaseDate(isoToday());
    setNotes("");
  };

  const handleCreate = async () => {
    if (!selectedLease || !computedPropertyId) {
      setError("Choisis une location valide.");
      return;
    }
    if (!releaseDate) {
      setError("Choisis une date de libération.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await noticeService.create({
        property_id: Number(computedPropertyId),
        lease_id: Number(selectedLease.id), // backend déduit le tenant
        type: "landlord",
        reason: computedReason,
        notice_date: isoToday(),
        end_date: releaseDate,
        notes: notes || undefined,
      });

      setOpenCreate(false);
      resetCreate();
      await fetchAll();
    } catch (e: any) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Erreur lors de la création"
      );
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (n: Notice) => {
    setEditingId(n.id);
    setEditStatus(n.status);
    setEditNotes(n.notes || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus("pending");
    setEditNotes("");
  };

  const saveEdit = async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      await noticeService.update(id, { status: editStatus, notes: editNotes || null });
      await fetchAll();
      cancelEdit();
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Erreur lors de la mise à jour");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer ce préavis ?")) return;
    setBusy(true);
    setError(null);
    try {
      await noticeService.delete(id);
      await fetchAll();
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Erreur lors de la suppression");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-200">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Préavis</h1>
          <p className="text-slate-600 mt-1">
            Crée, modifie et supprime les préavis (propriétaire).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4 text-blue-700" />
            Actualiser
          </button>

          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nouveau préavis
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      )}

      {/* Create Modal */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-blue-700">Créer un préavis</h2>
              <button
                onClick={() => {
                  setOpenCreate(false);
                  resetCreate();
                }}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-4">
              {/* Lease Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Location (bail)
                </label>

                <select
                  value={selectedLeaseId}
                  onChange={(e) => setSelectedLeaseId(e.target.value ? Number(e.target.value) : "")}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">— Choisir une location —</option>
                  {leases.map((l: any) => {
                    const addr = l.property?.address || `Bien #${l.property_id}`;
                    const t = l.tenant ? `${l.tenant.first_name || ""} ${l.tenant.last_name || ""}`.trim() : "";
                    const label = `${addr}${t ? ` — ${t}` : ""}`;
                    return (
                      <option key={l.id} value={l.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-xs text-slate-500">Bien</div>
                    <div className="text-sm font-medium text-blue-700">{propertyLabel}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-xs text-slate-500">Locataire</div>
                    <div className="text-sm font-medium text-blue-700">{tenantLabel}</div>
                  </div>
                </div>
              </div>

              {/* Reason (readonly, auto) */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Motif (auto)
                </label>
                <input
                  value={computedReason}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-blue-700"
                />
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Date de libération (fin du préavis)
                </label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-blue-700 outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Le préavis est enregistré avec <span className="font-medium text-blue-700">notice_date = aujourd’hui</span>.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Ex : remise des clés, visite de sortie, instructions…"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-blue-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                onClick={() => {
                  setOpenCreate(false);
                  resetCreate();
                }}
                disabled={busy}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={busy || !selectedLeaseId}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-3">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-blue-700">{notices.length}</span> préavis
          </p>
        </div>

        {notices.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500">
            Aucun préavis pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {notices.map((n) => {
              const isEditing = editingId === n.id;

              return (
                <div key={n.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-blue-700">{n.reason}</div>
                      <div className="text-xs text-slate-600">
                        Bien: {n.property?.address || `#${n.property_id}`} • Notice: {String(n.notice_date).slice(0, 10)} • Libération:{" "}
                        {String(n.end_date).slice(0, 10)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!isEditing ? (
                        <>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClasses(
                              n.status
                            )}`}
                          >
                            {statusLabel(n.status)}
                          </span>

                          <button
                            onClick={() => startEdit(n)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <Pencil className="h-4 w-4 text-blue-700" />
                            Modifier
                          </button>

                          <button
                            onClick={() => remove(n.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </>
                      ) : (
                        <>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as NoticeStatus)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-blue-700 outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="cancelled">Annulé</option>
                          </select>

                          <button
                            onClick={() => saveEdit(n.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            Sauver
                          </button>

                          <button
                            onClick={cancelEdit}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    {!isEditing ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {n.notes ? n.notes : <span className="text-slate-400">Aucune note</span>}
                      </div>
                    ) : (
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-blue-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Notes…"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreavisList;
