import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { propertyService, Property, leaseService, Lease, accountingService } from "../../../services/api";

interface CreerTransactionProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}

const CreerTransaction: React.FC<CreerTransactionProps> = ({ notify }) => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [transactionType, setTransactionType] = useState<string>("revenu");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedLease, setSelectedLease] = useState<string>("");
  const [category, setCategory] = useState<string>("loyer");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Estados para los datos del backend
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Récupérer les biens et baux depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Charger les propriétés
        const propsResponse = await propertyService.listProperties();
        if (propsResponse.data) {
          setProperties(propsResponse.data);
        }
        
        // Charger les baux
        const leasesResponse = await leaseService.listLeases();
        setLeases(leasesResponse);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        notify?.("Erreur lors du chargement des données", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [notify]);

  // Filtrer les baux par propriété sélectionnée
  const propertyLeases = selectedProperty 
    ? leases.filter(l => l.property_id === parseInt(selectedProperty) && l.status === 'active')
    : [];

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
    grid3: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
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
    typeGroup: {
      display: "flex",
      gap: "12px",
      marginTop: "4px",
    },
    typeButton: {
      flex: 1,
      padding: "12px 16px",
      borderRadius: "8px",
      border: "2px solid",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "all 0.15s",
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
    infoBox: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "24px",
    },
    infoTitle: {
      fontSize: "14px",
      fontWeight: 700,
      color: "#1e40af",
      marginBottom: "8px",
      fontFamily: SMALL_FONT,
    },
    infoText: {
      fontSize: "13px",
      color: "#1d4ed8",
      margin: 0,
      fontFamily: SMALL_FONT,
    },
  };

  const selectedPropertyData = properties.find(p => p.id === parseInt(selectedProperty));

  // Catégories selon le type de transaction
  const categories = transactionType === "revenu" 
    ? [
        { value: "loyer", label: "Loyer" },
        { value: "charge_recuperable", label: "Charge récupérable" },
        { value: "autre_revenu", label: "Autre revenu" },
        { value: "depot_garantie", label: "Dépôt de garantie" },
        { value: "indemnite", label: "Indemnité" },
      ]
    : [
        { value: "travaux", label: "Travaux et réparations" },
        { value: "charge", label: "Charges non récupérables" },
        { value: "assurance", label: "Assurance" },
        { value: "taxe_fonciere", label: "Taxe foncière" },
        { value: "diagnostic", label: "Diagnostics" },
        { value: "frais_gestion", label: "Frais de gestion" },
        { value: "autre_charge", label: "Autre charge" },
      ];

  const handleSubmit = async () => {
    // Validation des champs obligatoires
    if (!transactionType || !selectedProperty || !category || !description || !amount || !paymentDate) {
      notify?.("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    // Pour les revenus, le bail est obligatoire
    if (transactionType === "revenu" && !selectedLease) {
      notify?.("Veuillez sélectionner un bail pour enregistrer un revenu", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Préparer les données de la transaction
      const transactionData = {
        type: transactionType,
        property_id: parseInt(selectedProperty),
        lease_id: selectedLease ? parseInt(selectedLease) : undefined,
        category: category,
        description: description,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
      };

      console.log("Payload envoyé au backend (transaction):", transactionData);

      // Appeler l'API pour créer la transaction
      await accountingService.createTransaction(transactionData);
      
      notify?.("Transaction créée avec succès!", "success");
      navigate("/proprietaire/comptabilite");
    } catch (error: unknown) {
      console.error("Erreur lors de la création de la transaction:", error);
      const err = error as { message?: string };
      notify?.(err.message || "Erreur lors de la création de la transaction.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ ...styles.page, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #eef2ee', borderTopColor: '#83C757', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Chargement...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
            onClick={() => navigate("/proprietaire/comptabilite")}
          >
            ← Retour à la comptabilité
          </button>
          <div style={styles.topActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/comptabilite")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer la transaction"}
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={styles.headerSection} className="animate-fadeInUp animate-delay-100">
          <h1 style={styles.title}>Ajouter une transaction</h1>
          <p style={styles.subtitle}>Enregistrez une nouvelle transaction dans votre comptabilité</p>
        </div>

        {/* Main Card */}
        <div style={styles.card} className="animate-scaleIn animate-delay-200">
          <div style={styles.cardTitle}>
            <span>💰</span> Informations de la transaction
          </div>

          {/* Info Box - Afficher les infos du bien sélectionné */}
          {selectedPropertyData && (
            <div style={styles.infoBox}>
              <div style={styles.infoTitle}>📍 Informations du bien</div>
              <p style={styles.infoText}>
                <strong>Nom :</strong> {selectedPropertyData.name || 'Non spécifié'}<br />
                <strong>Adresse :</strong> {selectedPropertyData.address}<br />
                {selectedPropertyData.city && <><strong>Ville :</strong> {selectedPropertyData.city}</>}
              </p>
            </div>
          )}

          <div style={styles.grid2}>

            {/* Type de transaction */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>
                Type de transaction<span style={styles.required}>*</span>
              </label>
              <div style={styles.typeGroup}>
                <button
                  type="button"
                  style={{
                    ...styles.typeButton,
                    borderColor: transactionType === "revenu" ? "#16a34a" : "#d1d5db",
                    background: transactionType === "revenu" ? "#f0fdf4" : "white",
                    color: transactionType === "revenu" ? "#16a34a" : "#6b7280",
                  }}
                  onClick={() => {
                    setTransactionType("revenu");
                    setCategory("loyer");
                  }}
                >
                  <span style={{ fontSize: "18px" }}>🟢</span>
                  Revenu
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.typeButton,
                    borderColor: transactionType === "charge" ? "#ef4444" : "#d1d5db",
                    background: transactionType === "charge" ? "#fef2f2" : "white",
                    color: transactionType === "charge" ? "#ef4444" : "#6b7280",
                  }}
                  onClick={() => {
                    setTransactionType("charge");
                    setCategory("travaux");
                  }}
                >
                  <span style={{ fontSize: "18px" }}>🔴</span>
                  Charge
                </button>
              </div>
            </div>

            {/* Bien / Propriété */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Bien / Propriété<span style={styles.required}>*</span>
              </label>
              <select 
                style={styles.select} 
                value={selectedProperty} 
                onChange={e => {
                  setSelectedProperty(e.target.value);
                  setSelectedLease("");
                }}
                disabled={isLoading}
              >
                <option value="">Sélectionner un bien</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name || prop.address} {prop.city ? `- ${prop.city}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Bail (obligatoire pour les revenus) */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Bail<span style={styles.required}>*</span> {transactionType === "revenu" && "(requis pour revenu)"}
              </label>
              <select 
                style={styles.select} 
                value={selectedLease} 
                onChange={e => setSelectedLease(e.target.value)}
                disabled={!selectedProperty || transactionType === "charge"}
              >
                <option value="">Sélectionner un bail</option>
                {propertyLeases.map(lease => (
                  <option key={lease.id} value={lease.id}>
                    Bail #{lease.id} - {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : 'Locataire'}
                  </option>
                ))}
              </select>
            </div>

            {/* Catégorie */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Catégorie<span style={styles.required}>*</span>
              </label>
              <select 
                style={styles.select} 
                value={category} 
                onChange={e => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>
                Description<span style={styles.required}>*</span>
              </label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder={transactionType === "revenu" ? "Ex: Loyer Février 2025 - Nom du locataire" : "Ex: Réparation chaudière"} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>

            {/* Montant */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Montant (€)<span style={styles.required}>*</span>
              </label>
              <input 
                type="number" 
                style={styles.input} 
                placeholder="Ex: 1250" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
              />
            </div>

            {/* Date de paiement */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Date de transaction<span style={styles.required}>*</span>
              </label>
              <input 
                type="date" 
                style={styles.input} 
                value={paymentDate} 
                onChange={e => setPaymentDate(e.target.value)} 
              />
            </div>

            {/* Mode de paiement */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mode de paiement</label>
              <select 
                style={styles.select} 
                value={paymentMethod} 
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Espèces</option>
                <option value="virement">Virement bancaire</option>
                <option value="mtn_momo">MTN Money</option>
                <option value="moov_money">Moov Money</option>
                <option value="cheque">Chèque</option>
                <option value="carte">Carte bancaire</option>
              </select>
            </div>

            {/* Référence */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Référence</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="N° de reçu, référence virement..." 
                value={reference} 
                onChange={e => setReference(e.target.value)} 
              />
            </div>

            {/* Notes */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Notes</label>
              <textarea
                style={styles.textarea}
                placeholder="Informations complémentaires..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

          </div>

          {/* Bottom actions */}
          <div style={styles.bottomActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/comptabilite")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer la transaction"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreerTransaction;
