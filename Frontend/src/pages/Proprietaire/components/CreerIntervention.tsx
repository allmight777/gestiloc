import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { propertyService, maintenanceService, Property, CreateMaintenanceRequestPayload } from "../../../services/api";

interface CreerInterventionProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}

const CreerIntervention: React.FC<CreerInterventionProps> = ({ notify }) => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("plumbing");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [assignedProvider, setAssignedProvider] = useState<string>("");
  const [preferredDate, setPreferredDate] = useState<string>("");
  
  // Estados para los datos del backend
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Récupérer les biens depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const propsResponse = await propertyService.listProperties();
        if (propsResponse.data) {
          setProperties(propsResponse.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des biens:", error);
        notify?.("Erreur lors du chargement des biens", "error");
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
      minHeight: "100px",
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

  const selectedPropertyData = properties.find(p => p.id === parseInt(selectedProperty));

  const handleSubmit = async () => {
    // Validation des champs obligatoires
    if (!selectedProperty || !title || !category) {
      notify?.("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Préparer les données de l'intervention
      const interventionData: CreateMaintenanceRequestPayload = {
        property_id: parseInt(selectedProperty),
        title: title,
        category: category as 'plumbing' | 'electricity' | 'heating' | 'other',
        priority: priority as 'low' | 'medium' | 'high' | 'emergency',
        description: description || undefined,
        assigned_provider: assignedProvider || undefined,
        preferred_slots: preferredDate ? [{ date: preferredDate }] : undefined,
      };

      console.log("Payload envoyé au backend (intervention):", interventionData);

      // Appeler l'API pour créer l'intervention
      await maintenanceService.createIncident(interventionData);
      
      notify?.("Intervention créée avec succès!", "success");
      navigate("/proprietaire/incidents");
    } catch (error: unknown) {
      console.error("Erreur lors de la création de l'intervention:", error);
      
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
        notify?.("Erreur lors de la création de l'intervention.", "error");
      }
    } finally {
      setIsSubmitting(false);
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
            onClick={() => navigate("/proprietaire/incidents")}
          >
            ← Retour aux interventions
          </button>
          <div style={styles.topActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/incidents")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer l'intervention"}
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={styles.headerSection} className="animate-fadeInUp animate-delay-100">
          <h1 style={styles.title}>Nouvelle intervention</h1>
          <p style={styles.subtitle}>Créez une nouvelle intervention ou demande de travaux</p>
        </div>

        {/* Main Card */}
        <div style={styles.card} className="animate-scaleIn animate-delay-200">
          <div style={styles.cardTitle}>
            <span>🔧</span> Informations de l'intervention
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
                    {prop.name || prop.address} {prop.city ? `- ${prop.city}` : ''}
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
                <option value="plumbing">Plomberie</option>
                <option value="electricity">Électricité</option>
                <option value="heating">Chauffage</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Titre / Intitulé */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Titre / Intitulé<span style={styles.required}>*</span>
              </label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="Ex: Réparation fuite d'eau dans la cuisine" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
              />
            </div>

            {/* Priorité */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Priorité</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="priority" 
                    value="low" 
                    checked={priority === "low"} 
                    onChange={() => setPriority("low")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Basse
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="priority" 
                    value="medium" 
                    checked={priority === "medium"} 
                    onChange={() => setPriority("medium")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Moyenne
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="priority" 
                    value="high" 
                    checked={priority === "high"} 
                    onChange={() => setPriority("high")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Haute
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="priority" 
                    value="emergency" 
                    checked={priority === "emergency"} 
                    onChange={() => setPriority("emergency")} 
                    style={{ accentColor: "#ef4444" }} 
                  />
                  Urgente
                </label>
              </div>
            </div>

            {/* Prestataire */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Prestataire</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="Nom du prestataire (optionnel)" 
                value={assignedProvider} 
                onChange={e => setAssignedProvider(e.target.value)} 
              />
            </div>

            {/* Date préférée */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Date préférée</label>
              <input 
                type="date" 
                style={styles.input} 
                value={preferredDate} 
                onChange={e => setPreferredDate(e.target.value)} 
              />
            </div>

            {/* Description */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                placeholder="Décrivez l'intervention à réaliser..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

          </div>

          {/* Bottom actions */}
          <div style={styles.bottomActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/incidents")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer l'intervention"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreerIntervention;
