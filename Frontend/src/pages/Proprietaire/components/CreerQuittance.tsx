import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leaseService, rentReceiptService, Lease, CreateRentReceiptPayload } from "../../../services/api";

interface CreerQuittanceProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}

// Type pour les options du select (locations/bails)
interface LeaseOption {
  id: number;
  label: string;
  propertyAddress: string;
  tenantName: string;
  rentAmount: number;
}

const CreerQuittance: React.FC<CreerQuittanceProps> = ({ notify }) => {
  const navigate = useNavigate();
  
  // États du formulaire
  const [selectedLease, setSelectedLease] = useState<string>("");
  const [typeQuittance, setTypeQuittance] = useState<string>("independent");
  const [paidMonth, setPaidMonth] = useState<string>("");
  const [issuedDate, setIssuedDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // États pour les données du backend
  const [leases, setLeases] = useState<LeaseOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Récupérer les baux actifs depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const leasesResponse = await leaseService.listLeases();
        const leasesData = leasesResponse || [];
        
        // Transformer les baux en options avec les informations nécessaires
        const leaseOptions: LeaseOption[] = (leasesData as Lease[])
          .filter((lease: Lease) => lease.status === 'active')
          .map((lease: Lease) => ({
            id: lease.id,
            label: `Bail #${lease.id} - ${lease.property?.name || lease.property?.address || 'Bien #' + lease.property_id}`,
            propertyAddress: lease.property?.address || '',
            tenantName: lease.tenant ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim() : 'Locataire',
            rentAmount: parseFloat(lease.rent_amount) || 0
          }));
        
        setLeases(leaseOptions);
        
        // Par défaut, date d'émission = aujourd'hui
        setIssuedDate(new Date().toISOString().split('T')[0]);
        
        // Par défaut, mois payé = mois en cours
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setPaidMonth(currentMonth);
        
      } catch (error) {
        console.error("Erreur lors de la récupération des baux:", error);
        notify?.("Erreur lors du chargement des baux", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [notify]);

  // Mettre à jour le montant quand un bail est sélectionné
  const selectedLeaseData = leases.find(l => l.id === parseInt(selectedLease));

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
    infoBox: {
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "24px",
    },
    infoTitle: {
      fontSize: "14px",
      fontWeight: 700,
      color: "#166534",
      marginBottom: "8px",
      fontFamily: SMALL_FONT,
    },
    infoText: {
      fontSize: "13px",
      color: "#15803d",
      margin: 0,
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
    required: {
      color: "#ef4444",
      marginLeft: "2px",
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
            onClick={() => navigate("/proprietaire/quittances")}
          >
            ← Retour aux quittances
          </button>
          <div style={styles.topActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/quittances")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={async () => {
                // Validation des champs obligatoires
                if (!selectedLease || !paidMonth || !issuedDate) {
                  notify?.("Veuillez remplir tous les champs obligatoires", "error");
                  return;
                }

                setIsSubmitting(true);
                try {
                  // Préparer les données de la quittance
                  const receiptPayload: CreateRentReceiptPayload = {
                    lease_id: parseInt(selectedLease),
                    paid_month: paidMonth,
                    issued_date: issuedDate,
                    notes: notes || undefined
                  };

                  console.log("Payload envoyé au backend:", receiptPayload);

                  // Appeler l'API pour créer la quittance
                  await rentReceiptService.createIndependent(receiptPayload);
                  
                  notify?.("Quittance créée avec succès!", "success");
                  navigate("/proprietaire/quittances");
                } catch (error: unknown) {
                  console.error("Erreur lors de la création de la quittance:", error);
                  
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
                    notify?.("Erreur lors de la création de la quittance. Veuillez vérifier les champs.", "error");
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer la quittance"}
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={styles.headerSection} className="animate-fadeInUp animate-delay-100">
          <h1 style={styles.title}>Nouvelle quittance de loyer</h1>
          <p style={styles.subtitle}>Créez une nouvelle quittance pour un locataire</p>
        </div>

        {/* Main Card */}
        <div style={styles.card} className="animate-scaleIn animate-delay-200">
          <div style={styles.cardTitle}>
            <span>📄</span> Informations de la quittance
          </div>

          {/* Info Box - Afficher les infos du bail sélectionné */}
          {selectedLeaseData && (
            <div style={styles.infoBox}>
              <div style={styles.infoTitle}>📍 Informations du bail</div>
              <p style={styles.infoText}>
                <strong>Bien :</strong> {selectedLeaseData.propertyAddress}<br />
                <strong>Locataire :</strong> {selectedLeaseData.tenantName}<br />
                <strong>Loyer :</strong> {selectedLeaseData.rentAmount.toLocaleString('fr-FR')} €
              </p>
            </div>
          )}

          <div style={styles.grid2}>

            {/* Bail / Location */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Bail / Location<span style={styles.required}>*</span>
              </label>
              <select 
                style={styles.select} 
                value={selectedLease} 
                onChange={e => setSelectedLease(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Sélectionner un bail</option>
                {leases.map(lease => (
                  <option key={lease.id} value={lease.id}>
                    {lease.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de quittance */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type de quittance</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="typeQuittance" 
                    value="independent" 
                    checked={typeQuittance === "independent"} 
                    onChange={() => setTypeQuittance("independent")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Indépendante
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="typeQuittance" 
                    value="invoice" 
                    checked={typeQuittance === "invoice"} 
                    onChange={() => setTypeQuittance("invoice")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Facture
                </label>
              </div>
            </div>

            {/* Mois payé */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Mois payé<span style={styles.required}>*</span>
              </label>
              <input 
                type="month" 
                style={styles.input} 
                value={paidMonth} 
                onChange={e => setPaidMonth(e.target.value)} 
              />
              <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                Format: YYYY-MM (ex: 2025-02)
              </span>
            </div>

            {/* Date d'émission */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Date d'émission<span style={styles.required}>*</span>
              </label>
              <input 
                type="date" 
                style={styles.input} 
                value={issuedDate} 
                onChange={e => setIssuedDate(e.target.value)} 
              />
            </div>

            {/* Notes */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Notes</label>
              <textarea
                style={styles.textarea}
                placeholder="Notes optionnelles (ex: paiement en espèces, compliment, etc.)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

          </div>

          {/* Bottom actions */}
          <div style={styles.bottomActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/quittances")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={async () => {
                // Validation des champs obligatoires
                if (!selectedLease || !paidMonth || !issuedDate) {
                  notify?.("Veuillez remplir tous les champs obligatoires", "error");
                  return;
                }

                setIsSubmitting(true);
                try {
                  const receiptPayload: CreateRentReceiptPayload = {
                    lease_id: parseInt(selectedLease),
                    paid_month: paidMonth,
                    issued_date: issuedDate,
                    notes: notes || undefined
                  };

                  console.log("Payload envoyé au backend:", receiptPayload);

                  await rentReceiptService.createIndependent(receiptPayload);
                  
                  notify?.("Quittance créée avec succès!", "success");
                  navigate("/proprietaire/quittances");
                } catch (error: unknown) {
                  console.error("Erreur lors de la création de la quittance:", error);
                  
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
                    notify?.("Erreur lors de la création de la quittance. Veuillez vérifier les champs.", "error");
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer la quittance"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreerQuittance;
