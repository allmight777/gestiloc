import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Settings, Eye, Download, Send, Loader2 } from 'lucide-react';
import { invoiceService, Invoice, propertyService } from '@/services/api';

// Type pour transformer les données API en format affichage
interface AvisData {
    id: number;
    statutBadge: string;
    statutBadgeColor: string;
    titre: string;
    lieu: string;
    periode: string;
    echeance: string;
    montantLoyer: string;
    charges: string;
    envoyeLe: string;
    status: string;
    lease_id: number;
}

// Fonction pour transformer une réponse API en type AvisData
const transformApiToAvis = (apiInvoice: Invoice): AvisData => {
    const propertyAddress = apiInvoice.lease?.property?.address || '';
    const propertyCity = apiInvoice.lease?.property?.city || '';
    const tenantName = apiInvoice.lease?.tenant 
        ? `${apiInvoice.lease.tenant.first_name || ''} ${apiInvoice.lease.tenant.last_name || ''}`.trim()
        : 'Locataire';
    
    // Déterminer le statut
    let statutBadge = '';
    let statutBadgeColor = '';
    
    switch (apiInvoice.status) {
        case 'paid':
            statutBadge = '✓ PAYÉ';
            statutBadgeColor = '#83C757';
            break;
        case 'pending':
            statutBadge = '⏳ EN ATTENTE';
            statutBadgeColor = '#6b7280';
            break;
        case 'overdue':
            statutBadge = '🚨 EN RETARD';
            statutBadgeColor = '#ef4444';
            break;
        default:
            statutBadge = '📧 À ENVOYER';
            statutBadgeColor = '#f59e0b';
    }
    
    // Formater la période
    let periode = '';
    if (apiInvoice.period_start && apiInvoice.period_end) {
        const start = new Date(apiInvoice.period_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        const end = new Date(apiInvoice.period_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        periode = start === end ? start : `${start} - ${end}`;
    } else if (apiInvoice.period_start) {
        periode = new Date(apiInvoice.period_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }
    
    return {
        id: apiInvoice.id || 0,
        statutBadge,
        statutBadgeColor,
        titre: `Avis - ${tenantName}`,
        lieu: `${propertyAddress}${propertyCity ? ', ' + propertyCity : ''}`,
        periode,
        echeance: apiInvoice.due_date ? new Date(apiInvoice.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
        montantLoyer: apiInvoice.amount_total ? `${apiInvoice.amount_total.toLocaleString('fr-FR')} €` : '—',
        charges: '—',
        envoyeLe: apiInvoice.created_at ? `Créé le ${new Date(apiInvoice.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}` : '—',
        status: apiInvoice.status || 'pending',
        lease_id: apiInvoice.lease_id || 0
    };
};

// Fonction pour calculer les statistiques
const calculateStats = (avisList: AvisData[]) => {
    const totalARecvoir = avisList
        .filter(a => a.status !== 'paid')
        .reduce((sum, a) => {
            const amount = parseFloat(a.montantLoyer.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            return sum + amount;
        }, 0);
    
    const enAttente = avisList.filter(a => a.status === 'pending').length;
    const enRetard = avisList.filter(a => a.status === 'overdue').length;
    const ceMois = avisList.length;
    
    return {
        totalARecvoir: totalARecvoir.toLocaleString('fr-FR') + ' €',
        enAttente: enAttente.toString(),
        enRetard: enRetard.toString(),
        ceMois: ceMois + ' avis'
    };
};

interface AvisEcheanceProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const AvisEcheance: React.FC<AvisEcheanceProps> = ({ notify }) => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [avisList, setAvisList] = useState<AvisData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalARecvoir: '0 €', enAttente: '0', enRetard: '0', ceMois: '0 avis' });
    const [filterBien, setFilterBien] = useState('Tous les biens');
    const [properties, setProperties] = useState<{id: number; name: string}[]>([]);
    const [downloadingIds, setDownloadingIds] = useState<Record<number, boolean>>({});
    const [selectedAvis, setSelectedAvis] = useState<AvisData | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const filters = ['Tous', 'A envoyer', 'En attente', 'Payés', 'En retard'];

    // Charger les biens pour le filtre
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const props = await propertyService.listProperties();
                setProperties(props.data || []);
            } catch (error) {
                console.error('Erreur lors du chargement des biens:', error);
            }
        };
        fetchProperties();
    }, []);

    // Charger les données depuis l'API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const apiInvoices = await invoiceService.listInvoices();
                const transformedAvis = apiInvoices.map(transformApiToAvis);
                setAvisList(transformedAvis);
                
                // Calculer les statistiques
                const calculatedStats = calculateStats(transformedAvis);
                setStats(calculatedStats);
            } catch (error) {
                console.error('Erreur lors du chargement des avis:', error);
                notify?.('Erreur lors du chargement des avis d\'échéance', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [notify]);

    // Appliquer les filtres
    const filtered = avisList.filter(a => {
        const matchesSearch = a.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.lieu.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        // Filtre par bien
        if (filterBien !== 'Tous les biens') {
            const property = properties.find(p => p.name === filterBien);
            if (property && !a.lieu.includes(property.name) && !a.lieu.includes(`#${property.id}`)) {
                return false;
            }
        }
        
        switch (activeFilter) {
            case 'A envoyer':
                return a.status === 'draft';
            case 'En attente':
                return a.status === 'pending';
            case 'Payés':
                return a.status === 'paid';
            case 'En retard':
                return a.status === 'overdue';
            default:
                return true;
        }
    });

    // Voir les détails d'un avis
    const handleView = (avis: AvisData) => {
        setSelectedAvis(avis);
        setShowViewModal(true);
    };

    // Modifier un avis - naviguer vers la page de modification
    const handleEdit = (avis: AvisData) => {
        navigate(`/proprietaire/factures/${avis.id}/modifier`);
    };

    // Télécharger le PDF de l'avis d'échéance
    const handleDownload = async (avis: AvisData) => {
        setDownloadingIds(prev => ({ ...prev, [avis.id]: true }));
        try {
            const blob = await invoiceService.downloadInvoice(avis.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `avis_echeance_${avis.id}_${avis.titre.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            notify?.('Avis d\'échéance téléchargé avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            notify?.('Erreur lors du téléchargement de l\'avis d\'échéance', 'error');
        } finally {
            setDownloadingIds(prev => ({ ...prev, [avis.id]: false }));
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .ae-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .ae-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .ae-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .ae-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; }
        .ae-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .ae-add-btn:hover { background: #72b44a; }
        .ae-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.25rem; }
        .ae-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; }
        .ae-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .ae-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .ae-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; }
        .ae-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .ae-filter-btn.active { background: #83C757; color: #fff; }
        .ae-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .ae-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .ae-filter-title { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .ae-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }
        .ae-search-row { display: flex; gap: 12px; align-items: stretch; }
        .ae-search-wrap { flex: 1; position: relative; }
        .ae-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .ae-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .ae-search-input::placeholder { color: #83C757; font-weight: 600; }
        .ae-btn-display { display: inline-flex; align-items: center; gap: 6px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #d1d5db; background: #fff; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; cursor: pointer; }
        .ae-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ae-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .ae-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .ae-status-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .ae-item-titre { font-size: 0.95rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .ae-item-lieu { font-size: 0.75rem; color: #ef4444; font-weight: 500; display: flex; align-items: center; gap: 4px; margin: 0 0 14px 0; }
        .ae-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
        .ae-detail-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .ae-detail-value { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .ae-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .ae-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .ae-footer-actions { display: flex; gap: 6px; }
        .ae-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.85rem; color: #9ca3af; }
        .ae-icon-btn.green { color: #83C757; }
        .ae-icon-btn.orange { color: #f59e0b; }
        .ae-loading { text-align: center; padding: 40px; color: #6b7280; }
        @media (max-width: 1400px) { .ae-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .ae-grid { grid-template-columns: repeat(2, 1fr); } .ae-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .ae-grid { grid-template-columns: 1fr; }
          .ae-stats { grid-template-columns: repeat(2, 1fr); }
          .ae-header { flex-direction: column; gap: 12px; }
          .ae-add-btn { width: 100%; justify-content: center; }
          .ae-search-row { flex-direction: column; }
          .ae-btn-display { width: 100%; height: 44px; justify-content: center; }
          .ae-card { padding: 1rem; }
          .ae-filters { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
          .ae-filter-btn { flex-shrink: 0; }
        }
        @media (max-width: 480px) {
          .ae-page { padding: 1rem 0.5rem 2rem; }
          .ae-title { font-size: 1.2rem; }
          .ae-stats { grid-template-columns: 1fr; }
          .ae-filter-btn { padding: 6px 14px; font-size: 0.75rem; }
        }
      `}</style>

            <div className="ae-page">
                <div className="ae-header">
                    <div>
                        <h1 className="ae-title">Avis d'échéance</h1>
                        <p className="ae-subtitle">Créez vos avis d'échéance de loyer et suivez les paiements attendus. Générez automatiquement les avis pour vos locataires.</p>
                    </div>
                    <button className="ae-add-btn" onClick={() => navigate('/proprietaire/avis-echeance/nouveau')}>
                        <Plus size={15} /> Créer un nouvel avis d'échéance
                    </button>
                </div>

                <div className="ae-stats">
                    <div className="ae-stat">
                        <p className="ae-stat-label">TOTAL À RECEVOIR</p>
                        <p className="ae-stat-value" style={{ color: '#83C757' }}>{loading ? '...' : stats.totalARecvoir}</p>
                    </div>
                    <div className="ae-stat">
                        <p className="ae-stat-label">EN ATTENTE</p>
                        <p className="ae-stat-value" style={{ color: '#f59e0b' }}>{loading ? '...' : stats.enAttente}</p>
                    </div>
                    <div className="ae-stat">
                        <p className="ae-stat-label">EN RETARD</p>
                        <p className="ae-stat-value" style={{ color: '#ef4444' }}>{loading ? '...' : stats.enRetard}</p>
                    </div>
                    <div className="ae-stat">
                        <p className="ae-stat-label">CE MOIS</p>
                        <p className="ae-stat-value" style={{ color: '#1a1a1a' }}>{loading ? '...' : stats.ceMois}</p>
                    </div>
                </div>

                <div className="ae-filters">
                    {filters.map(f => (
                        <button key={f} className={`ae-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
                    ))}
                </div>

                <div className="ae-card">
                    <p className="ae-filter-title">FILTRER PAR BIEN</p>
                    <select 
                        className="ae-select"
                        value={filterBien}
                        onChange={(e) => setFilterBien(e.target.value)}
                    >
                        <option>Tous les biens</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="ae-card">
                    <div className="ae-search-row">
                        <div className="ae-search-wrap">
                            <Search size={16} className="ae-search-icon" />
                            <input className="ae-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <button className="ae-btn-display" onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}><Settings size={15} /> {viewMode === 'grid' ? 'Liste' : 'Grille'}</button>
                    </div>
                </div>

                {loading ? (
                    <div className="ae-loading">Chargement des avis d'échéance...</div>
                ) : (
                    <div className="ae-grid">
                        {filtered.map(a => (
                            <div className="ae-item" key={a.id}>
                                <div className="ae-item-top">
                                    <span className="ae-status-badge" style={{ background: a.statutBadgeColor + '20', color: a.statutBadgeColor }}>{a.statutBadge}</span>
                                    <p className="ae-item-titre">{a.titre}</p>
                                    <p className="ae-item-lieu">📍 {a.lieu}</p>
                                    <div className="ae-detail-row">
                                        <div><p className="ae-detail-label">Période</p><p className="ae-detail-value">{a.periode}</p></div>
                                        <div><p className="ae-detail-label">Échéance</p><p className="ae-detail-value">{a.echeance}</p></div>
                                    </div>
                                    <div className="ae-detail-row">
                                        <div><p className="ae-detail-label">Montant loyer</p><p className="ae-detail-value" style={{ color: '#83C757' }}>{a.montantLoyer}</p></div>
                                        <div><p className="ae-detail-label">Charges</p><p className="ae-detail-value">{a.charges}</p></div>
                                    </div>
                                </div>
                                <div className="ae-footer">
                                    <span className="ae-footer-date">{a.envoyeLe}</span>
                                    <div className="ae-footer-actions">
                                        <button className="ae-icon-btn" title="Voir" onClick={() => handleView(a)}><Eye size={16} /></button>
                                        <button className="ae-icon-btn orange" title="Modifier" onClick={() => handleEdit(a)}>✏️</button>
                                        <button className="ae-icon-btn green" title="Télécharger" onClick={() => handleDownload(a)} disabled={downloadingIds[a.id]}>
                                            {downloadingIds[a.id] ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default AvisEcheance;
