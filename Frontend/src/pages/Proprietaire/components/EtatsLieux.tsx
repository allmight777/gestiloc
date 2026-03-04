// src/pages/Proprietaire/EtatsDesLieux.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  Pencil,
  MoreVertical,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import sablier from "@/assets/sablier.png";
import monIcone from "@/assets/downloadIcon.svg";
import pencil from "@/assets/pencilIcon.svg";
import moreVertical from "@/assets/more-vertical.svg";
import Entry from "@/assets/EntryIcon.svg";
import Exit from "@/assets/ExitIcon.svg";
import setting from "@/assets/Settings.png";
import sucette from "@/assets/SuccetteIcon.svg";
import camera from "@/assets/camera.svg";
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
import { conditionReportService, PropertyConditionReport, Property } from "@/services/api";

// Type local pour l'affichage
type typeEtatLieu = {
  id: number;
  titre: string;
  type: "entrée" | "sortie";
  locataire: string;
  bien: string;
  date: string;
  etatGeneral: string;
  signe: boolean;
  photosCount: number;
  statut: "signé" | "en attente";
  creeLe: string;
  property_id: number;
};

// ────────────────────────────────────────────────
export default function EstadosDesLieux() {
  const navigate = useNavigate();
  
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // États pour les données API
  const [etatsLieux, setEtatsLieux] = useState<typeEtatLieu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<{id: number, name: string}[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Récupérer tous les états des lieux
        const reports = await conditionReportService.listAll();
        
        // Transformer les données API en format local
        const transformedReports: typeEtatLieu[] = reports.map((report: PropertyConditionReport) => {
          const tenantName = report.lease?.tenant 
            ? `${report.lease.tenant.first_name || ''} ${report.lease.tenant.last_name || ''}`.trim()
            : 'Locataire';
            
          const propertyName = report.property?.name || report.lease?.property?.name || 'Bien';
          
          // Formater la date
          const reportDate = report.report_date ? new Date(report.report_date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : '';
          
          // Déterminer le type - on garde uniquement entrée ou sortie
          const typeLabel = report.type === 'entry' ? 'entrée' : 'sortie';
          
          // Déterminer le statut
          const isSigned = !!report.signed_at;
          const statut = isSigned ? 'signé' : 'en attente';
          
          // État général (par défaut ou basé sur les photos)
          const etatGeneral = report.photos && report.photos.length > 0 ? 'Bon' : 'Non évalué';
          
          // Titre
          const titre = `EDL - ${tenantName}`;
          
          // Créé le
          const creeLe = report.created_at ? `Créé le ${new Date(report.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}` : '';

          return {
            id: report.id,
            titre,
            type: typeLabel as "entrée" | "sortie",
            locataire: tenantName,
            bien: propertyName,
            date: reportDate,
            etatGeneral,
            signe: isSigned,
            photosCount: report.photos?.length || 0,
            statut: statut as "signé" | "en attente",
            creeLe,
            property_id: report.property_id,
          };
        });
        
        setEtatsLieux(transformedReports);
        
        // Extraire les propriétés uniques pour le filtre
        const uniqueProperties = [...new Set(reports.map((r: PropertyConditionReport) => 
          r.property?.id || r.lease?.property?.id
        ).filter(Boolean))].map((id: number) => {
          const report = reports.find((r: PropertyConditionReport) => 
            r.property?.id === id || r.lease?.property?.id === id
          );
          return {
            id,
            name: report?.property?.name || report?.lease?.property?.name || `Bien #${id}`
          };
        });
        setProperties(uniqueProperties);
        
      } catch (err) {
        console.error('Erreur lors du chargement des états des lieux:', err);
        setError('Impossible de charger les états des lieux. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrer les données
  const filtered = etatsLieux.filter((e) => {
    const matchSearch =
      !search ||
      e.titre.toLowerCase().includes(search.toLowerCase()) ||
      e.locataire.toLowerCase().includes(search.toLowerCase()) ||
      e.bien.toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === "all" || e.type === filterType;
    const matchProperty = 
      filterBien === "Tous les biens" || 
      e.bien === filterBien ||
      properties.find(p => p.name === filterBien)?.id === e.property_id;
    return matchSearch && matchType && matchProperty;
  });

  const filters = [
    { label: "Tous", value: "all", icon: null },
    { label: "Entrée", value: "entrée", icon: Entry },
    { label: "Sortie", value: "sortie", icon: Exit },
  ];

  const [downloadingIds, setDownloadingIds] = useState<Record<number, boolean>>(
    {},
  );

  function handleDownload(e: typeEtatLieu): void {
    // Set loading state
    setDownloadingIds((prev) => ({ ...prev, [e.id]: true }));

    // Simulate PDF generation/download - Version React-safe
    setTimeout(() => {
      const content = `État des lieux: ${e.titre}\nBien: ${e.bien}\nLocataire: ${e.locataire}\nDate: ${e.date}\nÉtat général: ${e.etatGeneral}\nPhotos: ${e.photosCount}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `EDL_${e.titre.replace(/\s+/g, '_')}.txt`;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);

      // Clear loading state
      setDownloadingIds((prev) => ({ ...prev, [e.id]: false }));
    }, 1000);
  }

  // Fonction de rechargement
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const reports = await conditionReportService.listAll();
      
      const transformedReports: typeEtatLieu[] = reports.map((report: PropertyConditionReport) => {
        const tenantName = report.lease?.tenant 
          ? `${report.lease.tenant.first_name || ''} ${report.lease.tenant.last_name || ''}`.trim()
          : 'Locataire';
        const propertyName = report.property?.name || report.lease?.property?.name || 'Bien';
        const reportDate = report.report_date ? new Date(report.report_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : '';
        const typeLabel = report.type === 'entry' ? 'entrée' : 'sortie';
        const isSigned = !!report.signed_at;
        const statut = isSigned ? 'signé' : 'en attente';
        const etatGeneral = report.photos && report.photos.length > 0 ? 'Bon' : 'Non évalué';
        const titre = `EDL - ${tenantName}`;
        const creeLe = report.created_at ? `Créé le ${new Date(report.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}` : '';

        return {
          id: report.id,
          titre,
          type: typeLabel as "entrée" | "sortie",
          locataire: tenantName,
          bien: propertyName,
          date: reportDate,
          etatGeneral,
          signe: isSigned,
          photosCount: report.photos?.length || 0,
          statut: statut as "signé" | "en attente",
          creeLe,
          property_id: report.property_id,
        };
      });
      
      setEtatsLieux(transformedReports);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Etats des lieux</h1>
          <p className="text-muted-foreground font-sans mt-1 font-light">
            Documentez l'état de vos biens avec photos et descriptions
            détaillées.
            <br />
            Générez des PDF professionnels en quelques clics.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Rafraîchir"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            className="bg-primary-light hover:bg-primary-deep gap-2"
            onClick={() => navigate("/proprietaire/etats-lieux/nouveau")}
          >
            <Plus className="h-3 w-3 text-purple-600" />
            Créer un nouvel état de lieu
          </Button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filtres type */}
      <div className="flex flex-wrap gap-2 bg-slate-200 text-blue-500 w-fit p-2">
        {filters.map((filter) => (
          <Button
            key={`${filter.label}-${filter.icon}`}
            variant={filterType === filter.label ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(filter.value)}
            className={
              filterType === filter.label
                ? " bg-primary-light hover:bg-primary-deep"
                : ""
            }
          >
            <span className="flex items-center gap-2">
              {filter.icon && (
                <img src={filter.icon} alt={filter.label} className="h-4 w-4" />
              )}
              {filter.label}
            </span>
          </Button>
        ))}
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
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.name}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />
            <Input
              placeholder="Rechercher locataire, bien, mois..."
              className="pl-9  border-primary-light focus:ring-primary-light bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button className="bg-slate-100 text-black font-normal shrink-0 border-2 border-primary-light w-full sm:w-auto" onClick={() => notify('Fonctionnalité d\'affichage en cours de développement', 'info')}>
            <img src={setting} alt="Settings" className="h-6 w-6 mr-2" />
            Affichage
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
          <span className="ml-2">Chargement des états des lieux...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Aucun état des lieux trouvé</h3>
          <p className="text-gray-500 mt-1">
            {search || filterBien !== "Tous les biens" || filterType !== "Tous"
              ? "Essayez de modifier vos filtres de recherche"
              : "Créez votre premier état des lieux en cliquant sur le bouton ci-dessus"}
          </p>
        </div>
      ) : (
        /* Grille */
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 bg-gray-50">
          {filtered.map((e) => (
            <Card
              key={e.id}
              className={`overflow-hidden bg-[#f8fafc] rounded-xl hover:shadow-md transition-shadow shadow-lg border-l-4 ${e.type === "entrée" ? "border-l-green-500" : "border-l-rose-700"
                }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* En-tête */}
                <div className="space-y-1">
                  <Badge
                    variant="outline"
                    className={`text-xs px-2.5 py-0.5 ${e.type === "entrée"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                        : "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                      }`}
                  >
                    <img
                      src={monIcone}
                      alt="Télécharger"
                      className="h-4 w-4 inline mr-2"
                    />
                    {e.type === "entrée"
                      ? "ÉTAT DES LIEUX D'ENTRÉE"
                      : "ÉTAT DES LIEUX DE SORTIE"}
                  </Badge>

                  <h3 className="font-bold text-base mt-3">{e.titre}</h3>

                  <p className="text-sm text-gray-500 flex items-center gap-1.5 font-light">
                    <span className="text-lg leading-none">
                      <img src={sucette} alt="Succette" className="h-4 w-4" />
                    </span>
                    {e.bien}
                  </p>
                </div>
                <div className="mx-0 border-t-2 border-gray-300" />
                {/* Infos principales */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs uppercase font-semibold text-gray-500">
                      Locataire
                    </div>
                    <div className="font-medium">{e.locataire}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-gray-500">
                      Date
                    </div>
                    <div className="font-medium">{e.date}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs uppercase font-semibold text-gray-500">
                      État général
                    </div>
                    <div className="font-medium">{e.etatGeneral}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-gray-500">
                      Signé
                    </div>
                    <div className="flex items-center gap-1.5">
                      {e.signe ? (
                        <Check className="h-4 w-4 mt-2" />
                      ) : (
                        <img
                          src={sablier}
                          alt="Sablier"
                          className="h-4 w-4 mt-2"
                        />
                      )}
                      <span
                        className={
                          e.signe ? "mt-2 font-medium" : "font-medium mt-2"
                        }
                      >
                        {e.signe ? "Oui" : e.statut}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photos count */}
                <div className="flex items-center gap-2 text-sm bg-gray-100 px-1 py-2 text-gray-600">
                  <img src={camera} alt="Camera" className="h-4 w-4" />
                  <span className="text-black">{e.photosCount} photos</span>
                </div>
              </CardContent>
              {/* Footer */}
              <CardFooter className="bg-gray-50 flex items-center justify-between gap-2 flex-nowrap">
                {/* Statut + actions + créé le */}
                <p className="text-xs font-semibold text-gray-400">{e.creeLe}</p>
                <div className="flex shrink-0 w-fit">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => handleDownload(e)}
                    disabled={downloadingIds[e.id]}
                  >
                    {downloadingIds[e.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <img src={monIcone} alt="Télécharger" className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                  >
                    <img src={pencil} alt="Modifier" className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <img
                      src={moreVertical}
                      alt="Plus d'options"
                      className="h-5 w-5"
                    />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
