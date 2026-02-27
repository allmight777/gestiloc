// 📁 DocumentsManager.tsx - Version connectée à l'API
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import monIcone from "@/assets/downloadIcon.svg";
import pencil from "@/assets/pencilIcon.svg";
import moreVertical from "@/assets/more-vertical.svg";
import setting from "@/assets/Settings.png";
import sucette from "@/assets/SuccetteIcon.svg";
import sablier from "@/assets/sablier.png";
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  FileText,
  Loader2,
  Settings,
  MoreVertical,
  Pencil,
  Clock,
  CheckCircle2,
  X,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { leaseService, contractService, propertyService, Property, Lease } from "@/services/api";

// ────────────────────────────────────────────────
// 🎭 TYPES - Transformés depuis l'API
// ────────────────────────────────────────────────
type DocumentContrat = {
  id: number;
  titre: string;
  locataire: string;
  bien: string;
  bienId: number;
  loyer: number;
  depot: number | null;
  debut: string;
  fin: string | null;
  statut: "active" | "terminated" | "pending";
  creeLe: string;
  uuid?: string;
  type?: string;
};

// Fonction pour transformer les données API en type DocumentContrat
const transformLeaseToDocument = (lease: Lease, property?: Property): DocumentContrat => {
  const tenantName = lease.tenant 
    ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim()
    : 'Locataire inconnu';
  
  const propertyName = property?.name || property?.address || 'Bien inconnu';
  const propertyId = property?.id || lease.property_id;
  
  // Format type de bail
  const leaseType = lease.type === 'nu' ? 'Bail d\'habitation nu' : 'Bail meublé';
  
  return {
    id: lease.id,
    titre: `Contrat - ${tenantName}`,
    locataire: tenantName,
    bien: propertyName,
    bienId: propertyId,
    loyer: parseFloat(lease.rent_amount) || 0,
    depot: lease.deposit ? parseFloat(lease.deposit) : null,
    debut: lease.start_date,
    fin: lease.end_date,
    statut: lease.status as "active" | "terminated" | "pending",
    creeLe: `Créé le ${new Date(lease.created_at).toLocaleDateString('fr-FR')}`,
    uuid: lease.uuid,
    type: leaseType,
  };
};

// ────────────────────────────────────────────────
// DONNÉES - Provenance API
// ────────────────────────────────────────────────
// Supprimé: MOCK_DOCUMENTS - теперь используются данные API

// ────────────────────────────────────────────────
// 🎯 COMPOSANT PRINCIPAL - Connecté à l'API
// ────────────────────────────────────────────────
interface DocumentsManagerProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}

export const DocumentsManager = ({
  notify = console.log,
}: DocumentsManagerProps) => {
  const navigate = useNavigate();
  //ÉTATS LOCAUX
  const [documents, setDocuments] = useState<DocumentContrat[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>(
    {},
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingContract, setEditingContract] = useState<DocumentContrat | null>(null);
  const [editForm, setEditForm] = useState({
    rent_amount: "",
    deposit: "",
    start_date: "",
    end_date: "",
    type: "nu",
    status: "active",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les baux depuis l'API
        const leases = await leaseService.listLeases();
        
        // Récupérer les biens pour la transformation
        let propsData: Property[] = [];
        try {
          const propsResponse = await propertyService.listProperties();
          propsData = propsResponse.data || [];
          setProperties(propsData);
        } catch (propError) {
          console.error('Erreur lors du chargement des biens:', propError);
        }
        
        // Transformer les données
        const transformedDocs = leases.map(lease => {
          const property = propsData.find(p => p.id === lease.property_id);
          return transformLeaseToDocument(lease, property);
        });
        
        setDocuments(transformedDocs);
      } catch (err) {
        console.error('Erreur lors du chargement des contrats:', err);
        notify('Erreur lors du chargement des contrats', 'error');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // FILTRES (Fonctionnels immédiatement)
  const filteredDocuments = documents.filter((doc) => {
    // Filtre recherche textuelle
    const matchesSearch =
      !search ||
      doc.titre.toLowerCase().includes(search.toLowerCase()) ||
      doc.locataire.toLowerCase().includes(search.toLowerCase()) ||
      doc.bien.toLowerCase().includes(search.toLowerCase());

    // Filtre par bien (simplifié pour le mock)
    const matchesBien =
      filterBien === "Tous les biens" || doc.bien.includes(filterBien);

    return matchesSearch && matchesBien;
  });

  // LISTE UNIQUE DES BIENS POUR LE FILTRE
  const biensList = [
    "Tous les biens",
    ...new Set(documents.map((d) => d.bien)),
  ];

  //  TÉLÉCHARGEMENT DU CONTRAT VIA API
  const handleDownload = async (doc: DocumentContrat) => {
    if (!doc.uuid) {
      notify('UUID du contrat non disponible', 'error');
      return;
    }
    
    setDownloadingIds((prev) => ({ ...prev, [doc.id.toString()]: true }));

    try {
      const blob = await contractService.downloadLeaseContract(doc.uuid);
      contractService.downloadBlob(blob, `contrat_${doc.locataire.replace(' ', '_')}.pdf`);
      notify(`📥 Contrat téléchargé : ${doc.titre}`, "success");
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      notify('Erreur lors du téléchargement du contrat', 'error');
    } finally {
      setDownloadingIds((prev) => ({ ...prev, [doc.id.toString()]: false }));
    }
  };

  //  RAFRAÎCHISSEMENT DES DONNÉES
  const handleRefresh = async () => {
    setLoading(true);
    notify("🔄 Actualisation des données...", "info");

    try {
      // Récupérer les baux depuis l'API
      const leases = await leaseService.listLeases();
      
      // Récupérer les biens
      let propsData: Property[] = [];
      try {
        const propsResponse = await propertyService.listProperties();
        propsData = propsResponse.data || [];
      } catch (propError) {
        console.error('Erreur lors du chargement des biens:', propError);
      }
      
      // Transformer les données
      const transformedDocs = leases.map(lease => {
        const property = propsData.find(p => p.id === lease.property_id);
        return transformLeaseToDocument(lease, property);
      });
      
      setDocuments(transformedDocs);
      notify("✅ Données actualisées", "success");
    } catch (err) {
      console.error('Erreur lors de l\'actualisation:', err);
      notify('Erreur lors de l\'actualisation des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  //  CRÉER UN NOUVEAU CONTRAT
  const handleCreateNewContract = () => {
    navigate("/proprietaire/nouvelle-location");
  };

  //  MODIFIER UN CONTRAT
  const handleEditContract = (doc: DocumentContrat) => {
    setEditingContract(doc);
    setEditForm({
      rent_amount: doc.loyer.toString(),
      deposit: doc.depot?.toString() || "",
      start_date: doc.debut,
      end_date: doc.fin || "",
      type: doc.type === "Bail meublé" ? "forme" : "nu",
      status: doc.statut,
    });
    setIsEditing(true);
    setOpenMenuId(null);
  };

  //  SAUVEGARDER LES MODIFICATIONS
  const handleSaveEdit = async () => {
    if (!editingContract?.uuid) {
      notify("UUID du contrat non disponible", "error");
      return;
    }

    try {
      // Convertir "forme" en "orme" car le backend attend "nu" | "orme"
      const leaseType = editForm.type === "forme" ? "orme" : editForm.type;
      
      await leaseService.updateLease(editingContract.uuid, {
        rent_amount: parseFloat(editForm.rent_amount),
        deposit: editForm.deposit ? parseFloat(editForm.deposit) : null,
        start_date: editForm.start_date,
        end_date: editForm.end_date || null,
        type: leaseType as "nu" | "orme",
        status: editForm.status as "pending" | "active" | "terminated",
      } as any);
      
      notify("✅ Contrat modifié avec succès!", "success");
      setIsEditing(false);
      setEditingContract(null);
      handleRefresh();
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      notify("Erreur lors de la modification du contrat", "error");
    }
  };

  //  FERMER LA MODALE
  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingContract(null);
  };

  //  MENU CONTEXTUEL - Plus d'options
  const handleMenuAction = async (action: string, doc: DocumentContrat) => {
    setOpenMenuId(null);
    
    switch (action) {
      case "view":
        notify(`📄 Visualisation du contrat "${doc.titre}"`, "info");
        break;
      case "terminate":
        if (doc.statut === "active") {
          const confirmTerminate = window.confirm(`Voulez-vous vraiment résilier le contrat "${doc.titre}" ?`);
          if (confirmTerminate) {
            try {
              await leaseService.terminateLease(doc.uuid || doc.id.toString());
              notify(`✅ Contrat "${doc.titre}" résilié avec succès`, "success");
              handleRefresh();
            } catch (err) {
              console.error('Erreur lors de la résiliation:', err);
              notify('Erreur lors de la résiliation du contrat', "error");
            }
          }
        } else {
          notify("Ce contrat ne peut pas être résilié (statut non actif)", "error");
        }
        break;
      case "duplicate":
        notify(`📋 Duplication du contrat "${doc.titre}" - Fonctionnalité en cours de développement`, "info");
        break;
      default:
        notify(`Action "${action}" non implémentée`, "info");
    }
  };

  //  CHANGER LE MODE D'AFFICHAGE
  const handleViewModeToggle = () => {
    setViewMode(prev => prev === "grid" ? "list" : "grid");
  };

  //  FORMATAGE DATE
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // TRADUCTION STATUT

  const getStatusLabel = (statut: DocumentContrat["statut"]) => {
    switch (statut) {
      case "active":
        return "✓ Actif";
      case "terminated":
        return "✗ Terminé";
      case "pending":
        return "⏳ En attente de signature";
      default:
        return statut;
    }
  };

  const getStatusClass = (statut: DocumentContrat["statut"]) => {
    switch (statut) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "terminated":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // RENDU PRINCIPAL
  return (
    <div className="space-y-6 p-2 md:p-3 lg:p-4 w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrats de bail</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Générez automatiquement vos contrats de bail personnalisés en
            quelques clics.
            <br />
            Documents conformes et prêts à signer.
          </p>
        </div>

        {/* BOUTON CRÉATION - Connecté à la page de création */}
        <Button 
          className="bg-primary-light hover:bg-primary-deep"
          onClick={handleCreateNewContract}
        >
          <Plus className="h-4 w-4 text-purple-700" />
          Contrat de bail
        </Button>
      </div>

      {/*  FILTRES ET RECHERCHE */}
      <div className=" bg-transparent rounded-xl shadow-lg p-4 md:p-6 border border-gray-400 mt-4">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl font-medium uppercase tracking-tight leading-relaxed">
            Filtrer par bien{" "}
          </h4>
          <Select value={filterBien} onValueChange={setFilterBien}>
            <SelectTrigger className="w-full text-center border-primary-light focus:ring-primary-light bg-white">
              <SelectValue
                className="text-gray-500"
                placeholder="Tous les biens"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous les biens">Tous les biens</SelectItem>
              {properties.map((prop) => (
                <SelectItem key={prop.id} value={prop.name || prop.address}>
                  {prop.name || prop.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center gap-2 ">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />
            <Input
              placeholder="Rechercher locataire, bien, mois..."
              className="pl-9  border-primary-light focus:ring-primary-light bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button 
            className="bg-slate-100 text-black font-normal shrink-0 border-2 border-primary-light"
            onClick={handleViewModeToggle}
          >
            <img src={setting} alt="Settings" className="h-6 w-6 mr-2" />
            {viewMode === "grid" ? "Liste" : "Grille"}
          </Button>
        </div>
      </div>

      {/*  COMPTEUR RÉSULTATS */}
      <div className="text-sm text-gray-500">
        {filteredDocuments.length} contrat
        {filteredDocuments.length > 1 ? "s" : ""} trouvé
        {filteredDocuments.length > 1 ? "s" : ""}
      </div>

      {/*  ÉTAT DE CHARGEMENT SIMULÉ */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Actualisation...</span>
        </div>
      ) : (
        <>
          {/*  ÉTAT VIDE */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Aucun contrat trouvé
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Aucun contrat ne correspond à votre recherche. Essayez de
                modifier vos filtres ou créez un nouveau contrat.
              </p>
              <Button 
                className="mt-6 bg-green-600 hover:bg-green-700 gap-2"
                onClick={handleCreateNewContract}
              >
                <Plus className="h-4 w-4" />
                Nouveau contrat
              </Button>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 border border-gray-50 rounded-sm bg-gray-50 ">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="overflow-hidden bg-[#f8fafc] border border-[#e2e8f0] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-200"
              >
                {/* En-tête */}
                <div className="bg-[#F0FDF4] px-5 py-4 w-full">
                  <div className="space-y-1.5">
                    <p className="text-xs font-extrabold uppercase text-gray-500">
                      {doc.type}
                    </p>
                    <h3 className="text-base font-bold">{doc.titre}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                      <span className="text-emerald-600 text-lg leading-none">
                        <img src={sucette} alt="Succette" className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{doc.bien}</span>
                    </p>
                  </div>
                </div>
                <CardContent className="space-y-4 p-5 bg-white">
                  {/* Loyer + Dépôt */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <div className="text-xs uppercase font-medium tracking-wide text-gray-500 mb-0.5">
                        Loyer mensuel
                      </div>
                      <div className="font-semibold text-gray-900">
                        {doc.loyer.toLocaleString("fr-FR")} FCFA
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-medium tracking-wide text-gray-500 mb-0.5">
                        Dépôt de garantie
                      </div>
                      <div className="font-semibold text-gray-900">
                        {doc.depot?.toLocaleString("fr-FR") || "—"} FCFA
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <div className="text-xs uppercase font-medium tracking-wide text-gray-500 mb-0.5">
                        Date de début
                      </div>
                      <div className="font-medium text-gray-800">
                        {formatDate(doc.debut)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-medium tracking-wide text-gray-500 mb-0.5">
                        Date de fin
                      </div>
                      <div className="font-medium text-gray-800">
                        {formatDate(doc.fin)}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      doc.statut === "active"
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 px-3 py-1 text-sm font-medium"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100 px-3 py-1 text-sm font-medium flex items-center gap-1.5"
                    }
                  >
                    {doc.statut === "active" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Actif
                      </>
                    ) : (
                      <>
                        <img
                          src={sablier}
                          alt="Sablier"
                          className="h-4 w-4 mt-2"
                        />
                        En attente de signature
                      </>
                    )}
                  </Badge>
                </CardContent>
                <CardFooter className="h-auto px-5 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  {/* Statut + actions + créé le */}
                  <p className="text-xs font-bold text-gray-400">
                    {doc.creeLe}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingIds[doc.id]}
                    >
                      {downloadingIds[doc.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <img
                          src={monIcone}
                          alt="Télécharger"
                          className="h-5 w-5"
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                      onClick={() => handleEditContract(doc)}
                    >
                      <img src={pencil} alt="Modifier" className="h-5 w-5" />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                        }}
                      >
                        <img
                          src={moreVertical}
                          alt="Plus d'options"
                          className="h-5 w-5"
                        />
                      </Button>
                      {openMenuId === doc.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuAction("view", doc);
                            }}
                          >
                            👁️ Voir les détails
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuAction("duplicate", doc);
                            }}
                          >
                            📋 Dupliquer
                          </button>
                          {doc.statut === "active" && (
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuAction("terminate", doc);
                              }}
                            >
                              ❌ Résilier le bail
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* MODALE D'ÉDITION DE CONTRAT */}
      {isEditing && editingContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Modifier le contrat</h2>
              <Button variant="ghost" size="icon" onClick={handleCloseEdit}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loyer mensuel (FCFA)
                </label>
                <Input
                  type="number"
                  value={editForm.rent_amount}
                  onChange={(e) => setEditForm({ ...editForm, rent_amount: e.target.value })}
                  placeholder="40000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dépôt de garantie (FCFA)
                </label>
                <Input
                  type="number"
                  value={editForm.deposit}
                  onChange={(e) => setEditForm({ ...editForm, deposit: e.target.value })}
                  placeholder="20000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={editForm.end_date}
                  onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de bail
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                >
                  <option value="nu">Bail nu</option>
                  <option value="forme">Bail meublé</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="pending">En attente</option>
                  <option value="active">Actif</option>
                  <option value="terminated">Terminé</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border-t">
              <Button
                variant="outline"
                onClick={handleCloseEdit}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
