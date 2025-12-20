import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Loader2, Send, FileText, X } from "lucide-react";
import { noticeService } from "../../../services/noticeService";
import tenantApi, { TenantLease } from "../services/tenantApi"; // (ton fichier tenantApi existant)

type NoticeStatus = "pending" | "confirmed" | "cancelled";

const isoToday = () => new Date().toISOString().slice(0, 10);

const badge = (s: NoticeStatus) => {
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold";
  if (s === "confirmed") return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  if (s === "cancelled") return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  return `${base} border-amber-200 bg-amber-50 text-amber-800`;
};

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

  // form
  const [leaseId, setLeaseId] = useState<number | "">("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const inputBase =
    "w-full rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 " +
    "border border-blue-200 px-4 py-3 text-sm font-semibold shadow-sm " +
    "focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400";

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const l = await tenantApi.getLeases();
      setLeases(l);

      const n = await noticeService.list(); // backend renvoie selon rôle
      setNotices(Array.isArray(n) ? n : []);

      if (l?.[0]?.id) setLeaseId(l[0].id);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Impossible de charger les préavis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
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
    if (!leaseId) return setError("Choisis un bail.");
    if (!endDate) return setError("Choisis une date de sortie.");
    if (!reason.trim()) return setError("Ajoute une raison.");

    setBusy(true);
    try {
      await noticeService.create({
        lease_id: Number(leaseId),
        end_date: endDate,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        // notice_date optionnel: sinon backend met today()
      });

      notify?.("Demande de préavis envoyée au propriétaire", "success");
      setEndDate("");
      setReason("");
      setNotes("");

      await fetchAll();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Erreur lors de l’envoi.";
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
      const msg = e?.response?.data?.message || "Impossible d’annuler.";
      notify?.(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-700 font-bold">
          <Loader2 className="animate-spin" /> Chargement…
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Préavis</h1>
        <p className="mt-1 text-sm font-semibold text-gray-600">
          Fais une demande de sortie. Le propriétaire pourra confirmer et organiser la suite.
        </p>
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
              value={leaseId}
              onChange={(e) => setLeaseId(e.target.value ? Number(e.target.value) : "")}
              className={`${inputBase} mt-2`}
            >
              {leases.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.property?.address} — {l.property?.city}
                </option>
              ))}
            </select>

            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                Bien concerné
              </div>
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
                type="date"
                value={endDate}
                min={isoToday()}
                onChange={(e) => setEndDate(e.target.value)}
                className={`${inputBase} pl-12`}
              />
            </div>

            <div className="mt-4">
              <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Raison</div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`${inputBase} mt-2 min-h-[110px] resize-none`}
                placeholder="Ex : Mutation pro, changement de ville, achat immobilier…"
              />
            </div>

            <div className="mt-4">
              <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Notes (optionnel)</div>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputBase} mt-2`}
                placeholder="Ex : dispo visites le samedi, remise des clés…"
              />
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
                      <span className="text-gray-900 font-extrabold">{String(n.end_date).slice(0, 10)}</span>
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
}
