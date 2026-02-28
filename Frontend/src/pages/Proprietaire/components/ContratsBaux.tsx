import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Settings, Loader2, CheckCircle2, X, Download, Pencil, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { leaseService, contractService, propertyService, Property, Lease } from '@/services/api';

// Types
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
  typeBadgeColor?: string;
};

// Fonction pour transformer les données API en type DocumentContrat
const transformLeaseToDocument = (lease: Lease, property?: Property): DocumentContrat => {
  const tenantName = lease.tenant 
    ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim()
    : 'Locataire inconnu';
  
  const propertyName = property?.name || property?.address || 'Bien inconnu';
  const propertyId = property?.id || lease.property_id;
  
  const leaseType = lease.type === 'nu' ? 'BAIL D\'HABITATION NU' : 'BAIL MEUBLÉ';
  const leaseTypeColor = lease.type === 'nu' ? '#83C757' : '#f59e0b';
  
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
    typeBadgeColor: leaseTypeColor,
  };
};

interface ContratsBauxProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ContratsBaux: React.FC<ContratsBauxProps> = ({ notify }) => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<DocumentContrat[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBien, setFilterBien] = useState('Tous les biens');
    const [loading, setLoading] = useState(true);
    const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

    // Filtrer les documents
    const filtered = documents.filter(doc => {
        const matchesSearch = 
            doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.locataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.bien.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesBien = filterBien === 'Tous les biens' || doc.bien.includes(filterBien);
        
        return matchesSearch && matchesBien;
    });

    // Liste unique des biens pour le filtre
    const biensList = ['Tous les biens', ...new Set(documents.map(d => d.bien))];

    // Formatage date
    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Formatage loyer
    const formatLocier = (amount: number): string => {
        return amount.toLocaleString('fr-FR') + ' FCA';
    };

    // Statut label
    const getStatusLabel = (statut: string) => {
        switch (statut) {
            case 'active': return '✓ Actif';
            case 'terminated': return '✗ Terminé';
            case 'pending': return '⏳ En attente de signature';
            default: return statut;
        }
    };

    // Statut class
    const getStatusClass = (statut: string) => {
        switch (statut) {
            case 'active': return 'cb-status-actif';
            case 'terminated': return 'cb-status-termine';
            case 'pending': return 'cb-status-attente';
            default: return 'cb-status-attente';
        }
    };

    // Téléchargement du contrat via API
    const handleDownload = async (doc: DocumentContrat) => {
        if (!doc.uuid) {
            notify('UUID du contrat non disponible', 'error');
            return;
        }
        
        setDownloadingIds(prev => ({ ...prev, [doc.id.toString()]: true }));

        try {
            const blob = await contractService.downloadLeaseContract(doc.uuid);
            contractService.downloadBlob(blob, `contrat_${doc.locataire.replace(' ', '_')}.pdf`);
            notify(`📥 Contrat téléchargé : ${doc.titre}`, 'success');
        } catch (err) {
            console.error('Erreur lors du téléchargement:', err);
            notify('Erreur lors du téléchargement du contrat', 'error');
        } finally {
            setDownloadingIds(prev => ({ ...prev, [doc.id.toString()]: false }));
        }
    };

    // Rafraîchissement des données
    const handleRefresh = async () => {
        setLoading(true);
        notify('🔄 Actualisation des données...', 'info');

        try {
            const leases = await leaseService.listLeases();
            
            let propsData: Property[] = [];
            try {
                const propsResponse = await propertyService.listProperties();
                propsData = propsResponse.data || [];
            } catch (propError) {
                console.error('Erreur lors du chargement des biens:', propError);
            }
            
            const transformedDocs = leases.map(lease => {
                const property = propsData.find(p => p.id === lease.property_id);
                return transformLeaseToDocument(lease, property);
            });
            
            setDocuments(transformedDocs);
            notify('✅ Données actualisées', 'success');
        } catch (err) {
            console.error('Erreur lors de l\'actualisation:', err);
            notify('Erreur lors de l\'actualisation des données', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Modifier un contrat
    const handleEditContract = (doc: DocumentContrat) => {
        setEditingContract(doc);
        setEditForm({
            rent_amount: doc.loyer.toString(),
            deposit: doc.depot?.toString() || '',
            start_date: doc.debut,
            end_date: doc.fin || '',
            type: doc.type === 'BAIL MEUBLÉ' ? 'forme' : 'nu',
            status: doc.statut,
        });
        setIsEditing(true);
    };

    // Sauvegarder les modifications
    const handleSaveEdit = async () => {
        if (!editingContract?.uuid) {
            notify('UUID du contrat non disponible', 'error');
            return;
        }

        try {
            const leaseType = editForm.type === 'forme' ? 'orme' : editForm.type;
            
            await leaseService.updateLease(editingContract.uuid, {
                rent_amount: parseFloat(editForm.rent_amount),
                deposit: editForm.deposit ? parseFloat(editForm.deposit) : null,
                start_date: editForm.start_date,
                end_date: editForm.end_date || null,
                type: leaseType as 'nu' | 'orme',
                status: editForm.status as 'pending' | 'active' | 'terminated',
            });
            
            notify('✅ Contrat modifié avec succès!', 'success');
            setIsEditing(false);
            setEditingContract(null);
            handleRefresh();
        } catch (err) {
            console.error('Erreur lors de la modification:', err);
            notify('Erreur lors de la modification du contrat', 'error');
        }
    };

    // Fermer la modale
    const handleCloseEdit = () => {
        setIsEditing(false);
        setEditingContract(null);
    };

    // Menu contextuel
    const handleMenuAction = async (action: string, doc: DocumentContrat) => {
        switch (action) {
            case 'view':
                notify(`📄 Visualisation du contrat "${doc.titre}"`, 'info');
                break;
            case 'terminate':
                if (doc.statut === 'active') {
                    const confirmTerminate = window.confirm(`Voulez-vous vraiment résilier le contrat "${doc.titre}" ?`);
                    if (confirmTerminate) {
                        try {
                            await leaseService.terminateLease(doc.uuid || doc.id.toString());
                            notify(`✅ Contrat "${doc.titre}" résilié avec succès`, 'success');
                            handleRefresh();
                        } catch (err) {
                            console.error('Erreur lors de la résiliation:', err);
                            notify('Erreur lors de la résiliation du contrat', 'error');
                        }
                    }
                } else {
                    notify('Ce contrat ne peut pas être résilié (statut non actif)', 'error');
                }
                break;
            case 'duplicate':
                notify(`📋 Duplication du contrat "${doc.titre}" - Fonctionnalité en cours de développement`, 'info');
                break;
            default:
                notify(`Action "${action}" non implémentée`, 'info');
        }
    };

    // Redirection vers création
    const handleCreateNewContract = () => {
        navigate('/proprietaire/nouvelle-location');
    };

    // État de chargement
    if (loading) {
        return (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
                    .cb-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
                    .cb-loading { display: flex; justify-content: center; align-items: center; py-16; }
                `}</style>
                <div className="cb-page">
                    <div className="cb-loading">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        <span className="ml-3 text-gray-600">Chargement des contrats...</span>
                    </div>
                </div>
            </>
        );
    }

    // État vide
    if (documents.length === 0 && !loading) {
        return (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
                    .cb-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
                    .cb-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
                    .cb-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
                    .cb-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; }
                    .cb-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
                    .cb-add-btn:hover { background: #72b44a; }
                    .cb-empty { text-align: center; py-16; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; }
                `}</style>
                <div className="cb-page">
                    <div className="cb-header">
                        <div>
                            <h1 className="cb-title">Contrats de bail</h1>
                            <p className="cb-subtitle">Générez automatiquement vos contrats de bail personnalisés en quelques clics. Documents conformes et prêts à signer.</p>
                        </div>
                        <button className="cb-add-btn" onClick={handleCreateNewContract}>
                            <Plus size={15} /> Contrat de bail
                        </button>
                    </div>
                    <div className="cb-empty">
                        <p className="text-gray-500 py-8">Aucun contrat trouvé.</p>
                        <button className="cb-add-btn mb-8" onClick={handleCreateNewContract}>
                            <Plus size={15} /> Créer un premier contrat
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .cb-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .cb-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .cb-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .cb-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; }
        .cb-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
        .cb-add-btn:hover { background: #72b44a; }
        .cb-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .cb-filter-title { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .cb-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }
        .cb-search-row { display: flex; gap: 12px; align-items: stretch; }
        .cb-search-wrap { flex: 1; position: relative; }
        .cb-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .cb-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .cb-search-input::placeholder { color: #83C757; font-weight: 600; }
        .cb-btn-display { display: inline-flex; align-items: center; gap: 6px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #d1d5db; background: #fff; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; cursor: pointer; }
        .cb-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .cb-contrat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; padding: 0; overflow: hidden; display: flex; flex-direction: column; }
        .cb-contrat-top { padding: 1.1rem 1.3rem 0.7rem; }
        .cb-type-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .cb-contrat-titre { font-size: 0.95rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .cb-contrat-bien { font-size: 0.75rem; color: #ef4444; font-weight: 500; display: flex; align-items: center; gap: 4px; margin: 0 0 14px 0; }
        .cb-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
        .cb-detail-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .cb-detail-value { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .cb-status-actif { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 6px; background: #dcfce7; color: #166534; font-size: 0.72rem; font-weight: 700; }
        .cb-status-attente { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 6px; background: #fef3c7; color: #92400e; font-size: 0.72rem; font-weight: 700; }
        .cb-status-termine { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 6px; background: #f3f4f6; color: #6b7280; font-size: 0.72rem; font-weight: 700; }
        .cb-contrat-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .cb-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .cb-footer-actions { display: flex; gap: 6px; }
        .cb-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; color: #9ca3af; transition: color 0.15s; }
        .cb-icon-btn:hover { color: #374151; }
        .cb-icon-btn.green { color: #83C757; }
        .cb-icon-btn.orange { color: #f59e0b; }
        .cb-icon-btn.spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cb-result-count { font-size: 0.75rem; color: #6b7280; margin-bottom: 1rem; }
        .cb-dropdown { position: relative; }
        .cb-dropdown-menu { position: absolute; right: 0; top: 100%; margin-top: 4px; width: 180px; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; z-index: 20; }
        .cb-dropdown-item { width: 100%; padding: 10px 16px; text-align: left; background: none; border: none; font-size: 0.82rem; color: #374151; cursor: pointer; }
        .cb-dropdown-item:hover { background: #f3f4f6; }
        .cb-dropdown-item.danger { color: #dc2626; }
        .cb-dropdown-item.danger:hover { background: #fef2f2; }
        @media (max-width: 1400px) { .cb-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .cb-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .cb-grid { grid-template-columns: 1fr; }
          .cb-header { flex-direction: column; gap: 12px; }
          .cb-add-btn { width: 100%; justify-content: center; }
          .cb-search-row { flex-direction: column; }
          .cb-btn-display { width: 100%; height: 44px; justify-content: center; }
          .cb-card { padding: 1rem; }
        }
        @media (max-width: 480px) { .cb-page { padding: 1rem 0.5rem 2rem; } .cb-title { font-size: 1.2rem; } }
      `}</style>

            <div className="cb-page">
                <div className="cb-header">
                    <div>
                        <h1 className="cb-title">Contrats de bail</h1>
                        <p className="cb-subtitle">Générez automatiquement vos contrats de bail personnalisés en quelques clics. Documents conformes et prêts à signer.</p>
                    </div>
                    <button className="cb-add-btn" onClick={handleCreateNewContract}>
                        <Plus size={15} /> Contrat de bail
                    </button>
                </div>

                <div className="cb-card">
                    <p className="cb-filter-title">FILTRER PAR BIEN</p>
                    <select 
                        className="cb-select" 
                        value={filterBien}
                        onChange={(e) => setFilterBien(e.target.value)}
                    >
                        {biensList.map(bien => (
                            <option key={bien} value={bien}>{bien}</option>
                        ))}
                    </select>
                </div>

                <div className="cb-card">
                    <div className="cb-search-row">
                        <div className="cb-search-wrap">
                            <Search size={16} className="cb-search-icon" />
                            <input 
                                className="cb-search-input" 
                                placeholder="Rechercher" 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <button className="cb-btn-display" onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}>
                            <Settings size={15} /> {viewMode === 'grid' ? 'Liste' : 'Grille'}
                        </button>
                    </div>
                </div>

                <p className="cb-result-count">
                    {filtered.length} contrat{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
                </p>

                <div className="cb-grid">
                    {filtered.map(c => (
                        <div className="cb-contrat" key={c.id}>
                            <div className="cb-contrat-top">
                                <span 
                                    className="cb-type-badge" 
                                    style={{ 
                                        background: c.typeBadgeColor ? c.typeBadgeColor + '20' : '#e5e7eb', 
                                        color: c.typeBadgeColor || '#374151' 
                                    }}
                                >
                                    {c.type}
                                </span>
                                <p className="cb-contrat-titre">{c.titre}</p>
                                <p className="cb-contrat-bien">📍 {c.bien}</p>
                                <div className="cb-detail-row">
                                    <div><p className="cb-detail-label">Loyer mensuel</p><p className="cb-detail-value">{formatLocier(c.loyer)}</p></div>
                                    <div><p className="cb-detail-label">Dépôt de garantie</p><p className="cb-detail-value">{c.depot ? formatLocier(c.depot) : '—'}</p></div>
                                </div>
                                <div className="cb-detail-row">
                                    <div><p className="cb-detail-label">Date de début</p><p className="cb-detail-value">{formatDate(c.debut)}</p></div>
                                    <div><p className="cb-detail-label">Date de fin</p><p className="cb-detail-value">{formatDate(c.fin)}</p></div>
                                </div>
                                <span className={getStatusClass(c.statut)}>
                                    {getStatusLabel(c.statut)}
                                </span>
                            </div>
                            <div className="cb-contrat-footer">
                                <span className="cb-footer-date">{c.creeLe}</span>
                                <div className="cb-footer-actions">
                                    <button 
                                        className="cb-icon-btn green" 
                                        title="Télécharger"
                                        onClick={() => handleDownload(c)}
                                        disabled={downloadingIds[c.id]}
                                    >
                                        {downloadingIds[c.id] ? (
                                            <Loader2 size={16} className="cb-icon-btn spinning" />
                                        ) : (
                                            '📥'
                                        )}
                                    </button>
                                    <button 
                                        className="cb-icon-btn orange" 
                                        title="Modifier"
                                        onClick={() => handleEditContract(c)}
                                    >
                                        ✏️
                                    </button>
                                    <div className="cb-dropdown">
                                        <button 
                                            className="cb-icon-btn" 
                                            title="Plus"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const currentOpen = (e.target as HTMLElement).closest('.cb-dropdown')?.querySelector('.cb-dropdown-menu');
                                                document.querySelectorAll('.cb-dropdown-menu').forEach(el => {
                                                    if (el !== currentOpen) el.classList.add('hidden');
                                                });
                                                const menu = (e.target as HTMLElement).closest('.cb-dropdown').querySelector('.cb-dropdown-menu');
                                                menu?.classList.toggle('hidden');
                                            }}
                                        >
                                            ⋮
                                        </button>
                                        <div className="cb-dropdown-menu hidden">
                                            <button className="cb-dropdown-item" onClick={() => handleMenuAction('view', c)}>
                                                👁️ Voir les détails
                                            </button>
                                            <button className="cb-dropdown-item" onClick={() => handleMenuAction('duplicate', c)}>
                                                📋 Dupliquer
                                            </button>
                                            {c.statut === 'active' && (
                                                <button className="cb-dropdown-item danger" onClick={() => handleMenuAction('terminate', c)}>
                                                    ❌ Résilier le bail
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modale d'édition */}
            {isEditing && editingContract && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-bold">Modifier le contrat</h2>
                            <button className="cb-icon-btn" onClick={handleCloseEdit}>
                                <X size={20} />
                            </button>
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
                                    className="cb-select"
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
                                    className="cb-select"
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
        </>
    );
};

export default ContratsBaux;
