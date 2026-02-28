// src/pages/Proprietaire/components/CreerEtatLieu.tsx
import { useState, useEffect } from "react";
import { 
  Plus, 
  X, 
  Camera, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { conditionReportService, Lease } from "@/services/api";

interface CreerEtatLieuProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  properties?: { id: number; name: string }[];
  mode?: 'modal' | 'page';
  notify?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function CreerEtatLieu({ 
  isOpen = true, 
  onClose, 
  onSuccess,
  properties = [],
  mode = 'modal',
  notify
}: CreerEtatLieuProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Données
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [leases, setLeases] = useState<Lease[]>([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>("");
  const [reportType, setReportType] = useState<"entry" | "exit" | "intermediate">("entry");
  const [reportDate, setReportDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Photos
  const [photos, setPhotos] = useState<{ file: File; caption: string; date: string }[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  
  // Signature
  const [signatureData, setSignatureData] = useState<string>("");
  const [signedBy, setSignedBy] = useState<string>("");

  // Charger les leases quand une propriété est sélectionnée
  useEffect(() => {
    if (selectedPropertyId) {
      loadLeases();
    } else {
      setLeases([]);
      setSelectedLeaseId("");
    }
  }, [selectedPropertyId]);

  const loadLeases = async () => {
    try {
      const { default: api } = await import("@/services/api");
      const response = await api.get(`/properties/${selectedPropertyId}/leases`);
      setLeases(response.data || []);
    } catch (err) {
      console.error("Erreur chargement baux:", err);
    }
  };

  // Gérer l'upload de photos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        file,
        caption: "",
        date: new Date().toISOString().split('T')[0]
      }));
      
      const newPreviews = newPhotos.map(file => URL.createObjectURL(file.file));
      
      setPhotos(prev => [...prev, ...newPhotos]);
      setPhotoPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  // Supprimer une photo
  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    
    const newPreviews = [...photoPreviewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPhotoPreviewUrls(newPreviews);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedPropertyId || !selectedLeaseId || !reportDate || photos.length === 0) {
      setError("Veuillez remplir tous les champs obligatoires (propriété, bail, date, photos)");
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        lease_id: parseInt(selectedLeaseId),
        type: reportType,
        report_date: reportDate,
        notes: notes || undefined,
        photos: photos.map(p => ({
          file: p.file,
          caption: p.caption || undefined,
          taken_at: p.date
        })),
        signature_data: signatureData || undefined,
        signed_by: signedBy || undefined
      };

      await conditionReportService.createForProperty(parseInt(selectedPropertyId), payload);
      
      if (notify) {
        notify('État des lieux créé avec succès!', 'success');
      }
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
      // Reset form
      setSelectedPropertyId("");
      setSelectedLeaseId("");
      setReportType("entry");
      setReportDate("");
      setNotes("");
      setPhotos([]);
      setPhotoPreviewUrls([]);
      setSignatureData("");
      setSignedBy("");
      
    } catch (err: any) {
      console.error("Erreur création état des lieux:", err);
      setError(err?.response?.data?.message || "Erreur lors de la création de l'état des lieux");
    } finally {
      setLoading(false);
    }
  };

  // Mode page: affichage en pleine page
  if (mode === 'page') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nouvel état des lieux</h1>
            <p className="text-gray-500">Créez un nouvel état des lieux pour un bien</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <FormContent 
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            setSelectedPropertyId={setSelectedPropertyId}
            selectedLeaseId={selectedLeaseId}
            setSelectedLeaseId={setSelectedLeaseId}
            reportType={reportType}
            setReportType={setReportType}
            reportDate={reportDate}
            setReportDate={setReportDate}
            notes={notes}
            setNotes={setNotes}
            photos={photos}
            setPhotos={setPhotos}
            photoPreviewUrls={photoPreviewUrls}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            signatureData={signatureData}
            setSignatureData={setSignatureData}
            signedBy={signedBy}
            setSignedBy={setSignedBy}
            leases={leases}
            error={error}
            loading={loading}
            handleSubmit={handleSubmit}
            onCancel={() => window.history.back()}
          />
        </div>
      </div>
    );
  }

  // Mode modal (par défaut)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-light" />
            Nouvel état des lieux
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <FormContent 
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            setSelectedPropertyId={setSelectedPropertyId}
            selectedLeaseId={selectedLeaseId}
            setSelectedLeaseId={setSelectedLeaseId}
            reportType={reportType}
            setReportType={setReportType}
            reportDate={reportDate}
            setReportDate={setReportDate}
            notes={notes}
            setNotes={setNotes}
            photos={photos}
            setPhotos={setPhotos}
            photoPreviewUrls={photoPreviewUrls}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            signatureData={signatureData}
            setSignatureData={setSignatureData}
            signedBy={signedBy}
            setSignedBy={setSignedBy}
            leases={leases}
            error={error}
            loading={loading}
            handleSubmit={handleSubmit}
            onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
}

// Sous-composant pour le contenu du formulaire
function FormContent({
  properties,
  selectedPropertyId,
  setSelectedPropertyId,
  selectedLeaseId,
  setSelectedLeaseId,
  reportType,
  setReportType,
  reportDate,
  setReportDate,
  notes,
  setNotes,
  photos,
  setPhotos,
  photoPreviewUrls,
  handlePhotoUpload,
  removePhoto,
  signatureData,
  setSignatureData,
  signedBy,
  setSignedBy,
  leases,
  error,
  loading,
  handleSubmit,
  onClose,
  onCancel
}: {
  properties: { id: number; name: string }[];
  selectedPropertyId: string;
  setSelectedPropertyId: (v: string) => void;
  selectedLeaseId: string;
  setSelectedLeaseId: (v: string) => void;
  reportType: "entry" | "exit" | "intermediate";
  setReportType: (v: "entry" | "exit" | "intermediate") => void;
  reportDate: string;
  setReportDate: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  photos: { file: File; caption: string; date: string }[];
  setPhotos: (v: { file: File; caption: string; date: string }[]) => void;
  photoPreviewUrls: string[];
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (index: number) => void;
  signatureData: string;
  setSignatureData: (v: string) => void;
  signedBy: string;
  setSignedBy: (v: string) => void;
  leases: Lease[];
  error: string | null;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  onClose?: () => void;
  onCancel?: () => void;
}) {
  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Sélection du bien */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Bien *
        </label>
        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un bien" />
          </SelectTrigger>
          <SelectContent>
            {properties.map(prop => (
              <SelectItem key={prop.id} value={String(prop.id)}>
                {prop.name}
              </SelectItem>
            ))}
            {properties.length === 0 && (
              <SelectItem value="no-property" disabled>
                Aucun bien disponible
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Sélection du bail */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Bail *
        </label>
        <Select 
          value={selectedLeaseId} 
          onValueChange={setSelectedLeaseId}
          disabled={!selectedPropertyId || leases.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un bail" />
          </SelectTrigger>
          <SelectContent>
            {leases.map(lease => (
              <SelectItem key={lease.id} value={String(lease.id)}>
                {lease.tenant ? 
                  `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim() 
                  : `Bail #${lease.id}`
                } - {lease.property?.name || `Bien #${lease.property_id}`}
              </SelectItem>
            ))}
            {leases.length === 0 && selectedPropertyId && (
              <SelectItem value="no-lease" disabled>
                Aucun bail pour ce bien
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Type d'état des lieux */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Type *
          </label>
          <Select value={reportType} onValueChange={(v) => setReportType(v as "entry" | "exit" | "intermediate")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entrée</SelectItem>
              <SelectItem value="exit">Sortie</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Date du rapport *
          </label>
          <Input 
            type="date" 
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          className="w-full p-3 border rounded-lg text-sm"
          rows={3}
          placeholder="Observations sur l'état du bien..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Photos * ({photos.length} photo{photos.length !== 1 ? 's' : ''})
        </label>
        
        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label 
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Camera className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              Cliquez pour ajouter des photos
            </span>
          </label>
        </div>

        {/* Prévisualisation des photos */}
        {photoPreviewUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {photoPreviewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img 
                  src={url} 
                  alt={`Photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <input
                  type="text"
                  placeholder="Légende..."
                  className="w-full text-xs mt-1 p-1 border rounded"
                  value={photos[index].caption}
                  onChange={(e) => {
                    const newPhotos = [...photos];
                    newPhotos[index].caption = e.target.value;
                    setPhotos(newPhotos);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signature (optionnel) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Signature (optionnel)
        </label>
        <div className="flex gap-2">
          <Input 
            placeholder="Nom du signataire"
            value={signedBy}
            onChange={(e) => setSignedBy(e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          La signature peut être ajoutée séparément après la création
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        {onCancel ? (
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Annuler
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
        )}
        <Button 
          type="submit"
          disabled={loading || photos.length === 0 || !selectedPropertyId || !selectedLeaseId || !reportDate}
          className="bg-primary-light hover:bg-primary-deep"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Créer l'état des lieux
            </>
          )}
        </Button>
      </div>
    </>
  );
}
