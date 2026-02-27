import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { propertyService, tenantService, leaseService, Property, TenantApi, TenantInvitationApi, TenantIndexResponse, CreateLeasePayload } from "../../../services/api";

interface NouvelleLocationProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}

// Type pour les options du select (biens)
interface PropertyOption {
  id: number;
  name: string;
  address: string;
}

// Type pour les options du select (locataires)
interface TenantOption {
  id: number;
  label: string;
  type: 'tenant' | 'invitation';
  email?: string;
  // Stocker l'ID réel du locataire (pour les invitations, c'est différent de l'ID d'invitation)
  tenantId?: number;
}

const NouvelleLocation: React.FC<NouvelleLocationProps> = ({ notify }) => {
  const navigate = useNavigate();
  const [typeBail, setTypeBail] = useState<string>("nu");
  const [statutBail, setStatutBail] = useState<string>("active");
  const [renouvellement, setRenouvellement] = useState<boolean>(true);
  const [loyer, setLoyer] = useState<string>("");
  const [depot, setDepot] = useState<string>("");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [duree, setDuree] = useState<string>("");
  const [datePaiement, setDatePaiement] = useState<string>("1");
  const [periodicite, setPeriodicite] = useState<string>("Mensuel");
  const [modePaiement, setModePaiement] = useState<string>("Espèce");
  const [details, setDetails] = useState<string>("");
  const [bien, setBien] = useState<string>("");
  const [locataire, setLocataire] = useState<string>("");

  // États pour les données du backend
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mapper le statut du formulaire vers le format backend
  const mapStatusToBackend = (formStatus: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'active',
      'en_attente': 'pending',
      'resilié': 'terminated',
      'expiré': 'terminated'
    };
    return statusMap[formStatus] || 'pending';
  };

  // Statuts disponibles pour le bail
  const statuts = [
    { value: "active", label: "Actif", color: "#22c55e" },
    { value: "en_attente", label: "En attente", color: "#94a3b8" },
    { value: "resilié", label: "Résilié", color: "#f97316" },
  ];

  // Récupérer les biens et locataires depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les biens DISPONIBLES uniquement pour le formulaire de bail
        const propertiesResponse = await propertyService.listAvailableProperties();
        const propertiesData = propertiesResponse.data || propertiesResponse;
        
        // Transformer les propriétés en options avec le nom
        const propertyOptions: PropertyOption[] = (propertiesData as Property[]).map((p: Property) => ({
          id: p.id,
          name: p.name || `Bien #${p.id}`,
          address: p.address
        }));
        setProperties(propertyOptions);

        // Récupérer les locataires et invitations
        const tenantsResponse = await tenantService.listTenants();
        const tenantsData = tenantsResponse as TenantIndexResponse;
        
        // Transformer les locataires existants
        const tenantOptions: TenantOption[] = (tenantsData.tenants || []).map((t: TenantApi) => ({
          id: t.id,
          label: `${t.first_name || ''} ${t.last_name || ''}`.trim() || `Locataire #${t.id}`,
          type: 'tenant' as const,
          email: t.email
        }));
        
        // Ajouter les invitations en attente (locataires qui ne communiquent pas encore)
        const invitationOptions: TenantOption[] = (tenantsData.invitations || []).map((inv: TenantInvitationApi) => ({
          id: inv.id,
          label: `${inv.first_name || ''} ${inv.last_name || ''}`.trim() || inv.email,
          type: 'invitation' as const,
          email: inv.email,
          tenantId: inv.tenant_id || undefined // Stocker l'ID du locataire associé
        }));
        
        // Combiner les deux listes
        setTenants([...tenantOptions, ...invitationOptions]);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        notify?.("Erreur lors du chargement des données", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [notify]);

  const BOLD_FONT = "'Merriweather', Georgia, serif";
  const SMALL_FONT = "'Manrope', sans-serif";

  const styles: Record<string, React.CSSProperties> = {
    page: {
      fontFamily: SMALL_FONT,
      background: "#f8faf8",
      minHeight: "100vh",
      padding: "0",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 32px",
      marginBottom: "8px",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "white",
      border: "1.5px solid #d1d5db",
      borderRadius: "8px",
      padding: "9px 18px",
      fontSize: "13px",
      color: "#374151",
      cursor: "pointer",
      fontWeight: 500,
      fontFamily: SMALL_FONT,
      transition: "all 0.15s",
    },
    topActions: {
      display: "flex",
      gap: "12px",
    },
    cancelBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "white",
      border: "1.5px solid #ef4444",
      borderRadius: "8px",
      padding: "9px 20px",
      fontSize: "13px",
      color: "#ef4444",
      cursor: "pointer",
      fontWeight: 600,
      fontFamily: SMALL_FONT,
      transition: "all 0.15s",
    },
    createBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "#16a34a",
      border: "none",
      borderRadius: "8px",
      padding: "9px 22px",
      fontSize: "13px",
      color: "white",
      cursor: "pointer",
      fontWeight: 600,
      fontFamily: SMALL_FONT,
      transition: "all 0.15s",
      boxShadow: "0 2px 8px rgba(22,163,74,0.25)",
    },
    headerSection: {
      padding: "0 32px 20px",
    },
    title: {
      fontSize: "26px",
      fontWeight: 800,
      color: "#111827",
      margin: "0 0 4px 0",
      fontFamily: BOLD_FONT,
      letterSpacing: "-0.3px",
    },
    subtitle: {
      fontSize: "16px",
      color: "#6b7280",
      margin: 0,
      fontFamily: SMALL_FONT,
    },
    card: {
      background: "white",
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      padding: "32px",
      margin: "0 32px 32px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    },
    cardTitle: {
      fontSize: "17px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "28px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontFamily: BOLD_FONT,
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "28px 40px",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#374151",
      fontFamily: SMALL_FONT,
    },
    select: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1.5px solid #d1d5db",
      fontSize: "13px",
      color: "#6b7280",
      background: "white",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      cursor: "pointer",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: SMALL_FONT,
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1.5px solid #d1d5db",
      fontSize: "13px",
      color: "#111827",
      background: "white",
      boxSizing: "border-box",
      outline: "none",
      transition: "border-color 0.15s",
      fontFamily: SMALL_FONT,
    },
    radioGroup: {
      display: "flex",
      gap: "20px",
      alignItems: "center",
      marginTop: "4px",
    },
    radioLabel: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#374151",
      cursor: "pointer",
      fontWeight: 500,
      fontFamily: SMALL_FONT,
    },
    statutGroup: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      marginTop: "4px",
    },
    checkboxRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "6px",
    },
    checkboxLabel: {
      fontSize: "12px",
      color: "#6b7280",
      cursor: "pointer",
      fontFamily: SMALL_FONT,
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1.5px solid #d1d5db",
      fontSize: "13px",
      color: "#111827",
      background: "white",
      boxSizing: "border-box",
      outline: "none",
      resize: "vertical",
      minHeight: "110px",
      fontFamily: SMALL_FONT,
      transition: "border-color 0.15s",
    },
    note: {
      fontSize: "12px",
      color: "#9ca3af",
      marginTop: "12px",
      fontFamily: SMALL_FONT,
    },
    bottomActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "24px",
      paddingTop: "20px",
      borderTop: "1px solid #f3f4f6",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;800;900&family=Manrope:wght@400;500;600&display=swap');
      `}</style>
      <div style={styles.page} className="animate-fadeInUp">
        {/* Top Action Bar */}
        <div style={styles.topBar} className="animate-slideInLeft">
          <button 
            style={styles.backBtn}
            onClick={() => navigate("/proprietaire/dashboard")}
          >
            ← Retour au tableau de bord
          </button>
          <div style={styles.topActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/biens")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={async () => {
                // Validation des champs obligatoires
                if (!bien || !locataire || !loyer || !dateDebut) {
                  notify?.("Veuillez remplir tous les champs obligatoires", "error");
                  return;
                }

                setIsSubmitting(true);
                try {
                  // Préparer les données du bail
                  const leasePayload: CreateLeasePayload = {
                    property_id: parseInt(bien),
                    tenant_id: parseInt(locataire),
                    start_date: dateDebut,
                    end_date: duree ? new Date(new Date(dateDebut).setFullYear(new Date(dateDebut).getFullYear() + parseInt(duree))).toISOString().split('T')[0] : null,
                    rent_amount: parseFloat(loyer),
                    deposit: depot ? parseFloat(depot) : null,
                    type: typeBail as "nu" | "forme",
                    status: mapStatusToBackend(statutBail) as "pending" | "active" | "terminated",
                    terms: details ? details.split('\n').filter(t => t.trim()) : []
                  };

                  console.log("Payload envoyé au backend:", leasePayload);

                  // Appeler l'API pour créer le bail
                  await leaseService.createLease(leasePayload);
                  
                  notify?.("Contrat de location créé avec succès!", "success");
                  navigate("/proprietaire/documents/baux");
                } catch (error: unknown) {
                  console.error("Erreur lors de la création du contrat:", error);
                  
                  // Afficher les erreurs de validation détaillées
                  const err = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
                  const errorData = err.response?.data;
                  if (errorData?.errors) {
                    // Afficher toutes les erreurs de validation
                    const errorMessages = Object.entries(errorData.errors)
                      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                      .join('\n');
                    notify?.(`Erreurs de validation:\n${errorMessages}`, "error");
                  } else if (errorData?.message) {
                    notify?.(errorData.message, "error");
                  } else {
                    notify?.("Erreur lors de la création du contrat. Veuillez vérifier les champs.", "error");
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer le contrat"}
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={styles.headerSection} className="animate-fadeInUp animate-delay-100">
          <h1 style={styles.title}>Nouveau contrat de location</h1>
          <p style={styles.subtitle}>Créez un nouveau contrat entre un bien et un locataire</p>
        </div>

        {/* Main Card */}
        <div style={styles.card} className="animate-scaleIn animate-delay-200">
          <div style={styles.cardTitle}>
            <span>🏠</span> Informations de location
          </div>

          <div style={styles.grid2}>

            {/* Bien à louer */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bien à louer</label>
              <select 
                style={styles.select} 
                value={bien} 
                onChange={e => setBien(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Sélectionner un bien</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Locataire */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Locataire</label>
              <select 
                style={styles.select} 
                value={locataire} 
                onChange={e => setLocataire(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Sélectionner un locataire</option>
                {tenants.length > 0 && (
                  <optgroup label="Locataires existants">
                    {tenants.filter(t => t.type === 'tenant').map(tenant => (
                      <option key={`tenant-${tenant.id}`} value={tenant.id}>
                        {tenant.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {tenants.some(t => t.type === 'invitation') && (
                  <optgroup label="En attente d'invitation">
                    {tenants.filter(t => t.type === 'invitation').map(inv => (
                      <option key={`invitation-${inv.id}`} value={inv.id}>
                        {inv.label} ({inv.email})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Type de bail */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type de bail</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="typeBail" 
                    value="nu" 
                    checked={typeBail === "nu"} 
                    onChange={() => setTypeBail("nu")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Bail nu
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="typeBail" 
                    value="forme" 
                    checked={typeBail === "forme"} 
                    onChange={() => setTypeBail("forme")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Bail meublé
                </label>
              </div>
            </div>

            {/* Statut du bail */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Statut du bail</label>
              <div style={styles.statutGroup}>
                {statuts.map(s => (
                  <label key={s.value} style={{ ...styles.radioLabel, fontSize: "13px" }}>
                    <input
                      type="radio"
                      name="statutBail"
                      value={s.value}
                      checked={statutBail === s.value}
                      onChange={() => setStatutBail(s.value)}
                      style={{ accentColor: s.color }}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Loyer mensuel */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Loyer mensuel (FCFA)</label>
              <input 
                type="number" 
                style={styles.input} 
                placeholder="40.000" 
                value={loyer} 
                onChange={e => setLoyer(e.target.value)} 
              />
            </div>

            {/* Date de début */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Date de début</label>
              <input 
                type="date" 
                style={styles.input} 
                value={dateDebut} 
                onChange={e => setDateDebut(e.target.value)} 
              />
            </div>

            {/* Dépôt de garantie */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Dépôt de garantie (FCFA)</label>
              <input 
                type="number" 
                style={styles.input} 
                placeholder="20.000" 
                value={depot} 
                onChange={e => setDepot(e.target.value)} 
              />
            </div>

            {/* Durée du bail */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Durée du bail</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="Ex: 2 ans" 
                value={duree} 
                onChange={e => setDuree(e.target.value)} 
              />
              <div style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  id="renouvellement"
                  checked={renouvellement}
                  onChange={e => setRenouvellement(e.target.checked)}
                  style={{ accentColor: "#16a34a", width: "14px", height: "14px" }}
                />
                <label htmlFor="renouvellement" style={styles.checkboxLabel}>
                  Renouvellement par tacite · cochez la case
                </label>
              </div>
            </div>

            {/* Date de paiement */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Date de paiement</label>
              <select 
                style={styles.select} 
                value={datePaiement} 
                onChange={e => setDatePaiement(e.target.value)}
              >
                {Array.from({ length: 28 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                ))}
              </select>
            </div>

            {/* Périodicité */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Périodicité</label>
              <select 
                style={styles.select} 
                value={periodicite} 
                onChange={e => setPeriodicite(e.target.value)}
              >
                <option>Mensuel</option>
                <option>Trimestriel</option>
                <option>Annuel</option>
              </select>
            </div>

            {/* Mode de paiement */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Mode de paiement</label>
              <select 
                style={styles.select} 
                value={modePaiement} 
                onChange={e => setModePaiement(e.target.value)}
              >
                <option>Espèce</option>
                <option>Virement bancaire</option>
                <option>Chèque</option>
                <option>Mobile Money</option>
              </select>
            </div>

            {/* Détails / conditions particulières */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Détails / conditions particulières</label>
              <textarea
                style={styles.textarea}
                placeholder="Ex: Charges comprises, Interdictions de fumer etc.."
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
            </div>

          </div>

          <p style={styles.note}>Ces informations seront envoyées dans le champ termes du bail.</p>

          {/* Bottom actions */}
          <div style={styles.bottomActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/biens")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={async () => {
                // Validation des champs obligatoires
                if (!bien || !locataire || !loyer || !dateDebut) {
                  notify?.("Veuillez remplir tous les champs obligatoires", "error");
                  return;
                }

                setIsSubmitting(true);
                try {
                  // Préparer les données du bail
                  const leasePayload: CreateLeasePayload = {
                    property_id: parseInt(bien),
                    tenant_id: parseInt(locataire),
                    start_date: dateDebut,
                    end_date: duree ? new Date(new Date(dateDebut).setFullYear(new Date(dateDebut).getFullYear() + parseInt(duree))).toISOString().split('T')[0] : null,
                    rent_amount: parseFloat(loyer),
                    deposit: depot ? parseFloat(depot) : null,
                    type: typeBail as "nu" | "forme",
                    status: mapStatusToBackend(statutBail) as "pending" | "active" | "terminated",
                    terms: details ? details.split('\n').filter(t => t.trim()) : []
                  };

                  console.log("Payload envoyé au backend:", leasePayload);

                  // Appeler l'API pour créer le bail
                  await leaseService.createLease(leasePayload);
                  
                  notify?.("Contrat de location créé avec succès!", "success");
                  navigate("/proprietaire/documents/baux");
                } catch (error: unknown) {
                  console.error("Erreur lors de la création du contrat:", error);
                  
                  // Afficher les erreurs de validation détaillées
                  const err = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
                  const errorData = err.response?.data;
                  if (errorData?.errors) {
                    const errorMessages = Object.entries(errorData.errors)
                      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                      .join('\n');
                    notify?.(`Erreurs de validation:\n${errorMessages}`, "error");
                  } else if (errorData?.message) {
                    notify?.(errorData.message, "error");
                  } else {
                    notify?.("Erreur lors de la création du contrat. Veuillez vérifier les champs.", "error");
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer le contrat"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NouvelleLocation;
