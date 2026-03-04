import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leaseService, invoiceService, propertyService, Lease, Property, CreateInvoicePayload } from "../../../services/api";

interface CreerFactureDocProps {
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

const CreerFactureDoc: React.FC<CreerFactureDocProps> = ({ notify }) => {
  const navigate = useNavigate();
  
  // États du formulaire
  const [selectedLease, setSelectedLease] = useState<string>("");
  const [typeFacture, setTypeFacture] = useState<string>("repair");
  const [dueDate, setDueDate] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [amountTotal, setAmountTotal] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("virement");
  const [description, setDescription] = useState<string>("");
  
  // Estados para documento
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [nomDocument, setNomDocument] = useState<string>("");
  const [typeDocument, setTypeDocument] = useState<string>("facture");
  const [categorieDocument, setCategorieDocument] = useState<string>("actif");
  
  // Estados para los datos del backend
  const [leases, setLeases] = useState<LeaseOption[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formType, setFormType] = useState<"facture">("facture");

  // Récupérer les baux actifs depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les baux
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

        // Récupérer les biens
        const propsResponse = await propertyService.listProperties();
        if (propsResponse.data) {
          setProperties(propsResponse.data);
        }
        
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        notify?.("Erreur lors du chargement des données", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [notify]);

  // Calcul automatique du montant total basé sur le bail sélectionné
  useEffect(() => {
    if (selectedLease) {
      const selectedLeaseData = leases.find(l => l.id === parseInt(selectedLease));
      if (selectedLeaseData) {
        // Par défaut, le montant total = loyer
        setAmountTotal(selectedLeaseData.rentAmount.toString());
        
        // Par défaut, période = mois en cours
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setPeriodStart(firstDay.toISOString().split('T')[0]);
        setPeriodEnd(lastDay.toISOString().split('T')[0]);
        
        // Par défaut, échéance = 5 du mois suivant
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 5);
        setDueDate(nextMonth.toISOString().split('T')[0]);
      }
    }
  }, [selectedLease, leases]);

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
    textarea: {
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
      minHeight: "80px",
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
    tabContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "24px",
    },
    tab: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: SMALL_FONT,
      transition: "all 0.15s",
    },
  };

  // Obtenir les informations du bail sélectionné
  const selectedLeaseData = leases.find(l => l.id === parseInt(selectedLease));

  const handleSubmit = async () => {
    if (formType === "facture") {
      // Validation des champs obligatoires pour facture
      if (!selectedLease || !dueDate || !amountTotal) {
        notify?.("Veuillez remplir tous les champs obligatoires", "error");
        return;
      }

      setIsSubmitting(true);
      try {
        const invoicePayload: CreateInvoicePayload = {
          lease_id: parseInt(selectedLease),
          type: typeFacture as 'rent' | 'deposit' | 'charge' | 'repair',
          due_date: dueDate,
          period_start: periodStart || undefined,
          period_end: periodEnd || undefined,
          amount_total: parseFloat(amountTotal),
          payment_method: paymentMethod
        };

        console.log("Payload envoyé au backend (facture):", invoicePayload);

        await invoiceService.createInvoice(invoicePayload);
        
        notify?.("Facture créée avec succès!", "success");
        navigate("/proprietaire/factures");
      } catch (error: unknown) {
        console.error("Erreur lors de la création de la facture:", error);
        
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
          notify?.("Erreur lors de la création de la facture. Veuillez vérifier les champs.", "error");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      notify?.("La fonctionnalité de gestion des documents sera disponible bientôt.", "info");
    }
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
            onClick={() => navigate("/proprietaire/factures")}
          >
            ← Retour aux factures et documents
          </button>
          <div style={styles.topActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/factures")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer"}
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={styles.headerSection} className="animate-fadeInUp animate-delay-100">
          <h1 style={styles.title}>Nouvelle facture / document</h1>
          <p style={styles.subtitle}>Créez une nouvelle facture ou ajoutez un document divers</p>
        </div>

        {/* Main Card */}
        <div style={styles.card} className="animate-scaleIn animate-delay-200">
          {/* Onglets pour choisir le type de facture */}
          <div style={styles.tabContainer}>
            <button 
              style={{
                ...styles.tab,
                background: "#83C757",
                color: "white",
              }}
            >
              📄 Nouvelle facture
            </button>
          </div>

          {/* Formulaire Facture */}
          {formType === "facture" && (
            <>
              <div style={styles.cardTitle}>
                <span>📋</span> Informations de la facture
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

                {/* Type de facture */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Type de facture</label>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="typeFacture" 
                        value="repair" 
                        checked={typeFacture === "repair"} 
                        onChange={() => setTypeFacture("repair")} 
                        style={{ accentColor: "#16a34a" }} 
                      />
                      Réparation
                    </label>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="typeFacture" 
                        value="rent" 
                        checked={typeFacture === "rent"} 
                        onChange={() => setTypeFacture("rent")} 
                        style={{ accentColor: "#16a34a" }} 
                      />
                      Loyer
                    </label>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="typeFacture" 
                        value="charge" 
                        checked={typeFacture === "charge"} 
                        onChange={() => setTypeFacture("charge")} 
                        style={{ accentColor: "#16a34a" }} 
                      />
                      Charges
                    </label>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="typeFacture" 
                        value="deposit" 
                        checked={typeFacture === "deposit"} 
                        onChange={() => setTypeFacture("deposit")} 
                        style={{ accentColor: "#16a34a" }} 
                      />
                      Dépôt
                    </label>
                  </div>
                </div>

                {/* Période - Début */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Période - Début</label>
                  <input 
                    type="date" 
                    style={styles.input} 
                    value={periodStart} 
                    onChange={e => setPeriodStart(e.target.value)} 
                  />
                </div>

                {/* Période - Fin */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Période - Fin</label>
                  <input 
                    type="date" 
                    style={styles.input} 
                    value={periodEnd} 
                    onChange={e => setPeriodEnd(e.target.value)} 
                  />
                </div>

                {/* Date d'échéance */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Date d'échéance<span style={styles.required}>*</span>
                  </label>
                  <input 
                    type="date" 
                    style={styles.input} 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                  />
                </div>

                {/* Montant total */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Montant total (€)<span style={styles.required}>*</span>
                  </label>
                  <input 
                    type="number" 
                    style={styles.input} 
                    placeholder="Ex: 500" 
                    value={amountTotal} 
                    onChange={e => setAmountTotal(e.target.value)} 
                  />
                </div>

                {/* Mode de paiement */}
                <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
                  <label style={styles.label}>Mode de paiement</label>
                  <select 
                    style={styles.select} 
                    value={paymentMethod} 
                    onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <option value="virement">Virement bancaire</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="especes">Espèces</option>
                    <option value="cheque">Chèque</option>
                    <option value="card">Carte bancaire</option>
                    <option value="fedapay">Fedapay</option>
                  </select>
                </div>

                {/* Description */}
                <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Description optionnelle de la facture"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

              </div>
            </>
          )}

          {/* Formulaire Document */}
          {formType === "document" && (
            <>
              <div style={styles.cardTitle}>
                <span>📁</span> Informations du document
              </div>

              <div style={styles.grid2}>

                {/* Bien / Propriété */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Bien / Propriété<span style={styles.required}>*</span>
                  </label>
                  <select 
                    style={styles.select} 
                    value={selectedProperty} 
                    onChange={e => setSelectedProperty(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Sélectionner un bien</option>
                    {properties.map(prop => (
                      <option key={prop.id} value={prop.id}>
                        {prop.name || prop.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type de document */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Type de document<span style={styles.required}>*</span></label>
                  <select 
                    style={styles.select} 
                    value={typeDocument} 
                    onChange={e => setTypeDocument(e.target.value)}
                  >
                    <option value="facture">Facture</option>
                    <option value="travaux">Travaux</option>
                    <option value="assurance">Assurance</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="attestation">Attestation</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Nom du document */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Nom du document<span style={styles.required}>*</span>
                  </label>
                  <input 
                    type="text" 
                    style={styles.input} 
                    placeholder="Ex: Facture réparation fuite d'eau" 
                    value={nomDocument} 
                    onChange={e => setNomDocument(e.target.value)} 
                  />
                </div>

                {/* Catégorie */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Catégorie</label>
                  <select 
                    style={styles.select} 
                    value={categorieDocument} 
                    onChange={e => setCategorieDocument(e.target.value)}
                  >
                    <option value="actif">Actif</option>
                    <option value="archive">Archive</option>
                    <option value="template">Modèle</option>
                  </select>
                </div>

                {/* Description du document */}
                <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Description du document (optionnel)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

              </div>
            </>
          )}

          {/* Bottom actions */}
          <div style={styles.bottomActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/factures")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreerFactureDoc;
