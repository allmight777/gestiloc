import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  FileText,
  Loader2,
  AlertTriangle,
  X,
  Building,
  User,
  ShieldAlert,
  Users,
  Key,
  CheckCircle, // Import de l'icône de succès
} from "lucide-react";

import {
  propertyService,
  tenantService,
  leaseService,
  type Property,
  type TenantIndexResponse,
} from "@/services/api";

// Styles existants conservés
const styles = `
  .form-container { min-height: 100vh; background:#fff; padding:2rem; }
  .form-card { max-width:1200px; margin:0 auto; background:#fff; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.3); overflow:hidden; }
  .form-header { background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:2.5rem; color:#fff;  }
  .form-header h1{ font-size:2rem; font-weight:700; margin:0 0 .5rem 0; display:flex; align-items:center; gap:.75rem;  color: white; }
  .form-header p{ margin:0; opacity:.9; font-size:1rem;  color: white; }

  .form-body{ padding:2.5rem; }
  .section{ margin-bottom:2.5rem; background:#f8f9fa; padding:2rem; border-radius:12px; border:1px solid #e9ecef; }
  .section-title{ font-size:1.25rem; font-weight:600; color:#2d3748; margin:0 0 1.5rem 0; padding-bottom:.75rem; border-bottom:2px solid #667eea; display:flex; align-items:center; gap:.5rem; }

  .form-grid{ display:grid; gap:1.5rem; }
  .form-grid-2{ grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); }
  .form-group{ display:flex; flex-direction:column; gap:.5rem; }
  .form-label{ font-size:.875rem; font-weight:600; color:#4a5568; display:flex; align-items:center; gap:.25rem; }
  .required{ color:#e53e3e; }

  .form-input,.form-select,.form-textarea{
    width:100%; padding:.75rem 1rem; border:2px solid #e2e8f0; border-radius:8px;
    font-size:1rem; color:#2d3748; background:#fff; transition:all .2s ease; font-family:inherit;
  }
  .top-actions{ display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
  .button{
    padding:.75rem 1.5rem; border-radius:8px; font-weight:600; font-size:.875rem;
    cursor:pointer; transition:all .2s ease; border:none; display:inline-flex; align-items:center; gap:.5rem;
  }
  .button-primary{ background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#fff; }
  .button-secondary{ background:#fff; color:#667eea; border:2px solid #667eea; }

  .banner{
    border-radius:12px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; display:flex;
    align-items:flex-start; justify-content:space-between; gap: 12px; border: 1px solid rgba(102,126,234,.25);
    background: rgba(102,126,234,.08); color:#2d3748;
  }
  .banner-danger{ border-color:#fed7d7; background:#fff5f5; color:#742a2a; }
  .banner-success{ border-color:#c6f6d5; background:#f0fff4; color:#22543d; }
  .banner-title{ font-weight:800; display:flex; align-items:center; gap:10px; }
  .banner-text{ margin-top: 4px; font-size:.95rem; font-weight:600; opacity:.9; }
  .banner-close{ background:transparent; border:none; cursor:pointer; color:inherit; }

  .stats-container { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; margin-bottom: 20px; }
  .stat-badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; }
  .stat-badge-available { background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; }
`;

// --- Composants Internes ---
const CheckIcon = () => <CheckCircle size={18} />;

export const NouvelleLocation: React.FC = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<any | null>(null);

  const [banner, setBanner] = useState<{
    kind: "error" | "success" | "info";
    title: string;
    text?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    propertyId: "",
    tenantId: "",
    startDate: "",
    endDate: "",
    rent: "",
    deposit: "",
    type: "nu" as "nu" | "meuble",
    status: "active", // ✅ Statut forcé à "active" (Loué) pour éviter le mode "Disponible"
    details: "",
  });

  const propertyRef = useRef<HTMLSelectElement | null>(null);

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingLists(true);
        const [propsRes, tenantsRes] = await Promise.all([
          propertyService.listProperties(),
          tenantService.listTenants()
        ]);

        const propsArray = propsRes.data ?? [];
        setProperties(propsArray.map((p: any) => ({
          id: p.id,
          // ✅ Utilisation du nom/label si dispo, sinon adresse
          label: p.name || `${p.address}${p.city ? `, ${p.city}` : ""}`,
          suggestedRent: p.rent_amount,
          category: p.delegation_type === 'agency' ? 'delegated_agency' : (p.current_tenants?.length > 0 ? 'occupied' : 'available'),
          isAvailable: p.delegation_type !== 'agency' && (p.current_tenants?.length === 0 || p.delegation_type === 'co_owner')
        })));

        setTenants((tenantsRes.tenants ?? []).map((t: any) => ({
          id: t.id,
          label: `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || t.email
        })));
      } catch (e) {
        setBanner({ kind: "error", title: "Erreur", text: "Impossible de charger les données." });
      } finally {
        setIsLoadingLists(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setApiErrors(null);

    try {
      const payload = {
        property_id: Number(formData.propertyId),
        tenant_id: Number(formData.tenantId),
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        rent_amount: Number(formData.rent),
        deposit: formData.deposit ? Number(formData.deposit) : null,
        type: formData.type,
        status: "active", // ✅ On s'assure que le bien passe en statut "Loué" côté API
        terms: formData.details ? [formData.details] : [],
      };

      await leaseService.createLease(payload as any);

      // ✅ Modification du message de succès selon le style demandé
      setBanner({
        kind: "success",
        title: "✅ Contrat enregistré avec succès",
        text: "Le bien est désormais marqué comme loué et le bail a été ajouté à votre dossier.",
      });

      // Petite tempo pour laisser voir le message avant redirection
      setTimeout(() => navigate("/proprietaire"), 2000);
    } catch (e: any) {
      setBanner({ kind: "error", title: "Erreur", text: "Une erreur est survenue lors de la création." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <h1><FileText size={32} /> Nouveau contrat de location</h1>
            <p>Enregistrez une nouvelle mise en location pour l'un de vos biens</p>
          </div>

          <div className="form-body">
            {/* Bannière de succès ou d'erreur */}
            {banner && (
              <div className={`banner banner-${banner.kind}`}>
                <div>
                  <div className="banner-title">
                    {banner.kind === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    <span>{banner.title}</span>
                  </div>
                  {banner.text && <div className="banner-text">{banner.text}</div>}
                </div>
                <button className="banner-close" onClick={() => setBanner(null)}><X size={18} /></button>
              </div>
            )}

            <div className="top-actions">
              <button className="button button-secondary" onClick={() => navigate("/proprietaire")}>
                <ArrowLeft size={16} /> Retour
              </button>
              <button className="button button-primary" onClick={() => handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSubmitting ? "Création..." : "Confirmer la location"}
              </button>
            </div>

            <form>
              <div className="section">
                <h2 className="section-title"><Key size={20} /> Créer une nouvelle location</h2>
                
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    {/* ✅ "Nom du bien" au lieu de "Adresse" */}
                    <label className="form-label">Nom du bien <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.propertyId}
                      onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                    >
                      <option value="">Choisir un bien...</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id} disabled={!p.isAvailable}>
                          {p.label} {!p.isAvailable ? "(Déjà loué ou indisponible)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Locataire <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.tenantId}
                      onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                    >
                      <option value="">Choisir le locataire...</option>
                      {tenants.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Loyer mensuel (FCFA) <span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.rent}
                      onChange={(e) => setFormData({...formData, rent: e.target.value})}
                      placeholder="Ex: 150000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date de début <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};