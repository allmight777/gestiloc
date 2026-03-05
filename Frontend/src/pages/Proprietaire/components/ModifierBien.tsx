import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Home,
  MapPin,
  Euro,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Save,
  Building2,
  X,
} from "lucide-react";
import { uploadService, propertyService, Property } from "../../../services/api";

interface ModifierBienProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}

// Interface pour le formulaire d'édition
interface EditFormData {
  type: string;
  name: string;
  description: string;
  address: string;
  city: string;
  district: string;
  zip_code: string;
  surface: string;
  room_count: string;
  bedroom_count: string;
  bathroom_count: string;
  rent_amount: string;
  status: string;
  reference_code: string;
  terrace: boolean;
  balcony: boolean;
  garden: boolean;
  parking: boolean;
  floor: string;
  elevator: boolean;
  furnished: boolean;
  heating_type: string;
  energy_class: string;
}

const typeLabel: Record<string, string> = {
  apartment: "Appartement",
  house: "Maison",
  office: "Bureau",
  commercial: "Local commercial",
  parking: "Parking",
  land: "Terrain",
  other: "Autre",
};

const statusLabel: Record<string, string> = {
  available: "Disponible",
  rented: "Loué",
  maintenance: "En maintenance",
  off_market: "Retiré du marché",
};

const getBackendOrigin = () => {
  const baseURL = "https://gestiloc-backend.onrender.com";
  try {
    return new URL(baseURL).origin;
  } catch {
    return window.location.origin;
  }
};

const resolvePhotoUrl = (p?: string | null) => {
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const origin = getBackendOrigin();
  if (p.startsWith("/storage/")) return `${origin}${p}`;
  const normalized = p.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${origin}/storage/${normalized}`;
};

const ModifierBien: React.FC<ModifierBienProps> = ({ notify }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<EditFormData>({
    type: "apartment",
    name: "",
    description: "",
    address: "",
    city: "",
    district: "",
    zip_code: "",
    surface: "",
    room_count: "",
    bedroom_count: "",
    bathroom_count: "",
    rent_amount: "",
    status: "available",
    reference_code: "",
    terrace: false,
    balcony: false,
    garden: false,
    parking: false,
    floor: "",
    elevator: false,
    furnished: false,
    heating_type: "",
    energy_class: "",
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Charger les données du bien
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        notify?.("ID du bien manquant", "error");
        navigate("/proprietaire/mes-biens");
        return;
      }

      setIsLoading(true);
      try {
        const response = await propertyService.getProperty(parseInt(id));
        const propertyData = response.data || response;
        setProperty(propertyData);

        // Pré-remplir le formulaire avec les données existantes
        setFormData({
          type: propertyData.type || "apartment",
          name: propertyData.name || "",
          description: propertyData.description || "",
          address: propertyData.address || "",
          city: propertyData.city || "",
          district: propertyData.district || "",
          zip_code: propertyData.zip_code || "",
          surface: propertyData.surface?.toString() || "",
          room_count: propertyData.room_count?.toString() || "",
          bedroom_count: propertyData.bedroom_count?.toString() || "",
          bathroom_count: propertyData.bathroom_count?.toString() || "",
          rent_amount: propertyData.rent_amount?.toString() || "",
          status: propertyData.status || "available",
          reference_code: propertyData.reference_code || "",
          terrace: propertyData.meta?.terrace || false,
          balcony: propertyData.meta?.balcony || false,
          garden: propertyData.meta?.garden || false,
          parking: propertyData.meta?.parking || false,
          floor: propertyData.meta?.floor?.toString() || "",
          elevator: propertyData.meta?.elevator || false,
          furnished: propertyData.meta?.furnished || false,
          heating_type: propertyData.meta?.heating_type || "",
          energy_class: propertyData.meta?.energy_class || "",
        });

        setPhotos(propertyData.photos || []);
      } catch (error) {
        console.error("Erreur lors du chargement du bien:", error);
        notify?.("Erreur lors du chargement du bien", "error");
        navigate("/proprietaire/mes-biens");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate, notify]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const maxPhotos = 8 - photos.length - newPhotos.length;

    if (fileArray.length > maxPhotos) {
      notify?.(`Maximum ${maxPhotos} photos supplémentaires autorisées`, "error");
      return;
    }

    const newFiles = fileArray.slice(0, maxPhotos);
    setNewPhotos(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemovePhoto = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewPhotos(prev => prev.filter((_, i) => i !== index));
      setPhotoPreviews(prev => {
        const url = prev[index];
        URL.revokeObjectURL(url);
        return prev.filter((_, i) => i !== index);
      });
    } else {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Le nom du bien est requis";
    if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
    if (!formData.city.trim()) newErrors.city = "La ville est requise";
    if (!formData.zip_code.trim()) newErrors.zip_code = "Le code postal est requis";
    if (!formData.surface.trim()) newErrors.surface = "La surface est requise";
    else if (isNaN(Number(formData.surface)) || Number(formData.surface) <= 0) {
      newErrors.surface = "Surface invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      notify?.("Veuillez corriger les erreurs du formulaire", "error");
      return;
    }

    if (!id) {
      notify?.("ID du bien manquant", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedPhotoUrls: string[] = [];
      if (newPhotos.length > 0) {
        for (const file of newPhotos) {
          const res = await uploadService.uploadPhoto(file);
          uploadedPhotoUrls.push(res.path);
        }
      }

      const payload: any = {
        type: formData.type,
        title: formData.name.trim(),
        name: formData.name.trim(),
        description: formData.description || null,
        address: formData.address,
        district: formData.district || null,
        city: formData.city,
        zip_code: formData.zip_code || null,
        surface: formData.surface ? parseFloat(formData.surface) : null,
        room_count: formData.room_count ? parseInt(formData.room_count) : null,
        bedroom_count: formData.bedroom_count ? parseInt(formData.bedroom_count) : null,
        bathroom_count: formData.bathroom_count ? parseInt(formData.bathroom_count) : null,
        rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
        status: formData.status,
        reference_code: formData.reference_code || null,
        photos: [...photos, ...uploadedPhotoUrls],
        meta: {
          terrace: formData.terrace,
          balcony: formData.balcony,
          garden: formData.garden,
          parking: formData.parking,
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          elevator: formData.elevator,
          furnished: formData.furnished,
          heating_type: formData.heating_type || undefined,
          energy_class: formData.energy_class || undefined,
        },
      };

      await propertyService.updateProperty(parseInt(id), payload);

      notify?.("✅ Le bien a été mis à jour avec succès !", "success");
      navigate("/proprietaire/mes-biens");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      const errorMsg = error.response?.data?.message || "Une erreur est survenue";
      notify?.(errorMsg, "error");

      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};

        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = validationErrors[key][0];
        });

        setErrors(formattedErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

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
    saveBtn: {
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
    required: {
      color: "#dc2626",
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
    inputError: {
      borderColor: "#dc2626",
    },
    errorText: {
      fontSize: "12px",
      color: "#dc2626",
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
    photosSection: {
      marginTop: "24px",
      padding: "24px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
    },
    photosGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: "12px",
      marginTop: "12px",
    },
    photoItem: {
      position: "relative" as const,
      width: "100%",
      height: "100px",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #e5e7eb",
    },
    photoRemove: {
      position: "absolute" as const,
      top: "4px",
      right: "4px",
      background: "rgba(239, 68, 68, 0.9)",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    photoUpload: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "12px",
    },
    photoUploadBtn: {
      padding: "8px 16px",
      borderRadius: "8px",
      border: "2px dashed #d1d5db",
      background: "white",
      color: "#6b7280",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
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

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">Chargement du bien...</p>
          </div>
        </div>
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
            onClick={() => navigate("/proprietaire/mes-biens")}
          >
            <ArrowLeft size={16} />
            Retour à mes biens
          </button>
          <div style={styles.topActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/mes-biens")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.saveBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={styles.headerSection} className="animate-fadeInUp animate-delay-100">
          <h1 style={styles.title}>
            <Building2 size={28} className="inline-block mr-2" />
            Modifier le bien
          </h1>
          <p style={styles.subtitle}>
            Modifiez les informations de votre bien immobilier
            {property?.reference_code && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                Réf: {property.reference_code}
              </span>
            )}
          </p>
        </div>

        {/* Main Card */}
        <div style={styles.card} className="animate-scaleIn animate-delay-200">
          
          {/* Section: Informations générales */}
          <div style={styles.cardTitle}>
            <span>🏠</span> Informations générales
          </div>
          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Type de bien <span style={styles.required}>*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="office">Bureau</option>
                <option value="commercial">Local commercial</option>
                <option value="parking">Parking</option>
                <option value="land">Terrain</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Statut <span style={styles.required}>*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="available">Disponible</option>
                <option value="rented">Loué</option>
                <option value="maintenance">En maintenance</option>
                <option value="off_market">Retiré du marché</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Nom du bien <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Appartement T3 centre-ville"
                style={{
                  ...styles.input,
                  ...(errors.name ? styles.inputError : {}),
                }}
              />
              {errors.name && <div style={styles.errorText}>{errors.name}</div>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Surface (m²) <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="surface"
                value={formData.surface}
                onChange={handleChange}
                placeholder="Ex: 65"
                style={{
                  ...styles.input,
                  ...(errors.surface ? styles.inputError : {}),
                }}
                min="0"
                step="0.01"
              />
              {errors.surface && <div style={styles.errorText}>{errors.surface}</div>}
            </div>
          </div>

          {/* Section: Adresse */}
          <div style={{ ...styles.cardTitle, marginTop: "32px" }}>
            <span>📍</span> Adresse
          </div>
          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Adresse <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Numéro et rue"
                style={{
                  ...styles.input,
                  ...(errors.address ? styles.inputError : {}),
                }}
              />
              {errors.address && <div style={styles.errorText}>{errors.address}</div>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Ville <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: Paris"
                style={{
                  ...styles.input,
                  ...(errors.city ? styles.inputError : {}),
                }}
              />
              {errors.city && <div style={styles.errorText}>{errors.city}</div>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Code postal <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="Ex: 75000"
                style={{
                  ...styles.input,
                  ...(errors.zip_code ? styles.inputError : {}),
                }}
              />
              {errors.zip_code && <div style={styles.errorText}>{errors.zip_code}</div>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Quartier / Arrondissement</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Ex: Le Marais, 4ème"
                style={styles.input}
              />
            </div>
          </div>

          {/* Section: Caractéristiques */}
          <div style={{ ...styles.cardTitle, marginTop: "32px" }}>
            <span>🏗️</span> Caractéristiques
          </div>
          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nombre de pièces</label>
              <input
                type="number"
                name="room_count"
                value={formData.room_count}
                onChange={handleChange}
                placeholder="Ex: 4"
                style={styles.input}
                min="0"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nombre de chambres</label>
              <input
                type="number"
                name="bedroom_count"
                value={formData.bedroom_count}
                onChange={handleChange}
                placeholder="Ex: 3"
                style={styles.input}
                min="0"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nombre de salles de bain</label>
              <input
                type="number"
                name="bathroom_count"
                value={formData.bathroom_count}
                onChange={handleChange}
                placeholder="Ex: 2"
                style={styles.input}
                min="0"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Étage</label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="Ex: 3"
                style={styles.input}
                min="0"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "16px" }}>
            <label style={{ ...styles.checkboxRow, marginTop: 0 }}>
              <input
                type="checkbox"
                name="terrace"
                checked={formData.terrace}
                onChange={handleChange}
                style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
              />
              <span style={styles.checkboxLabel}>Terrasse</span>
            </label>
            <label style={{ ...styles.checkboxRow, marginTop: 0 }}>
              <input
                type="checkbox"
                name="balcony"
                checked={formData.balcony}
                onChange={handleChange}
                style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
              />
              <span style={styles.checkboxLabel}>Balcon</span>
            </label>
            <label style={{ ...styles.checkboxRow, marginTop: 0 }}>
              <input
                type="checkbox"
                name="garden"
                checked={formData.garden}
                onChange={handleChange}
                style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
              />
              <span style={styles.checkboxLabel}>Jardin</span>
            </label>
            <label style={{ ...styles.checkboxRow, marginTop: 0 }}>
              <input
                type="checkbox"
                name="parking"
                checked={formData.parking}
                onChange={handleChange}
                style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
              />
              <span style={styles.checkboxLabel}>Parking</span>
            </label>
            <label style={{ ...styles.checkboxRow, marginTop: 0 }}>
              <input
                type="checkbox"
                name="elevator"
                checked={formData.elevator}
                onChange={handleChange}
                style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
              />
              <span style={styles.checkboxLabel}>Ascenseur</span>
            </label>
            <label style={{ ...styles.checkboxRow, marginTop: 0 }}>
              <input
                type="checkbox"
                name="furnished"
                checked={formData.furnished}
                onChange={handleChange}
                style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
              />
              <span style={styles.checkboxLabel}>Meublé</span>
            </label>
          </div>

          {/* Chauffage et énergie */}
          <div style={{ ...styles.grid2, marginTop: "20px" }}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type de chauffage</label>
              <select
                name="heating_type"
                value={formData.heating_type}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Sélectionner...</option>
                <option value="electric">Électrique</option>
                <option value="gas">Gaz</option>
                <option value="oil">Fioul</option>
                <option value="heat_pump">Pompe à chaleur</option>
                <option value="solar">Solaire</option>
                <option value="collective">Collectif</option>
                <option value="none">Aucun</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Classe énergétique</label>
              <select
                name="energy_class"
                value={formData.energy_class}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Sélectionner...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
              </select>
            </div>
          </div>

          {/* Section: Financier */}
          <div style={{ ...styles.cardTitle, marginTop: "32px" }}>
            <span>💰</span> Financier
          </div>
          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Loyer mensuel (FCFA)</label>
              <input
                type="number"
                name="rent_amount"
                value={formData.rent_amount}
                onChange={handleChange}
                placeholder="0,00"
                style={styles.input}
                min="0"
                step="0.01"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Référence du bien</label>
              <input
                type="text"
                name="reference_code"
                value={formData.reference_code}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    reference_code: e.target.value.toUpperCase()
                  }));
                }}
                placeholder="Ex: APP-123"
                style={styles.input}
              />
            </div>
          </div>

          {/* Section: Description */}
          <div style={{ ...styles.cardTitle, marginTop: "32px" }}>
            <span>📝</span> Description
          </div>
          <div style={styles.fieldGroup}>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Décrivez le bien, ses points forts, son emplacement..."
              rows={4}
            />
          </div>

          {/* Section: Photos */}
          <div style={styles.photosSection}>
            <div style={styles.cardTitle}>
              <ImageIcon size={18} />
              Photos ({photos.length + newPhotos.length}/8)
            </div>

            {(photos.length > 0 || photoPreviews.length > 0) && (
              <div style={styles.photosGrid}>
                {photos.map((photo, index) => {
                  const photoUrl = resolvePhotoUrl(photo);
                  return photoUrl ? (
                    <div key={`existing-${index}`} style={styles.photoItem}>
                      <img src={photoUrl} alt={`Photo ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        style={styles.photoRemove}
                        onClick={() => handleRemovePhoto(index, false)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null;
                })}

                {photoPreviews.map((preview, index) => (
                  <div key={`new-${index}`} style={styles.photoItem}>
                    <img src={preview} alt={`Nouvelle photo ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      style={styles.photoRemove}
                      onClick={() => handleRemovePhoto(index, true)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.photoUpload}>
              <label style={styles.photoUploadBtn}>
                <ImageIcon size={14} />
                Ajouter des photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                  disabled={photos.length + newPhotos.length >= 8}
                />
              </label>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                {8 - photos.length - newPhotos.length} photos restantes
              </span>
            </div>
          </div>

          {/* Bottom actions */}
          <div style={styles.bottomActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/mes-biens")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.saveBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModifierBien;
